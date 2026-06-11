// Unit tests for the /api/generate edge function helpers.
// Run: npm test   (node --test)
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import {
  resolveModel, MAX_OUTPUT_TOKENS, buildPrompt,
  DIAGNOSIS_SLUGS, SEVERITY_LEVELS, GUIDE_TOOL, guideRequest, parseGuide,
} from "./generate.js";

const TAXONOMY_PATH = fileURLToPath(new URL("../benchmarks/schema/diagnosis_taxonomy.json", import.meta.url));

const DEAD_MODEL = "claude-sonnet-4-20250514"; // 404s on the API as of 2026-06

test("resolveModel defaults to a current, non-404 model", () => {
  const prev = process.env.ANTHROPIC_MODEL;
  delete process.env.ANTHROPIC_MODEL;
  try {
    assert.notEqual(resolveModel(), DEAD_MODEL, "default must not be the dead model");
    assert.equal(resolveModel(), "claude-sonnet-4-6");
  } finally {
    if (prev !== undefined) process.env.ANTHROPIC_MODEL = prev;
  }
});

test("resolveModel honors ANTHROPIC_MODEL override", () => {
  const prev = process.env.ANTHROPIC_MODEL;
  process.env.ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";
  try {
    assert.equal(resolveModel(), "claude-haiku-4-5-20251001");
  } finally {
    if (prev === undefined) delete process.env.ANTHROPIC_MODEL;
    else process.env.ANTHROPIC_MODEL = prev;
  }
});

test("MAX_OUTPUT_TOKENS is large enough for a full guide (~5.8k output)", () => {
  // The baseline showed full guides need ~5800 output tokens; 4096 truncated them.
  assert.ok(MAX_OUTPUT_TOKENS >= 6000, `expected >= 6000, got ${MAX_OUTPUT_TOKENS}`);
});

test("buildPrompt embeds vehicle + problem and stays ASCII-safe", () => {
  const p = buildPrompt({ year: 2013, make: "Ford", model: "C-MAX", trim: "SEL", problem: "whining noise", stateCode: "NC", lang: "en" });
  assert.match(p, /2013 Ford C-MAX/);
  assert.match(p, /whining noise/);
  assert.match(p, /JSON object/);
});

test("buildPrompt adds the Spanish instruction when lang=es", () => {
  const p = buildPrompt({ year: 2016, make: "Toyota", model: "Camry", trim: "", problem: "ruido", stateCode: "", lang: "es" });
  assert.match(p, /SPANISH/);
});

// ---- item (c): structured tool-use output ----

test("DIAGNOSIS_SLUGS stays in sync with the benchmark taxonomy file", () => {
  const file = JSON.parse(fs.readFileSync(TAXONOMY_PATH, "utf8")).diagnoses;
  assert.deepEqual(DIAGNOSIS_SLUGS, file, "inlined slugs drifted from diagnosis_taxonomy.json");
});

test("GUIDE_TOOL enforces diagnosis_slug + severity as required enums", () => {
  const props = GUIDE_TOOL.input_schema.properties;
  assert.deepEqual(props.diagnosis_slug.enum, DIAGNOSIS_SLUGS);
  assert.deepEqual(props.severity.enum, SEVERITY_LEVELS);
  for (const r of ["diagnosis_slug", "severity", "safety"]) {
    assert.ok(GUIDE_TOOL.input_schema.required.includes(r), `${r} must be required`);
  }
});

test("guideRequest forces the emit_repair_guide tool", () => {
  const body = guideRequest({ year: 2013, make: "Ford", model: "C-MAX", trim: "", problem: "x", stateCode: "", lang: "en" });
  assert.equal(body.tool_choice.type, "tool");
  assert.equal(body.tool_choice.name, "emit_repair_guide");
  assert.equal(body.tools[0].name, "emit_repair_guide");
  assert.equal(body.max_tokens, MAX_OUTPUT_TOKENS);
});

test("parseGuide extracts the tool_use input", () => {
  const data = {
    stop_reason: "tool_use",
    usage: { input_tokens: 100, output_tokens: 200 },
    content: [
      { type: "text", text: "thinking" },
      { type: "tool_use", name: "emit_repair_guide", input: { overview: "x", diagnosis_slug: "alternator", severity: "moderate" } },
    ],
  };
  const { guide, truncated, usage } = parseGuide(data);
  assert.equal(guide.diagnosis_slug, "alternator");
  assert.equal(truncated, false);
  assert.equal(usage.output_tokens, 200);
});

test("parseGuide returns null guide on a truncated tool call", () => {
  const data = { stop_reason: "max_tokens", content: [{ type: "text", text: "partial" }] };
  const { guide, truncated } = parseGuide(data);
  assert.equal(guide, null);
  assert.equal(truncated, true);
});
