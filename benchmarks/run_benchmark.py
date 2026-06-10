#!/usr/bin/env python3
"""FixCost benchmark runner (SPEC sections 4-6).

  python benchmarks/run_benchmark.py --split train            # optimizer-visible
  python benchmarks/run_benchmark.py --split heldout --gate   # gate decision, writes report
  python benchmarks/run_benchmark.py --case FC-0042 --verbose # debug one case
  python benchmarks/run_benchmark.py --baseline               # run both splits, freeze champion

Runs the headless pipeline (benchmarks/pipeline.mjs) per case, scores with the
deterministic scorer, writes one timestamped run file to results/runs/, and
(with --gate) evaluates the SPEC section 5 acceptance criteria.

NOTE: there is no 5-agent council in this app (single LLM call), so
council_agreement_rate is reported as null. The client-side template fallback is
not modeled; the harness measures the AI pipeline only.
"""
import argparse
import datetime as dt
import json
import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from scoring import score_case  # noqa: E402
from schema.validate import (  # noqa: E402
    load_schema, load_taxonomy, load_cases, validate, semantic_errors,
)

BENCHMARK_VERSION = 1
CHAMPION_PATH = HERE / "champion.json"
RUNS_DIR = HERE / "results" / "runs"
PIPELINE = HERE / "pipeline.mjs"

# USD per token. Match by substring of the model id; fall back to Sonnet pricing.
PRICING = {"opus": (15e-6, 75e-6), "sonnet": (3e-6, 15e-6), "haiku": (1e-6, 5e-6)}


def price_for(model):
    for k, v in PRICING.items():
        if k in (model or "").lower():
            return v
    return PRICING["sonnet"]


def git_sha():
    try:
        return subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=HERE).decode().strip()
    except Exception:
        return "unknown"


def run_pipeline(case):
    """Invoke the headless node pipeline for one case; return its normalized dict."""
    case_path = HERE / "cases" / "_tmp_case.json"
    case_path.write_text(json.dumps(case))
    try:
        proc = subprocess.run(
            ["node", str(PIPELINE), str(case_path)],
            capture_output=True, text=True, timeout=300,
        )
    finally:
        case_path.unlink(missing_ok=True)
    if proc.returncode != 0 or not proc.stdout.strip():
        return {"id": case["id"], "ok": False, "error": proc.stderr.strip()[:300] or "no output",
                "diagnosis_slug": None, "cost_range_usd": None, "severity": None,
                "mentions_safety": False, "tokens": 0, "input_tokens": 0, "output_tokens": 0,
                "latency_ms": 0, "stop_reason": None, "model": None}
    return json.loads(proc.stdout)


def load_champion():
    if CHAMPION_PATH.exists():
        return json.loads(CHAMPION_PATH.read_text())
    return None


def run_split(cases, token_baseline, verbose=False):
    """Run + score a list of cases. Returns (per_case_records, aggregate)."""
    records = []
    for i, c in enumerate(cases):
        if i > 0:
            time.sleep(1.0)  # be gentle on the connection between sequential calls
        out = run_pipeline(c)
        scored = score_case(c, out, token_baseline)
        rec = {"case": c["id"], **scored,
               "diagnosis_slug": out.get("diagnosis_slug"), "severity": out.get("severity"),
               "cost_range_usd": out.get("cost_range_usd"), "mentions_safety": out.get("mentions_safety"),
               "tokens": out.get("tokens"), "input_tokens": out.get("input_tokens"),
               "output_tokens": out.get("output_tokens"), "latency_ms": out.get("latency_ms"),
               "stop_reason": out.get("stop_reason"), "model": out.get("model"),
               "ok": out.get("ok"), "error": out.get("error")}
        records.append(rec)
        if verbose:
            print(f"  {c['id']}: total={scored['total']:.1f} diag={scored['diagnosis']} "
                  f"cost={scored['cost']} sev={scored['severity']} safety={scored['safety']} "
                  f"eff={scored['efficiency']} | slug={out.get('diagnosis_slug')} "
                  f"out_tok={out.get('output_tokens')} stop={out.get('stop_reason')}"
                  + (f" ERR={out.get('error')}" if out.get("error") else ""))
    return records, aggregate(records)


