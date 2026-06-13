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

const ANTHROPIC_VERSION = "2023-06-01";

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
      // TODO-PHASE1 (diagnostician): Opus 4.8 streamed call → ranked differential.
      // TODO-PHASE1 (critic): Sonnet 4.6 verify → gate / one bounded revision.

      // Increment 1: proven fast-path call (full guide), same contract.
      const body = guideRequest(input);
      const data = await anthropic(ANTHROPIC_URL, apiKey, body);
      const { guide, stop_reason, truncated, usage } = parseGuide(data);
      res.json({
        result: guide ? JSON.stringify(guide) : "",
        model: body.model, stop_reason, truncated, usage,
        pipeline: "increment-1-fastpath",
      });
    } catch (err) {
      console.error("diagnose pipeline error", err.message);
      // Never 500 the user into a dead end — signal a fallback so the client
      // retries /api/generate (existing behavior), then templateGuide.
      res.status(502).json({ error: "diagnose unavailable", fallback: "/api/generate" });
    }
  });
}
