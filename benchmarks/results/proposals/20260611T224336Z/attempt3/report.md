# Optimizer proposal — verifier report

Gate result: **FAIL — rejected**

## Rationale (optimizer)
The two weak components are severity mid-range calibration (info/moderate/urgent one-level misses) and over-diagnosis of healthy vehicles (no_fault_found being replaced by specific repair slugs). Previous attempts failed the verifier gate, likely because the description text grew too long or touched restricted areas. This attempt makes the smallest possible targeted edits: (1) for diagnosis_slug, add a brief but explicit reminder to prefer no_fault_found when symptoms are consistent with normal operation or no defect is confirmed; (2) for severity, add concise landmark anchors inline — "info=cosmetic/normal wear no urgency, moderate=drivable but fix within weeks, urgent=fix within days, do_not_drive=unsafe to drive" — without expanding the field substantially.

## Gate conditions
- PASS cond1: full test suite passes
- PASS cond2: 0 safety violations on heldout
- FAIL cond3a: heldout 91.68 < champion 92.51 - 0.5 tolerance

## Metrics (proposal vs champion)
| metric | champion train | proposal train | champion heldout | proposal heldout |
|---|---|---|---|---|
| mean_score | 89.84 | 93.43 | 92.51 | 91.68 |
| safety_violations | 0 | 0 | 0 | 0 |
| mean_tokens | 6649.5 | 6784.5 | 6736.8 | 6752.6 |
| mean_cost_usd | 0.063 | 0.064 | 0.0645 | 0.0636 |
| mean_latency_s | 178.58 | 237.15 | 85.36 | 82.62 |

Diff in `proposal.diff`. NOT applied — apply only with Kai's approval.
