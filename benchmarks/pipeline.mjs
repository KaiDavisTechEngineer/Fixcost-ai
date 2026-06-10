#!/usr/bin/env node
/**
 * Headless wiring of the app's diagnostic pipeline for the benchmark harness.
 *
 * It reuses the PRODUCTION prompt (buildPrompt from api/generate.js) unchanged,
 * then appends a small classification addendum so the model also returns a
 * controlled-vocabulary `diagnosis_slug` and a machine `severity` — the two
 * fields the deterministic scorer needs (SPEC section 2: "mapped to a slug by
 * the app itself; no fuzzy matching in the scorer").
 *
 * It mirrors the app's own extraction logic (extractJSON + validity check), so a
 * truncated/invalid response is treated as a MISS exactly as the app discards it.
 * The client-side templateGuide fallback is intentionally NOT modeled — the
 * harness measures the AI pipeline, which is what Phase 2B optimizes.
 *
 * Usage: node pipeline.mjs <case.json>   → prints one normalized JSON object.
 * Reads ANTHROPIC_API_KEY and (optional) ANTHROPIC_MODEL from the environment.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildPrompt, resolveModel } from "../api/generate.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.ANTHROPIC_API_KEY || "";
const MODEL = resolveModel();
const MAX_TOKENS = parseInt(process.env.FIXCOST_MAX_TOKENS || "4096", 10); // app default

const TAXONOMY = JSON.parse(
  fs.readFileSync(path.join(__dirname, "schema", "diagnosis_taxonomy.json"), "utf8")
).diagnoses;

// HV / high-voltage safety language detector for the safety-compliance component.
const HV_RE = /high[\s-]?voltage|\bhv\b|orange cable|orange (?:high[\s-]?voltage )?cable|electric shock|electrocution|de-?energize|service (?:plug|disconnect)|hybrid battery|traction battery|hv battery|isolate the battery|hazardous voltage/i;

function caseToInput(c) {
  const v = c.vehicle;
  const obs = (c.observations || []).join("; ");
  const dtc = (c.dtc_codes || []).length ? ` DTC codes: ${c.dtc_codes.join(", ")}.` : "";
  const problem = `${c.complaint}${obs ? ` Observations: ${obs}.` : ""}${dtc}`;
  return { year: v.year, make: v.make, model: v.model, trim: "", problem, stateCode: "", lang: "en" };
}

// Same extraction the app uses (src/App.jsx extractJSON).
function extractJSON(raw) {
  if (!raw || typeof raw !== "string") return null;
  let t = raw.trim().replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/, "").trim();
  const start = t.indexOf("{"), end = t.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try { return JSON.parse(t.slice(start, end + 1)); } catch { return null; }
}
const valid = (o) => o && typeof o === "object" && !!(o.overview || o.difficulty || o.cost || (Array.isArray(o.steps) && o.steps.length));

function parseCostRange(cost) {
  // Prefer shop total, then DIY total. Returns [lo, hi] or null.
  const fields = [cost?.total_shop, cost?.total_diy, cost?.shop_labor];
  for (const f of fields) {
    if (typeof f !== "string") continue;
    const nums = (f.match(/\$\s*([0-9][0-9,]*)/g) || []).map((s) => parseInt(s.replace(/[^0-9]/g, ""), 10));
    if (nums.length >= 2) return [Math.min(nums[0], nums[1]), Math.max(nums[0], nums[1])];
    if (nums.length === 1) return [nums[0], nums[0]];
  }
  return null;
}

function normalizeSeverity(s) {
  const v = String(s || "").toLowerCase().replace(/[\s-]+/g, "_");
  return ["info", "moderate", "urgent", "do_not_drive"].includes(v) ? v : null;
}

function detectSafety(obj) {
  const hay = JSON.stringify(obj?.safety || []) + " " + (obj?.overview || "") + " " + (obj?.when_to_stop || "");
  return HV_RE.test(hay);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504, 529]);
const RETRYABLE_TYPE = new Set(["overloaded_error", "rate_limit_error", "api_error", "timeout_error"]);

// Call the model with bounded retry on transient network drops / overload.
// Network-level "fetch failed" and 429/5xx are retried with backoff; a clean
// API error (e.g. invalid model) is returned immediately, not retried.
async function callWithRetry(prompt, attempts = 4) {
  const backoff = [2000, 5000, 12000];
  let lastErr = null;
  for (let i = 0; i < attempts; i++) {
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": API_KEY, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: MODEL, max_tokens: MAX_TOKENS, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await r.json();
      if (data?.error && RETRYABLE_TYPE.has(data.error.type) && i < attempts - 1) {
        await sleep(backoff[i] || 12000); continue;
      }
      if (!r.ok && RETRYABLE_STATUS.has(r.status) && !data?.error && i < attempts - 1) {
        await sleep(backoff[i] || 12000); continue;
      }
      return { data, errorMsg: null };
    } catch (e) {
      lastErr = e.message;
      if (i < attempts - 1) { await sleep(backoff[i] || 12000); continue; }
    }
  }
  return { data: null, errorMsg: lastErr || "request failed after retries" };
}

async function run(caseObj) {
  const input = caseToInput(caseObj);
  const basePrompt = buildPrompt(input);
  const addendum =
    "\n\nAdditionally, include these two extra top-level JSON keys:\n" +
    '"diagnosis_slug": choose the SINGLE best-matching slug for the most likely root cause, EXACTLY as written, from this controlled list: ' +
    TAXONOMY.join(", ") + ". Use \"needs_further_diagnosis\" only if genuinely indeterminate and \"no_fault_found\" if nothing is wrong.\n" +
    '"severity": one of info | moderate | urgent | do_not_drive.';
  const prompt = basePrompt + addendum;

  const t0 = Date.now();
  const { data, errorMsg } = await callWithRetry(prompt);
  const latency_ms = Date.now() - t0;

  if (errorMsg || data?.error) {
    return {
      id: caseObj.id, ok: false, error: errorMsg || data.error?.message,
      diagnosis_slug: null, cost_range_usd: null, severity: null, mentions_safety: false,
      tokens: (data?.usage?.input_tokens || 0) + (data?.usage?.output_tokens || 0),
      input_tokens: data?.usage?.input_tokens || 0, output_tokens: data?.usage?.output_tokens || 0,
      latency_ms, stop_reason: data?.stop_reason || null, model: MODEL,
    };
  }

  const text = (data.content || []).filter((b) => b && (b.type === "text" || typeof b.text === "string")).map((b) => b.text || "").join("\n");
  const obj = extractJSON(text);
  const isValid = !!valid(obj);
  const u = data.usage || {};

  return {
    id: caseObj.id,
    ok: isValid,
    raw_valid: isValid,
    diagnosis_slug: isValid && TAXONOMY.includes(obj.diagnosis_slug) ? obj.diagnosis_slug : null,
    cost_range_usd: isValid ? parseCostRange(obj.cost) : null,
    severity: isValid ? normalizeSeverity(obj.severity) : null,
    mentions_safety: isValid ? detectSafety(obj) : false,
    tokens: (u.input_tokens || 0) + (u.output_tokens || 0),
    input_tokens: u.input_tokens || 0,
    output_tokens: u.output_tokens || 0,
    latency_ms,
    stop_reason: data.stop_reason || null,
    model: MODEL,
  };
}

const caseFile = process.argv[2];
if (!caseFile) { console.error("usage: node pipeline.mjs <case.json>"); process.exit(2); }
const caseObj = JSON.parse(fs.readFileSync(caseFile, "utf8"));
run(caseObj).then((res) => { process.stdout.write(JSON.stringify(res)); });
