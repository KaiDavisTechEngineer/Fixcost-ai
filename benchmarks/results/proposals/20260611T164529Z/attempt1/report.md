# Optimizer proposal — verifier report

Gate result: **FAIL — rejected**

## Rationale (optimizer)
The two weak components are mean_severity (8.6/15) and mean_diagnosis (46.5/50). For severity, the current enum description is terse and lacks guidance on which symptoms map to which level, leading to miscalibration. For diagnosis_slug, the description doesn't emphasize precision or give concrete examples of close-call disambiguation. Expanding both field descriptions with concrete decision criteria should push the model toward correct slug selection and accurate severity assignment without meaningfully changing output length.

## Gate conditions
- FAIL pre-gate: train regression or safety violation; heldout eval not spent

## Metrics (proposal vs champion)
| metric | champion train | proposal train | champion heldout | proposal heldout |
|---|---|---|---|---|
| mean_score | 88.5 | 87.13 | 92.51 | — |
| safety_violations | 0 | 0 | 0 | — |
| mean_tokens | 6632.2 | 6957.3 | 6736.8 | — |
| mean_cost_usd | 0.0628 | 0.0652 | 0.0645 | — |
| mean_latency_s | 88.38 | 297.79 | 85.36 | — |

Diff in `proposal.diff`. NOT applied — apply only with Kai's approval.
