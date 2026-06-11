#!/usr/bin/env node
/**
 * Headless wiring of the app's diagnostic pipeline for the benchmark harness.
 *
 * It reuses the PRODUCTION request builder (guideRequest from api/generate.js),
 * which forces the emit_repair_guide tool — so diagnosis_slug and severity come
 * straight from the app's own structured output (SPEC section 2: "mapped to a
 * slug by the app itself; no fuzzy matching in the scorer"). The client-side
 * templateGuide fallback is intentionally NOT modeled; the harness measures the
 * AI pipeline only.
 *
 * Usage: node pipeline.mjs <case.json>   → prints one normalized JSON object.
 * Reads ANTHROPIC_API_KEY and (optional) ANTHROPIC_MODEL / FIXCOST_MAX_TOKENS.
 */
import fs from "node:fs";
import { guideRequest, parseGuide, DIAGNOSIS_SLUGS, SEVERITY_LEVELS } from "../api/generate.js";

const API_KEY = process.env.ANTHROPIC_API_KEY || "";
const MAX_TOKENS_OVERRIDE = process.env.FIXCOST_MAX_TOKENS
  ? parseInt(process.env.FIXCOST_MAX_TOKENS, 10) : null;

// HV / high-voltage safety language detector for the safety-compliance component.
const HV_RE = /high[\s-]?voltage|\bhv\b|orange cable|orange (?:high[\s-]?voltage )?cable|electric shock|electrocution|de-?energize|service (?:plug|disconnect)|hybrid battery|traction battery|hv battery|isolate the battery|hazardous voltage/i;

function caseToInput(c) {
  const v = c.vehicle;
  const obs = (c.observations || []).join("; ");
  const dtc = (c.dtc_codes || []).length ? ` DTC codes: ${c.dtc_codes.join(", ")}.` : "";
  const problem = `${c.complaint}${obs ? ` Observations: ${obs}.` : ""}${dtc}`;
  return { year: v.year, make: v.make, model: v.model, trim: "", problem, stateCode: "", lang: "en" };
}

function parseCostRange(cost) {
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
  return SEVERITY_LEVELS.includes(v) ? v : null;
}

function detectSafety(guide) {
  const hay = JSON.stringify(guide?.safety || []) + " " + (guide?.overview || "") + " " + (guide?.when_to_stop || "");
  return HV_RE.test(hay);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504, 529]);
const RETRYABLE_TYPE = new Set(["overloaded_error", "rate_limit_error", "api_error", "timeout_error"]);

// Bounded retry on transient network drops / overload; a clean API error
// (e.g. invalid model) is returned immediately.
async function callWithRetry(body, attempts = 4) {
  const backoff = [2000, 5000, 12000];
  let lastErr = null;
  for (let i = 0; i < attempts; i++) {
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": API_KEY, "anthropic-version": "2023-06-01" },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (data?.error && RETRYABLE_TYPE.has(data.error.type) && i < attempts - 1) { await sleep(backoff[i] || 12000); continue; }
      if (!r.ok && RETRYABLE_STATUS.has(r.status) && !data?.error && i < attempts - 1) { await sleep(backoff[i] || 12000); continue; }
      return { data, errorMsg: null };
    } catch (e) {
      lastErr = e.message;
      if (i < attempts - 1) { await sleep(backoff[i] || 12000); continue; }
    }
  }
  return { data: null, errorMsg: lastErr || "request failed after retries" };
}

async function run(caseObj) {
  const body = guideRequest(caseToInput(caseObj));
  if (MAX_TOKENS_OVERRIDE) body.max_tokens = MAX_TOKENS_OVERRIDE;
  const model = body.model;

  const t0 = Date.now();
  const { data, errorMsg } = await callWithRetry(body);
  const latency_ms = Date.now() - t0;

  const base = {
    id: caseObj.id, latency_ms, model,
    diagnosis_slug: null, cost_range_usd: null, severity: null, mentions_safety: false,
    tokens: (data?.usage?.input_tokens || 0) + (data?.usage?.output_tokens || 0),
    input_tokens: data?.usage?.input_tokens || 0, output_tokens: data?.usage?.output_tokens || 0,
    stop_reason: data?.stop_reason || null,
  };

  if (errorMsg || data?.error) {
    return { ...base, ok: false, error: errorMsg || data.error?.message };
  }

  const { guide, stop_reason, usage } = parseGuide(data);
  const isValid = !!(guide && (guide.overview || guide.difficulty || guide.cost));
  return {
    ...base,
    ok: isValid,
    raw_valid: isValid,
    diagnosis_slug: isValid && DIAGNOSIS_SLUGS.includes(guide.diagnosis_slug) ? guide.diagnosis_slug : null,
    cost_range_usd: isValid ? parseCostRange(guide.cost) : null,
    severity: isValid ? normalizeSeverity(guide.severity) : null,
    mentions_safety: isValid ? detectSafety(guide) : false,
    tokens: (usage?.input_tokens || 0) + (usage?.output_tokens || 0),
    input_tokens: usage?.input_tokens || 0,
    output_tokens: usage?.output_tokens || 0,
    stop_reason,
  };
}

const caseFile = process.argv[2];
if (!caseFile) { console.error("usage: node pipeline.mjs <case.json>"); process.exit(2); }
const caseObj = JSON.parse(fs.readFileSync(caseFile, "utf8"));
run(caseObj).then((res) => { process.stdout.write(JSON.stringify(res)); });
