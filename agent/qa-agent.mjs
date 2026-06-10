#!/usr/bin/env node
/**
 * FixCost AI — expert-review QA agent
 * ------------------------------------
 * Drives the app through real repair scenarios, runs automated checks, and then
 * convenes a THREE-PERSON SENIOR REVIEW PANEL (powered by Claude):
 *
 *   1. Senior Auto Mechanic   — judges the repair guides (accuracy, safety, realism)
 *   2. Senior App Developer   — judges the UX/product (SEES the screenshots)
 *   3. Senior Software Engineer — judges the source code (architecture, security, perf)
 *
 * Each gathers different evidence: the mechanic reads guides, the app dev looks at
 * screenshots + console/timing, the engineer reads the source.
 *
 * Usage:
 *   npm install
 *   node qa-agent.mjs --file ../../fixcost-ai-standalone.html
 *   node qa-agent.mjs --url https://your-site.vercel.app --source ../src/App.jsx
 *   ANTHROPIC_API_KEY=sk-ant-... node qa-agent.mjs --file ../../fixcost-ai-standalone.html
 */

import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
function arg(name) { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; }
const fileArg = arg("--file");
const urlArg = arg("--url");
const sourceArg = arg("--source");
const headed = args.includes("--headed");
if (!fileArg && !urlArg) { console.error("Provide --file <standalone.html> or --url <deployed-url>"); process.exit(1); }
const targetUrl = urlArg || pathToFileURL(path.resolve(__dirname, fileArg)).href;
const API_KEY = process.env.ANTHROPIC_API_KEY || "";
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";

// Resolve the source file for the engineer review (prefer the real App.jsx)
function resolveSource() {
  const candidates = [sourceArg, "../src/App.jsx", "../../fixcost-ai.jsx", fileArg].filter(Boolean);
  for (const c of candidates) { const p = path.resolve(__dirname, c); if (fs.existsSync(p)) return p; }
  return null;
}
const SOURCE_PATH = resolveSource();

const SCENARIOS = [
  { id: "tire-nc",   year: "2013", make: "Ford",   model: "C-Max", trim: "SEL 2.0L Hybrid",      state: "NC", lang: "EN", problem: "low air in tire" },
  { id: "struts-nc", year: "2013", make: "Ford",   model: "C-Max", trim: "SEL 2.0L Hybrid",      state: "NC", lang: "EN", problem: "Suspension bottoming out" },
  { id: "struts-ca", year: "2013", make: "Ford",   model: "C-Max", trim: "SEL 2.0L Hybrid",      state: "CA", lang: "EN", problem: "Suspension bottoming out" },
  { id: "brakes-tx", year: "2018", make: "Honda",  model: "Civic", trim: "EX 1.5L Turbo Sedan",  state: "TX", lang: "EN", problem: "Squeaking grinding brakes" },
  { id: "cel-ny",    year: "2016", make: "Toyota", model: "Camry", trim: "LE 2.5L 4cyl Sedan",   state: "NY", lang: "EN", problem: "Check engine light on, rough idle" },
  { id: "struts-es", year: "2013", make: "Ford",   model: "C-Max", trim: "SEL 2.0L Hybrid",      state: "CA", lang: "ES", problem: "Suspension bottoming out" },
];

