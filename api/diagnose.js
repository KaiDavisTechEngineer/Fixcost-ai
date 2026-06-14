// FixCost AI — FULL TEAM diagnostic pipeline (Phase 1).
//
// Runs on the persistent Node server (server.js) so it can make several
// sequential model calls and stream without an Edge timeout. Returns the SAME
// {result: <stringified guide JSON>} contract the existing client renders, plus
// a `differential` array — a drop-in upgrade behind the client router; on any
// failure the client falls back to /api/generate then templateGuide.
//
// Pipeline:  intake → triage (Haiku, optional user round-trip)
//                   → diagnostician (Opus 4.8: ranked differential + full guide)
//                   → [TODO] critic (Sonnet 4.6: gate / one bounded revision)
import { parseGuide, guideRequest } from "./generate.js";
import {
  buildDiagnosticianPrompt, DIAGNOSTICIAN_TOOL,
  buildTriagePrompt, TRIAGE_TOOL,
} from "../shared/guide.js";

const ANTHROPIC_VERSION = "2023-06-01";
// Depth lives in the diagnostician → best reasoning model (Kai's call).
const DIAGNOSTICIAN_MODEL = process.env.DIAGNOSTICIAN_MODEL || "claude-opus-4-8";
const DIAGNOSTICIAN_MAX_TOKENS = 12000; // ranked differential + full guide
const TRIAGE_MODEL = process.env.TRIAGE_MODEL || "claude-haiku-4-5";

async function anthropic(url, apiKey, body) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": ANTHROPIC_VERSION },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const err = new Error(`anthropic ${r.status}: ${(await r.text()).slice(0, 200)}`);
    err.status = r.status;
    throw err;
  }
  return r.json();
}

function toolInput(data, name) {
  const blocks = Array.isArray(data?.content) ? data.content : [];
  const t = blocks.find((b) => b && b.type === "tool_use" && b.name === name);
  return t && t.input && typeof t.input === "object" ? t.input : null;
}

// ---- triage (the mechanic interview) ----
function triageRequest(input) {
  return {
    model: TRIAGE_MODEL, max_tokens: 1024,
    tools: [TRIAGE_TOOL], tool_choice: { type: "tool", name: TRIAGE_TOOL.name },
    messages: [{ role: "user", content: buildTriagePrompt(input) }],
  };
}
async function runTriage(url, apiKey, input) {
  try {
    return toolInput(await anthropic(url, apiKey, triageRequest(input)), TRIAGE_TOOL.name);
  } catch (e) {
    console.warn("triage failed, skipping to diagnostician:", e.message);
    return { triage_complete: true }; // degrade gracefully — never block the user
  }
}

// ---- diagnostician (ranked differential + full guide) ----
function diagnosticianRequest(input) {
  return {
    model: DIAGNOSTICIAN_MODEL, max_tokens: DIAGNOSTICIAN_MAX_TOKENS,
    tools: [DIAGNOSTICIAN_TOOL], tool_choice: { type: "tool", name: DIAGNOSTICIAN_TOOL.name },
    messages: [{ role: "user", content: buildDiagnosticianPrompt(input) }],
  };
}

// ---- stateless round-trip token (carries the original input + asked questions) ----
const b64 = { enc: (o) => Buffer.from(JSON.stringify(o)).toString("base64url"),
              dec: (s) => { try { return JSON.parse(Buffer.from(String(s), "base64url").toString()); } catch { return null; } } };

function formatAnswers(questions, answers) {
  return questions
    .map((q) => { const a = answers?.[q.id]; return a ? `- ${q.question} → ${a}` : null; })
    .filter(Boolean).join("\n");
}

export function registerDiagnose(app, { ANTHROPIC_URL, clientIp, rateLimited }) {
  app.post("/api/diagnose", async (req, res) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Server misconfigured" });
    if (rateLimited(clientIp(req))) {
      return res.status(429).json({ error: "Rate limit exceeded — try again in a minute" });
    }
    const body = req.body || {};
    try {
      let input, triageAnswers = null, routeFull = true;

      if (body.resume_token) {
        // RESUME: the client answered the triage questions.
        const decoded = b64.dec(body.resume_token);
        if (!decoded || !decoded.input) return res.status(400).json({ error: "bad resume token" });
        input = decoded.input;
        triageAnswers = formatAnswers(decoded.questions || [], body.answers || {});
      } else {
        const { year, make, model, trim, problem, stateCode, lang } = body;
        if (!year || !make || !model || !problem) {
          return res.status(400).json({ error: "Missing required fields: year, make, model, problem" });
        }
        input = { year, make, model, trim, problem, stateCode, lang };

        // TRIAGE: ask high-yield follow-ups if they'd narrow the diagnosis,
        // and decide routing depth (spend scales to the job).
        const triage = await runTriage(ANTHROPIC_URL, apiKey, input);
        if (triage && triage.triage_complete === false && Array.isArray(triage.questions) && triage.questions.length) {
          // Ambiguous → ask; the resumed leg always runs the full diagnostician.
          const questions = triage.questions.slice(0, 3);
          return res.json({
            status: "needs_input",
            questions,
            resume_token: b64.enc({ input, questions }),
          });
        }
        // Route by depth: full Opus differential UNLESS triage marked this a
        // clearly simple, single-system, NON-safety-critical job. Safety-critical
        // always escalates (FC-0012: an EV charge-port fault looks low-voltage).
        routeFull = !(triage && triage.route === "quick" && !triage.safety_critical);
      }

      // DISPATCH: full = Opus diagnostician + ranked differential; quick = the
      // frozen Fast Path (Sonnet, no differential) — same {result} contract.
      const diagInput = triageAnswers
        ? { ...input, problem: `${input.problem}\n\nFollow-up answers:\n${triageAnswers}` }
        : input;
      const reqBody = routeFull ? diagnosticianRequest(diagInput) : guideRequest(diagInput);
      const data = await anthropic(ANTHROPIC_URL, apiKey, reqBody);
      const { guide, stop_reason, truncated, usage } = parseGuide(data);
      if (!guide) throw new Error("diagnostician returned no guide");
      res.json({
        result: JSON.stringify(guide),
        differential: routeFull ? (guide.differential || []) : [],
        model: reqBody.model, tier: routeFull ? "full" : "quick",
        stop_reason, truncated, usage,
        pipeline: "increment-4-routed",
      });
    } catch (err) {
      console.error("diagnose pipeline error", err.message);
      // Never dead-end the user — signal a fallback so the client retries
      // /api/generate (existing behavior), then templateGuide.
      res.status(502).json({ error: "diagnose unavailable", fallback: "/api/generate" });
    }
  });
}
