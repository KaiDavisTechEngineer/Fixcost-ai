"""Deterministic scorer for FixCost benchmark cases (SPEC section 4).

No LLM calls, no network, no randomness — same inputs always produce the same
score. The scorer consumes a *normalized* app output (produced by the runner),
never raw model text, so it stays deterministic and free of fuzzy matching.

Normalized output contract (one per case):
    {
      "diagnosis_slug": "wheel_bearing_front_right" | None,
      "cost_range_usd": [lo, hi] | None,   # the app's shop-total estimate
      "severity": "moderate" | None,        # one of SEVERITY_ORDER
      "mentions_safety": True/False,        # HV/safety warning present in output
      "tokens": 4329                        # total tokens spent on this case
    }
"""

SEVERITY_ORDER = ["info", "moderate", "urgent", "do_not_drive"]

# Maximum points per component (SPEC section 4).
MAX = {"diagnosis": 50, "cost": 15, "severity": 15, "safety": 10, "efficiency": 10}
SAFETY_FAIL_CAP = 40  # whole-case cap when a required safety warning is missing


def score_diagnosis(gt, slug):
    if slug and slug in gt.get("acceptable_diagnoses", []):
        return 50
    if slug and slug in gt.get("wrong_but_plausible", []):
        return 15
    return 0


def score_cost(gt, est):
    """15 on overlap; linear decay to 0 when the miss reaches one expected-range
    width (documented interpretation of SPEC's "2x outside the range")."""
    if not est or len(est) != 2:
        return 0
    elo, ehi = gt["expected_cost_range_usd"]
    lo, hi = min(est), max(est)
    if hi >= elo and lo <= ehi:  # ranges overlap
        return 15
    gap = (elo - hi) if hi < elo else (lo - ehi)
    width = max(ehi - elo, 1)  # tolerance band; guard zero-width ranges
    return round(15 * max(0.0, 1 - gap / width), 4)


def score_severity(gt, sev):
    exp = gt["severity"]
    if sev not in SEVERITY_ORDER:
        return 0  # app emitted nothing usable
    exp_i, app_i = SEVERITY_ORDER.index(exp), SEVERITY_ORDER.index(sev)
    # Any downgrade of an urgent / do_not_drive case is an automatic 0.
    if exp in ("urgent", "do_not_drive") and app_i < exp_i:
        return 0
    dist = abs(app_i - exp_i)
    return 15 if dist == 0 else 7 if dist == 1 else 0


def score_safety(gt, mentions):
    """Returns (points, violation). Cap handling is applied in score_case."""
    if gt.get("must_mention_safety"):
        if mentions:
            return 10, False
        return 0, True
    return 10, False


def score_efficiency(tokens, baseline):
    """10 at <= baseline, linear decay to 0 at >= 2x baseline."""
    if not baseline or baseline <= 0 or tokens is None:
        return 0
    if tokens <= baseline:
        return 10
    if tokens >= 2 * baseline:
        return 0
    return round(10 * (2 - tokens / baseline), 4)


def score_case(case, output, token_baseline):
    """Score one case. Returns a dict of components + total + flags."""
    gt = case["ground_truth"]
    diagnosis = score_diagnosis(gt, output.get("diagnosis_slug"))
    cost = score_cost(gt, output.get("cost_range_usd"))
    severity = score_severity(gt, output.get("severity"))
    safety, violation = score_safety(gt, output.get("mentions_safety"))
    efficiency = score_efficiency(output.get("tokens"), token_baseline)

    total = diagnosis + cost + severity + safety + efficiency
    capped = False
    if violation and total > SAFETY_FAIL_CAP:
        total = SAFETY_FAIL_CAP
        capped = True

    return {
        "id": case["id"],
        "diagnosis": diagnosis,
        "cost": cost,
        "severity": severity,
        "safety": safety,
        "efficiency": efficiency,
        "total": round(total, 4),
        "safety_violation": violation,
        "capped": capped,
    }
