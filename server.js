// FixCost AI — Node web server (Render).
// Serves the built React SPA (dist/) and hosts the API routes. Replaces the
// Vercel Edge function with a persistent Node server so the ~90s streamed
// diagnosis runs without an Edge timeout.
//
//   /api/generate  — FAST PATH: one forced-tool-use call, the exact {result}
//                    contract the existing client already renders. Unchanged.
//   /api/diagnose  — FULL TEAM (Phase 1): streamed multi-agent pipeline.
//
// Env: ANTHROPIC_API_KEY (required), ANTHROPIC_MODEL (optional), PORT (Render sets it).
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { guideRequest, parseGuide, resolveModel } from "./api/generate.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "dist");
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json({ limit: "64kb" }));

// Security headers (mirror the old vercel.json set; CSP allows the client's own
// fetches to the app origin + the YouTube data API the user can opt into).
app.use((req, res, next) => {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  });
  next();
});

// Crude per-IP rate limit (persistent process, so this actually holds here).
const buckets = new Map();
const RATE = { window: 60_000, max: 20 };
function rateLimited(ip) {
  const now = Date.now();
  const b = buckets.get(ip) || { count: 0, resetAt: now + RATE.window };
  if (now > b.resetAt) { b.count = 0; b.resetAt = now + RATE.window; }
  b.count++; buckets.set(ip, b);
  return b.count > RATE.max;
}

function clientIp(req) {
  return (req.headers["x-forwarded-for"]?.split(",")[0]?.trim()) || req.ip || "unknown";
}

app.get("/healthz", (req, res) => {
  res.json({ ok: true, model: resolveModel(), hasKey: !!process.env.ANTHROPIC_API_KEY });
});

// ---- FAST PATH: /api/generate (same contract as the old Edge function) ----
app.post("/api/generate", async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Server misconfigured" });
  if (rateLimited(clientIp(req))) {
    return res.status(429).json({ error: "Rate limit exceeded — try again in a minute" });
  }
  const { year, make, model, trim, problem, stateCode, lang } = req.body || {};
  if (!year || !make || !model || !problem) {
    return res.status(400).json({ error: "Missing required fields: year, make, model, problem" });
  }
  const body = guideRequest({ year, make, model, trim, problem, stateCode, lang });
  try {
    const r = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      console.error("Anthropic error", r.status, (await r.text()).slice(0, 300));
      return res.status(502).json({ error: "AI service unavailable" });
    }
    const data = await r.json();
    const { guide, stop_reason, truncated, usage } = parseGuide(data);
    if (truncated) console.warn(`[FixCost] truncated (max_tokens) model=${body.model}`);
    res.json({
      result: guide ? JSON.stringify(guide) : "",
      model: body.model, stop_reason, truncated, usage,
    });
  } catch (err) {
    console.error("generate handler error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---- FULL TEAM: /api/diagnose (Phase 1 multi-agent pipeline) ----
import { registerDiagnose } from "./api/diagnose.js";
registerDiagnose(app, { ANTHROPIC_URL, clientIp, rateLimited });

// ---- static SPA + client-side routing fallback ----
app.use(express.static(DIST, { index: false, maxAge: "1h" }));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) return res.status(404).json({ error: "Not found" });
  res.sendFile(path.join(DIST, "index.html"));
});

app.listen(PORT, () => {
  console.log(`FixCost server on :${PORT} (model ${resolveModel()}, key ${process.env.ANTHROPIC_API_KEY ? "set" : "MISSING"})`);
});
