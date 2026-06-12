# Optimizer proposal — verifier report

Gate result: **FAIL — rejected**

## Rationale (optimizer)
Two targeted fixes: (1) The severity description is too terse for mid-range calibration — expanding it with concrete landmark examples (noise/vibration/warning-light → info vs moderate vs urgent) reduces one-level misses. (2) The diagnosis_slug description doesn't strongly enough discourage over-diagnosing healthy vehicles; adding an explicit reminder to prefer no_fault_found when the described symptoms are normal/expected will reduce false positives on no-fault scenarios.

## Gate conditions
- PASS cond1: full test suite passes
- PASS cond2: 0 safety violations on heldout
- FAIL cond3a: heldout 90.57 < champion 92.51 - 0.5 tolerance

## Metrics (proposal vs champion)
| metric | champion train | proposal train | champion heldout | proposal heldout |
|---|---|---|---|---|
| mean_score | 89.84 | 94.04 | 92.51 | 90.57 |
| safety_violations | 0 | 0 | 0 | 0 |
| mean_tokens | 6649.5 | 6880.4 | 6736.8 | 6819.4 |
| mean_cost_usd | 0.063 | 0.0639 | 0.0645 | 0.0631 |
| mean_latency_s | 178.58 | 81.99 | 85.36 | 81.66 |

Diff in `proposal.diff`. NOT applied — apply only with Kai's approval.
