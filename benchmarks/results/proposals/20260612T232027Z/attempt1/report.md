# Optimizer proposal — verifier report

Gate result: **FAIL — rejected**

## Rationale (optimizer)
Human-authored (Kai-directed) symmetric severity calibration. Evidence: baseline over-calls the info/moderate/urgent mid-range by one level (13/25 train cases, several heldout); the rejected optimizer fix added a directional 'choose the lower' rule that collapsed on under-call scenarios (heldout 79.93). This version anchors each level to the consequence of continued driving - symmetric criteria, no directional tiebreak. Scary-sounding-but-benign symptoms get pushed down by the consequence test exactly as mild-sounding-but-dangerous ones get pushed up.

## Gate conditions
- PASS cond1: full test suite passes
- FAIL cond2: 2 safety violation(s) on heldout (must be 0)
- FAIL cond3a: heldout 83.61 < champion 92.48 - 0.5 tolerance

## Metrics (proposal vs champion)
| metric | champion train | proposal train | champion heldout | proposal heldout |
|---|---|---|---|---|
| mean_score | 89.84 | 91.17 | 92.48 | 83.61 |
| safety_violations | 0 | 0 | 0 | 2 |
| mean_tokens | 6649.5 | 6755.4 | 6604.6 | 5806.9 |
| mean_cost_usd | 0.063 | 0.0627 | 0.0624 | 0.0537 |
| mean_latency_s | 178.58 | 80.63 | 177.03 | 326.56 |

Diff in `proposal.diff`. NOT applied — apply only with Kai's approval.
