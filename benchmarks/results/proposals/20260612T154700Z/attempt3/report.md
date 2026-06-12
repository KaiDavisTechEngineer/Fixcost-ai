# Optimizer proposal — verifier report

Gate result: **FAIL — rejected**

## Rationale (optimizer)
The two weak areas are (1) severity mid-range over-calling (info→moderate or moderate→urgent one-level misses) and (2) over-diagnosis of healthy vehicles (no-fault cases getting a specific repair slug). For severity, adding concrete distinguishing criteria directly in the buildPrompt JSON instructions gives the LLM clearer calibration anchors before it sees the tool schema. For diagnosis_slug, adding an explicit sentence in the prompt instructing the model to use no_fault_found when symptoms are normal/minor/expected reduces false-positive repair diagnoses. These changes are small, touch only non-safety content, and keep output length roughly the same.

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
