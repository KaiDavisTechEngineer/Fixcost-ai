// Vercel Edge Function: /api/generate
// Proxies repair-guide generation requests to the Anthropic API server-side,
// keeping the API key out of the client bundle. Deployed automatically by
// Vercel when this file exists in /api/ — no extra config needed.
//
// Required environment variable on Vercel: ANTHROPIC_API_KEY
// Optional: ANTHROPIC_MODEL (defaults to claude-sonnet-4-6)
//
// The prompt + diagnosis schema live in ../shared/guide.js (single source of
// truth shared with the client and the benchmark harness). This file only adds
// the server concerns: model/env resolution, the request body, response
// parsing, CORS, and rate limiting.

import {
  buildPrompt, GUIDE_TOOL, DIAGNOSIS_SLUGS, SEVERITY_LEVELS,
} from "../shared/guide.js";

export const config = { runtime: "edge" };

// Re-export the shared prompt/schema so existing importers (benchmark harness,
// tests) keep a single import surface.
export { buildPrompt, GUIDE_TOOL, DIAGNOSIS_SLUGS, SEVERITY_LEVELS };

export function resolveModel() {
  return process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
}

// Output token cap. The repair-guide JSON needs ~5.8k output tokens for a full
// guide; the old 4096 cap truncated most responses into invalid JSON that the
// client then silently discarded. 8192 gives headroom so full guides complete.
export const MAX_OUTPUT_TOKENS = 8192;

// Single source of truth for the Anthropic request body — used by the handler
// and by the benchmark harness so both measure the same call.
export function guideRequest(input) {
  return {
    model: resolveModel(),
    max_tokens: MAX_OUTPUT_TOKENS,
    tools: [GUIDE_TOOL],
    tool_choice: { type: "tool", name: GUIDE_TOOL.name },
    messages: [{ role: "user", content: buildPrompt(input) }],
  };
}

// Extract the structured guide from a forced tool_use response.
export function parseGuide(data) {
  const blocks = Array.isArray(data?.content) ? data.content : [];
  const tool = blocks.find(b => b && b.type === "tool_use" && b.name === GUIDE_TOOL.name);
  const guide = tool && tool.input && typeof tool.input === "object" ? tool.input : null;
  const stop_reason = data?.stop_reason || null;
  return { guide, stop_reason, truncated: stop_reason === "max_tokens", usage: data?.usage || null };
}

// Crude per-IP rate limiting via a Map. For production scale, swap for
// Upstash Redis or Vercel KV. This is plenty for an MVP / demo.
const ipBuckets = new Map();
const RATE_LIMIT = { window: 60_000, max: 10 }; // 10 requests per minute per IP

function checkRateLimit(ip) {
  const now = Date.now();
  const bucket = ipBuckets.get(ip) || { count: 0, resetAt: now + RATE_LIMIT.window };
  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + RATE_LIMIT.window;
  }
  bucket.count++;
  ipBuckets.set(ip, bucket);
  return bucket.count <= RATE_LIMIT.max;
}

export default async function handler(req) {
  // CORS — restrict to same-origin (or an explicit allowlist via ALLOWED_ORIGINS env).
  // Wildcard "*" would let any website use your API key endpoint, so we avoid it.
  const origin = req.headers.get("origin") || "";
  const host = req.headers.get("host") || "";
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map(o => o.trim())
    .filter(Boolean);
  const isSameOrigin = origin && host && origin.replace(/^https?:\/\//, "") === host;
  const isAllowed = isSameOrigin || allowedOrigins.includes(origin);
  const corsHeaders = {
    "Access-Control-Allow-Origin": isAllowed ? origin : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY environment variable is not set");
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Rate limiting
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded — try again in a minute" }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "60" },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { year, make, model, trim, problem, stateCode, lang } = body;
  if (!year || !make || !model || !problem) {
    return new Response(JSON.stringify({ error: "Missing required fields: year, make, model, problem" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const requestBody = guideRequest({ year, make, model, trim, problem, stateCode, lang });
  const model_id = requestBody.model;

  try {
    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(requestBody),
    });

    if (!anthropicResponse.ok) {
      const errorText = await anthropicResponse.text();
      console.error("Anthropic API error:", anthropicResponse.status, errorText);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await anthropicResponse.json();
    const { guide, stop_reason, truncated, usage } = parseGuide(data);

    // Telemetry: a max_tokens stop means the tool call was cut off and the
    // client will get nothing usable. Surface it instead of failing silently.
    if (truncated) {
      console.warn(
        `[FixCost] truncated response (stop_reason=max_tokens) model=${model_id} ` +
        `output_tokens=${usage?.output_tokens} — guide incomplete`
      );
    }

    // result is a JSON string of the structured guide, backward-compatible with
    // the client's extractJSON()/jsonToSections() path.
    return new Response(JSON.stringify({
      result: guide ? JSON.stringify(guide) : "",
      model: model_id,
      stop_reason,
      truncated,
      usage,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Handler error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}
