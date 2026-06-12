# Optimizer proposal — verifier report

Gate result: **FAIL — rejected**

## Rationale (optimizer)
The two weak areas are (1) severity mid-range calibration (info/moderate/urgent one-level misses) and (2) over-diagnosis of healthy vehicles. For severity, expanding the enum description with concrete distinguishing examples for each level gives the model clearer boundaries. For diagnosis_slug, adding an explicit instruction to prefer no_fault_found when symptoms are normal/expected/minor reduces false positive repairs on no-fault scenarios. Both changes are minimal and touch only non-safety fields.

## Gate conditions
- PASS cond1: full test suite passes
- PASS cond2: 0 safety violations on heldout
- FAIL cond3a: heldout 79.93 < champion 92.48 - 0.5 tolerance

## Metrics (proposal vs champion)
| metric | champion train | proposal train | champion heldout | proposal heldout |
|---|---|---|---|---|
| mean_score | 89.84 | 93.28 | 92.48 | 79.93 |
| safety_violations | 0 | 0 | 0 | 0 |
| mean_tokens | 6649.5 | 6713.2 | 6604.6 | 5332.3 |
| mean_cost_usd | 0.063 | 0.0625 | 0.0624 | 0.0495 |
| mean_latency_s | 178.58 | 81.06 | 177.03 | 364.54 |

Diff in `proposal.diff`. NOT applied — apply only with Kai's approval.
