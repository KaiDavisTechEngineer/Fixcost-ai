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
  return process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
}

// Output token cap. The repair-guide JSON schema needs ~5.8k output tokens for a
// full guide; the old 4096 cap truncated most responses into invalid JSON that
// the client then silently discarded in favor of the local template. 8192 gives
// headroom so full guides complete. (Phase 2B item b trims the schema to bring
// typical usage back down.)
export const MAX_OUTPUT_TOKENS = 8192;

export const SEVERITY_LEVELS = ["info", "moderate", "urgent", "do_not_drive"];

// Controlled diagnosis vocabulary. MUST stay in sync with
// benchmarks/schema/diagnosis_taxonomy.json (guarded by a unit test). Inlined
// because the edge runtime can't read the file at request time.
export const DIAGNOSIS_SLUGS = [
  "no_fault_found", "needs_further_diagnosis", "brake_pads_front", "brake_pads_rear", "brake_rotors_front", "brake_rotors_rear",
  "brake_pads_and_rotors_front", "brake_pads_and_rotors_rear", "brake_caliper_seized", "brake_caliper_leaking", "brake_master_cylinder", "brake_booster",
  "brake_fluid_leak", "brake_line_corroded", "abs_wheel_speed_sensor", "abs_module", "parking_brake_cable", "wheel_bearing_front",
  "wheel_bearing_front_right", "wheel_bearing_front_left", "wheel_bearing_rear", "cv_joint", "cv_axle", "tie_rod_end",
  "ball_joint", "control_arm", "control_arm_bushing", "sway_bar_end_link", "sway_bar_bushing", "strut_assembly",
  "strut_mount", "shock_absorber", "coil_spring_broken", "wheel_alignment", "tire_worn", "tire_puncture",
  "tire_sidewall_damage", "tire_pressure_low", "tpms_sensor", "wheel_balance", "wheel_lug_stud", "power_steering_pump",
  "power_steering_fluid_leak", "steering_rack", "steering_rack_leak", "electric_power_steering_motor", "intermediate_steering_shaft", "engine_misfire",
  "ignition_coil", "spark_plugs", "spark_plug_wires", "fuel_injector", "fuel_pump", "fuel_filter",
  "fuel_pressure_regulator", "mass_air_flow_sensor", "oxygen_sensor_upstream", "oxygen_sensor_downstream", "throttle_body", "egr_valve",
  "evap_purge_valve", "evap_canister", "evap_leak_gas_cap", "pcv_valve", "intake_manifold_gasket", "vacuum_leak",
  "timing_chain", "timing_belt", "timing_cover_leak", "valve_cover_gasket_leak", "head_gasket", "oil_leak_rear_main_seal",
  "oil_leak_oil_pan_gasket", "oil_pan_drain_plug", "oil_consumption_piston_rings", "low_oil_pressure", "engine_mount", "serpentine_belt",
  "belt_tensioner", "idler_pulley", "knock_sensor", "camshaft_position_sensor", "crankshaft_position_sensor", "variable_valve_timing_solenoid",
  "carbon_buildup_intake_valves", "catalytic_converter", "exhaust_leak_manifold", "exhaust_flex_pipe", "muffler", "thermostat",
  "water_pump", "radiator", "radiator_fan_motor", "radiator_hose_leak", "coolant_leak", "heater_core",
  "coolant_temp_sensor", "head_gasket_coolant_loss", "battery_weak", "battery_dead", "alternator", "starter_motor",
  "starter_solenoid", "ground_strap_corroded", "parasitic_draw", "ignition_switch", "blower_motor", "blower_motor_resistor",
  "headlight_bulb", "wiring_harness_chafe", "body_control_module", "ac_compressor", "ac_refrigerant_low", "ac_condenser",
  "ac_evaporator", "ac_expansion_valve", "cabin_air_filter", "ac_clutch", "transmission_fluid_low", "transmission_slipping",
  "transmission_solenoid", "torque_converter", "clutch_worn", "clutch_master_cylinder", "transmission_mount", "differential_fluid",
  "transfer_case", "cvt_failure", "hybrid_battery_pack", "hybrid_inverter_coolant_pump", "hybrid_high_voltage_cable", "ev_battery_pack",
  "ev_charging_port", "ev_onboard_charger", "ev_drive_motor", "dc_dc_converter", "regenerative_braking_fault", "windshield_wiper_motor",
  "window_regulator", "door_lock_actuator", "sunroof_drain_clog", "exterior_trim_clip",
];

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
    '{"overview":"2-3 sentences: what\'s likely wrong, the most probable root cause for THIS vehicle, and what the repair involves",' +
    '"repair_target":"the SINGLE most likely specific part or repair in short searchable terms — e.g. \'front sway bar end links\', \'front brake pads and rotors\', \'alternator\'. This drives parts/forum/video searches, so be precise.",' +
    '"difficulty":"Beginner|Intermediate|Advanced","time":"realistic range e.g. 2-4 hours","difficulty_reason":"1 sentence explaining the rating",' +
    '"diagnosis":["3-5 ordered steps to CONFIRM the root cause before buying parts — specific tests, what confirms/rules out each cause, which OBD-II codes matter for this engine"],' +
    `"cost":{"diy_parts":"$X-$Y","tools":"$X-$Y","total_diy":"$X-$Y","shop_labor":"$X-$Y${rate ? ` at $${rate.lo}-$${rate.hi}/hr` : ""}","total_shop":"$X-$Y","savings":"$X-$Y"},` +
    '"tools":["each tool WITH the specific size/spec needed, e.g. \'10mm + 13mm sockets\', \'torque wrench (10-100 ft-lb)\'"],' +
    '"parts":["each part with OEM vs aftermarket note and a rough price"],' +
    '"steps":["ONLY for a diagnostic-only fix with no part to replace; otherwise omit this key and use removal_steps + installation_steps instead. Never produce both."],' +
    '"removal_steps":["4-8 short bullet steps to REMOVE the failed part. Each 1-2 sentences: the action plus exact torque/measurement or a step-specific warning."],' +
    '"installation_steps":["4-8 short bullet steps to INSTALL the new part and VERIFY the fix — torque specs, any reset/relearn, and the final test-drive/confirmation step."],' +
    '"mistakes":["3-5 mistakes UNIQUE to this make/model/year — known failure points, model-specific gotchas, year-range recalls/TSBs"],' +
    '"safety":["4-6 safety warnings including model-specific ones (electronic parking brake service mode, battery registration, hybrid high-voltage, refrigerant type, etc.)"],' +
    '"tips":["2-3 pro tips that make the job easier or prevent comebacks"],' +
    '"when_to_stop":"1-2 sentences: signs this is beyond DIY and should go to a professional",' +
    '"youtube_searches":["3-4 search terms tuned to THIS exact vehicle and repair"]}\n\n' +
    "Be SPECIFIC to this exact vehicle — real torque values, real part numbers where you know them, real failure points. " +
    "Avoid generic advice. Respond with ONLY the JSON object — no markdown, no preamble."
  );
}

