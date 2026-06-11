"""EVALUATOR: runs benchmark splits and produces structured score reports.

Heldout isolation (SPEC section 1 hard rule): the only data structure that may
ever be handed to the optimizer is the output of optimizer_view(), which
contains aggregate train-split numbers and nothing else. Full reports
(per-case records, heldout results) exist only for Kai and the verifier.
"""
import json
import sys
from pathlib import Path

BENCH = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BENCH))
from run_benchmark import run_split, load_champion, write_run  # noqa: E402
from schema.validate import load_cases  # noqa: E402

COMPONENTS = ("diagnosis", "cost", "severity", "safety", "efficiency")


def component_means(records):
    """Aggregate per-component means across a split — still aggregates, so
    optimizer-safe; they say WHERE points are lost without leaking cases."""
    n = len(records) or 1
    return {f"mean_{c}": round(sum((r.get(c) or 0) for r in records) / n, 2)
            for c in COMPONENTS}


def evaluate_split(split, verbose=False):
    """Run one split against the current working tree and write a run file."""
    champ = load_champion()
    tb = champ["token_baseline"] if champ else None
    cases = load_cases(split)
    records, agg = run_split(cases, tb, verbose=verbose)
    path = write_run(split, records, agg, tb)
    return {
        "split": split,
        "aggregate": agg,
        "components": component_means(records),
        "records": records,
        "run_file": str(path),
    }


def optimizer_view(train_report, champion):
    """The ONLY object the optimizer may receive. Train aggregates only."""
    if train_report["split"] != "train":
        raise ValueError("optimizer_view only accepts a train-split report")
    view = {
        "train_aggregate": train_report["aggregate"],
        "train_component_means": train_report["components"],
        "champion_train_aggregate": champion["metrics"]["train"],
        "score_rubric_max": {"diagnosis": 50, "cost": 15, "severity": 15,
                             "safety": 10, "efficiency": 10},
    }
    blob = json.dumps(view).lower()
    for forbidden in ("heldout", "fc-00", "complaint", "ground_truth"):
        if forbidden in blob:
            raise RuntimeError(f"optimizer view leaked forbidden content: {forbidden!r}")
    return view
