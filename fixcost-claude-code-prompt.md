# FixCost AI — Improvement Project

You are working in the FixCost AI repo: a multi-agent automotive diagnostic QA tool (5-agent diagnostic council, Playwright crawler, 3D repair visualizer, hybrid/EV high-voltage safety warnings, content-policy blocklist, informed-consent modal).

Work in three phases. Do not skip ahead. Do not write or modify code until Phase 2.

---

## HARD CONSTRAINTS (apply to every phase, no exceptions)

1. The EV/high-voltage safety warnings, informed-consent modal, and content-policy blocklist must remain intact and functioning. Any change touching these paths requires my explicit sign-off before implementation.
2. Never break the existing test suite. Every behavioral change ships with tests.
3. One logical change per commit, with a clear message. No mega-commits.
4. If you find exposed secrets, API keys, or credentials anywhere in the repo or git history, stop and report them immediately.
5. No silent self-modification. The improvement loop you build in Phase 2C produces reports and diffs; it never auto-applies changes.

---

## PHASE 0 — READ-ONLY AUDIT (no edits)

1. Map the repo: directory structure, entry points, the actual stack and versions in use (do not assume — read package/config files).
2. Run the existing test suite. Report pass/fail counts and any flaky or skipped tests.
3. Trace one full diagnostic request end-to-end: where each of the 5 council agents is invoked, how many LLM calls occur, how disagreement between agents is currently resolved, and where the safety checks (HV warning, blocklist, consent) hook in.
4. Measure current baselines on 3 representative diagnostic runs: wall-clock latency, total tokens, estimated cost per run.
5. Report findings to me as a concise summary: stack, architecture diagram in text, baseline numbers, redundancies or obvious waste you spotted, and anything that contradicts the description above.

STOP after Phase 0 and wait for my response.

## PHASE 1 — PLAN (no edits)

Based on the audit, propose a ranked improvement list. For each item: expected impact (with which metric it moves), implementation risk, and rough effort. Cover at minimum:

- Council efficiency: eliminating redundant LLM calls, parallelizing independent agent calls, early-exit when 4/5 agents agree, deterministic arbitration for disagreement.
- Latency and cost per run.
- Diagnostic accuracy / output quality.
- Any correctness or security issues found in Phase 0.

I will approve specific items. Implement only approved items.

## PHASE 2 — IMPLEMENT

### 2A. Benchmark harness (build this FIRST, before any optimization)

Build the harness exactly per benchmarks/SPEC.md in this repo. Follow its build order (section 7) strictly:

1. Case schema + diagnosis taxonomy + validation tests
2. Deterministic scorer with unit tests against hand-computed fixtures
3. CLI runner wiring the diagnostic pipeline headless
4. 10 seed cases for my review — STOP and wait for my approval of the seed cases
5. Baseline run against current code; freeze token/latency baselines and write benchmarks/champion.json

Where SPEC.md conflicts with anything in this prompt, SPEC.md wins for harness details; this prompt wins for process and constraints.

### 2B. Approved improvements

Implement the Phase 1 items I approved, one commit at a time. After each item, run the train-split benchmark and report before/after on: mean score, latency, tokens, cost, council agreement rate. A change that regresses heldout score or triggers any safety violation gets reverted, not patched forward.

### 2C. Self-improvement loop (only after 2A and 2B are merged)

Scaffold the evaluator → optimizer → verifier loop per SPEC.md sections 5–6:

- EVALUATOR: runs the benchmark and produces structured score reports.
- OPTIMIZER: proposes code/prompt changes, sees ONLY aggregate train-split scores. It must never see heldout cases, heldout scores per case, or heldout case contents.
- VERIFIER GATE: accepts a proposal only if the full test suite passes, zero safety violations on both splits, and the heldout criteria in SPEC.md section 5 are met. Output of the gate is a report + diff for my approval. Max 3 heldout evaluations per optimization session — enforce this in code.

---

## REPORTING

End every working session with: what changed (commits), current champion metrics vs. session start, open risks, and the single highest-value next step.
