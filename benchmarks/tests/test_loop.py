"""Unit tests for the Phase 2C loop machinery — all offline, no API calls.

Pins the four code-enforced invariants:
  1. max 3 heldout evaluations per session
  2. the optimizer view can never contain heldout/case data
  3. proposals touching safety/HV content or non-allowlisted files are rejected
  4. the SPEC section 5 gate decision logic
"""
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from optimize.verifier import Session, HeldoutBudgetExceeded, MAX_HELDOUT_EVALS, gate_decision  # noqa: E402
from optimize.optimizer import validate_proposal, apply_edits, ALLOWED_FILES  # noqa: E402
from optimize.evaluator import optimizer_view  # noqa: E402


# ---- 1. heldout budget ----

def test_heldout_budget_allows_three_then_raises(tmp_path):
    s = Session(tmp_path / "session.json")
    for _ in range(MAX_HELDOUT_EVALS):
        s.spend_heldout_eval()
    with pytest.raises(HeldoutBudgetExceeded):
        s.spend_heldout_eval()


def test_heldout_budget_persists_across_restarts(tmp_path):
    p = tmp_path / "session.json"
    Session(p).spend_heldout_eval()
    s2 = Session(p)  # simulated crash + resume
    assert s2.data["heldout_evals"] == 1
    s2.spend_heldout_eval()
    s2.spend_heldout_eval()
    with pytest.raises(HeldoutBudgetExceeded):
        Session(p).spend_heldout_eval()


# ---- 2. optimizer isolation ----

def _train_report(**over):
    rep = {"split": "train",
           "aggregate": {"mean_score": 88.5, "safety_violations": 0},
           "components": {"mean_severity": 9.6},
           "records": [{"case": "FC-0001"}]}
    rep.update(over)
    return rep


CHAMPION = {"metrics": {
    "train": {"mean_score": 88.5, "safety_violations": 0, "mean_tokens": 6632.2,
              "mean_cost_usd": 0.0628, "mean_latency_s": 88.38},
    "heldout": {"mean_score": 92.51, "safety_violations": 0, "mean_tokens": 6736.8,
                "mean_cost_usd": 0.0645, "mean_latency_s": 85.36},
}}


def test_optimizer_view_contains_only_aggregates():
    view = optimizer_view(_train_report(), CHAMPION)
    assert set(view) == {"train_aggregate", "train_component_means",
                         "champion_train_aggregate", "score_rubric_max"}
    assert "records" not in view and "heldout" not in str(view).lower()


def test_optimizer_view_rejects_heldout_report():
    with pytest.raises(ValueError):
        optimizer_view(_train_report(split="heldout"), CHAMPION)


def test_optimizer_view_detects_leak():
    poisoned = _train_report()
    poisoned["aggregate"] = dict(poisoned["aggregate"], note="heldout mean was 92")
    with pytest.raises(RuntimeError, match="leaked"):
        optimizer_view(poisoned, CHAMPION)


# ---- 3. proposal validation ----

@pytest.fixture()
def repo(tmp_path):
    (tmp_path / "shared").mkdir()
    (tmp_path / "shared" / "guide.js").write_text(
        'export const A = "severity: info=no urgency";\n'
        'export const B = "unique target text";\n'
        'export const C = "dup"; export const D = "dup";\n')
    return tmp_path


def _prop(**e):
    edit = {"file": "shared/guide.js", "old": "unique target text",
            "new": "improved target text"}
    edit.update(e)
    return {"rationale": "r", "edits": [edit]}


def test_valid_proposal_passes(repo):
    assert validate_proposal(_prop(), repo) == []


def test_file_outside_allowlist_rejected(repo):
    errs = validate_proposal(_prop(file="api/generate.js"), repo)
    assert any("allowlist" in e for e in errs)
    assert ALLOWED_FILES == ["shared/guide.js"]


def test_old_text_missing_or_ambiguous_rejected(repo):
    assert any("not found" in e for e in validate_proposal(_prop(old="nope"), repo))
    assert any("must be unique" in e for e in validate_proposal(_prop(old='"dup"'), repo))


