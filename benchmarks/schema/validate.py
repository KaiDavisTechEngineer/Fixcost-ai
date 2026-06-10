"""Minimal, dependency-free JSON-Schema (Draft-07 subset) validator.

Supports exactly the keywords used by case.schema.json so the benchmark harness
stays hermetic (no pip installs). Not a general-purpose validator.

Supported keywords: type, required, additionalProperties(false), properties,
enum, items, minItems, maxItems, minimum, maximum, minLength, maxLength, pattern.
"""
import json
import re
from pathlib import Path

_TYPES = {
    "object": dict,
    "array": list,
    "string": str,
    "integer": int,
    "number": (int, float),
    "boolean": bool,
}


def _check_type(value, expected, path, errors):
    # bool is a subclass of int in Python; reject it where integer/number expected.
    if expected in ("integer", "number") and isinstance(value, bool):
        errors.append(f"{path}: expected {expected}, got boolean")
        return False
    py = _TYPES[expected]
    if not isinstance(value, py):
        errors.append(f"{path}: expected {expected}, got {type(value).__name__}")
        return False
    return True


def _validate(value, schema, path, errors):
    t = schema.get("type")
    if t and not _check_type(value, t, path, errors):
        return  # type wrong; deeper checks would be noise

    if "enum" in schema and value not in schema["enum"]:
        errors.append(f"{path}: {value!r} not in enum {schema['enum']}")

    if isinstance(value, str):
        if "minLength" in schema and len(value) < schema["minLength"]:
            errors.append(f"{path}: shorter than minLength {schema['minLength']}")
        if "maxLength" in schema and len(value) > schema["maxLength"]:
            errors.append(f"{path}: longer than maxLength {schema['maxLength']}")
        if "pattern" in schema and not re.search(schema["pattern"], value):
            errors.append(f"{path}: {value!r} does not match pattern {schema['pattern']}")

    if isinstance(value, (int, float)) and not isinstance(value, bool):
        if "minimum" in schema and value < schema["minimum"]:
            errors.append(f"{path}: {value} < minimum {schema['minimum']}")
        if "maximum" in schema and value > schema["maximum"]:
            errors.append(f"{path}: {value} > maximum {schema['maximum']}")

    if isinstance(value, list):
        if "minItems" in schema and len(value) < schema["minItems"]:
            errors.append(f"{path}: fewer than minItems {schema['minItems']}")
        if "maxItems" in schema and len(value) > schema["maxItems"]:
            errors.append(f"{path}: more than maxItems {schema['maxItems']}")
        item_schema = schema.get("items")
        if item_schema:
            for i, item in enumerate(value):
                _validate(item, item_schema, f"{path}[{i}]", errors)

    if isinstance(value, dict):
        props = schema.get("properties", {})
        for req in schema.get("required", []):
            if req not in value:
                errors.append(f"{path}: missing required property '{req}'")
        if schema.get("additionalProperties") is False:
            for key in value:
                if key not in props:
                    errors.append(f"{path}: additional property '{key}' not allowed")
        for key, sub in props.items():
            if key in value:
                _validate(value[key], sub, f"{path}.{key}" if path else key, errors)


def validate(instance, schema):
    """Return a list of error strings; empty list means valid."""
    errors = []
    _validate(instance, schema, "", errors)
    return errors


def load_schema():
    return json.loads((Path(__file__).with_name("case.schema.json")).read_text())


def load_taxonomy():
    data = json.loads((Path(__file__).with_name("diagnosis_taxonomy.json")).read_text())
    return data["diagnoses"]


def semantic_errors(case, taxonomy):
    """Cross-field / cross-file checks the JSON-schema layer can't express."""
    errors = []
    gt = case.get("ground_truth", {})
    vocab = set(taxonomy)
    slug_fields = {
        "primary_diagnosis": [gt.get("primary_diagnosis")] if gt.get("primary_diagnosis") else [],
        "acceptable_diagnoses": gt.get("acceptable_diagnoses", []),
        "wrong_but_plausible": gt.get("wrong_but_plausible", []),
    }
    for field, slugs in slug_fields.items():
        for s in slugs:
            if s not in vocab:
                errors.append(f"ground_truth.{field}: slug '{s}' not in diagnosis taxonomy")
    if gt.get("primary_diagnosis") and gt["primary_diagnosis"] not in gt.get("acceptable_diagnoses", []):
        errors.append("ground_truth: primary_diagnosis must also appear in acceptable_diagnoses")
    overlap = set(gt.get("acceptable_diagnoses", [])) & set(gt.get("wrong_but_plausible", []))
    if overlap:
        errors.append(f"ground_truth: slugs in both acceptable and wrong_but_plausible: {sorted(overlap)}")
    lo, hi = (gt.get("expected_cost_range_usd", [None, None]) + [None, None])[:2]
    if isinstance(lo, int) and isinstance(hi, int) and lo > hi:
        errors.append(f"ground_truth.expected_cost_range_usd: low {lo} > high {hi}")
    return errors


def load_cases(split):
    """Load committed cases for a split ('train' or 'heldout'), sorted by id."""
    d = Path(__file__).parent.parent / "cases" / split
    cases = []
    if d.is_dir():
        for f in sorted(d.glob("*.json")):
            cases.append(json.loads(f.read_text()))
    return cases
