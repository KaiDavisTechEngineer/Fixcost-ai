# Gate C — paired champion vs proposal (human-severity-v1), model-pinned

Scorer: claude-sonnet-4-6 (pinned). Heldout = 50 (base 30 + cluster 15 + arm 5). Both fresh, same run.

## Headline means (fresh champ vs fresh proposal)
| slice | n | champion | proposal | Δ |
|---|--:|--:|--:|--:|
| base (headline) | 30 | 93.12 | 94.45 | +1.33 |
| cluster (moderate) | 15 | 91.31 | 90.83 | -0.48 |
| arm (urgent) | 5 | 96.52 | 94.39 | -2.13 |
| overall | 50 | 92.91 | 93.36 | +0.45 |

## PRIMARY — over-call on the 15 loud-but-moderate cluster
- champion over-calls: 9 ['FC-0061', 'FC-0060', 'FC-0066', 'FC-0070', 'FC-0065', 'FC-0073', 'FC-0069', 'FC-0059', 'FC-0074']
- proposal over-calls: 10 ['FC-0057', 'FC-0061', 'FC-0060', 'FC-0066', 'FC-0065', 'FC-0073', 'FC-0069', 'FC-0059', 'FC-0074', 'FC-0058']
- PAIRED regressions (champ correct -> proposal over-calls): 2 ['FC-0057', 'FC-0058']
- PAIRED improvements (champ over-calls -> proposal correct): 1 ['FC-0070']
- binomial (proposal over-calls vs rule >=3): 10 -> BIAS FLAGGED

## SECONDARY — under-call on the 5 urgent-control arm (directional)
- champion under-calls: 0 []
- proposal under-calls: 0 []
- PAIRED arm regressions (champ urgent-correct -> proposal downgrades): 0 []

## Per-case app-severity (gt | champion -> proposal)
| case | slice | gt | champ | prop |
|---|---|---|---|---|
| FC-0057 | cluster | moderate | moderate | urgent |
| FC-0077 | cluster | moderate | info | info |
| FC-0061 | cluster | moderate | urgent | urgent |
| FC-0060 | cluster | moderate | urgent | urgent |
| FC-0066 | cluster | moderate | urgent | urgent |
| FC-0070 | cluster | moderate | urgent | moderate |
| FC-0065 | cluster | moderate | do_not_drive | urgent |
| FC-0073 | cluster | moderate | urgent | urgent |
| FC-0069 | cluster | moderate | urgent | urgent |
| FC-0072 | cluster | moderate | moderate | moderate |
| FC-0064 | cluster | moderate | info | info |
| FC-0059 | cluster | moderate | urgent | do_not_drive |
| FC-0075 | cluster | moderate | moderate | moderate |
| FC-0074 | cluster | moderate | urgent | urgent |
| FC-0058 | cluster | moderate | moderate | urgent |
| FC-0076 | arm | urgent | urgent | do_not_drive |
| FC-0056 | arm | urgent | do_not_drive | do_not_drive |
| FC-0067 | arm | urgent | urgent | urgent |
| FC-0063 | arm | urgent | urgent | urgent |
| FC-0062 | arm | urgent | urgent | urgent |
