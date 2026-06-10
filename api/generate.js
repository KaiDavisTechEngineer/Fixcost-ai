// Vercel Edge Function: /api/generate
// Proxies repair-guide generation requests to the Anthropic API server-side,
// keeping the API key out of the client bundle. Deployed automatically by
// Vercel when this file exists in /api/ — no extra config needed.
//
// Required environment variable on Vercel: ANTHROPIC_API_KEY
// Optional: ANTHROPIC_MODEL (defaults to claude-sonnet-4-20250514)

export const config = { runtime: "edge" };

const MAX_INPUT = {
  year: 4, make: 30, model: 60, trim: 60, problem: 500, stateCode: 2, lang: 2,
};

function sanitize(value, maxLen) {
  if (typeof value !== "string") value = String(value || "");
  // Strip non-ASCII, control characters, and excessive whitespace
  return value
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[^\x20-\x7E\n]/g, "")
    .slice(0, maxLen);
}

// State labor rate lookup — synced with client-side LABOR object
const LABOR = {
  Northeast: { lo: 120, hi: 180, codes: ["NY","NJ","CT","MA","RI","NH","VT","ME","PA","DE","MD","DC"] },
  WestCoast: { lo: 130, hi: 190, codes: ["CA","OR","WA"] },
  Midwest: { lo: 90, hi: 130, codes: ["IL","IN","OH","MI","WI","MN","IA","MO","KS","NE","ND","SD"] },
  South: { lo: 85, hi: 125, codes: ["FL","GA","NC","SC","VA","WV","KY","TN","AL","MS","LA","AR"] },
  Mountain: { lo: 95, hi: 145, codes: ["CO","UT","WY","MT","ID","NV"] },
  Southwest: { lo: 90, hi: 135, codes: ["TX","OK","NM","AZ"] },
  AlaskaHawaii: { lo: 140, hi: 200, codes: ["AK","HI"] },
};
const STATE_NAMES = {
  AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",CO:"Colorado",CT:"Connecticut",DE:"Delaware",FL:"Florida",GA:"Georgia",HI:"Hawaii",ID:"Idaho",IL:"Illinois",IN:"Indiana",IA:"Iowa",KS:"Kansas",KY:"Kentucky",LA:"Louisiana",ME:"Maine",MD:"Maryland",MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",MS:"Mississippi",MO:"Missouri",MT:"Montana",NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",NJ:"New Jersey",NM:"New Mexico",NY:"New York",NC:"North Carolina",ND:"North Dakota",OH:"Ohio",OK:"Oklahoma",OR:"Oregon",PA:"Pennsylvania",RI:"Rhode Island",SC:"South Carolina",SD:"South Dakota",TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",VA:"Virginia",WA:"Washington",WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming",DC:"District of Columbia",
};

function getLaborRate(stateCode) {
  const code = sanitize(stateCode, 2).toUpperCase();
  if (!code) return null;
  for (const region of Object.values(LABOR)) {
    if (region.codes.includes(code)) return region;
  }
  return null;
}

export function resolveModel() {
  return process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";
}

export function buildPrompt({ year, make, model, trim, problem, stateCode, lang }) {
  const rate = getLaborRate(stateCode);
  const stateName = STATE_NAMES[sanitize(stateCode, 2).toUpperCase()] || "";
  const rateLine = rate
    ? ` Location: ${stateName}, labor rate $${rate.lo}-$${rate.hi}/hr.`
    : "";
  const trimLine = trim ? ` Trim/Engine: ${sanitize(trim, MAX_INPUT.trim)}.` : "";
  const langInstr = lang === "es"
    ? "\nWRITE ALL STRING VALUES IN SPANISH. Keep JSON keys in English."
    : "";

  return (
    "You are a master auto mechanic and ASE-certified technician with 25+ years of hands-on experience. You explain repairs clearly enough that a careful beginner can follow, while including the depth a pro would want.\n\n" +
    `Vehicle: ${sanitize(year, MAX_INPUT.year)} ${sanitize(make, MAX_INPUT.make)} ${sanitize(model, MAX_INPUT.model)}${trimLine}\n` +
    `Problem: ${sanitize(problem, MAX_INPUT.problem)}${rateLine}${langInstr}\n\n` +
    "Generate a thorough, vehicle-specific repair guide as a JSON object. Use the trim/engine info to give exact torque specs, fluid types/capacities, common failure points, and known issues for THIS engine. Format:\n" +
    '{"overview":"2-4 sentences: what\'s likely wrong, the most probable root cause for THIS vehicle, and what the repair involves",' +
    '"repair_target":"the SINGLE most likely specific part or repair in short searchable terms — e.g. \'front sway bar end links\', \'front brake pads and rotors\', \'alternator\'. This drives parts/forum/video searches, so be precise.",' +
    '"difficulty":"Beginner|Intermediate|Advanced","time":"realistic range e.g. 2-4 hours","difficulty_reason":"1-2 sentences explaining the rating",' +
    '"diagnosis":["3-6 ordered steps to CONFIRM the root cause before buying parts — specific tests, what readings/symptoms confirm or rule out each cause, which OBD-II codes matter and what they mean for this engine"],' +
    `"cost":{"diy_parts":"$X-$Y","tools":"$X-$Y","total_diy":"$X-$Y","shop_labor":"$X-$Y${rate ? ` at $${rate.lo}-$${rate.hi}/hr` : ""}","total_shop":"$X-$Y","savings":"$X-$Y"},` +
    '"tools":["each tool WITH the specific size/spec needed, e.g. \'10mm + 13mm sockets\', \'torque wrench (10-100 ft-lb)\'"],' +
    '"parts":["each part with OEM vs aftermarket note and a rough price"],' +
    '"steps":["fallback single list ONLY if removal/installation split does not apply"],' +
    '"removal_steps":["5-12 SHORT scannable bullet steps to REMOVE the failed part. Each 1-2 sentences: the action plus exact torque/measurement or a step-specific warning."],' +
    '"installation_steps":["5-12 SHORT scannable bullet steps to INSTALL the new part and VERIFY the fix — torque specs, reset/relearn procedure, and final test-drive/confirmation step."],' +
    '"mistakes":["4-6 mistakes UNIQUE to this make/model/year — known failure points, model-specific gotchas, year-range recalls/TSBs"],' +
    '"safety":["4-6 safety warnings including model-specific ones (electronic parking brake service mode, battery registration, hybrid high-voltage, refrigerant type, etc.)"],' +
    '"tips":["2-4 pro tips that make the job easier or prevent comebacks"],' +
    '"when_to_stop":"1-2 sentences: signs this is beyond DIY and should go to a professional",' +
    '"youtube_searches":["4 search terms tuned to THIS exact vehicle and repair"]}\n\n' +
    "Be SPECIFIC to this exact vehicle — real torque values, real part numbers where you know them, real failure points. " +
    "Avoid generic advice. Respond with ONLY the JSON object — no markdown, no preamble."
  );
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

  const prompt = buildPrompt({ year, make, model, trim, problem, stateCode, lang });
  const model_id = resolveModel();

  try {
    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model_id,
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      }),
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
    const blocks = Array.isArray(data?.content) ? data.content : [];
    const text = blocks
      .filter(b => b && (b.type === "text" || typeof b.text === "string"))
      .map(b => b.text || "")
      .join("\n");

    return new Response(JSON.stringify({ result: text, model: model_id }), {
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
