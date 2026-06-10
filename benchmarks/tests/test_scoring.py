"""Unit tests for the deterministic scorer against hand-computed fixtures.

Every expected number here is computed by hand from SPEC section 4, not from the
implementation, so the tests pin the rubric rather than the code.

Run: python3 -m pytest benchmarks/tests/test_scoring.py -q
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from scoring import (  # noqa: E402
    score_case,
    score_cost,
    score_severity,
    score_efficiency,
    MAX,
)

B = 4000  # token baseline used throughout the fixtures


def case(severity, cost_range, must_safety, acceptable=("x",), wrong=("y",)):
    return {
        "id": "FC-0000",
        "ground_truth": {
            "primary_diagnosis": acceptable[0],
            "acceptable_diagnoses": list(acceptable),
            "wrong_but_plausible": list(wrong),
            "must_mention_safety": must_safety,
            "expected_cost_range_usd": list(cost_range),
            "severity": severity,
        },
    }


def out(slug=None, cost=None, severity=None, mentions=False, tokens=None):
    return {
        "diagnosis_slug": slug,
        "cost_range_usd": cost,
        "severity": severity,
        "mentions_safety": mentions,
        "tokens": tokens,
    }


# (label, case, output, baseline, expected_components_and_flags)
FIXTURES = [
    ("perfect",
     case("moderate", [250, 550], True),
     out("x", [250, 550], "moderate", True, 3000), B,
     dict(diagnosis=50, cost=15, severity=15, safety=10, efficiency=10, total=100, safety_violation=False, capped=False)),

    ("wrong_but_plausible_diag",
     case("moderate", [250, 550], False),
     out("y", [250, 550], "moderate", False, 4000), B,
     dict(diagnosis=15, cost=15, severity=15, safety=10, efficiency=10, total=65, safety_violation=False, capped=False)),

    ("fully_wrong_diag_and_slow",
     case("moderate", [250, 550], False),
     out("z", [250, 550], "moderate", False, 8000), B,
     dict(diagnosis=0, cost=15, severity=15, safety=10, efficiency=0, total=40, safety_violation=False, capped=False)),

    ("safety_violation_caps_at_40",
     case("moderate", [250, 550], True),
     out("x", [250, 550], "moderate", False, 3000), B,
     dict(diagnosis=50, cost=15, severity=15, safety=0, efficiency=10, total=40, safety_violation=True, capped=True)),

    ("severity_off_by_one_upgrade",
     case("moderate", [250, 550], False),
     out("x", [250, 550], "urgent", False, 6000), B,
     dict(diagnosis=50, cost=15, severity=7, safety=10, efficiency=5, total=87, safety_violation=False, capped=False)),

    ("severity_downgrade_of_do_not_drive_is_zero",
     case("do_not_drive", [250, 550], False),
     out("x", [250, 550], "urgent", False, 4000), B,
     dict(diagnosis=50, cost=15, severity=0, safety=10, efficiency=10, total=85, safety_violation=False, capped=False)),

    ("severity_off_by_two",
     case("info", [250, 550], False),
     out("x", [250, 550], "urgent", False, 3000), B,
     dict(diagnosis=50, cost=15, severity=0, safety=10, efficiency=10, total=85, safety_violation=False, capped=False)),

    ("cost_above_partial_decay",
     case("moderate", [200, 400], False),
     out("x", [500, 600], "moderate", False, 4000), B,
     dict(diagnosis=50, cost=7.5, severity=15, safety=10, efficiency=10, total=92.5, safety_violation=False, capped=False)),

    ("cost_miss_beyond_tolerance",
     case("moderate", [200, 400], False),
     out("x", [700, 800], "moderate", False, 3000), B,
     dict(diagnosis=50, cost=0, severity=15, safety=10, efficiency=10, total=85, safety_violation=False, capped=False)),

    ("all_missing",
     case("moderate", [250, 550], True),
     out(None, None, None, False, None), B,
     dict(diagnosis=0, cost=0, severity=0, safety=0, efficiency=0, total=0, safety_violation=True, capped=False)),

    ("efficiency_partial",
     case("moderate", [250, 550], False),
     out("x", [250, 550], "moderate", False, 5000), B,
     dict(diagnosis=50, cost=15, severity=15, safety=10, efficiency=7.5, total=97.5, safety_violation=False, capped=False)),

    ("cost_below_partial_decay",
     case("moderate", [300, 500], False),
     out("x", [100, 150], "moderate", False, 4000), B,
     dict(diagnosis=50, cost=3.75, severity=15, safety=10, efficiency=10, total=88.75, safety_violation=False, capped=False)),

    ("severity_upgrade_of_urgent_is_off_by_one",
     case("urgent", [250, 550], True),
     out("x", [250, 550], "do_not_drive", True, 4000), B,
     dict(diagnosis=50, cost=15, severity=7, safety=10, efficiency=10, total=92, safety_violation=False, capped=False)),
]


def test_fixtures():
    assert len(FIXTURES) >= 10
    for label, c, o, baseline, exp in FIXTURES:
        got = score_case(c, o, baseline)
        for key, want in exp.items():
            assert got[key] == want, f"{label}: {key} expected {want}, got {got[key]}  (full: {got})"


def test_total_bounds_and_component_caps():
    for label, c, o, baseline, _ in FIXTURES:
        got = score_case(c, o, baseline)
        assert 0 <= got["total"] <= 100, f"{label}: total out of range"
        for comp, cap in MAX.items():
            assert 0 <= got[comp] <= cap, f"{label}: {comp} out of [0,{cap}]"


def test_cost_overlap_boundary_counts_as_overlap():
    gt = {"expected_cost_range_usd": [250, 550]}
    assert score_cost(gt, [550, 600]) == 15  # touching upper edge
    assert score_cost(gt, [100, 250]) == 15  # touching lower edge


def test_efficiency_monotonic_decay():
    assert score_efficiency(4000, 4000) == 10
    assert score_efficiency(8000, 4000) == 0
    assert score_efficiency(9000, 4000) == 0
    assert 0 < score_efficiency(6000, 4000) < 10


def test_severity_exact_each_level():
    for lvl in ["info", "moderate", "urgent", "do_not_drive"]:
        assert score_severity({"severity": lvl}, lvl) == 15