// ---- UI drivers (select by stable option VALUES so it works in EN and ES) ----
async function selectByOptionValue(page, value) {
  const sel = page.locator(`select:has(option[value="${value}"])`).first();
  await sel.waitFor({ state: "visible", timeout: 8000 });
  await sel.selectOption(value);
}
async function setLanguage(page, lang) {
  const btn = page.getByRole("button", { name: new RegExp(`^${lang}$`, "i") }).first();
  if (await btn.count()) { await btn.click().catch(() => {}); await page.waitForTimeout(300); }
}
async function goToDiagnose(page) {
  const btn = page.getByRole("button", { name: /diagnose|diagnosticar/i }).first();
  if (await btn.count()) { await btn.click().catch(() => {}); await page.waitForTimeout(300); }
}
async function readGuide(page) {
  const cards = page.locator(".rs");
  await cards.first().waitFor({ state: "visible", timeout: 20000 });
  return (await cards.allInnerTexts()).join("\n\n");
}
function dollars(text, label) {
  const re = new RegExp(label + "[^$]*\\$([0-9,]+)(?:\\s*[-–]\\s*\\$([0-9,]+))?", "i");
  const m = text.match(re); if (!m) return null;
  const lo = parseInt(m[1].replace(/,/g, ""), 10);
  const hi = m[2] ? parseInt(m[2].replace(/,/g, ""), 10) : lo;
  return Math.round((lo + hi) / 2);
}

async function runScenario(page, sc, diag) {
  await page.goto(targetUrl, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  await setLanguage(page, sc.lang);
  await goToDiagnose(page);
  await selectByOptionValue(page, sc.year);
  await selectByOptionValue(page, sc.make);
  await page.waitForTimeout(200);
  await selectByOptionValue(page, sc.model).catch(() => {});
  await page.waitForTimeout(200);
  await selectByOptionValue(page, sc.trim).catch(() => {});
  await selectByOptionValue(page, sc.state).catch(() => {});
  await page.locator("textarea").first().fill(sc.problem);
  const t0 = Date.now();
  await page.getByRole("button", { name: /generate repair guide|generar/i }).first().click();
  const guide = await readGuide(page);
  const timeToResult = Date.now() - t0;
  const shot = path.join(__dirname, "screenshots", `${sc.id}.png`);
  await page.screenshot({ path: shot, fullPage: true });
  return { ...sc, guide, timeToResult, shopMid: dollars(guide, "shop estimate|taller"), diyMid: dollars(guide, "Total DIY|Total hazlo"), screenshot: path.relative(__dirname, shot), shotAbs: shot };
}

// ---- Claude helpers ----
async function callClaude(system, content, maxTokens = 1100) {
  if (!API_KEY) return null;
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages: [{ role: "user", content }] }),
    });
    const data = await r.json();
    if (data.error) return "(review error: " + (data.error.message || JSON.stringify(data.error)) + ")";
    return (data.content || []).map(b => b.text || "").join("\n").trim();
  } catch (e) { return "(review failed: " + e.message + ")"; }
}

// 1) Senior Auto Mechanic — reads the repair guides
async function reviewMechanic(results) {
  const sample = results.filter(r => r.guide).slice(0, 4)
    .map(r => `=== ${r.year} ${r.make} ${r.model} ${r.trim} — "${r.problem}" (${r.lang}) ===\n${r.guide.slice(0, 3500)}`).join("\n\n");
  const system = "You are a senior ASE-certified master auto mechanic with 25+ years of hands-on experience across all major makes. You are reviewing the repair guidance produced by a consumer car-repair app. Be blunt and specific — owners will act on this.";
  const prompt = `Review these AI-generated repair guides for TECHNICAL CORRECTNESS and SAFETY.\n\n${sample}\n\nGive:\n1. Scores /5 for: technical accuracy, safety guidance, completeness, realism of cost/time.\n2. Any WRONG or DANGEROUS statements (quote them).\n3. Anything important that's missing for these specific repairs/vehicles.\n4. Your top 3 fixes, most important first. Be terse.`;
  return callClaude(system, prompt);
}

