"""Validation tests for case.schema.json, the taxonomy, and committed cases.

Run: python3 -m pytest benchmarks/tests/test_schema.py -q
"""
import copy
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from schema.validate import (  # noqa: E402
    validate,
    semantic_errors,
    load_schema,
    load_taxonomy,
    load_cases,
)

SCHEMA = load_schema()
TAXONOMY = load_taxonomy()


def good_case():
    return {
        "id": "FC-0001",
        "version": 1,
        "vehicle": {
            "year": 2013,
            "make": "Ford",
            "model": "C-MAX Hybrid",
            "powertrain": "hybrid",
            "mileage": 142000,
        },
        "complaint": "Whining noise from front end that rises with speed.",
        "observations": ["Noise persists in neutral while coasting"],
        "dtc_codes": [],
        "ground_truth": {
            "primary_diagnosis": "wheel_bearing_front_right",
            "acceptable_diagnoses": ["wheel_bearing_front_right", "wheel_bearing_front"],
            "wrong_but_plausible": ["cv_joint"],
            "must_mention_safety": False,
            "expected_cost_range_usd": [250, 550],
            "severity": "moderate",
        },
        "tags": ["noise", "drivetrain", "hybrid"],
    }


# ---- taxonomy ----

def test_taxonomy_slugs_are_well_formed():
    assert len(TAXONOMY) >= 100, "SPEC wants ~100-200 slugs"
    for slug in TAXONOMY:
        assert re.fullmatch(r"[a-z0-9_]+", slug), f"bad slug: {slug}"


def test_taxonomy_has_no_duplicates():
    assert len(TAXONOMY) == len(set(TAXONOMY))


def test_taxonomy_has_no_fault_found():
    # Required for the >=10% "monitor and recheck" / over-diagnosis cases.
    assert "no_fault_found" in TAXONOMY


# ---- schema: happy path ----

def test_good_case_passes_schema_and_semantics():
    assert validate(good_case(), SCHEMA) == []
    assert semantic_errors(good_case(), TAXONOMY) == []


# ---- schema: structural rejections ----

def test_bad_id_pattern_rejected():
    c = good_case(); c["id"] = "0001"
    assert any("pattern" in e for e in validate(c, SCHEMA))


def test_missing_required_field_rejected():
    c = good_case(); del c["complaint"]
    assert any("missing required property 'complaint'" in e for e in validate(c, SCHEMA))


def test_additional_property_rejected():
    c = good_case(); c["sneaky"] = True
    assert any("additional property 'sneaky'" in e for e in validate(c, SCHEMA))


def test_bad_powertrain_enum_rejected():
    c = good_case(); c["vehicle"]["powertrain"] = "rocket"
    assert any("enum" in e for e in validate(c, SCHEMA))


def test_bad_severity_enum_rejected():
    c = good_case(); c["ground_truth"]["severity"] = "kinda_bad"
    assert any("enum" in e for e in validate(c, SCHEMA))


def test_cost_range_must_be_two_ints():
    c = good_case(); c["ground_truth"]["expected_cost_range_usd"] = [250]
    assert any("minItems" in e for e in validate(c, SCHEMA))
    c2 = good_case(); c2["ground_truth"]["expected_cost_range_usd"] = [250, 550, 900]
    assert any("maxItems" in e for e in validate(c2, SCHEMA))


def test_boolean_where_int_expected_rejected():
    c = good_case(); c["vehicle"]["mileage"] = True
    assert any("expected integer" in e for e in validate(c, SCHEMA))


def test_bad_dtc_code_pattern_rejected():
    c = good_case(); c["dtc_codes"] = ["NOTACODE"]
    assert any("pattern" in e for e in validate(c, SCHEMA))


def test_valid_dtc_code_accepted():
    c = good_case(); c["dtc_codes"] = ["P0301", "C1234"]
    assert validate(c, SCHEMA) == []


# ---- semantic (cross-field / cross-file) rejections ----

def test_unknown_slug_rejected():
    c = good_case(); c["ground_truth"]["primary_diagnosis"] = "flux_capacitor"
    c["ground_truth"]["acceptable_diagnoses"] = ["flux_capacitor"]
    assert any("not in diagnosis taxonomy" in e for e in semantic_errors(c, TAXONOMY))


def test_primary_must_be_in_acceptable():
    c = good_case(); c["ground_truth"]["acceptable_diagnoses"] = ["wheel_bearing_front"]
    assert any("must also appear in acceptable_diagnoses" in e for e in semantic_errors(c, TAXONOMY))


def test_acceptable_and_wrong_cannot_overlap():
    c = good_case(); c["ground_truth"]["wrong_but_plausible"] = ["wheel_bearing_front_right"]
    assert any("both acceptable and wrong_but_plausible" in e for e in semantic_errors(c, TAXONOMY))


def test_cost_low_high_ordering():
    c = good_case(); c["ground_truth"]["expected_cost_range_usd"] = [600, 200]
    assert any("low 600 > high 200" in e for e in semantic_errors(c, TAXONOMY))


# ---- committed cases (guards the seed set once it exists) ----

def test_all_committed_cases_valid():
    cases = load_cases("train") + load_cases("heldout")
    for c in cases:
        cid = c.get("id", "<no id>")
        assert validate(c, SCHEMA) == [], f"{cid} fails schema: {validate(c, SCHEMA)}"
        assert semantic_errors(c, TAXONOMY) == [], f"{cid} fails semantics: {semantic_errors(c, TAXONOMY)}"


def test_committed_case_ids_unique():
    cases = load_cases("train") + load_cases("heldout")
    ids = [c["id"] for c in cases]
    assert len(ids) == len(set(ids)), "duplicate case ids across splits"
