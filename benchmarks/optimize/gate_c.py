#!/usr/bin/env python3
"""Gate C: paired champion-vs-proposal read on the refreshed, model-pinned heldout.

Both champion (current HEAD) and proposal (HEAD + human-severity-v1 diff) are
re-scored FRESH on the combined 50-case heldout under the pinned scorer
(claude-sonnet-4-6) — the historical 92.48 is NOT trusted. Run files are saved
before analysis so the paired read never costs re-spend.

PRIMARY verdict: over-call read on the 15-case loud_but_moderate cluster.
SECONDARY: under-call read on the 5-case urgent_control arm (directional, n=5).
"""
import json
import os
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
BENCH = REPO / "benchmarks"
OUT = BENCH / "results" / "proposals" / "human-severity-v1"
sys.path.insert(0, str(BENCH))
sys.path.insert(0, str(BENCH / "optimize"))
import verifier  # noqa: E402

PROPOSAL = json.loads((OUT / "proposal.json").read_text())


def newest_heldout_run(root):
    runs = sorted((Path(root) / "benchmarks" / "results" / "runs").glob("*_heldout.json"))
    return json.loads(runs[-1].read_text())


def run_champion():
    print("scoring CHAMPION (current HEAD) on heldout-50…", flush=True)
    proc = subprocess.run(
        [sys.executable, "benchmarks/run_benchmark.py", "--split", "heldout"],
        cwd=REPO, env={**os.environ, "FIXCOST_CONCURRENCY": "4"},
        capture_output=True, text=True, timeout=7200)
    if proc.returncode != 0:
        raise RuntimeError(f"champion run failed (rc={proc.returncode}): {(proc.stderr or proc.stdout)[-400:]}")
    return newest_heldout_run(REPO)


def run_proposal():
    print("scoring PROPOSAL (HEAD + human-severity-v1) on heldout-50 in worktree…", flush=True)
    wt = verifier.create_worktree(REPO)
    try:
        verifier.apply_proposal_to_worktree(wt, PROPOSAL["edits"])
        viol = verifier.check_protected_invariants(wt)
        if viol:
            raise RuntimeError(f"proposal violates safety invariants: {viol}")
        return verifier.run_split_in_worktree(wt, "heldout")
    finally:
        verifier.remove_worktree(REPO, wt)


def main():
    champ = run_champion()
    (OUT / "gate_c_champion_run.json").write_text(json.dumps(champ, indent=2))
    print("  champion run saved")
    prop = run_proposal()
    (OUT / "gate_c_proposal_run.json").write_text(json.dumps(prop, indent=2))
    print("  proposal run saved")
    print("\nBOTH RUNS SAVED — analysis can re-run free from here.")
    # ground-truth severity per case
    held = {json.loads(f.read_text())["id"]: json.loads(f.read_text())
            for f in (BENCH / "cases" / "heldout").glob("*.json")}
    gt_sev = {cid: c["ground_truth"]["severity"] for cid, c in held.items()}
    tags = {cid: set(c["tags"]) for cid, c in held.items()}

    def slice_ids(tag): return [cid for cid, t in tags.items() if tag in t]
    cluster = slice_ids("loud_but_moderate")
    arm = slice_ids("urgent_control")
    base = [cid for cid in held if not ({"loud_but_moderate", "urgent_control"} & tags[cid])]

    cr = {r["case"]: r for r in champ["cases"]}
    pr = {r["case"]: r for r in prop["cases"]}
    ORDER = ["info", "moderate", "urgent", "do_not_drive"]

    def mean(ids, run): return round(sum(run[c]["total"] for c in ids) / len(ids), 2)

    lines = ["# Gate C — paired champion vs proposal (human-severity-v1), model-pinned", ""]
    lines += [f"Scorer: {champ['cases'][0].get('model')} (pinned). Heldout = {len(held)} "
              f"(base {len(base)} + cluster {len(cluster)} + arm {len(arm)}). Both fresh, same run.", ""]
    lines += ["## Headline means (fresh champ vs fresh proposal)",
              "| slice | n | champion | proposal | Δ |", "|---|--:|--:|--:|--:|"]
    for name, ids in [("base (headline)", base), ("cluster (moderate)", cluster), ("arm (urgent)", arm), ("overall", list(held))]:
        c, p = mean(ids, cr), mean(ids, pr)
        lines.append(f"| {name} | {len(ids)} | {c} | {p} | {round(p-c,2):+} |")

    # PRIMARY: cluster over-call (app severity ABOVE moderate = urgent/do_not_drive)
    def overcall(r, cid):
        a = r[cid].get("app_severity")
        return a in ("urgent", "do_not_drive")  # gt is moderate for cluster
    champ_oc = [c for c in cluster if overcall(cr, c)]
    prop_oc = [c for c in cluster if overcall(pr, c)]
    regress = [c for c in cluster if not overcall(cr, c) and overcall(pr, c)]   # champ ok, prop over-calls
    improve = [c for c in cluster if overcall(cr, c) and not overcall(pr, c)]   # prop fixes a champ over-call
    lines += ["", "## PRIMARY — over-call on the 15 loud-but-moderate cluster",
              f"- champion over-calls: {len(champ_oc)} {champ_oc}",
              f"- proposal over-calls: {len(prop_oc)} {prop_oc}",
              f"- PAIRED regressions (champ correct -> proposal over-calls): {len(regress)} {regress}",
              f"- PAIRED improvements (champ over-calls -> proposal correct): {len(improve)} {improve}",
              f"- binomial (proposal over-calls vs rule >=3): {len(prop_oc)} -> "
              f"{'BIAS FLAGGED' if len(prop_oc) >= 3 else 'below threshold'}"]

    # SECONDARY: arm under-call (app severity BELOW urgent = info/moderate)
    def undercall(r, cid):
        a = r[cid].get("app_severity")
        return a in ("info", "moderate")  # gt is urgent for arm
    champ_uc = [c for c in arm if undercall(cr, c)]
    prop_uc = [c for c in arm if undercall(pr, c)]
    arm_regress = [c for c in arm if not undercall(cr, c) and undercall(pr, c)]
    lines += ["", f"## SECONDARY — under-call on the {len(arm)} urgent-control arm (directional)",
              f"- champion under-calls: {len(champ_uc)} {champ_uc}",
              f"- proposal under-calls: {len(prop_uc)} {prop_uc}",
              f"- PAIRED arm regressions (champ urgent-correct -> proposal downgrades): {len(arm_regress)} {arm_regress}"]

    # per-case app-severity table for cluster + arm
    lines += ["", "## Per-case app-severity (gt | champion -> proposal)",
              "| case | slice | gt | champ | prop |", "|---|---|---|---|---|"]
    for cid in cluster + arm:
        sl = "cluster" if cid in cluster else "arm"
        lines.append(f"| {cid} | {sl} | {gt_sev[cid]} | {cr[cid].get('app_severity')} | {pr[cid].get('app_severity')} |")

    (OUT / "gate_c_report.md").write_text("\n".join(lines) + "\n")
    print("\n".join(lines))
    print(f"\nreport: {OUT / 'gate_c_report.md'}")


if __name__ == "__main__":
    main()