// 2) Senior App Developer — SEES screenshots + console/timing
async function reviewAppDev(results, diag) {
  const ok = results.filter(r => r.guide);
  const shots = ok.slice(0, 2).map(r => r.shotAbs).filter(p => p && fs.existsSync(p));
  const content = [];
  const avgTime = ok.length ? Math.round(ok.reduce((s, r) => s + (r.timeToResult || 0), 0) / ok.length) : 0;
  content.push({ type: "text", text:
    `You are reviewing a car-repair web app. Below are full-page screenshots of generated repair guides, plus runtime telemetry.\n\n` +
    `Telemetry:\n- Scenarios run: ${results.length}, succeeded: ${ok.length}\n- Avg time from "Generate" to result: ${avgTime} ms\n- Console errors: ${diag.consoleErrors.length ? diag.consoleErrors.slice(0,5).join(" | ") : "none"}\n- Failed network requests: ${diag.failedRequests.length ? diag.failedRequests.slice(0,5).join(" | ") : "none"}\n\nReview as a senior product/app developer + UX designer. Give:\n1. Scores /5 for: visual design, information hierarchy, mobile usability, perceived performance, feature completeness.\n2. The 3 biggest UX problems you can SEE in the screenshots.\n3. 3 concrete, high-impact improvements. Be terse and specific.` });
  for (const p of shots) {
    try { content.push({ type: "image", source: { type: "base64", media_type: "image/png", data: fs.readFileSync(p).toString("base64") } }); } catch {}
  }
  const system = "You are a senior product engineer and UX designer who has shipped many consumer web/mobile apps. You give direct, prioritized, actionable critique.";
  return callClaude(system, content, 1100);
}

// 3) Senior Software Engineer — reads the source code
async function reviewSWE() {
  if (!SOURCE_PATH) return "(no source file found — pass --source ../src/App.jsx to enable the engineering review)";
  let code = fs.readFileSync(SOURCE_PATH, "utf8");
  const note = code.length > 120000 ? `\n\n[NOTE: source truncated to first 120k chars of ${code.length}]` : "";
  code = code.slice(0, 120000);
  const system = "You are a senior software engineer / tech lead reviewing a single-file React application for a code review. You care about architecture, security, performance, accessibility, error handling, and maintainability. Be direct and concrete.";
  const prompt = `Code review this React app (file: ${path.basename(SOURCE_PATH)}).${note}\n\n\`\`\`jsx\n${code}\n\`\`\`\n\nGive:\n1. Scores /5 for: architecture, security, performance, accessibility, maintainability.\n2. The most serious issues you'd block a PR on (be specific — name functions/patterns).\n3. The 3 highest-leverage refactors. Be terse.`;
  return callClaude(system, prompt, 1400);
}

