"""Kai-approved hardening (2026-06-13): infrastructure errors VOID a split.

Error records (billing, credit, network, timeout) must never be scored into an
aggregate or gate decision — they corrupted two gate runs before this existed.
These tests simulate a credit-balance error mid-split and assert the run voids
instead of scoring, in both serial and concurrent modes.
"""
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import run_benchmark as rb  # noqa: E402
from optimize.verifier import Session  # noqa: E402

BILLING_MSG = ("Your credit balance is too low to access the Anthropic API. "
               "Please go to Plans & Billing to upgrade or purchase credits.")


def _case(i):
    return {"id": f"FC-9{i:03d}", "ground_truth": {
        "primary_diagnosis": "alternator", "acceptable_diagnoses": ["alternator"],
        "wrong_but_plausible": ["battery_dead"], "must_mention_safety": False,
        "expected_cost_range_usd": [100, 400], "severity": "moderate"}}


def _good_out(case):
    return {"id": case["id"], "ok": True, "error": None,
            "diagnosis_slug": "alternator", "cost_range_usd": [150, 350],
            "severity": "moderate", "mentions_safety": False,
            "tokens": 5000, "input_tokens": 2000, "output_tokens": 3000,
            "latency_ms": 90000, "stop_reason": "tool_use", "model": "m"}


def _error_out(case, msg):
    return {"id": case["id"], "ok": False, "error": msg,
            "diagnosis_slug": None, "cost_range_usd": None, "severity": None,
            "mentions_safety": False, "tokens": 0, "input_tokens": 0,
            "output_tokens": 0, "latency_ms": 0, "stop_reason": None, "model": None}


def _patch(monkeypatch, fail_at, msg):
    def fake_pipeline(case):
        if case["id"] == fail_at:
            return _error_out(case, msg)
        return _good_out(case)
    monkeypatch.setattr(rb, "run_pipeline", fake_pipeline)
    monkeypatch.setattr(rb.time, "sleep", lambda s: None)
    # Good records use model "m"; pin to it so the model-pin guard (separate
    # concern, tested in test_model_pin.py) doesn't trip these error-path tests.
    monkeypatch.setattr(rb, "pinned_scoring_model", lambda: "m")


def test_billing_error_mid_split_voids_serial(monkeypatch):
    cases = [_case(i) for i in range(6)]
    _patch(monkeypatch, "FC-9003", BILLING_MSG)
    monkeypatch.setattr(rb, "CONCURRENCY", 1)
    with pytest.raises(rb.SplitVoidError) as ei:
        rb.run_split(cases, 5715)
    assert "credit balance" in str(ei.value)
    assert ("FC-9003", BILLING_MSG) in ei.value.errors


def test_transport_error_voids(monkeypatch):
    cases = [_case(i) for i in range(4)]
    _patch(monkeypatch, "FC-9001", "fetch failed")
    monkeypatch.setattr(rb, "CONCURRENCY", 1)
    with pytest.raises(rb.SplitVoidError, match="fetch failed"):
        rb.run_split(cases, 5715)


def test_billing_error_voids_concurrent_mode(monkeypatch):
    cases = [_case(i) for i in range(8)]
    _patch(monkeypatch, "FC-9004", BILLING_MSG)
    monkeypatch.setattr(rb, "CONCURRENCY", 4)
    with pytest.raises(rb.SplitVoidError, match="credit balance"):
        rb.run_split(cases, 5715)


def test_clean_split_still_scores(monkeypatch):
    cases = [_case(i) for i in range(5)]
    monkeypatch.setattr(rb, "run_pipeline", _good_out)
    monkeypatch.setattr(rb.time, "sleep", lambda s: None)
    monkeypatch.setattr(rb, "pinned_scoring_model", lambda: "m")
    monkeypatch.setattr(rb, "CONCURRENCY", 4)
    records, agg = rb.run_split(cases, 5715)
    assert len(records) == 5
    assert agg["n_cases"] == 5 and agg["safety_violations"] == 0
    assert [r["case"] for r in records] == [c["id"] for c in cases]  # order preserved


def test_heldout_refund_on_void(tmp_path):
    s = Session(tmp_path / "s.json")
    s.spend_heldout_eval()
    assert s.data["heldout_evals"] == 1
    s.refund_heldout_eval("attempt 1 heldout VOID: test")
    assert s.data["heldout_evals"] == 0
    assert s.data["refunds"] == ["attempt 1 heldout VOID: test"]
    s.refund_heldout_eval("floor check")  # never goes negative
    assert s.data["heldout_evals"] == 0