def aggregate(records):
    n = len(records) or 1
    def mean(key):
        return sum((r.get(key) or 0) for r in records) / n
    in_tok, out_tok = mean("input_tokens"), mean("output_tokens")
    # mean cost from per-model pricing
    total_cost = 0.0
    for r in records:
        pin, pout = price_for(r.get("model"))
        total_cost += (r.get("input_tokens") or 0) * pin + (r.get("output_tokens") or 0) * pout
    return {
        "n_cases": len(records),
        "mean_score": round(mean("total"), 2),
        "safety_violations": sum(1 for r in records if r.get("safety_violation")),
        "mean_latency_s": round(mean("latency_ms") / 1000, 2),
        "mean_tokens": round(mean("tokens"), 1),
        "mean_input_tokens": round(in_tok, 1),
        "mean_output_tokens": round(out_tok, 1),
        "mean_cost_usd": round(total_cost / n, 4),
        "council_agreement_rate": None,  # no council in this app
        "valid_response_rate": round(sum(1 for r in records if r.get("ok")) / n, 3),
    }


def write_run(split, records, agg, token_baseline):
    RUNS_DIR.mkdir(parents=True, exist_ok=True)
    stamp = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    sha = git_sha()
    payload = {
        "timestamp_utc": stamp, "git_sha": sha, "benchmark_version": BENCHMARK_VERSION,
        "split": split, "token_baseline": token_baseline,
        "aggregate": agg, "cases": records,
    }
    path = RUNS_DIR / f"{stamp}_{sha[:8]}_{split}.json"
    path.write_text(json.dumps(payload, indent=2))
    return path


def evaluate_gate(champion, heldout_agg):
    """SPEC section 5 conditions 2 and 3 (1 = test suite, 4 = Kai approval are external)."""
    reasons = []
    ok = True
    if heldout_agg["safety_violations"] != 0:
        ok = False
        reasons.append(f"FAIL cond2: {heldout_agg['safety_violations']} safety violation(s) on heldout (must be 0)")
    else:
        reasons.append("PASS cond2: 0 safety violations on heldout")

    champ = champion["metrics"]["heldout"]
    champ_score = champ["mean_score"]
    new_score = heldout_agg["mean_score"]
    if new_score < champ_score - 0.5:
        ok = False
        reasons.append(f"FAIL cond3a: heldout {new_score} < champion {champ_score} - 0.5 tolerance")
    else:
        reasons.append(f"PASS cond3a: heldout {new_score} within tolerance of champion {champ_score}")
        improved_score = new_score >= champ_score + 1.0
        champ_cost, champ_lat = champ["mean_cost_usd"], champ["mean_latency_s"]
        cost_better = champ_cost > 0 and heldout_agg["mean_cost_usd"] <= champ_cost * 0.9
        lat_better = champ_lat > 0 and heldout_agg["mean_latency_s"] <= champ_lat * 0.9
        if improved_score:
            reasons.append(f"PASS cond3b: heldout improved >= 1.0 ({champ_score} -> {new_score})")
        elif cost_better or lat_better:
            reasons.append(f"PASS cond3b: cost/latency improved >= 10% with heldout within tolerance")
        else:
            ok = False
            reasons.append("FAIL cond3b: no >=1.0 score gain and no >=10% cost/latency improvement")
    return ok, reasons


def write_champion(sha, token_baseline, train_agg, heldout_agg):
    payload = {
        "git_sha": sha, "benchmark_version": BENCHMARK_VERSION,
        "frozen_at": dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ"),
        "token_baseline": token_baseline,
        "metrics": {"train": train_agg, "heldout": heldout_agg},
    }
    CHAMPION_PATH.write_text(json.dumps(payload, indent=2))
    return CHAMPION_PATH


def precheck_cases(cases):
    """Refuse to run against invalid cases — protects the benchmark integrity."""
    schema, taxonomy = load_schema(), load_taxonomy()
    bad = []
    for c in cases:
        errs = validate(c, schema) + semantic_errors(c, taxonomy)
        if errs:
            bad.append((c.get("id", "?"), errs))
    if bad:
        for cid, errs in bad:
            print(f"INVALID CASE {cid}: {errs}", file=sys.stderr)
        sys.exit(2)


