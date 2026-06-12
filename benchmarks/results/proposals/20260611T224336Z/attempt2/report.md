# Optimizer proposal — verifier report

Gate result: **FAIL — rejected**

## Rationale (optimizer)
The two weak areas are (1) severity mid-range calibration (info/moderate/urgent one-level misses) and (2) over-diagnosis of healthy vehicles. For severity, expanding the enum description with concrete distinguishing examples for each level gives the model clearer boundaries. For diagnosis_slug, adding an explicit instruction to prefer no_fault_found when symptoms are normal/expected/minor reduces false positive repairs on no-fault scenarios. Both changes are minimal and touch only non-safety fields.

## Gate conditions
- PASS cond1: full test suite passes
- PASS cond2: 0 safety violations on heldout
- PASS cond3a: heldout 92.82 within tolerance of champion 92.51
- FAIL cond3b: no >=1.0 score gain and no >=10% cost/latency improvement

## Metrics (proposal vs champion)
| metric | champion train | proposal train | champion heldout | proposal heldout |
|---|---|---|---|---|
| mean_score | 89.84 | 94.7 | 92.51 | 92.82 |
| safety_violations | 0 | 0 | 0 | 0 |
| mean_tokens | 6649.5 | 6654.9 | 6736.8 | 6758.4 |
| mean_cost_usd | 0.063 | 0.0616 | 0.0645 | 0.0633 |
| mean_latency_s | 178.58 | 79.55 | 85.36 | 82.71 |

Diff in `proposal.diff`. NOT applied — apply only with Kai's approval.
