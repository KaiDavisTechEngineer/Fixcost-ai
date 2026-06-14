#!/usr/bin/env python3
"""Paired champion(Fast Path) vs proposal(diagnose/diagnostician) read.

CHAMPION  = current-HEAD Fast Path (pipeline.mjs default: guideRequest, Sonnet).
            buildPrompt/GUIDE_TOOL are untouched since afa1a2c, so a fresh run is
            byte-for-byte the frozen champion's pipeline.
PROPOSAL  = the Phase-1 diagnose path (pipeline.mjs FIXCOST_PIPELINE=diagnostician:
            diagnosticianRequest, Opus 4.8). Triage is bypassed (headless = no
            human to answer; cases are pre-detailed) — see pipeline.mjs.

Both run FRESH on the same cases and are graded by the SAME deterministic scorer
(scoring.py); efficiency uses the champion's frozen token_baseline. The runs use
DIFFERENT production models by design (Sonnet vs Opus), so this deliberately does
NOT use run_benchmark.py's single-model pin — it pairs two pipelines, not two
prompts on one model. diagnosis/cost/severity/safety are model-agnostic;
efficiency differs because token spend differs (reported per-component).

Usage:
  python benchmarks/optimize/diagnose_gate.py FC-0011 FC-0012   # dry-run named cases
  python benchmarks/optimize/diagnose_gate.py --split heldout    # full split
  FIXCOST_CONCURRENCY=4 python benchmarks/optimize/diagnose_gate.py --split heldout
"""
import argparse
import concurrent.futures
import json
import os
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
BENCH = REPO / "benchmarks"
sys.path.insert(0, str(BENCH))
from scoring import score_case, SCORING_VERSION  # noqa: E402

PIPELINE = BENCH / "pipeline.mjs"
CHAMP = json.loads((BENCH / "champion.json").read_text())
TOKEN_BASELINE = CHAMP["token_baseline"]
CONCURRENCY = max(1, int(os.environ.get("FIXCOST_CONCURRENCY", "1")))


def load_case(cid):
    for split in ("heldout", "train"):
        p = BENCH / "cases" / split / f"{cid}.json"
        if p.exists():
            return json.loads(p.read_text())
    raise SystemExit(f"case {cid} not found in heldout/ or train/")


def load_split(split):
    d = BENCH / "cases" / split
    return [json.loads(p.read_text()) for p in sorted(d.glob("*.json"))]


def _invoke(case, mode):
    """One node pipeline call → normalized dict (or an error record)."""
    tmp = BENCH / "cases" / f"_tmp_case_dg_{mode}_{case['id']}.json"
    tmp.write_text(json.dumps(case))
    env = {**os.environ}
    env["FIXCOST_PIPELINE"] = "diagnostician" if mode == "diagnostician" else "fast"
    try:
        proc = subprocess.run(
            ["node", str(PIPELINE), str(tmp)],
            capture_output=True, text=True, timeout=900, env=env)
    except subprocess.TimeoutExpired:
        return {"id": case["id"], "ok": False, "error": "timeout 900s", "tokens": 0,
                "diagnosis_slug": None, "cost_range_usd": None, "severity": None,
                "mentions_safety": False, "output_tokens": 0, "latency_ms": 900000,
                "model": None, "stop_reason": None}
    finally:
        tmp.unlink(missing_ok=True)
    if proc.returncode != 0 or not proc.stdout.strip():
        return {"id": case["id"], "ok": False, "error": (proc.stderr.strip()[:300] or "no output"),
                "tokens": 0, "diagnosis_slug": None, "cost_range_usd": None, "severity": None,
                "mentions_safety": False, "output_tokens": 0, "latency_ms": 0,
                "model": None, "stop_reason": None}
    return json.loads(proc.stdout)


def _degraded(out):
    """Contamination signature from the first full-50: an 'ok' guide that came
    back with diagnosis_slug=None (verified non-reproducible on re-run). Retry
    once so a load blip can't poison a paid run. A genuinely out-of-vocab slug
    just stays None after the retry (costs one extra call, changes nothing)."""
    return bool(out.get("ok")) and not out.get("error") and out.get("diagnosis_slug") is None


