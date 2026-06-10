// Unit tests for the /api/generate edge function helpers.
// Run: npm test   (node --test)
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveModel, MAX_OUTPUT_TOKENS, buildPrompt } from "./generate.js";

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
