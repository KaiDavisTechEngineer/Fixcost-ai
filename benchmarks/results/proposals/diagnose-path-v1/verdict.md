# Diagnose path (triage → routed Opus differential) vs champion afa1a2c — gate history

Paired 50-case heldout, concurrency 2, retry-guarded. Champion = Fast Path (Sonnet, guideRequest).
Proposal = the Phase-1 diagnose path. Deterministic scorer (scoring.py). Logs in this folder.

## FINAL: PASS under scorer v2 (run byud9jxgq) — gate_run_v2_differential.log
- **total: champion 92.44 → proposal 93.92 (+1.48)** ✅ no regression
- **safety: 0/0 violations** ✅
- win/loss total 40–9–1; quality-only (excl. efficiency) 84.23 → 93.66 (+9.44), 45–5
- per-component Δ: diagnosis −1.00, cost −1.62, severity +3.04, safety 0.00, efficiency −7.96,
  **differential +9.02** (the credit offsets the differential's own token cost)
- over-call cluster: champ 10/15 → prop 3/15 (7 paired improvements, 0 regressions); under-call arm 0/0
- routing: 48 full / 2 quick. Won DESPITE one transport artifact (FC-0030 → None/35, non-reproducible),
  so the margin is conservative.

## How we got here
1. **Change 0 — HV safety fix** (gate_run_after_hv_fix.log): the Opus diagnostician intermittently
   dropped the high-voltage warning on FC-0012 (2019 Leaf, must_mention_safety) → 1 safety violation.
   Mandated HV warnings for electrified vehicles in buildDiagnosticianPrompt. Re-gate: safety 0/0.
   Total still −6.15, entirely the efficiency token penalty.
2. **Change 1 — tier depth to difficulty** (routing): triage now emits safety_critical + route; the
   diagnose path escalates to the full Opus differential for safety-critical / ambiguous / hard cases
   and takes the cheap Fast Path for clearly-simple non-safety jobs. Routing probe: only 1–2/50 heldout
   route quick (heldout is diagnostic, not maintenance), so its efficiency payoff can't be shown until
   the novice/simple tier exists (Phase-2 step 1). Triage already ran in production, so Change 1 adds
   routing benefit at zero new prod cost. Code kept; formal gate deferred.
3. **Change 2 — credit the differential** (scoring.py v2, max 110): deterministic component (coverage 6
   / rank 4, well-formedness cap→0). The scorer no longer penalizes the differential's tokens while
   ignoring its value. Champion (no differential) scores 0 there; re-baselined under v2 it is 92.44.
   Proposal earns it back → PASS.

## Prior FAILs (superseded)
- gate_run_concurrency2.log (v1, post-HV-fix): total 92.89 → 85.47 (−6.51), efficiency-only; safety 0/0.
- The original v1 FAIL had a safety violation (FC-0012) — fixed by Change 0.

## Note on scoring_version
scoring.py is now v2 (differential component, additive max 110). Fast-Path scores are UNCHANGED under
v2 (no differential → +0), so champion.json's frozen v1 Fast-Path metrics remain valid for the existing
run_benchmark/optimizer flow. A v2 champion baseline for the DIAGNOSE path (for future verifier-gated
optimization of that path) is the recommended next step — not done here.
