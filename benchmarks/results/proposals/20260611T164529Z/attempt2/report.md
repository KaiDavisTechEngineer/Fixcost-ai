# Optimizer proposal — verifier report

Gate result: **FAIL — rejected**

## Rationale (optimizer)
Attempt 1 expanded both descriptions heavily and regressed, likely due to increased input tokens and prompt noise. This attempt makes a smaller, more targeted change: refine only the severity description with concise, concrete clinical criteria (tying severity levels to symptom urgency signals like warning lights, drivability loss, and safety risk) without touching the diagnosis_slug field. This should improve severity calibration with minimal token overhead.

## Gate conditions
- FAIL pre-gate: train regression or safety violation; heldout eval not spent

## Metrics (proposal vs champion)
| metric | champion train | proposal train | champion heldout | proposal heldout |
|---|---|---|---|---|
| mean_score | 88.5 | 66.13 | 92.51 | — |
| safety_violations | 0 | 0 | 0 | — |
| mean_tokens | 6632.2 | 4897.8 | 6736.8 | — |
| mean_cost_usd | 0.0628 | 0.0471 | 0.0645 | — |
| mean_latency_s | 88.38 | 879.58 | 85.36 | — |

Diff in `proposal.diff`. NOT applied — apply only with Kai's approval.
