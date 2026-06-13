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
import os
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
BENCH = REPO / "benchmarks"
sys.path.insert(0, str(BENCH))
sys.path.insert(0, str(BENCH / "optimize"))

from run_benchmark import load_champion, SplitVoidError  # noqa: E402
from schema.validate import load_cases  # noqa: E402
import evaluator  # noqa: E402
import optimizer  # noqa: E402
import verifier  # noqa: E402

EST_COST_PER_CALL_USD = 0.07  # observed mean ~$0.063/call + margin


def preflight(max_attempts):
    """Abort before spending anything if credits are already exhausted.

    The API exposes no remaining-balance endpoint, so this cannot verify the
    balance covers the whole run — it makes one ~1-token probe call (detects
    an already-empty balance) and prints the worst-case cost estimate. The
    mid-run guard is SplitVoidError fail-fast (Kai-approved hardening).
    """
    n_train, n_heldout = len(load_cases("train")), len(load_cases("heldout"))
    calls = n_train + max_attempts * (n_train + n_heldout) + max_attempts
    print(f"preflight: worst-case ~{calls} calls ≈ ${calls * EST_COST_PER_CALL_USD:.2f} "
          f"(no balance endpoint exists; probing for already-exhausted credits)")
    import urllib.error
    import urllib.request
    body = json.dumps({
        "model": os.environ.get("ANTHROPIC_MODEL") or "claude-sonnet-4-6",
        "max_tokens": 1,
        "messages": [{"role": "user", "content": "ping"}],
    }).encode()
    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages", data=body, method="POST",
        headers={"Content-Type": "application/json",
                 "x-api-key": os.environ.get("ANTHROPIC_API_KEY", ""),
                 "anthropic-version": "2023-06-01"})
    try:
        with urllib.request.urlopen(req, timeout=60):
            pass
    except urllib.error.HTTPError as e:
        try:
            msg = json.load(e)["error"]["message"]
        except Exception:
            msg = f"HTTP {e.code}"
        print(f"PREFLIGHT ABORT: probe failed — {msg}", file=sys.stderr)
        sys.exit(2)
    except urllib.error.URLError as e:
        print(f"PREFLIGHT ABORT: network unreachable — {e}", file=sys.stderr)
        sys.exit(2)
    print("preflight: probe OK")


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
    ap.add_argument("--seed-proposal",
                    help="path to a proposal.json evaluated VERBATIM as attempt 1 (e.g. a "
                         "near-miss from a prior session, retested against refreshed heldout). "
                         "Gets no special treatment: same validation, invariants, tests, and gate.")
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

    preflight(args.max_attempts)

    # EVALUATOR — fresh train aggregate on current code; this (and only this)
    # feeds the optimizer.
    print("evaluating train split on current code…", flush=True)
    try:
        train_report = evaluator.evaluate_split("train")
    except SplitVoidError as e:
        print(f"SESSION ABORT: initial train eval VOID (infrastructure): {e}", file=sys.stderr)
        sys.exit(3)
    view = evaluator.optimizer_view(train_report, champion)
    print(f"  train mean={view['train_aggregate']['mean_score']} "
          f"components={view['train_component_means']}")

    prior = []  # optimizer feedback: aggregates + failure kind only, never heldout numbers
    for attempt in range(1, args.max_attempts + 1):
        print(f"\n=== attempt {attempt}/{args.max_attempts} "
              f"(heldout evals used: {session.data['heldout_evals']}/{verifier.MAX_HELDOUT_EVALS}) ===",
              flush=True)

        # OPTIMIZER (or a seeded proposal for attempt 1)
        if attempt == 1 and args.seed_proposal:
            proposal = json.loads(Path(args.seed_proposal).read_text())
            print(f"using seeded proposal: {args.seed_proposal}")
        else:
            proposal = optimizer.propose(view, REPO, args.goal, prior_attempts=prior)
        print(f"optimizer rationale: {proposal.get('rationale', '')[:300]}")
        errors = optimizer.validate_proposal(proposal, REPO)
        if errors:
            print("proposal rejected statically:", *errors, sep="\n  ")
            session.record_attempt({"attempt": attempt, "outcome": "static_reject",
                                    "errors": errors, "proposal": proposal})
            prior.append({"attempt": attempt, "rationale": proposal.get("rationale"),
                          "result": "rejected before evaluation: " + "; ".join(errors)})
            continue

        # VERIFIER — isolated worktree
        wt = verifier.create_worktree(REPO)
        try:
            diff = verifier.apply_proposal_to_worktree(wt, proposal["edits"])

            # Hard constraint #1 backstop: protected safety constructs must be
            # byte-identical after the edits, whatever the edit text said.
            violations = verifier.check_protected_invariants(wt)
            if violations:
                print("proposal rejected by safety invariant:", *violations, sep="\n  ")
                session.record_attempt({"attempt": attempt, "outcome": "invariant_reject",
                                        "violations": violations, "proposal": proposal})
                prior.append({"attempt": attempt, "rationale": proposal.get("rationale"),
                              "result": "rejected: altered protected safety content"})
                continue

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
            try:
                train_run = verifier.run_split_in_worktree(wt, "train")
            except verifier.SplitVoid as e:
                print(f"attempt {attempt} VOID (train, infrastructure): {e}", file=sys.stderr)
                session.record_attempt({"attempt": attempt, "outcome": "void_infrastructure",
                                        "phase": "train", "error": str(e)})
                print("SESSION ABORT: fix infrastructure (credits/network), then re-run")
                return
            t_agg = train_run["aggregate"]
            # Persist per-case run data before the worktree is removed — gate
            # decisions must be explainable case-by-case, not just in aggregate.
            attempt_dir = proposals_root / f"attempt{attempt}"
            attempt_dir.mkdir(parents=True, exist_ok=True)
            (attempt_dir / "train_run.json").write_text(json.dumps(train_run, indent=2))
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
            try:
                heldout_run = verifier.run_split_in_worktree(wt, "heldout")
            except verifier.SplitVoid as e:
                session.refund_heldout_eval(f"attempt {attempt} heldout VOID: {str(e)[:200]}")
                print(f"attempt {attempt} VOID (heldout, infrastructure): {e}", file=sys.stderr)
                print("heldout eval REFUNDED (void run produced zero heldout scores)")
                session.record_attempt({"attempt": attempt, "outcome": "void_infrastructure",
                                        "phase": "heldout", "error": str(e)})
                print("SESSION ABORT: fix infrastructure (credits/network), then re-run")
                return
            h_agg = heldout_run["aggregate"]
            (attempt_dir / "heldout_run.json").write_text(json.dumps(heldout_run, indent=2))
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
