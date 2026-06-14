---
name: phase1-ui-handoff
description: "Phase 1 UI wiring handoff — backend done, App.jsx triage state-machine refactor remains"
metadata: 
  node_type: memory
  type: project
  originSessionId: 5a4ff77e-3f4f-4e46-a927-007874855741
---

FixCost BUILD MODE, Phase 1 (multi-agent diagnostic engine). Backend DONE; the App.jsx UI wiring is the remaining (delicate) leg. Paused at 100% context before the refactor. Read [[fixcost-next-task.md]] for full build-mode context (repo, Render, roadmap, carry-forward mandate). Champion = afa1a2c (frozen baseline + acceptance gate).

## DONE + committed (HEAD 884b841)
- `/api/diagnose` (api/diagnose.js) + Express `server.js` (serves dist/ SPA + /api/generate Fast Path + /api/diagnose) + `render.yaml` (Render Node web service; Kai deploys later, NOT yet).
- Pipeline in /api/diagnose: **triage (Haiku `claude-haiku-4-5`, TRIAGE_TOOL/buildTriagePrompt)** → optional stateless round-trip (base64 `resume_token`, no DB) → **diagnostician (Opus `claude-opus-4-8`, DIAGNOSTICIAN_TOOL/buildDiagnosticianPrompt, max_tokens 12000)** returning the SAME `{result:<stringified guide>}` contract PLUS a `differential` array. Critic stage NOT built yet (TODO in api/diagnose.js).
- shared/guide.js additions (ALL ADDITIVE): `DIFFERENTIAL_ITEM` schema (cause, diagnosis_slug, likelihood enum[most_likely..rule_out], reasoning, supporting, contradicting, discriminator, confirmation_test, severity, cost_range_usd), `DIAGNOSTICIAN_TOOL` (= GUIDE_TOOL superset, same tool name "emit_repair_guide" so parseGuide works), `buildDiagnosticianPrompt`, `TRIAGE_TOOL`, `buildTriagePrompt`.
- FIELD-ORDERING FIX: differential must be LAST in DIAGNOSTICIAN_TOOL.input_schema.properties (it was first → model spent output budget on it and dropped required scalars repair_target/severity/cost → null). Now core fields first, differential last. Validated: complete guide + 5-cause differential, all fields present.
- VERIFIED: champion afa1a2c's GUIDE_TOOL and buildPrompt are UNTOUCHED ("differential" in GUIDE_TOOL.input_schema.properties === false). Fast Path baseline unchanged. 10 JS tests green, working tree CLEAN.
- Live-validated locally: vague "weird noise" → 3 triage questions (2.8s); answers steer differential to engine-accessory-drive causes; specific brake complaint → urgent brake_pads_and_rotors_front + 5-cause differential.

## App.jsx MAP (structural notes — verified, src/App.jsx ~2448 lines)
- callAI() at **line 926**: today calls POST /api/generate → direct anthropic fetch fallback → templateGuide(). Returns {sections, raw, template}.
- SUBMIT HANDLER inside the diagnose component (the `gen`/submit fn around **line 1655-1696**): validates form → setLd(true), clears state (line 1667: setSecs([]) setDiff(null) etc.) → `const result = await callAI(...)` (**line 1669**) → parses sections, `const d = extractDiff(parsed)` (line 1673) → setSecs/setRaw/setDiff/setYT → fetches YT videos if key. finally setLd(false).
- RESULT RENDER: `hasSecs = secs.length>0` (line 1703); the guide renders from `secs` (section objects from jsonToSections). `raw` is the stringified guide JSON (used for save/export/repairTarget parse at line 1704).
- NAMING COLLISION (critical): the `const [diff, setDiff]` state at **line 1601** is the DIFFICULTY rating (set via extractDiff(parsed), saved as `difficulty: diff` at line 1699). It is NOT a differential. DO NOT reuse `diff`/setDiff for the differential — add a NEW state e.g. `const [differential, setDifferential] = useState([])`.

## REMAINING (the UI refactor — submit → triage → answer → result)
1. Route submit to /api/diagnose first (new path; keep callAI/Fast Path as fallback). Suggest a new async fn (e.g. callDiagnose) that POSTs to /api/diagnose and handles two response shapes:
   - `{status:"needs_input", questions, resume_token}` → render the triage pick-list, do NOT render a guide yet.
   - `{result, differential, ...}` → parse like callAI's result and render guide + differential.
2. TRIAGE UI: a new intermediate state (e.g. `const [triage, setTriage] = useState(null)` holding {questions, resume_token, answers}). Render each question with its 2-4 `choices` as radio/buttons; a "Continue" button POSTs {resume_token, answers:{q1:choice,...}} to /api/diagnose → resolves to {result, differential}. Submit flow becomes: submit → loading → (triage ? show questions : show result) → on Continue → loading → result.
3. DIFFERENTIAL rendering: new result section showing ranked causes (likelihood badge, cause, reasoning, discriminator, confirmation_test, severity, cost_range_usd). Either a dedicated component above the existing sections, or fold into jsonToSections. The differential is on the parsed guide object as `guide.differential` AND returned top-level as `differential`.
4. CLEAN FALLBACK: if /api/diagnose errors or returns {error, fallback}, call the existing callAI (/api/generate → template) so the bookmarked app never dead-ends. Keep the existing single-shot path fully working.
5. EN/ES strings: add all new UI strings (triage heading, question/answer labels, Continue button, differential section title, likelihood labels) to BOTH S.en and S.es (the S object lines ~8-147).

## CONSTRAINTS
- ADDITIVE ONLY. Do NOT modify GUIDE_TOOL/buildPrompt (champion frozen). Do NOT break the bookmarked single-shot flow (hard rule #3). Keep the same {result} contract.
- Run LOCAL only (no Render deploy yet — Kai owns that, 3 clicks via render.yaml when he wants a public URL).

## ACCEPTANCE GATE (before /api/diagnose becomes the user-facing default)
Score the new diagnose path vs champion afa1a2c on the 50-case heldout (FC-0011..FC-0077; cluster FC-0056-0077) under the pinned scorer, prove better-or-equal, and REPORT the score. NOTE: the benchmark pipeline.mjs currently scores the Fast Path (guideRequest). To score /api/diagnose you must point the harness at the diagnostician path (diagnosticianRequest) — adapt pipeline.mjs or add a flag. Severity over-warning is MODEL-LEVEL (Gate C finding) — the critic stage + few-shot exemplars are the levers, not prompt anchors.

## DEMO STOP deliverable (give Kai these exact local run steps when UI is browser-testable)
1. `npm install`
2. `npm run build`   (creates dist/)
3. Create `.env` at repo root with one line: `ANTHROPIC_API_KEY=sk-ant-...` (NOT committed; .env is gitignored). Optionally `ANTHROPIC_MODEL=claude-sonnet-4-6`, `DIAGNOSTICIAN_MODEL=claude-opus-4-8`.
4. Start: `node --env-file=.env server.js`  (Node 20+/24 supports --env-file; loads the key). Without --env-file, `export ANTHROPIC_API_KEY=...` then `node server.js`.
5. Open `http://localhost:3000` (or the PORT printed). `/healthz` returns {ok, hasKey} to confirm the key loaded.