def test_safety_content_rejected(repo):
    for bad in ("safety warnings list", "high-voltage isolation", "high voltage",
                "must_mention_safety", "the HV system", '"safety":["..."]',
                "safety: strArr"):
        errs = validate_proposal(_prop(new=bad), repo)
        assert any("safety" in e.lower() for e in errs), bad


def test_severity_prose_using_word_safety_is_allowed(repo):
    # Kai-approved narrowing (2026-06-11): calibration prose may say "safety
    # risk"; the byte-level invariant check is the real guard.
    ok = _prop(new="urgent=fix within days, a safety risk if driven; moderate=fix soon")
    assert validate_proposal(ok, repo) == []


# ---- 3b. post-apply protected invariants ----

def test_protected_invariants_detect_removal(tmp_path):
    from optimize.verifier import check_protected_invariants
    inv = {"f.js": ["KEEP THIS SPAN", "AND THIS ONE"]}
    (tmp_path / "f.js").write_text("xx KEEP THIS SPAN yy AND THIS ONE zz")
    assert check_protected_invariants(tmp_path, inv) == []
    (tmp_path / "f.js").write_text("xx KEEP THIS SPAN yy zz")  # span removed
    violations = check_protected_invariants(tmp_path, inv)
    assert len(violations) == 1 and "AND THIS ONE" in violations[0]


def test_protected_invariants_match_real_file():
    """Drift guard: if shared/guide.js is refactored, the invariant spans must
    be updated too — otherwise every proposal would be (fail-safe) rejected."""
    from optimize.verifier import PROTECTED_INVARIANTS, check_protected_invariants
    repo_root = Path(__file__).resolve().parents[2]
    assert check_protected_invariants(repo_root, PROTECTED_INVARIANTS) == []


# NOTE: do not add tests that assert on the *content* of optimizer-editable
# regions of shared/guide.js. The suite runs inside verifier worktrees where a
# proposal has rewritten those regions, so any such test bricks gate cond1 for
# every proposal touching them. A seed-drift test did exactly that twice
# (sessions 20260612T154700Z and attempts 2-3 of 20260612T182857Z) and was
# removed after the seeded retest completed. Protected safety spans are the
# exception — they must never change, which is what check_protected_invariants
# and its drift test assert.


def test_apply_edits_pure():
    files = {"shared/guide.js": "alpha beta gamma"}
    out = apply_edits(files, [{"file": "shared/guide.js", "old": "beta", "new": "BETA"}])
    assert out["shared/guide.js"] == "alpha BETA gamma"
    assert files["shared/guide.js"] == "alpha beta gamma"  # input untouched


# ---- 4. gate decision (SPEC section 5) ----

def _held(score, violations=0, cost=0.0645, lat=85.36):
    return {"mean_score": score, "safety_violations": violations,
            "mean_cost_usd": cost, "mean_latency_s": lat}


TRAIN_OK = {"safety_violations": 0, "mean_score": 89.0}


def test_gate_pass_by_score_improvement():
    ok, _ = gate_decision(CHAMPION, TRAIN_OK, _held(93.6), tests_ok=True)
    assert ok


def test_gate_pass_by_cost_improvement_within_tolerance():
    ok, reasons = gate_decision(CHAMPION, TRAIN_OK, _held(92.3, cost=0.055), tests_ok=True)
    assert ok, reasons


def test_gate_fail_score_below_tolerance():
    ok, _ = gate_decision(CHAMPION, TRAIN_OK, _held(91.5), tests_ok=True)
    assert not ok


def test_gate_fail_no_improvement_axis():
    ok, _ = gate_decision(CHAMPION, TRAIN_OK, _held(92.6), tests_ok=True)
    assert not ok  # within tolerance but no >=1.0 gain and no >=10% cost/latency win


def test_gate_fail_on_any_safety_violation():
    ok, _ = gate_decision(CHAMPION, {"safety_violations": 1, "mean_score": 95.0},
                          _held(95.0), tests_ok=True)
    assert not ok
    ok, _ = gate_decision(CHAMPION, TRAIN_OK, _held(95.0, violations=1), tests_ok=True)
    assert not ok


def test_gate_fail_on_test_suite():
    ok, _ = gate_decision(CHAMPION, TRAIN_OK, _held(99.0), tests_ok=False)
    assert not ok
