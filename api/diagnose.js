// FixCost AI — FULL TEAM diagnostic pipeline (Phase 1).
//
// This is the multi-agent endpoint. It runs on the persistent Node server
// (server.js) so it can make several sequential model calls and stream without
// an Edge timeout. It returns the SAME {result: <stringified guide JSON>}
// contract the existing client renders, so it is a drop-in upgrade behind the
// client-side router; on any failure the client falls back to /api/generate.
//
// Pipeline (built incrementally; seams marked TODO-PHASE1):
//   intake → triage (Haiku, optional user round-trip)
//          → diagnostician (Opus 4.8: ranked differential → tests → repair → cost → severity)
//          → critic (Sonnet 4.6: gate output)
//
// Increment 1 (now): the route is live and functional via the proven fast-path
// call, so the app deploys and works on Render today. The stages below replace
// this single call one at a time, each scored against champion afa1a2c before
// it ships.
import { guideRequest, parseGuide, resolveModel } from "./generate.js";
import { buildDiagnosticianPrompt, DIAGNOSTICIAN_TOOL } from "../shared/guide.js";

const ANTHROPIC_VERSION = "2023-06-01";
// The diagnostician runs on the best reasoning model (Kai's call) — depth lives
// here. Overridable for cost A/B without code change.
const DIAGNOSTICIAN_MODEL = process.env.DIAGNOSTICIAN_MODEL || "claude-opus-4-8";
const DIAGNOSTICIAN_MAX_TOKENS = 12000; // ranked differential + full guide

function diagnosticianRequest(input) {
  return {
    model: DIAGNOSTICIAN_MODEL,
    max_tokens: DIAGNOSTICIAN_MAX_TOKENS,
    tools: [DIAGNOSTICIAN_TOOL],
    tool_choice: { type: "tool", name: DIAGNOSTICIAN_TOOL.name },
    messages: [{ role: "user", content: buildDiagnosticianPrompt(input) }],
  };
}

async function anthropic(url, apiKey, body) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": ANTHROPIC_VERSION },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const text = await r.text();
    const err = new Error(`anthropic ${r.status}: ${text.slice(0, 200)}`);
    err.status = r.status;
    throw err;
  }
  return r.json();
}

export function registerDiagnose(app, { ANTHROPIC_URL, clientIp, rateLimited }) {
  app.post("/api/diagnose", async (req, res) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Server misconfigured" });
    if (rateLimited(clientIp(req))) {
      return res.status(429).json({ error: "Rate limit exceeded — try again in a minute" });
    }
    const { year, make, model, trim, problem, stateCode, lang } = req.body || {};
    if (!year || !make || !model || !problem) {
      return res.status(400).json({ error: "Missing required fields: year, make, model, problem" });
    }
    const input = { year, make, model, trim, problem, stateCode, lang };

    try {
      // TODO-PHASE1 (triage): Haiku call → clarifying questions or triage_complete.
      //   If questions, return {status:"needs_input", questions, triage_token} (HTTP 200)
      //   and resume on the client's follow-up POST.
      // TODO-PHASE1 (critic): Sonnet 4.6 verify → gate / one bounded revision.

      // Increment 2: Opus diagnostician → ranked differential + full guide.
      const body = diagnosticianRequest(input);
      const data = await anthropic(ANTHROPIC_URL, apiKey, body);
      const { guide, stop_reason, truncated, usage } = parseGuide(data);
      if (!guide) throw new Error("diagnostician returned no guide");
      res.json({
        // result stays the {result: <stringified guide>} contract the client
        // already renders; the guide now carries a `differential` array.
        result: JSON.stringify(guide),
        differential: guide.differential || [],
        model: body.model, stop_reason, truncated, usage,
        pipeline: "increment-2-differential",
      });
    } catch (err) {
      console.error("diagnose pipeline error", err.message);
      // Never 500 the user into a dead end — signal a fallback so the client
      // retries /api/generate (existing behavior), then templateGuide.
      res.status(502).json({ error: "diagnose unavailable", fallback: "/api/generate" });
    }
  });
}
