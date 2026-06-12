# Optimizer proposal — verifier report

Gate result: **FAIL — rejected**

## Rationale (optimizer)
The two weak components are severity mid-range calibration and over-diagnosis of healthy vehicles. For severity, adding concrete distinguishing cues ("info=cosmetic/normal wear/no driveability impact", "moderate=noticeable symptom but vehicle still safe to drive", "urgent=driving risk or rapid deterioration", "do_not_drive=unsafe") gives the model clearer boundaries to avoid one-level over-calls. For diagnosis_slug, prepending a terse instruction to prefer no_fault_found when the description indicates normal operation, expected wear, or no confirmed defect reduces false-positive repair diagnoses on healthy vehicles. Both edits are minimal, non-safety, and avoid the patterns that failed in prior attempts.

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
