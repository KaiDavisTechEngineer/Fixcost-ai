# FixCost AI — Senior Panel QA Agent

An automated agent that drives the app through real repair scenarios, runs sanity checks, and then convenes a **three-person senior review panel** (powered by Claude). Each expert reviews from their own viewpoint, using their own evidence:

| Reviewer | Viewpoint | What it looks at |
|---|---|---|
| 🔧 **Senior Auto Mechanic** | technical accuracy & safety | the generated repair guides |
| 📱 **Senior App Developer** | UX / product | the **screenshots** (it actually sees them) + console errors + load timing |
| 💻 **Senior Software Engineer** | architecture, security, performance | the **source code** |

Each returns 1–5 scores per dimension, the most serious problems, and prioritized fixes.

## Setup (on your Mac)

```bash
cd agent
npm install        # installs Playwright + downloads Chromium
```

## Run it

```bash
# local standalone file (engineering review falls back to the source it can find)
node qa-agent.mjs --file ../../fixcost-ai-standalone.html

# point the engineer review at the clean source for a better code review:
node qa-agent.mjs --file ../../fixcost-ai-standalone.html --source ../src/App.jsx

# against a deployed site:
node qa-agent.mjs --url https://your-site.vercel.app --source ../src/App.jsx

# watch it drive the browser:
node qa-agent.mjs --file ../../fixcost-ai-standalone.html --headed
```

## Turn on the expert panel (required for the reviews)

The three senior reviews are produced by Claude, so they need your API key:

```bash
ANTHROPIC_API_KEY=sk-ant-... node qa-agent.mjs --file ../../fixcost-ai-standalone.html --source ../src/App.jsx
```

Get a key at https://console.anthropic.com/settings/keys. A full run (6 scenarios + 3 expert reviews, one of which includes screenshots) costs roughly $0.05–0.15.

Without a key it still runs the scenarios, screenshots, and automated checks — it just skips the panel.

## Output

- `report.md` — automated checks, then the three expert reviews, then per-scenario detail
- `screenshots/*.png` — full-page screenshot of every generated guide

## Automated checks (run with or without a key)

- Shop cost scales by state (CA > NC for the same strut repair)
- Tire DIY is much cheaper than a strut job
- Difficulty levels are right (tire = Beginner, struts = Intermediate)
- The Spanish guide actually uses Spanish headers
- Every guide has its core sections
- Console errors / failed network requests are counted and reported

## Customize

Edit the `SCENARIOS` array at the top of `qa-agent.mjs` to test any year/make/model/trim/state/problem/language combos you want.

## Notes

- Form fields are selected by stable option *values* (`Ford`, `2013`, `CA`), so the agent works in both English and Spanish.
- The engineer review prefers `../src/App.jsx` (the clean source) over the standalone wrapper; override with `--source`.
- A broken scenario is reported with its error instead of crashing the run.
