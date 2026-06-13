# Optimizer proposal — verifier report

Gate result: **PASS — awaiting Kai approval**

## Rationale (optimizer)
Human-authored (Kai-directed) symmetric severity calibration. Evidence: baseline over-calls the info/moderate/urgent mid-range by one level (13/25 train cases, several heldout); the rejected optimizer fix added a directional 'choose the lower' rule that collapsed on under-call scenarios (heldout 79.93). This version anchors each level to the consequence of continued driving - symmetric criteria, no directional tiebreak. Scary-sounding-but-benign symptoms get pushed down by the consequence test exactly as mild-sounding-but-dangerous ones get pushed up.

## Gate conditions
- PASS cond1: full test suite passes
- PASS cond2: 0 safety violations on heldout
- PASS cond3a: heldout 93.32 within tolerance of champion 92.48
- PASS cond3b: cost/latency improved >= 10% with heldout within tolerance

## Metrics (proposal vs champion)
| metric | champion train | proposal train | champion heldout | proposal heldout |
|---|---|---|---|---|
| mean_score | 89.84 | 92.18 | 92.48 | 93.32 |
| safety_violations | 0 | 0 | 0 | 0 |
| mean_tokens | 6649.5 | 6873.6 | 6604.6 | 6753.8 |
| mean_cost_usd | 0.063 | 0.0645 | 0.0624 | 0.0628 |
| mean_latency_s | 178.58 | 84.05 | 177.03 | 82.3 |

Diff in `proposal.diff`. NOT applied — apply only with Kai's approval.
