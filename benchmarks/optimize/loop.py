#!/usr/bin/env python3
"""Self-improvement loop orchestrator (Phase 2C, SPEC sections 5-6).

  python3 benchmarks/optimize/loop.py --goal "..." [--max-attempts 3]

Per attempt: optimizer proposes (sees ONLY aggregate train metrics) → static
validation → worktree apply → full test suite → train benchmark (pre-gate;
heldout budget is only spent when train looks viable) → heldout benchmark →
gate decision → report + diff for Kai. The proposal is never applied to the
main tree. Max 3 heldout evaluations per session, enforced in Session.
"""
import argparse
import datetime as dt
import json
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
BENCH = REPO / "benchmarks"
sys.path.insert(0, str(BENCH))
sys.path.insert(0, str(BENCH / "optimize"))

from run_benchmark import load_champion  # noqa: E402
import evaluator  # noqa: E402
import optimizer  # noqa: E402
import verifier  # noqa: E402


def require_clean_tree():
    out = subprocess.check_output(["git", "status", "--porcelain"], cwd=REPO).decode().strip()
    if out:
        print("ABORT: working tree is dirty — commit or stash before an optimization session",
              file=sys.stderr)
        sys.exit(2)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--goal", required=True, help="aggregate-level improvement goal for the optimizer")
    ap.add_argument("--max-attempts", type=int, default=3)
    ap.add_argument("--session", help="resume an existing session file (budget persists)")
    args = ap.parse_args()

    require_clean_tree()
    champion = load_champion()
    if not champion or champion["metrics"]["heldout"]["n_cases"] == 0:
        print("ABORT: champion.json needs heldout metrics — run the heldout baseline first",
              file=sys.stderr)
        sys.exit(2)

    stamp = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    session_path = args.session or (BENCH / "results" / "optimizer_sessions" / f"{stamp}.json")
    session = verifier.Session(session_path)
    proposals_root = BENCH / "results" / "proposals" / stamp
    print(f"session: {session_path}")

    # EVALUATOR — fresh train aggregate on current code; this (and only this)
    # feeds the optimizer.
    print("evaluating train split on current code…", flush=True)
    train_report = evaluator.evaluate_split("train")
    view = evaluator.optimizer_view(train_report, champion)
    print(f"  train mean={view['train_aggregate']['mean_score']} "
          f"components={view['train_component_means']}")

    prior = []  # optimizer feedback: aggregates + failure kind only, never heldout numbers
    for attempt in range(1, args.max_attempts + 1):
        print(f"\n=== attempt {attempt}/{args.max_attempts} "
              f"(heldout evals used: {session.data['heldout_evals']}/{verifier.MAX_HELDOUT_EVALS}) ===",
              flush=True)

        # OPTIMIZER
        proposal = optimizer.propose(view, REPO, args.goal, prior_attempts=prior)
        print(f"optimizer rationale: {proposal.get('rationale', '')[:300]}")
        errors = optimizer.validate_proposal(proposal, REPO)
        if errors:
            print("proposal rejected statically:", *errors, sep="\n  ")
            session.record_attempt({"attempt": attempt, "outcome": "static_reject", "errors": errors})
            prior.append({"attempt": attempt, "rationale": proposal.get("rationale"),
                          "result": "rejected before evaluation: " + "; ".join(errors)})
            continue

        # VERIFIER — isolated worktree
        wt = verifier.create_worktree(REPO)
        try:
            diff = verifier.apply_proposal_to_worktree(wt, proposal["edits"])
            tests_ok, test_log = verifier.run_test_suite(wt)
            print(f"test suite: {'PASS' if tests_ok else 'FAIL'}")
            if not tests_ok:
                pdir = verifier.write_report(proposals_root / f"attempt{attempt}", proposal, diff,
                                             {"safety_violations": "?", "mean_score": "?"},
                                             None, False, ["FAIL cond1: test suite failed"], champion)
                session.record_attempt({"attempt": attempt, "outcome": "tests_failed",
                                        "report": str(pdir)})
                prior.append({"attempt": attempt, "rationale": proposal.get("rationale"),
                              "result": "test suite failed"})
                continue

            print("running train split on proposal…", flush=True)
            train_run = verifier.run_split_in_worktree(wt, "train")
            t_agg = train_run["aggregate"]
            print(f"  proposal train: mean={t_agg['mean_score']} "
                  f"violations={t_agg['safety_violations']}")

            # pre-gate: don't burn a heldout eval on a clearly bad proposal
            champ_train = champion["metrics"]["train"]["mean_score"]
            if t_agg["safety_violations"] != 0 or t_agg["mean_score"] < champ_train - 0.5:
                print("pre-gate fail (train regressed or safety violation) — heldout NOT spent")
                pdir = verifier.write_report(proposals_root / f"attempt{attempt}", proposal, diff,
                                             t_agg, None, False,
                                             ["FAIL pre-gate: train regression or safety violation; "
                                              "heldout eval not spent"], champion)
                session.record_attempt({"attempt": attempt, "outcome": "pregate_fail",
                                        "train": t_agg, "report": str(pdir)})
                prior.append({"attempt": attempt, "rationale": proposal.get("rationale"),
                              "result": "train regressed", "train_aggregate": t_agg})
                continue

            # GATE — spends one of the 3 heldout evaluations
            session.spend_heldout_eval()
            print(f"running heldout split on proposal "
                  f"(eval {session.data['heldout_evals']}/{verifier.MAX_HELDOUT_EVALS})…", flush=True)
            heldout_run = verifier.run_split_in_worktree(wt, "heldout")
            h_agg = heldout_run["aggregate"]
            gate_ok, reasons = verifier.gate_decision(champion, t_agg, h_agg, tests_ok)
            pdir = verifier.write_report(proposals_root / f"attempt{attempt}", proposal, diff,
                                         t_agg, h_agg, gate_ok, reasons, champion)
            session.record_attempt({"attempt": attempt,
                                    "outcome": "gate_pass" if gate_ok else "gate_fail",
                                    "train": t_agg, "heldout": h_agg, "report": str(pdir)})
            print(f"gate: {'PASS' if gate_ok else 'FAIL'}", *reasons, sep="\n  ")
            print(f"report: {pdir}")
            if gate_ok:
                print("\nPASS — proposal awaits Kai's approval (cond4). NOT applied to the main tree.")
                return
            prior.append({"attempt": attempt, "rationale": proposal.get("rationale"),
                          "result": "verifier gate failed", "train_aggregate": t_agg})
        finally:
            verifier.remove_worktree(REPO, wt)

    print("\nsession ended without an accepted proposal")


if __name__ == "__main__":
    main()