function runChecks(results) {
  const byId = Object.fromEntries(results.map(r => [r.id, r]));
  const checks = []; const push = (n, p, d) => checks.push({ name: n, pass: p, detail: d || "" });
  if (byId["struts-ca"]?.shopMid && byId["struts-nc"]?.shopMid) push("Shop cost scales by state (CA > NC for struts)", byId["struts-ca"].shopMid > byId["struts-nc"].shopMid, `CA ~$${byId["struts-ca"].shopMid} vs NC ~$${byId["struts-nc"].shopMid}`);
  if (byId["tire-nc"]?.diyMid && byId["struts-nc"]?.diyMid) push("Tire DIY much cheaper than struts DIY", byId["tire-nc"].diyMid < byId["struts-nc"].diyMid, `tire ~$${byId["tire-nc"].diyMid} vs struts ~$${byId["struts-nc"].diyMid}`);
  if (byId["tire-nc"]) push("Tire guide is Beginner-level", /beginner|principiante/i.test(byId["tire-nc"].guide));
  if (byId["struts-nc"]) push("Struts guide is Intermediate-level", /intermediate|intermedio/i.test(byId["struts-nc"].guide));
  if (byId["struts-es"]) push("Spanish guide uses Spanish headers", /qué falla|estimado de costo|herramientas necesarias/i.test(byId["struts-es"].guide) && !/what's likely wrong/i.test(byId["struts-es"].guide));
  for (const r of results) push(`Core sections present — ${r.id}`, /(what's likely wrong|qué falla)/i.test(r.guide) && /(cost estimate|estimado de costo)/i.test(r.guide) && /(tools|herramientas)/i.test(r.guide));
  return checks;
}

(async () => {
  console.log("Launching browser… target:", targetUrl);
  if (SOURCE_PATH) console.log("Engineering review source:", path.relative(__dirname, SOURCE_PATH));
  const browser = await chromium.launch({ headless: !headed });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const diag = { consoleErrors: [], failedRequests: [] };
  page.on("console", m => { if (m.type() === "error") diag.consoleErrors.push(m.text().slice(0, 200)); });
  page.on("pageerror", e => diag.consoleErrors.push("pageerror: " + String(e.message).slice(0, 200)));
  page.on("requestfailed", req => { const u = req.url(); if (!u.startsWith("data:")) diag.failedRequests.push(u.slice(0, 120)); });

  const results = [];
  for (const sc of SCENARIOS) {
    process.stdout.write(`Running ${sc.id} … `);
    try { const r = await runScenario(page, sc, diag); results.push(r); console.log("ok" + (r.shopMid ? ` (shop ~$${r.shopMid}, ${r.timeToResult}ms)` : "")); }
    catch (e) { console.log("FAILED:", e.message); results.push({ ...sc, error: e.message, guide: "" }); }
  }
  await browser.close();

  const checks = runChecks(results.filter(r => !r.error));
  const passCount = checks.filter(c => c.pass).length;

  // Convene the expert panel
  let mech = null, appdev = null, swe = null;
  if (API_KEY) {
    console.log("\nConvening senior review panel (Claude)…");
    process.stdout.write("  • Senior Auto Mechanic … "); mech = await reviewMechanic(results); console.log("done");
    process.stdout.write("  • Senior App Developer … "); appdev = await reviewAppDev(results, diag); console.log("done");
    process.stdout.write("  • Senior Software Engineer … "); swe = await reviewSWE(); console.log("done");
  }

  let md = `# FixCost AI — Senior Panel Review\n\nTarget: \`${targetUrl}\`\nGenerated: ${new Date().toISOString()}\n\n`;
  md += `## Automated checks — ${passCount}/${checks.length} passed\n\n`;
  for (const c of checks) md += `- ${c.pass ? "✅" : "❌"} ${c.name}${c.detail ? ` — ${c.detail}` : ""}\n`;
  if (diag.consoleErrors.length) md += `\n**Console errors observed:** ${diag.consoleErrors.length}\n`;
  if (diag.failedRequests.length) md += `**Failed requests:** ${diag.failedRequests.length}\n`;

  if (API_KEY) {
    md += `\n---\n\n# Expert Panel\n\n`;
    md += `## 🔧 Senior Auto Mechanic — repair-guide review\n\n${mech || "(skipped)"}\n\n`;
    md += `## 📱 Senior App Developer — UX/product review\n\n${appdev || "(skipped)"}\n\n`;
    md += `## 💻 Senior Software Engineer — code review\n\n${swe || "(skipped)"}\n\n`;
  } else {
    md += `\n> Set ANTHROPIC_API_KEY to convene the senior review panel (mechanic + app developer + software engineer).\n`;
  }

  md += `\n---\n\n## Scenario details\n\n`;
  for (const r of results) {
    md += `### ${r.id} — ${r.year} ${r.make} ${r.model} (${r.lang})\nProblem: "${r.problem}" · State: ${r.state}\n\n`;
    if (r.error) { md += `> ERROR: ${r.error}\n\n`; continue; }
    md += `- DIY ~$${r.diyMid ?? "?"} · Shop ~$${r.shopMid ?? "?"} · ${r.timeToResult}ms to result\n- Screenshot: \`${r.screenshot}\`\n\n`;
  }

  fs.writeFileSync(path.join(__dirname, "report.md"), md);
  console.log(`\nReport written to ${path.join(__dirname, "report.md")}`);
  console.log(`Checks: ${passCount}/${checks.length} passed. Screenshots in ./screenshots/`);
  if (!API_KEY) console.log("Tip: set ANTHROPIC_API_KEY to get the 3 senior expert reviews.");
})();