def run_pipeline(case, mode):
    """mode: 'fast' (champion) | 'diagnostician' (proposal). Returns normalized dict.
    One automatic retry on the degraded-result signature or a hard error."""
    out = _invoke(case, mode)
    if out.get("error") or _degraded(out):
        retry = _invoke(case, mode)
        # Keep the retry unless it's strictly worse (still lets a real None stand).
        if not retry.get("error") and not _degraded(retry):
            return retry
        if not out.get("error"):
            return out
        return retry
    return out


def score(case, out):
    s = score_case(case, out, TOKEN_BASELINE)
    s.update(slug=out.get("diagnosis_slug"), sev=out.get("severity"),
             tok=out.get("tokens"), out_tok=out.get("output_tokens"),
             lat_s=round((out.get("latency_ms") or 0) / 1000, 1),
             model=out.get("model"), stop=out.get("stop_reason"),
             tier=out.get("tier"), ok=out.get("ok"), err=out.get("error"))
    return s


def run_one(case):
    cid = case["id"]
    c = score(case, run_pipeline(case, "fast"))
    p = score(case, run_pipeline(case, "diagnostician"))
    return cid, c, p


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("cases", nargs="*", help="case ids, e.g. FC-0011 FC-0012")
    ap.add_argument("--split", choices=["train", "heldout"])
    args = ap.parse_args()

    if args.split:
        cases = load_split(args.split)
    elif args.cases:
        cases = [load_case(c) for c in args.cases]
    else:
        ap.error("pass case ids or --split")

    gt_sev = {c["id"]: c["ground_truth"].get("severity") for c in cases}

    rows = []
    if CONCURRENCY > 1 and len(cases) > 1:
        with concurrent.futures.ThreadPoolExecutor(max_workers=CONCURRENCY) as pool:
            for cid, c, p in pool.map(run_one, cases):
                rows.append((cid, c, p))
    else:
        for case in cases:
            cid, c, p = run_one(case)
            rows.append((cid, c, p))
            print(f"  done {cid}", file=sys.stderr, flush=True)
    rows.sort(key=lambda r: r[0])

    COMP = ["diagnosis", "cost", "severity", "safety", "efficiency", "differential"]
    print(f"\ntoken_baseline={TOKEN_BASELINE} (champion afa1a2c)   scorer=deterministic scoring.py v{SCORING_VERSION} (max 110)")
    print("champion = Fast Path (Sonnet) · proposal = diagnostician (Opus), triage bypassed\n")
    hdr = f"{'case':9} {'gt_sev':12} | {'CHAMP tot':9} {'PROP tot':9} {'Δtot':6} | champ(slug/sev)            prop(slug/sev)"
    print(hdr); print("-" * len(hdr))
    for cid, c, p in rows:
        ce = "ERR" if c.get("err") else ""
        pe = "ERR" if p.get("err") else ""
        print(f"{cid:9} {str(gt_sev[cid]):12} | {c['total']:9.1f} {p['total']:9.1f} "
              f"{p['total']-c['total']:+6.1f} | {str(c['slug']):20}/{str(c['sev']):11} "
              f"{str(p['slug']):20}/{str(p['sev']):11} {ce}{pe}")

    def avg(rows, who, key):
        vals = [(c if who == 'c' else p)[key] for _, c, p in rows]
        return sum(vals) / len(vals)

    print("\nPER-COMPONENT MEANS (champion → proposal, Δ):")
    for comp in COMP + ["total"]:
        ca, pa = avg(rows, 'c', comp), avg(rows, 'p', comp)
        print(f"  {comp:11} {ca:6.2f} → {pa:6.2f}  ({pa-ca:+.2f})")
    print("\nCOST/LATENCY (means):")
    for who, lbl in [('c', 'champion '), ('p', 'proposal ')]:
        print(f"  {lbl} out_tok={avg(rows, who, 'out_tok'):.0f}  "
              f"total_tok={avg(rows, who, 'tok'):.0f}  latency={avg(rows, who, 'lat_s'):.1f}s")
    n = len(rows)
    sv = sum(1 for _, _, p in rows if p.get("safety_violation"))
    cv = sum(1 for _, c, _ in rows if c.get("safety_violation"))
    print(f"\nn={n}  safety_violations champ={cv} prop={sv}  "
          f"proposal models={sorted({p['model'] for _, _, p in rows})}")

    # routing split (proposal tier from triage) + efficiency by tier
    tiers = {}
    for _, _, p in rows:
        tiers.setdefault(p.get("tier"), []).append(p)
    if any(t in tiers for t in ("quick", "full")):
        print("ROUTING (proposal tier):")
        for t in ("quick", "full", "n/a", None):
            if t in tiers:
                g = tiers[t]
                eff = sum(x["efficiency"] for x in g) / len(g)
                tok = sum(x["tok"] for x in g) / len(g)
                print(f"  {str(t):6} n={len(g):2}  mean_efficiency={eff:.2f}  mean_tokens={tok:.0f}  "
                      f"cases={[i for i,_,pp in rows if pp.get('tier')==t]}")

    # ---- severity over-call / under-call slices (mirrors the historical Gate C) ----
    tags = {c["id"]: set(c.get("tags", [])) for c in cases}
    cluster = [cid for cid, _, _ in rows if "loud_but_moderate" in tags.get(cid, ())]
    arm = [cid for cid, _, _ in rows if "urgent_control" in tags.get(cid, ())]
    cr = {cid: c for cid, c, _ in rows}
    pr = {cid: p for cid, _, p in rows}

    def overcall(rec, cid):   # gt moderate, app called above it
        return rec[cid]["sev"] in ("urgent", "do_not_drive")

    def undercall(rec, cid):  # gt urgent, app called below it
        return rec[cid]["sev"] in ("info", "moderate")

    if cluster:
        c_oc = [x for x in cluster if overcall(cr, x)]
        p_oc = [x for x in cluster if overcall(pr, x)]
        regress = [x for x in cluster if not overcall(cr, x) and overcall(pr, x)]
        improve = [x for x in cluster if overcall(cr, x) and not overcall(pr, x)]
        print(f"\nOVER-CALL on {len(cluster)} loud_but_moderate (gt=moderate):")
        print(f"  champ over-calls={len(c_oc)} {c_oc}")
        print(f"  prop  over-calls={len(p_oc)} {p_oc}")
        print(f"  paired regressions (champ ok -> prop over-calls)={len(regress)} {regress}")
        print(f"  paired improvements (champ over-calls -> prop ok)={len(improve)} {improve}")
    if arm:
        c_uc = [x for x in arm if undercall(cr, x)]
        p_uc = [x for x in arm if undercall(pr, x)]
        arm_regress = [x for x in arm if not undercall(cr, x) and undercall(pr, x)]
        print(f"\nUNDER-CALL on {len(arm)} urgent_control (gt=urgent):")
        print(f"  champ under-calls={len(c_uc)} {c_uc}")
        print(f"  prop  under-calls={len(p_uc)} {p_uc}")
        print(f"  paired regressions (champ urgent -> prop downgrades)={len(arm_regress)} {arm_regress}")

    # win/loss on total (efficiency-inclusive) and on quality-only (excl. efficiency)
    qonly = lambda r: r["total"] - r["efficiency"]
    p_better = sum(1 for _, c, p in rows if p["total"] > c["total"] + 1e-9)
    c_better = sum(1 for _, c, p in rows if c["total"] > p["total"] + 1e-9)
    pq = sum(1 for _, c, p in rows if qonly(p) > qonly(c) + 1e-9)
    cq = sum(1 for _, c, p in rows if qonly(c) > qonly(p) + 1e-9)
    qa_c = sum(qonly(c) for _, c, _ in rows) / n
    qa_p = sum(qonly(p) for _, _, p in rows) / n
    print(f"\nWIN/LOSS (total):        prop>champ={p_better}  champ>prop={c_better}  tie={n-p_better-c_better}")
    print(f"WIN/LOSS (quality-only): prop>champ={pq}  champ>prop={cq}  tie={n-pq-cq}")
    print(f"QUALITY-ONLY mean (excl. efficiency): champ {qa_c:.2f} -> prop {qa_p:.2f}  ({qa_p-qa_c:+.2f})")


if __name__ == "__main__":
    main()