const strArr = { type: "array", items: { type: "string" } };

// Tool-use schema: forcing this tool guarantees structured, valid JSON instead
// of brace-scraping free text, and makes diagnosis_slug + severity first-class
// required fields (deterministic scoring per benchmarks/SPEC.md section 2).
export const GUIDE_TOOL = {
  name: "emit_repair_guide",
  description: "Return the complete vehicle-specific repair guide as structured data.",
  input_schema: {
    type: "object",
    properties: {
      overview: { type: "string" },
      repair_target: { type: "string", description: "single most likely specific part/repair, short searchable terms" },
      diagnosis_slug: { type: "string", enum: DIAGNOSIS_SLUGS, description: "the SINGLE best-matching root-cause slug from the controlled list. Match the vehicle's powertrain: use ev_* slugs (e.g. ev_battery_pack) for a fully electric vehicle and hybrid_* slugs for a hybrid — never use a hybrid_* slug for an EV or vice versa. Use no_fault_found if nothing is wrong, needs_further_diagnosis if genuinely indeterminate." },
      severity: { type: "string", enum: SEVERITY_LEVELS, description: "info=no urgency, moderate=fix soon, urgent=fix now, do_not_drive=unsafe to drive" },
      difficulty: { type: "string", enum: ["Beginner", "Intermediate", "Advanced"] },
      time: { type: "string" },
      difficulty_reason: { type: "string" },
      diagnosis: strArr,
      cost: {
        type: "object",
        properties: {
          diy_parts: { type: "string" }, tools: { type: "string" }, total_diy: { type: "string" },
          shop_labor: { type: "string" }, total_shop: { type: "string" }, savings: { type: "string" },
        },
      },
      tools: strArr,
      parts: strArr,
      steps: strArr,
      removal_steps: strArr,
      installation_steps: strArr,
      mistakes: strArr,
      safety: strArr,
      tips: strArr,
      when_to_stop: { type: "string" },
      youtube_searches: strArr,
    },
    required: ["overview", "repair_target", "diagnosis_slug", "severity", "difficulty", "cost", "safety"],
  },
};

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
