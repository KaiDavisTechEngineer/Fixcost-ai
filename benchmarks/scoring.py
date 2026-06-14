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

# Scoring version — bump when the rubric changes so runs under different scorers
# can never be silently compared (mirrors the scoring_model pin in champion.json).
#   1 = original 5-component /100 scorer
#   2 = + deterministic differential component (Change 2), additive, max 110
SCORING_VERSION = 2

# Maximum points per component. differential (Change 2) is ADDITIVE → max 110.
MAX = {"diagnosis": 50, "cost": 15, "severity": 15, "safety": 10, "efficiency": 10,
       "differential": 10}
SAFETY_FAIL_CAP = 40  # whole-case cap when a required safety warning is missing

# Likelihood → rank-quality points (Change 2, rubric (i): always credit when an
# acceptable-diagnosis item is present in the differential).
LIKELIHOOD_RANK = {"most_likely": 4, "likely": 3, "possible": 2, "less_likely": 1, "rule_out": 0}


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


def score_differential(gt, differential, guide_slug):
    """Change 2 — deterministic credit for the ranked differential (max 10).

      coverage(6): GT cause present in the list — 6 if any item slug is in
                   acceptable_diagnoses, 3 if in wrong_but_plausible, else 0.
      rank(4):     when an acceptable item is present, the likelihood tier of the
                   BEST acceptable item (most_likely=4 … rule_out=0).
    Well-formedness gate (else 0): 3-6 items, each with non-empty discriminator AND
    confirmation_test, and the top item's slug == the guide's diagnosis_slug.
    No LLM, no randomness — pure membership / enum / length / presence checks."""
    if not isinstance(differential, list) or not differential:
        return 0
    n = len(differential)
    if not (3 <= n <= 6):
        return 0
    for it in differential:
        if not isinstance(it, dict) or not it.get("discriminator") or not it.get("confirmation_test"):
            return 0
    top_slug = differential[0].get("diagnosis_slug")
    if guide_slug is not None and top_slug != guide_slug:
        return 0  # top of the list must be the cause the guide committed to

    acc = gt.get("acceptable_diagnoses", [])
    plaus = gt.get("wrong_but_plausible", [])
    items = [(it.get("diagnosis_slug"), it.get("likelihood")) for it in differential]
    acc_items = [(s, lk) for s, lk in items if s in acc]
    if acc_items:
        return 6 + max(LIKELIHOOD_RANK.get(lk, 0) for _, lk in acc_items)
    if any(s in plaus for s, _ in items):
        return 3
    return 0


def score_case(case, output, token_baseline):
    """Score one case. Returns a dict of components + total + flags."""
    gt = case["ground_truth"]
    diagnosis = score_diagnosis(gt, output.get("diagnosis_slug"))
    cost = score_cost(gt, output.get("cost_range_usd"))
    severity = score_severity(gt, output.get("severity"))
    safety, violation = score_safety(gt, output.get("mentions_safety"))
    efficiency = score_efficiency(output.get("tokens"), token_baseline)
    differential = score_differential(gt, output.get("differential"), output.get("diagnosis_slug"))

    total = diagnosis + cost + severity + safety + efficiency + differential
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
        "differential": differential,
        "total": round(total, 4),
        "safety_violation": violation,
        "capped": capped,
    }
