# Change 2 (PROPOSAL — awaiting Kai's approval; NOT implemented)

## Problem
`scoring.py` = diagnosis 50 / cost 15 / severity 15 / safety 10 / efficiency 10 = 100.
The ranked differential earns **zero** credit, yet its tokens hit **efficiency**. An optimizer
pointed at this scorer would learn to **strip the differential** to win efficiency — destroying the
core of Phase 1. We must credit the differential's real diagnostic value so the gate (and later the
optimizer) preserves it. Must stay **deterministic** (scoring.py contract: no LLM, no randomness).

## (a) Rubric — deterministic "differential" component
The guide carries `differential[]`; each item has diagnosis_slug, likelihood (most_likely…rule_out),
discriminator, confirmation_test, etc. Proposed component (default **10 pts**), all deterministic:

1. **Coverage (6 pts)** — ground-truth cause present in the ranked list:
   6 if any item's `diagnosis_slug ∈ gt.acceptable_diagnoses`; 3 if ∈ `wrong_but_plausible`; else 0.
   (Rewards diagnostic *recall* — listing the true cause even when the top pick differs.)
2. **Rank quality (4 pts)** — if an acceptable item is present, scale by the likelihood tier of the
   BEST acceptable item: most_likely=4, likely=3, possible=2, less_likely=1, rule_out=0.
   (Rewards ranking the true cause high, not burying it.)
3. **Well-formedness gate (multiplicative cap, not a bonus)** — the differential must have 3–6 items,
   each with non-empty `discriminator` AND `confirmation_test`, and the TOP item's slug must equal the
   guide's `diagnosis_slug`. If malformed → component capped (0 or ×0.5). Prevents gaming via a
   padded/empty differential and enforces decision-usefulness.

Deterministic-only: uses slug membership + likelihood enum + list length + field presence. A
"is the reasoning correct" check would need an LLM judge → breaks determinism; explicitly NOT proposed
(that would be a separate judged track with its own variance controls).

**Double-counting note:** diagnosis(50) already credits the TOP cause; coverage/rank credit the whole
list. Mild correlation when top is correct. Two options:
- (i) accept mild correlation (simple), or
- (ii) award rank-quality only when top ≠ GT (credits the differential for catching what the single
  pick missed — its marginal value). Recommend (i) unless you want pure marginal-value measurement.

## (b) Re-baseline plan (changing the scorer moves the goalposts)
- Adding 10 pts changes max 100→110. **(A) additive (max 110)** [recommended — transparent, doesn't
  dilute existing components] vs **(B) redistributive (keep /100, carve from elsewhere)** [muddies
  historical comparison].
- The champion (Fast Path) has **no differential** → 0 on the new component → its total drops under
  the new scorer. So **champion.json's 92.89 is invalid under the new scorer.** We MUST re-baseline:
  re-score champion under the new scorer and freeze a NEW champion.json with a bumped `scoring_version`.
  - Champion can be re-scored **offline from its saved run JSON for $0** (no differential field → 0 on
    that component deterministically); no champion re-run needed.
  - Proposal needs the raw `differential[]` captured per case — `diagnose_gate.py` doesn't save that
    today; I'll add it so the new component can be scored.
- Re-score BOTH under the new scorer on the SAME cases; gate compares proposal vs re-baselined champion,
  both new-scorer. **NEVER new-proposal vs old-champion.**
- Add a `scoring_version` field + guard (mirror the existing scoring_model pin) so runs under different
  scorer versions can never be silently compared.

## Tension to acknowledge (your call to accept)
Adding a component the champion structurally can't earn makes the champion drop and the proposal look
relatively better. Legitimate ONLY because coverage/rank tie to ground truth (real recall/ranking, not
mere presence) — but it IS the kind of change that tilts the gate toward the proposal. Hence: you
approve the rubric + weight before I lock it, and we spot-check a few real differentials to confirm the
credited value is genuine.

## Decisions needed before I implement
1. Weight + normalization: **10 pts additive (max 110)** [rec] or redistributive /100?
2. Rank-quality: **(i) always** [rec] or (ii) only when top ≠ GT?
3. Well-formedness on malformed: cap to **0** [rec] or ×0.5?
4. Coverage thresholds: **6 acceptable / 3 plausible** ok?
5. Confirm re-baseline approach: champion re-scored offline ($0), proposal re-run with differential captured.