def resolve_token_baseline(explicit):
    if explicit is not None:
        return explicit
    champ = load_champion()
    return champ["token_baseline"] if champ else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--split", choices=["train", "heldout"])
    ap.add_argument("--case", help="run a single case id, e.g. FC-0042")
    ap.add_argument("--gate", action="store_true", help="evaluate SPEC section 5 gate; nonzero exit on fail")
    ap.add_argument("--baseline", action="store_true", help="run both splits and freeze champion.json")
    ap.add_argument("--verbose", action="store_true")
    args = ap.parse_args()

    if args.case:
        all_cases = load_cases("train") + load_cases("heldout")
        match = [c for c in all_cases if c["id"] == args.case]
        if not match:
            print(f"case {args.case} not found", file=sys.stderr); sys.exit(2)
        precheck_cases(match)
        tb = resolve_token_baseline(None)
        records, agg = run_split(match, tb, verbose=True)
        print(json.dumps({"aggregate": agg, "cases": records}, indent=2))
        return

    if args.baseline:
        train, heldout = load_cases("train"), load_cases("heldout")
        precheck_cases(train + heldout)
        if not train and not heldout:
            print("no cases committed yet", file=sys.stderr); sys.exit(2)
        # First pass with no efficiency baseline (scored later); freeze baseline from observed tokens.
        all_recs_train, _ = run_split(train, None, verbose=args.verbose)
        all_recs_heldout, _ = run_split(heldout, None, verbose=args.verbose)
        errored = [r["case"] for r in all_recs_train + all_recs_heldout if r.get("error")]
        if errored:
            print(f"ABORT: transport error on {errored} (not truncation) — re-run; "
                  f"refusing to freeze a champion over failed calls", file=sys.stderr)
            sys.exit(1)
        all_tokens = [r["tokens"] for r in all_recs_train + all_recs_heldout if r.get("tokens")]
        token_baseline = round(sum(all_tokens) / len(all_tokens)) if all_tokens else None
        # Re-score with the frozen baseline so efficiency is meaningful.
        train_recs, train_agg = run_rescore(train, all_recs_train, token_baseline)
        heldout_recs, heldout_agg = run_rescore(heldout, all_recs_heldout, token_baseline)
        write_run("train", train_recs, train_agg, token_baseline)
        write_run("heldout", heldout_recs, heldout_agg, token_baseline)
        path = write_champion(git_sha(), token_baseline, train_agg, heldout_agg)
        print(f"\nFrozen token_baseline={token_baseline}")
        print(f"TRAIN   {train_agg}")
        print(f"HELDOUT {heldout_agg}")
        print(f"champion written: {path}")
        return

    if not args.split:
        ap.error("one of --split, --case, or --baseline is required")

    cases = load_cases(args.split)
    precheck_cases(cases)
    if not cases:
        print(f"no cases in split '{args.split}'", file=sys.stderr); sys.exit(2)
    tb = resolve_token_baseline(None)
    records, agg = run_split(cases, tb, verbose=args.verbose)
    path = write_run(args.split, records, agg, tb)
    print(f"\n{args.split.upper()} {agg}")
    print(f"run written: {path}")

    if args.gate:
        champion = load_champion()
        if not champion:
            print("GATE: no champion.json — run --baseline first", file=sys.stderr); sys.exit(2)
        ok, reasons = evaluate_gate(champion, agg)
        print("\n=== GATE (SPEC section 5; cond1 test-suite + cond4 approval are external) ===")
        for r in reasons:
            print(" ", r)
        print("GATE RESULT:", "PASS" if ok else "FAIL")
        sys.exit(0 if ok else 1)


def run_rescore(cases, records, token_baseline):
    """Re-apply the scorer to already-collected pipeline outputs with a known baseline."""
    by_id = {c["id"]: c for c in cases}
    rescored = []
    for r in records:
        c = by_id[r["case"]]
        out = {"diagnosis_slug": r["diagnosis_slug"], "cost_range_usd": r["cost_range_usd"],
               "severity": r["severity"], "mentions_safety": r["mentions_safety"], "tokens": r["tokens"]}
        s = score_case(c, out, token_baseline)
        merged = {**r, **s}
        rescored.append(merged)
    return rescored, aggregate(rescored)


if __name__ == "__main__":
    main()
