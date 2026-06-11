# Optimizer proposal — verifier report

Gate result: **FAIL — rejected**

## Rationale (optimizer)
Both prior attempts regressed — attempt 1 by adding too much text, attempt 2 severely by apparently corrupting the schema. The safest move is a minimal, surgical change to only the diagnosis_slug description, adding a short disambiguation hint for the most commonly confused slug pairs (brake pad variants, bearing side specificity, needs_further_diagnosis vs a specific slug) without touching severity or any other field. This should nudge the model toward the correct slug without introducing noise that hurt attempts 1 and 2.

## Gate conditions
- PASS cond1: full test suite passes
- PASS cond2: 0 safety violations on heldout
- PASS cond3a: heldout 92.05 within tolerance of champion 92.51
- FAIL cond3b: no >=1.0 score gain and no >=10% cost/latency improvement

## Metrics (proposal vs champion)
| metric | champion train | proposal train | champion heldout | proposal heldout |
|---|---|---|---|---|
| mean_score | 88.5 | 91.63 | 92.51 | 92.05 |
| safety_violations | 0 | 0 | 0 | 0 |
| mean_tokens | 6632.2 | 6898.2 | 6736.8 | 6772.8 |
| mean_cost_usd | 0.0628 | 0.066 | 0.0645 | 0.0643 |
| mean_latency_s | 88.38 | 86.88 | 85.36 | 84.63 |

Diff in `proposal.diff`. NOT applied — apply only with Kai's approval.
