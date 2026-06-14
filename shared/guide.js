// Canonical repair-guide prompt + diagnosis schema.
// Single source of truth shared by the server edge function (api/generate.js),
// the benchmark harness (benchmarks/pipeline.mjs), and the client (src/App.jsx).
// Pure and browser-safe: no process.env, no node/edge built-ins.

export const MAX_INPUT = {
  year: 4, make: 30, model: 60, trim: 60, problem: 500, stateCode: 2, lang: 2,
};

export function sanitize(value, maxLen) {
  if (typeof value !== "string") value = String(value || "");
  // Strip non-ASCII, control characters, and excessive whitespace
  return value
    .replace(/[‐-―]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^\x20-\x7E\n]/g, "")
    .slice(0, maxLen);
}

// State labor rate lookup
export const LABOR = {
  Northeast: { lo: 120, hi: 180, codes: ["NY","NJ","CT","MA","RI","NH","VT","ME","PA","DE","MD","DC"] },
  WestCoast: { lo: 130, hi: 190, codes: ["CA","OR","WA"] },
  Midwest: { lo: 90, hi: 130, codes: ["IL","IN","OH","MI","WI","MN","IA","MO","KS","NE","ND","SD"] },
  South: { lo: 85, hi: 125, codes: ["FL","GA","NC","SC","VA","WV","KY","TN","AL","MS","LA","AR"] },
  Mountain: { lo: 95, hi: 145, codes: ["CO","UT","WY","MT","ID","NV"] },
  Southwest: { lo: 90, hi: 135, codes: ["TX","OK","NM","AZ"] },
  AlaskaHawaii: { lo: 140, hi: 200, codes: ["AK","HI"] },
};
export const STATE_NAMES = {
  AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",CO:"Colorado",CT:"Connecticut",DE:"Delaware",FL:"Florida",GA:"Georgia",HI:"Hawaii",ID:"Idaho",IL:"Illinois",IN:"Indiana",IA:"Iowa",KS:"Kansas",KY:"Kentucky",LA:"Louisiana",ME:"Maine",MD:"Maryland",MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",MS:"Mississippi",MO:"Missouri",MT:"Montana",NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",NJ:"New Jersey",NM:"New Mexico",NY:"New York",NC:"North Carolina",ND:"North Dakota",OH:"Ohio",OK:"Oklahoma",OR:"Oregon",PA:"Pennsylvania",RI:"Rhode Island",SC:"South Carolina",SD:"South Dakota",TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",VA:"Virginia",WA:"Washington",WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming",DC:"District of Columbia",
};

export function getLaborRate(stateCode) {
  const code = sanitize(stateCode, 2).toUpperCase();
  if (!code) return null;
  for (const region of Object.values(LABOR)) {
    if (region.codes.includes(code)) return region;
  }
  return null;
}

export const SEVERITY_LEVELS = ["info", "moderate", "urgent", "do_not_drive"];

// Controlled diagnosis vocabulary. MUST stay in sync with
// benchmarks/schema/diagnosis_taxonomy.json (guarded by a unit test).
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
  "transmission_range_switch",
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

// ── Phase 1: master-mechanic DIFFERENTIAL (additive — the champion's GUIDE_TOOL
// and buildPrompt above are untouched, so the Fast Path baseline stays frozen).
// The full-team diagnostician (api/diagnose.js, Opus) uses these.
const DIFFERENTIAL_ITEM = {
  type: "object",
  properties: {
    cause: { type: "string", description: "the failing component/condition, e.g. 'warped front brake rotors'" },
    diagnosis_slug: { type: "string", enum: DIAGNOSIS_SLUGS },
    likelihood: { type: "string", enum: ["most_likely", "likely", "possible", "less_likely", "rule_out"] },
    reasoning: { type: "string", description: "the causal mechanism — why this cause produces THESE reported symptoms" },
    supporting: { type: "string", description: "reported symptoms/conditions that point TO this cause" },
    contradicting: { type: "string", description: "what the user reported that argues AGAINST it, or 'none reported'" },
    discriminator: { type: "string", description: "the single fact or cheapest test that separates this from its nearest competitor" },
    confirmation_test: { type: "string", description: "the cheapest check to rule it in or out before buying parts" },
    severity: { type: "string", enum: SEVERITY_LEVELS },
    cost_range_usd: { type: "string", description: "rough range, e.g. '$200-$500'" },
  },
  required: ["cause", "diagnosis_slug", "likelihood", "reasoning", "supporting", "contradicting", "discriminator", "severity"],
};

// Same tool NAME as GUIDE_TOOL so parseGuide() works unchanged; superset schema
// adding the ranked differential. Used only by the Opus full-team path.
export const DIAGNOSTICIAN_TOOL = {
  name: GUIDE_TOOL.name,
  description: "Return a master-mechanic ranked differential diagnosis plus the full repair guide for the most-likely cause.",
  input_schema: {
    type: "object",
    properties: {
      differential: {
        type: "array",
        description: "3-6 candidate causes ranked most-likely first. The TOP entry must be the same cause as repair_target/diagnosis_slug/severity below.",
        items: DIFFERENTIAL_ITEM,
      },
      ...GUIDE_TOOL.input_schema.properties,
    },
    required: [...GUIDE_TOOL.input_schema.required, "differential"],
  },
};

// Extends the frozen buildPrompt with the differential instruction. Reuses the
// single source of truth rather than duplicating it.
export function buildDiagnosticianPrompt(input) {
  return buildPrompt(input) +
    "\n\nDIAGNOSE LIKE A MASTER TECHNICIAN. Before committing to a single repair_target, reason through a ranked DIFFERENTIAL of 3-6 candidate causes and return it in the \"differential\" field, most-likely first. For EACH candidate give: the causal mechanism (why it produces THESE specific symptoms), the reported evidence that supports it, what argues AGAINST it (or 'none reported'), the single discriminator that separates it from its nearest competitor, the cheapest confirmation test to run before buying parts, its severity, and a rough cost range. " +
    "The TOP differential entry MUST be the same cause as repair_target/diagnosis_slug, and the guide's diagnosis/steps/cost/severity must reflect that top cause. " +
    "Calibrate likelihood honestly — if the evidence is thin, say 'possible', not 'most_likely'. Do not fabricate precision.";
}
