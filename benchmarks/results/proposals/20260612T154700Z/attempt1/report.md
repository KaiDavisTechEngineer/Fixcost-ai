# Optimizer proposal — verifier report

Gate result: **FAIL — rejected**

## Rationale (optimizer)
The two weak areas are (1) severity mid-range calibration (info/moderate/urgent one-level misses) and (2) over-diagnosis of healthy vehicles. For severity, expanding the enum description with concrete distinguishing examples for each level gives the model clearer boundaries. For diagnosis_slug, adding an explicit instruction to prefer no_fault_found when symptoms are normal/expected/minor reduces false positive repairs on no-fault scenarios. Both changes are minimal and touch only non-safety fields.

## Gate conditions
- FAIL cond1: test suite failed

## Metrics (proposal vs champion)
| metric | champion train | proposal train | champion heldout | proposal heldout |
|---|---|---|---|---|
| mean_score | 89.84 | ? | 92.48 | — |
| safety_violations | 0 | ? | 0 | — |
| mean_tokens | 6649.5 | None | 6604.6 | — |
| mean_cost_usd | 0.063 | None | 0.0624 | — |
| mean_latency_s | 178.58 | None | 177.03 | — |

Diff in `proposal.diff`. NOT applied — apply only with Kai's approval.
