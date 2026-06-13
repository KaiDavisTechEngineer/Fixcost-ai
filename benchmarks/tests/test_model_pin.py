"""Gate A: the scorer model is pinned, and a run that scores on any other model
VOIDs instead of silently folding a drifted-model score into the aggregate.

The pin is the champion's frozen scoring_model (or the SCORER_MODEL constant
before any champion exists); production's resolveModel() default can no longer
silently move the measurement instrument.
"""
import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import run_benchmark as rb  # noqa: E402

PIN = "claude-sonnet-4-6"


def _case():
    return {"id": "FC-9000", "ground_truth": {
        "primary_diagnosis": "alternator", "acceptable_diagnoses": ["alternator"],
        "wrong_but_plausible": ["battery_dead"], "must_mention_safety": False,
        "expected_cost_range_usd": [100, 400], "severity": "moderate"}}


def _out(model):
    return {"id": "FC-9000", "ok": True, "error": None,
            "diagnosis_slug": "alternator", "cost_range_usd": [150, 350],
            "severity": "moderate", "mentions_safety": False,
            "tokens": 5000, "input_tokens": 2000, "output_tokens": 3000,
            "latency_ms": 90000, "stop_reason": "tool_use", "model": model}


# ---- the pin value ----

def test_champion_scoring_model_is_authoritative(tmp_path, monkeypatch):
    champ = {"scoring_model": "some-frozen-model", "metrics": {}}
    monkeypatch.setattr(rb, "load_champion", lambda: champ)
    assert rb.pinned_scoring_model() == "some-frozen-model"


def test_falls_back_to_constant_without_champion(monkeypatch):
    monkeypatch.setattr(rb, "load_champion", lambda: None)
    assert rb.pinned_scoring_model() == rb.SCORER_MODEL == PIN


def test_constant_is_decoupled_from_production_default():
    # The harness model must be its own literal, not imported/derived from the
    # app's resolveModel() — so a production bump can't silently move it.
    assert isinstance(rb.SCORER_MODEL, str) and rb.SCORER_MODEL == PIN
    import_lines = [ln for ln in Path(rb.__file__).read_text().splitlines()
                    if ln.lstrip().startswith(("import ", "from "))]
    blob = " ".join(import_lines)
    assert "resolveModel" not in blob and "generate" not in blob, \
        f"harness must not import the model from production: {import_lines}"


# ---- the guard: wrong model VOIDs ----

def test_wrong_model_voids(monkeypatch):
    monkeypatch.setattr(rb, "run_pipeline", lambda c: _out("claude-haiku-4-5-20251001"))
    monkeypatch.setattr(rb, "pinned_scoring_model", lambda: PIN)
    monkeypatch.setattr(rb, "CONCURRENCY", 1)
    monkeypatch.setattr(rb.time, "sleep", lambda s: None)
    with pytest.raises(rb.SplitVoidError, match="model drift"):
        rb.run_split([_case()], 5715)


def test_matching_model_scores(monkeypatch):
    monkeypatch.setattr(rb, "run_pipeline", lambda c: _out(PIN))
    monkeypatch.setattr(rb, "pinned_scoring_model", lambda: PIN)
    monkeypatch.setattr(rb, "CONCURRENCY", 1)
    monkeypatch.setattr(rb.time, "sleep", lambda s: None)
    records, agg = rb.run_split([_case()], 5715)
    assert agg["n_cases"] == 1 and records[0]["model"] == PIN


def test_drift_voids_in_concurrent_mode(monkeypatch):
    def fake(c):
        # one stray model among several correct ones
        return _out("claude-haiku-4-5-20251001" if c["id"].endswith("2") else PIN)
    cases = [{**_case(), "id": f"FC-900{i}"} for i in range(5)]
    monkeypatch.setattr(rb, "run_pipeline", fake)
    monkeypatch.setattr(rb, "pinned_scoring_model", lambda: PIN)
    monkeypatch.setattr(rb, "CONCURRENCY", 4)
    with pytest.raises(rb.SplitVoidError, match="model drift"):
        rb.run_split(cases, 5715)


# ---- champion self-documents the model ----

def test_committed_champion_records_scoring_model():
    champ = json.loads((Path(rb.__file__).parent / "champion.json").read_text())
    assert champ.get("scoring_model") == PIN
