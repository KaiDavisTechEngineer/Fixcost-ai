# FixCost AI — Benchmark Harness Spec (v1)

Purpose: a fixed, versioned evaluation harness so the evaluator → optimizer → verifier loop measures real improvement instead of overfitting. Claude Code should build exactly this; deviations require explicit approval.

---

## 1. Directory layout

```
benchmarks/
├── cases/
│   ├── train/          # optimizer is allowed to see scores on these
│   └── heldout/        # NEVER shown to the optimizer; gate decisions only
├── schema/
│   └── case.schema.json
├── results/
│   └── runs/           # one JSON per benchmark run, timestamped + git SHA
├── scoring.py          # deterministic scorer (no LLM calls in the scorer itself)
└── run_benchmark.py    # CLI entry point
```

Hard rule: `heldout/` scores are written to results but **never** fed into any prompt, context, or training signal for the optimizer agent. The optimizer may only see aggregate train-split scores.

## 2. Case format (`case.schema.json`)

Each case is one JSON file, one diagnostic scenario:

```json
{
  "id": "FC-0042",
  "version": 1,
  "vehicle": {
    "year": 2013,
    "make": "Ford",
    "model": "C-MAX Hybrid",
    "powertrain": "hybrid",        // gas | hybrid | ev | diesel
    "mileage": 142000
  },
  "complaint": "Whining noise from front end that rises with speed, faint burning smell after highway driving.",
  "observations": [
    "Noise persists in neutral while coasting",
    "Smell strongest near right front wheel"
  ],
  "dtc_codes": [],                  // empty array if none
  "ground_truth": {
    "primary_diagnosis": "wheel_bearing_front_right",
    "acceptable_diagnoses": ["wheel_bearing_front_right", "wheel_bearing_front"],
    "wrong_but_plausible": ["cv_joint", "transmission_whine"],
    "must_mention_safety": false,   // true => response MUST include HV/safety warning
    "expected_cost_range_usd": [250, 550],
    "severity": "moderate"          // info | moderate | urgent | do_not_drive
  },
  "tags": ["noise", "drivetrain", "hybrid"]
}
```

Notes:
- `acceptable_diagnoses` is a controlled vocabulary (build `benchmarks/schema/diagnosis_taxonomy.json` — flat slugs, ~100–200 entries). Scoring matches slugs, not free text, so the scorer stays deterministic.
- The app's output must be mapped to a slug by the app itself (add a `diagnosis_slug` field to its structured output). No fuzzy matching in the scorer.
- Every hybrid/EV case where the repair touches the HV system sets `must_mention_safety: true`.

## 3. Case set composition (v1 targets)

- **60 cases minimum**: 40 train / 20 heldout. Split once, commit it, never reshuffle.
- Coverage quotas (apply to both splits proportionally):
  - ≥ 15% hybrid/EV cases (safety-warning behavior must be exercised)
  - ≥ 10% "no fault found / monitor and recheck" cases (tests against over-diagnosis)
  - ≥ 10% urgent or do_not_drive severity
  - ≥ 20% cases with DTC codes, ≥ 20% with none
  - At least 5 adversarial cases: misleading complaints where the obvious answer is in `wrong_but_plausible`
- Sources: real forum threads / repair records paraphrased into the schema, plus synthetic cases reviewed by Kai. Every case gets human sign-off before entering the set.
- Cases are immutable once committed. Fixing a bad case = bump `version`, log the change in `benchmarks/CHANGELOG.md`, and invalidate prior run comparisons for that case.

## 4. Scoring rubric (per case, 0–100)

| Component | Points | Rule |
|---|---|---|
| Diagnosis correctness | 50 | 50 if `diagnosis_slug` ∈ `acceptable_diagnoses`; 15 if in `wrong_but_plausible` (partial credit for reasonable miss); 0 otherwise |
| Cost estimate accuracy | 15 | 15 if estimate range overlaps `expected_cost_range_usd`; linear decay to 0 at 2× outside the range |
| Severity calibration | 15 | 15 exact match; 7 if off by one level; 0 if off by two+ or if it downgrades an `urgent`/`do_not_drive` case (downgrade = automatic 0 here) |
| Safety compliance | 10 | Binary. If `must_mention_safety` and no HV warning present → 0 AND the whole case score is capped at 40. If not required, free 10 |
| Council efficiency | 10 | Full 10 at ≤ baseline token budget for the case class; linear decay to 0 at 2× baseline. Baselines fixed at harness creation from current app behavior |

Aggregate metrics per run (written to `results/runs/`):
- `mean_score_train`, `mean_score_heldout`
- `safety_violations` (count — any > 0 on either split is an automatic gate failure)
- `mean_latency_s`, `mean_tokens`, `mean_cost_usd`
- `council_agreement_rate` (fraction of cases where ≥ 4/5 agents converged before arbitration)
- git SHA of app code + benchmark set version

## 5. Verifier gate (when the optimizer proposes a change)

A proposed change is **accepted** only if ALL of:
1. Full existing test suite passes.
2. `safety_violations == 0` on both splits.
3. `mean_score_heldout` ≥ current champion's heldout score − 0.5 (noise tolerance), AND at least one of: heldout score improves ≥ 1.0, OR cost/latency improves ≥ 10% with heldout score within tolerance.
4. Kai approves the diff. No silent self-edits — the gate produces a report + diff and stops.

Champion tracking: `benchmarks/champion.json` stores the SHA + metrics of the best accepted version. All comparisons are against the champion, not the previous attempt (prevents slow drift-by-degradation).

Run budget: max 3 optimizer attempts per session against the heldout split. More attempts = the heldout set is leaking into the search; stop and add new heldout cases instead.

## 6. CLI contract

```
python benchmarks/run_benchmark.py --split train            # optimizer-visible
python benchmarks/run_benchmark.py --split heldout --gate   # gate decision, writes report
python benchmarks/run_benchmark.py --case FC-0042 --verbose # debug one case
```

`--gate` exits nonzero on failure so it can sit in CI.

## 7. Build order for Claude Code

1. `case.schema.json` + `diagnosis_taxonomy.json` + JSON-schema validation tests
2. `scoring.py` with unit tests against hand-computed expected scores (≥ 10 fixture cases)
3. `run_benchmark.py` wiring the app's diagnostic pipeline in headless mode
4. 10 seed cases (Kai reviews before more are added)
5. Baseline run against current app → freeze token/latency baselines + initial champion
6. Only then: evaluator/optimizer agents that consume this harness

Do not start step 6 until steps 1–5 are merged and the baseline is committed.
