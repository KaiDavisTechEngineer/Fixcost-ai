import { useState, useEffect, useRef, createContext, useContext } from "react";

const LangCtx = createContext("en");
const useLang = () => useContext(LangCtx);

const S = {
  en: {
    nav_diagnose:"Diagnose",nav_garage:"My Garage",nav_history:"History",nav_settings:"Settings",nav_about:"About",nav_back:"← Home",launch:"Launch App →",lnk_feat:"Features",lnk_how:"How It Works",lnk_faq:"FAQ",
    hero_tag:"AI-Powered Car Repair",hero_h1:"Know the fix.",hero_h1b:"Know the cost.",hero_h1c:"DIY with confidence.",
    hero_desc:"Enter your vehicle and problem — get a complete AI repair guide, regional cost estimate, tools, parts, difficulty rating, and YouTube videos. Free, instant, no account needed.",
    hero_cta:"Get Started — Free →",hero_no_acct:"No account required",hero_quick:"Quick Diagnosis",hero_go:"Generate My Repair Guide →",hero_or:"Or",hero_browse:"browse the full app →",
    stat_makes:"Vehicle makes",stat_rates:"State labor rates",stat_free:"Free forever",stat_secs:"Guide sections",
    how_tag:"How It Works",how_h:"From problem to action in under a minute.",
    s1t:"Enter your vehicle",s1d:"Select year, make, model, and state. Describe the problem or pick from 16 common issues.",
    s2t:"AI builds your guide",s2d:"A vehicle-specific guide with cost, steps, tools, parts, difficulty, and safety warnings — in seconds.",
    s3t:"Act on it",s3d:"Shop for parts, watch YouTube tutorials, save to history, or export the guide.",
    feat_tag:"Everything Included",feat_h:"One tool.",feat_hb:"Every repair answer.",
    f1t:"AI Repair Guide",f1d:"Torque specs, exact steps, real mechanic knowledge — specific to your vehicle.",
    f2t:"Regional Cost",f2d:"DIY vs shop cost adjusted to your state's actual labor rate.",
    f3t:"Difficulty Rating",f3d:"Beginner, Intermediate, or Advanced with honest reasoning.",
    f4t:"Tools & Parts",f4d:"Exact socket sizes, torque specs, OEM vs aftermarket notes.",
    f5t:"Parts Store Links",f5d:"One-click search: AutoZone, RockAuto, O'Reilly, NAPA, Amazon.",
    f6t:"YouTube Videos",f6d:"Real thumbnails with API key, or auto search links.",
    f7t:"Garage",f7d:"Save vehicles. Tap any to pre-fill the diagnose form.",
    f8t:"History",f8d:"Every saved guide stays searchable and re-readable.",
    faq_tag:"FAQ",
    faq_1q:"Is it free?",faq_1a:"Yes — completely free. No account, no credit card, no limits. Add a free YouTube API key in Settings for real video thumbnails.",
    faq_2q:"How accurate are cost estimates?",faq_2a:"Based on typical parts prices and your state's regional mechanic labor rates. Expect ±20% — prices vary by shop and location.",
    faq_3q:"Does it work for my car?",faq_3a:"If it's a major make from 1990–2025, yes. Ford, Toyota, Honda, Chevy, BMW, Mercedes, and 20+ more brands.",
    faq_4q:"Can I save guides?",faq_4a:"Yes. Click 'Save to History' after generating — guides are stored locally, searchable, and re-readable anytime.",
    cta_h:"Stop guessing.",cta_hb:"Start fixing.",cta_desc:"Free, instant, vehicle-specific repair guidance. No account. No credit card. No limits.",cta_btn:"Generate Your First Guide — Free →",
    foot_desc:"AI car repair guidance. Know the fix, know the cost.",foot_legal:"AI-generated guidance for informational purposes only. Verify with official service manuals.",foot_copy:"© 2025 FixCost AI",
    form_title:"Vehicle Details",f_year:"Year",f_make:"Make",f_model:"Model",f_model_select:"Select model…",f_model_other:"Other (type custom)…",f_trim:"Trim / Engine (optional)",f_trim_ph:"e.g. SEL 2.0L Hybrid, EX 1.5L Turbo, Sport V6",f_trim_select:"Select trim / engine…",f_trim_other:"Other (type custom)…",f_state:"Your State (optional)",f_problem:"Problem / Repair",
    shop_item:"Shop",
    f_ph:"e.g. Clunking noise going over bumps, lower control arm replacement, AC not cold…",f_common:"Common issues",f_hide:"Hide",sym_btn:"Common symptoms",
    btn_gen:"Generate Repair Guide →",btn_analyzing:"Analyzing…",btn_new:"↺ New Search",btn_print:"🖨️ Print",btn_export:"⬇ Export",
    btn_save:"Save to History",btn_saved:"✓ Saved",btn_retry:"Try Again",shop_rate:"estimated shop rate",
    warn_near:"{n} guides remaining this session.",warn_limit:"Session limit reached. Refresh to continue.",
    guide_lbl:"Repair Guide",disc_h:"Disclaimer:",disc:"AI-generated for informational purposes only. Verify torque specs with your vehicle's official service manual.",
    dv_difficulty:"Difficulty",dv_cost:"DIY vs Shop",dv_beg:"Beginner",dv_int:"Intermediate",dv_adv:"Advanced",dv_save:"You save",dv_doing_self:"doing it yourself",dv_savings:"DIY Savings",dv_vs_shop:"vs. paying a shop",dv_time:"Time to Complete",dv_hands_on:"hands-on estimate",
    inc_lbl:"Included in every guide",inc_1:"Step-by-step guide",inc_2:"Regional cost estimate",inc_3:"Difficulty rating",inc_4:"Tools & parts",inc_5:"Parts store links",inc_6:"Safety warnings",inc_7:"YouTube videos",
    wait:"Wait",ls1:"Analyzing your vehicle…",ls2:"Identifying root causes…",ls3:"Building repair guide…",ls4:"Calculating cost estimates…",ls5:"Checking tools & parts…",ls_step:"STEP",ls_of:"OF",
    ci1:"Clunking noise when going over bumps",ci2:"Car pulls to one side",ci3:"Squeaking / grinding brakes",ci4:"Check engine light on",
    ci5:"Hard to start / starter not engaging",ci6:"Vibration at highway speeds",ci7:"Steering wheel shakes when braking",ci8:"Power steering whining or stiff",
    ci9:"Transmission slipping / rough shifts",ci10:"AC not blowing cold",ci11:"Oil leak under the car",ci12:"Coolant leak / overheating",
    ci13:"Battery keeps dying",ci14:"CV axle clicking when turning",ci15:"Rough idle / misfiring",ci16:"Suspension bottoming out",
    parts_t:"Shop for Parts",parts_tab:"Opens in new tab",parts_for:"Search for:",yt_v:"YouTube Videos",yt_t:"YouTube Search Terms",
    yt_click:"CLICK TO SEARCH ON YOUTUBE",yt_loading:"Fetching videos…",yt_tip:"Add a YouTube API key in Settings for real video thumbnails.",yt_none:"Couldn't load videos — search manually:",
    copy_lbl:"Copy",copied_lbl:"Copied!",
    g_title:"My Garage",g_sub:"Save your vehicles for quick access.",g_add:"+ Add Vehicle",g_cancel:"Cancel",
    g_empty_h:"No vehicles yet",g_empty_p:"Add your vehicles for one-tap access.",g_add_first:"+ Add Your First Vehicle",g_new:"New Vehicle",
    g_nick:"Nickname (optional)",g_mile:"Mileage (optional)",g_cta:"DIAGNOSE →",g_add_btn:"Add to Garage →",g_rem_title:"Remove Vehicle?",g_rem_msg:"Remove this vehicle from your garage?",
    g_maint:"Maintenance suggestions",g_maint_note:"General mileage-based guidance — always confirm intervals with your vehicle's maintenance schedule.",
    h_title:"Repair History",h_sub:"Your saved repair guides.",h_slbl:"Search",h_search:"Search by vehicle, make, or problem…",
    h_sortlbl:"Sort by",h_date:"Date (newest first)",h_diff:"Difficulty (hardest first)",h_veh:"Vehicle (A–Z)",
    h_empty_h:"No saved guides yet",h_empty_p:"Generate a guide and click 'Save to History'.",h_nores:"No results",h_try:"Try a different search.",h_total:"Total saved",
    h_del_title:"Delete Guide?",h_del_msg:"This guide will be permanently deleted.",
    st_title:"Settings",st_sub:"Configure your FixCost AI experience.",
    st_lang_h:"🌐 Language / Idioma",st_lang_d:"Choose your preferred language for the interface and AI repair guides.",
    st_yt_h:"🎥 YouTube API Key",st_yt_d:"Enables real video thumbnails in repair guides.",st_active:"Active",st_not_set:"Not set",
    st_yt_hint:"Get a free key at console.cloud.google.com → Enable YouTube Data API v3 → Create credentials → API key. Free tier: 10,000 units/day.",
    st_yt_priv:"🔒 Your key is stored only on this device, never sent anywhere except Google's YouTube API.",
    st_state_h:"📍 Default State",st_state_d:"Pre-fills your state for regional labor rate estimates.",st_no_default:"No default",st_save:"Save Settings",st_saved:"✓ Saved!",st_clear_key:"Clear Key",
    st_data_h:"🗑️ Clear All Data",st_data_d:"Permanently delete all saved vehicles, history, and settings.",st_data_btn:"Clear All Data",
    st_clear_title:"Clear All Data?",st_clear_msg:"This will permanently delete all your saved vehicles, history, and settings.",st_clear_confirm:"Yes, Clear Everything",
    key_show:"Show key",key_hide:"Hide key",yt_key_err:"Invalid format. YouTube keys start with 'AIza' + 35 characters.",
    ab_tag:"About FixCost AI",ab_h:"One app.",ab_hb:"Every repair answer.",
    ab_desc:"Built because getting car repair info means juggling YouTube, Reddit, parts sites, and forums. This fixes that.",
    ab_vehicles:"Supported Vehicles",ab_disc_h:"⚠️ Disclaimer",ab_disc:"FixCost AI provides AI-generated guidance for informational purposes only. Always verify torque specs with your vehicle's official service manual.",
    v_year:"Select a year",v_make:"Select a make",v_model_req:"Enter the model name",v_model_long:"Max 60 characters",
    v_prob_req:"Describe the problem",v_prob_short:"Be more specific (at least 6 chars)",v_prob_long:"Max 500 characters",
    e_rate:"Rate limit reached. Wait a moment and try again.",e_auth:"Authentication error. Check your API settings.",
    e_net:"Network error. Check your connection.",e_timeout:"Request timed out. Try again.",e_session:"Session limit reached. Refresh the page.",e_default:"Something went wrong. Please try again.",
    t_added:"added",t_removed:"Vehicle removed",t_gsaved:"Guide saved to history",t_gdel:"Guide deleted",t_settings:"Settings saved",t_cleared:"All data cleared",
    mc:"Cancel",diff_beg:"Suitable for most DIYers",diff_int:"Some experience recommended",diff_adv:"Experienced mechanics only",lang_en:"EN",lang_es:"ES",loading:"Loading…",
  },
  es: {
    nav_diagnose:"Diagnosticar",nav_garage:"Mi Garaje",nav_history:"Historial",nav_settings:"Ajustes",nav_about:"Acerca de",nav_back:"← Inicio",launch:"Abrir App →",lnk_feat:"Funciones",lnk_how:"Cómo Funciona",lnk_faq:"Preguntas",
    hero_tag:"Reparación de Autos con IA",hero_h1:"Conoce la solución.",hero_h1b:"Conoce el costo.",hero_h1c:"Repara con confianza.",
    hero_desc:"Ingresa tu vehículo y problema — obtén una guía completa de reparación con IA, estimación de costo regional, herramientas, piezas, dificultad y videos de YouTube. Gratis, instantáneo, sin cuenta.",
    hero_cta:"Comenzar — Gratis →",hero_no_acct:"Sin cuenta requerida",hero_quick:"Diagnóstico Rápido",hero_go:"Generar Mi Guía de Reparación →",hero_or:"O",hero_browse:"explorar la app completa →",
    stat_makes:"Marcas de vehículos",stat_rates:"Tarifas por estado",stat_free:"Siempre gratis",stat_secs:"Secciones de guía",
    how_tag:"Cómo Funciona",how_h:"Del problema a la acción en menos de un minuto.",
    s1t:"Ingresa tu vehículo",s1d:"Selecciona año, marca, modelo y estado. Describe el problema o elige de 16 problemas comunes.",
    s2t:"La IA construye tu guía",s2d:"Una guía específica del vehículo con costo, pasos, herramientas, piezas, dificultad y advertencias — en segundos.",
    s3t:"Actúa sobre ella",s3d:"Compra repuestos, mira tutoriales en YouTube, guarda en el historial o exporta la guía.",
    feat_tag:"Todo Incluido",feat_h:"Una herramienta.",feat_hb:"Cada respuesta de reparación.",
    f1t:"Guía de Reparación con IA",f1d:"Especificaciones de torque, pasos exactos, conocimiento real de mecánico — específico para tu vehículo.",
    f2t:"Costo Regional",f2d:"Costo DIY vs taller ajustado a la tarifa laboral real de tu estado.",
    f3t:"Calificación de Dificultad",f3d:"Principiante, Intermedio o Avanzado con razonamiento honesto.",
    f4t:"Herramientas y Piezas",f4d:"Tamaños exactos de llaves, especificaciones de torque, notas OEM vs aftermarket.",
    f5t:"Links de Tiendas",f5d:"Búsqueda en un clic: AutoZone, RockAuto, O'Reilly, NAPA, Amazon.",
    f6t:"Videos de YouTube",f6d:"Miniaturas reales con clave API, o enlaces de búsqueda automáticos.",
    f7t:"Garaje",f7d:"Guarda vehículos. Toca cualquiera para pre-rellenar el formulario.",
    f8t:"Historial",f8d:"Cada guía guardada es buscable y relegible.",
    faq_tag:"Preguntas Frecuentes",
    faq_1q:"¿Es gratis?",faq_1a:"Sí — completamente gratis. Sin cuenta, sin tarjeta de crédito, sin límites. Agrega una clave API de YouTube gratuita en Ajustes para miniaturas reales.",
    faq_2q:"¿Qué tan precisas son las estimaciones?",faq_2a:"Basadas en precios típicos de repuestos y tarifas regionales de mecánicos. Espera ±20% — los precios varían por taller y ubicación.",
    faq_3q:"¿Funciona para mi auto?",faq_3a:"Si es una marca importante de 1990–2025, sí. Ford, Toyota, Honda, Chevy, BMW, Mercedes y más de 20 marcas.",
    faq_4q:"¿Puedo guardar las guías?",faq_4a:"Sí. Haz clic en 'Guardar en Historial' después de generar — las guías se almacenan localmente, son buscables y relectibles.",
    cta_h:"Deja de adivinar.",cta_hb:"Empieza a reparar.",cta_desc:"Guía de reparación gratuita, instantánea y específica para tu vehículo. Sin cuenta. Sin tarjeta de crédito. Sin límites.",cta_btn:"Genera Tu Primera Guía — Gratis →",
    foot_desc:"Guía de reparación de autos con IA. Conoce la solución, conoce el costo.",foot_legal:"Orientación generada por IA con fines informativos. Verifica con los manuales oficiales de servicio.",foot_copy:"© 2025 FixCost AI",
    form_title:"Detalles del Vehículo",f_year:"Año",f_make:"Marca",f_model:"Modelo",f_model_select:"Selecciona modelo…",f_model_other:"Otro (escribir personalizado)…",f_trim:"Versión / Motor (opcional)",f_trim_ph:"ej. SEL 2.0L Híbrido, EX 1.5L Turbo, Sport V6",f_trim_select:"Selecciona versión / motor…",f_trim_other:"Otra (escribir personalizada)…",f_state:"Tu Estado (opcional)",f_problem:"Problema / Reparación",
    shop_item:"Comprar",
    f_ph:"ej. Ruido al pasar por baches, reemplazo de brazos de control, A/C no enfría…",f_common:"Problemas comunes",f_hide:"Ocultar",sym_btn:"Síntomas comunes",
    btn_gen:"Generar Guía de Reparación →",btn_analyzing:"Analizando…",btn_new:"↺ Nueva Búsqueda",btn_print:"🖨️ Imprimir",btn_export:"⬇ Exportar",
    btn_save:"Guardar en Historial",btn_saved:"✓ Guardado",btn_retry:"Intentar de Nuevo",shop_rate:"tarifa estimada del taller",
    warn_near:"{n} guías restantes en esta sesión.",warn_limit:"Límite de sesión alcanzado. Recarga para continuar.",
    guide_lbl:"Guía de Reparación",disc_h:"Aviso:",disc:"Generado por IA con fines informativos únicamente. Verifica las especificaciones de torque con el manual oficial de tu vehículo.",
    dv_difficulty:"Dificultad",dv_cost:"DIY vs Taller",dv_beg:"Principiante",dv_int:"Intermedio",dv_adv:"Avanzado",dv_save:"Ahorras",dv_doing_self:"haciéndolo tú mismo",dv_savings:"Ahorro DIY",dv_vs_shop:"vs. pagar un taller",dv_time:"Tiempo Estimado",dv_hands_on:"estimado de trabajo",
    inc_lbl:"Incluido en cada guía",inc_1:"Guía paso a paso",inc_2:"Estimación de costo regional",inc_3:"Calificación de dificultad",inc_4:"Herramientas y piezas",inc_5:"Links de tiendas de repuestos",inc_6:"Advertencias de seguridad",inc_7:"Videos de YouTube",
    wait:"Espera",ls1:"Analizando tu vehículo…",ls2:"Identificando causas raíz…",ls3:"Construyendo guía de reparación…",ls4:"Calculando estimaciones de costo…",ls5:"Verificando herramientas y piezas…",ls_step:"PASO",ls_of:"DE",
    ci1:"Ruido de golpeteo al pasar por baches",ci2:"El auto se jala hacia un lado",ci3:"Frenos chirriantes o que raspan",ci4:"Luz de motor encendida",
    ci5:"Difícil de encender / motor de arranque no responde",ci6:"Vibración a velocidades de autopista",ci7:"El volante vibra al frenar",ci8:"Dirección hidráulica ruidosa o dura",
    ci9:"Transmisión patinando / cambios bruscos",ci10:"A/C no enfría",ci11:"Fuga de aceite debajo del auto",ci12:"Fuga de refrigerante / sobrecalentamiento",
    ci13:"La batería sigue descargándose",ci14:"Axle CV hace clic al girar",ci15:"Ralentí irregular / falla de encendido",ci16:"Suspensión golpeando el fondo",
    parts_t:"Comprar Repuestos",parts_tab:"Abre en nueva pestaña",parts_for:"Buscar:",yt_v:"Videos de YouTube",yt_t:"Términos de Búsqueda en YouTube",
    yt_click:"HAZ CLIC PARA BUSCAR EN YOUTUBE",yt_loading:"Cargando videos…",yt_tip:"Agrega una clave API de YouTube en Ajustes para ver miniaturas reales.",yt_none:"No se pudieron cargar videos — busca manualmente:",
    copy_lbl:"Copiar",copied_lbl:"¡Copiado!",
    g_title:"Mi Garaje",g_sub:"Guarda tus vehículos para acceso rápido.",g_add:"+ Agregar Vehículo",g_cancel:"Cancelar",
    g_empty_h:"Sin vehículos aún",g_empty_p:"Agrega tus vehículos para acceso rápido.",g_add_first:"+ Agregar Tu Primer Vehículo",g_new:"Nuevo Vehículo",
    g_nick:"Apodo (opcional)",g_mile:"Kilometraje (opcional)",g_cta:"DIAGNOSTICAR →",g_add_btn:"Agregar al Garaje →",g_rem_title:"¿Eliminar Vehículo?",g_rem_msg:"¿Eliminar este vehículo de tu garaje?",
    g_maint:"Sugerencias de mantenimiento",g_maint_note:"Guía general según el kilometraje — confirma siempre los intervalos con el plan de mantenimiento de tu vehículo.",
    h_title:"Historial de Reparaciones",h_sub:"Tus guías de reparación guardadas.",h_slbl:"Buscar",h_search:"Buscar por vehículo, marca o problema…",
    h_sortlbl:"Ordenar por",h_date:"Fecha (más reciente primero)",h_diff:"Dificultad (más difícil primero)",h_veh:"Vehículo (A–Z)",
    h_empty_h:"Sin guías guardadas aún",h_empty_p:"Genera una guía y haz clic en 'Guardar en Historial'.",h_nores:"Sin resultados",h_try:"Intenta con otro término de búsqueda.",h_total:"Total guardadas",
    h_del_title:"¿Eliminar Guía?",h_del_msg:"Esta guía será eliminada permanentemente.",
    st_title:"Ajustes",st_sub:"Configura tu experiencia con FixCost AI.",
    st_lang_h:"🌐 Language / Idioma",st_lang_d:"Elige tu idioma preferido para la interfaz y las guías de reparación.",
    st_yt_h:"🎥 Clave API de YouTube",st_yt_d:"Habilita miniaturas reales de videos en las guías.",st_active:"Activa",st_not_set:"No configurada",
    st_yt_hint:"Obtén una clave gratuita en console.cloud.google.com → Habilita YouTube Data API v3 → Crea credenciales → Clave API. Nivel gratuito: 10,000 unidades/día.",
    st_yt_priv:"🔒 Tu clave se almacena localmente en este dispositivo, nunca se envía a ningún servidor que no sea la API de YouTube de Google.",
    st_state_h:"📍 Estado Predeterminado",st_state_d:"Rellena automáticamente tu estado para estimaciones regionales.",st_no_default:"Sin predeterminado",st_save:"Guardar Ajustes",st_saved:"✓ ¡Guardado!",st_clear_key:"Borrar Clave",
    st_data_h:"🗑️ Borrar Todos los Datos",st_data_d:"Eliminar permanentemente todos los vehículos, historial y ajustes guardados.",st_data_btn:"Borrar Todos los Datos",
    st_clear_title:"¿Borrar Todos los Datos?",st_clear_msg:"Esto eliminará permanentemente todos tus vehículos, historial y ajustes.",st_clear_confirm:"Sí, Borrar Todo",
    key_show:"Mostrar clave",key_hide:"Ocultar clave",yt_key_err:"Formato inválido. Las claves de YouTube comienzan con 'AIza' + 35 caracteres.",
    ab_tag:"Acerca de FixCost AI",ab_h:"Una app.",ab_hb:"Cada respuesta de reparación.",
    ab_desc:"Creada porque obtener información de reparación significa buscar en YouTube, Reddit y sitios de repuestos. Esto lo soluciona.",
    ab_vehicles:"Vehículos Soportados",ab_disc_h:"⚠️ Aviso Legal",ab_disc:"FixCost AI proporciona orientación generada por IA únicamente con fines informativos. Siempre verifica las especificaciones de torque con el manual oficial de servicio de tu vehículo.",
    v_year:"Selecciona un año",v_make:"Selecciona una marca",v_model_req:"Ingresa el nombre del modelo",v_model_long:"Máximo 60 caracteres",
    v_prob_req:"Describe el problema",v_prob_short:"Sé más específico (al menos 6 caracteres)",v_prob_long:"Máximo 500 caracteres",
    e_rate:"Límite de velocidad alcanzado. Espera un momento e intenta de nuevo.",e_auth:"Error de autenticación. Verifica tu configuración de API.",
    e_net:"Error de red. Verifica tu conexión.",e_timeout:"La solicitud expiró. Intenta de nuevo.",e_session:"Límite de sesión alcanzado. Recarga la página.",e_default:"Algo salió mal. Por favor intenta de nuevo.",
    t_added:"agregado",t_removed:"Vehículo eliminado",t_gsaved:"Guía guardada en el historial",t_gdel:"Guía eliminada",t_settings:"Ajustes guardados",t_cleared:"Todos los datos eliminados",
    mc:"Cancelar",diff_beg:"Adecuado para la mayoría de los aficionados",diff_int:"Se recomienda algo de experiencia",diff_adv:"Solo para mecánicos experimentados",lang_en:"EN",lang_es:"ES",loading:"Cargando…",
  },
};

const MAKES = ["Ford","Toyota","Honda","Nissan","Chevy","Hyundai","Kia","BMW","Mercedes","Infiniti","Subaru","Mazda","Jeep","Dodge","Ram","GMC","Volkswagen","Audi","Lexus","Acura","Chrysler","Buick","Cadillac","Other"];
const YEARS = Array.from({length:35},(_,i)=>2025-i);
const VALID_YEARS = new Set(YEARS.map(String));
const VALID_STATES = new Set(["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"]);
const US_STATES = [
  {code:"AL",name:"Alabama",r:"South"},{code:"AK",name:"Alaska",r:"West Coast"},{code:"AZ",name:"Arizona",r:"Southwest"},{code:"AR",name:"Arkansas",r:"South"},{code:"CA",name:"California",r:"West Coast"},{code:"CO",name:"Colorado",r:"Mountain West"},{code:"CT",name:"Connecticut",r:"Northeast"},{code:"DE",name:"Delaware",r:"Northeast"},{code:"FL",name:"Florida",r:"South"},{code:"GA",name:"Georgia",r:"South"},{code:"HI",name:"Hawaii",r:"West Coast"},{code:"ID",name:"Idaho",r:"Mountain West"},{code:"IL",name:"Illinois",r:"Midwest"},{code:"IN",name:"Indiana",r:"Midwest"},{code:"IA",name:"Iowa",r:"Midwest"},{code:"KS",name:"Kansas",r:"Midwest"},{code:"KY",name:"Kentucky",r:"South"},{code:"LA",name:"Louisiana",r:"South"},{code:"ME",name:"Maine",r:"Northeast"},{code:"MD",name:"Maryland",r:"Northeast"},{code:"MA",name:"Massachusetts",r:"Northeast"},{code:"MI",name:"Michigan",r:"Midwest"},{code:"MN",name:"Minnesota",r:"Midwest"},{code:"MS",name:"Mississippi",r:"South"},{code:"MO",name:"Missouri",r:"Midwest"},{code:"MT",name:"Montana",r:"Mountain West"},{code:"NE",name:"Nebraska",r:"Midwest"},{code:"NV",name:"Nevada",r:"Mountain West"},{code:"NH",name:"New Hampshire",r:"Northeast"},{code:"NJ",name:"New Jersey",r:"Northeast"},{code:"NM",name:"New Mexico",r:"Southwest"},{code:"NY",name:"New York",r:"Northeast"},{code:"NC",name:"North Carolina",r:"South"},{code:"ND",name:"North Dakota",r:"Midwest"},{code:"OH",name:"Ohio",r:"Midwest"},{code:"OK",name:"Oklahoma",r:"South"},{code:"OR",name:"Oregon",r:"West Coast"},{code:"PA",name:"Pennsylvania",r:"Northeast"},{code:"RI",name:"Rhode Island",r:"Northeast"},{code:"SC",name:"South Carolina",r:"South"},{code:"SD",name:"South Dakota",r:"Midwest"},{code:"TN",name:"Tennessee",r:"South"},{code:"TX",name:"Texas",r:"South"},{code:"UT",name:"Utah",r:"Mountain West"},{code:"VT",name:"Vermont",r:"Northeast"},{code:"VA",name:"Virginia",r:"South"},{code:"WA",name:"Washington",r:"West Coast"},{code:"WV",name:"West Virginia",r:"South"},{code:"WI",name:"Wisconsin",r:"Midwest"},{code:"WY",name:"Wyoming",r:"Mountain West"},
];
const LABOR = {"Northeast":{lo:120,hi:180},"West Coast":{lo:130,hi:190},"Midwest":{lo:90,hi:130},"South":{lo:85,hi:125},"Mountain West":{lo:95,hi:145},"Southwest":{lo:90,hi:135}};
const COMMON_MODELS = {
  Ford:["F-150","F-250","F-350","Mustang","Explorer","Escape","Focus","Fusion","Edge","Ranger","Bronco","Bronco Sport","C-Max","Expedition","Taurus","Maverick","EcoSport","Transit","Flex"],
  Toyota:["Camry","Corolla","RAV4","Tacoma","Highlander","Prius","Tundra","4Runner","Sienna","Avalon","C-HR","Venza","Sequoia","Yaris","Land Cruiser","GR86","GR Supra","Crown","Mirai"],
  Honda:["Civic","Accord","CR-V","Pilot","Odyssey","HR-V","Ridgeline","Passport","Fit","Insight","CR-Z","Crosstour","Element","Prologue"],
  Nissan:["Altima","Maxima","Sentra","Rogue","Pathfinder","Frontier","Titan","Murano","Versa","Kicks","Armada","Leaf","370Z","350Z","GT-R","Juke","Xterra","Cube","Z","Ariya"],
  Chevy:["Silverado","Malibu","Equinox","Traverse","Tahoe","Suburban","Colorado","Camaro","Corvette","Bolt","Bolt EUV","Trax","Trailblazer","Blazer","Cruze","Impala","Sonic","Spark","Volt","Express"],
  Hyundai:["Elantra","Sonata","Tucson","Santa Fe","Palisade","Kona","Accent","Veloster","Ioniq","Ioniq 5","Ioniq 6","Venue","Nexo","Santa Cruz"],
  Kia:["Optima","Forte","Sportage","Sorento","Telluride","Soul","Stinger","Rio","K5","Niro","Carnival","Sedona","EV6","Seltos","K900"],
  BMW:["2 Series","3 Series","4 Series","5 Series","6 Series","7 Series","8 Series","X1","X2","X3","X4","X5","X6","X7","Z4","M2","M3","M4","M5","M8","i3","i4","iX","i7"],
  Mercedes:["A-Class","C-Class","E-Class","S-Class","CLA","CLS","GLA","GLB","GLC","GLE","GLS","G-Class","AMG GT","EQS","EQE","SL","SLC","Maybach"],
  Infiniti:["Q50","Q60","Q70","QX50","QX55","QX60","QX80","FX","EX","G37","M37"],
  Subaru:["Outback","Forester","Impreza","Legacy","WRX","Crosstrek","Ascent","BRZ","Solterra","Tribeca"],
  Mazda:["Mazda3","Mazda6","CX-3","CX-30","CX-5","CX-9","CX-50","CX-70","CX-90","MX-5 Miata","RX-8"],
  Jeep:["Wrangler","Grand Cherokee","Cherokee","Compass","Renegade","Gladiator","Wagoneer","Grand Wagoneer","Patriot","Liberty"],
  Dodge:["Challenger","Charger","Durango","Journey","Grand Caravan","Dart","Avenger","Hornet","Magnum","Nitro"],
  Ram:["1500","2500","3500","ProMaster","ProMaster City","Dakota"],
  GMC:["Sierra","Sierra 1500","Sierra 2500","Yukon","Yukon XL","Acadia","Terrain","Canyon","Hummer EV","Hummer EV SUV","Savana"],
  Volkswagen:["Jetta","Passat","Tiguan","Atlas","Atlas Cross Sport","Golf","GTI","Golf R","ID.4","Taos","Arteon","Beetle","CC","Touareg"],
  Audi:["A3","A4","A5","A6","A7","A8","S3","S4","S5","RS5","RS6","RS7","Q3","Q4 e-tron","Q5","Q7","Q8","R8","e-tron GT","TT"],
  Lexus:["ES","IS","GS","LS","RX","NX","GX","LX","RC","LC","UX","RZ","CT","HS","SC"],
  Acura:["TLX","MDX","RDX","ILX","NSX","Integra","TSX","TL","RL","RLX","ZDX"],
  Chrysler:["300","Pacifica","Voyager","200","Town & Country","Sebring","Aspen"],
  Buick:["Encore","Encore GX","Enclave","Envision","Regal","LaCrosse","Verano","Lucerne","Cascada"],
  Cadillac:["CT4","CT5","CT6","XT4","XT5","XT6","Escalade","Escalade ESV","ATS","CTS","SRX","STS","DTS","Lyriq","Celestiq"],
};
// Trim/engine options per "Make|Model" — used for the trim dropdown
const TRIMS = {
  "Ford|F-150":["XL 3.3L V6","XLT 2.7L EcoBoost V6","Lariat 5.0L V8","King Ranch 5.0L V8","Platinum 3.5L EcoBoost V6","Limited 3.5L EcoBoost V6","Raptor 3.5L EcoBoost V6","Lightning Electric"],
  "Ford|Mustang":["EcoBoost 2.3L Turbo Coupe","EcoBoost Premium 2.3L Turbo Convertible","V6 3.7L Coupe (pre-2017)","GT 5.0L V8 Coupe","GT Premium 5.0L V8 Convertible","Mach 1 5.0L V8 Coupe","Shelby GT350 5.2L V8 Coupe","Shelby GT500 5.2L V8 Supercharged"],
  "Ford|Explorer":["Base 2.3L EcoBoost","XLT 2.3L EcoBoost","Limited 2.3L EcoBoost","ST 3.0L EcoBoost V6","Platinum 3.0L EcoBoost V6","Hybrid 3.3L V6","King Ranch 3.0L EcoBoost V6"],
  "Ford|Escape":["S 1.5L EcoBoost","SE 1.5L EcoBoost","SEL 2.0L EcoBoost","Titanium 2.0L EcoBoost","Hybrid SE 2.5L","Hybrid Titanium 2.5L","Plug-in Hybrid 2.5L PHEV","ST-Line 2.0L EcoBoost"],
  "Ford|Focus":["S 2.0L Sedan","SE 2.0L Sedan","SE 2.0L Hatchback","SEL 2.0L Sedan","Titanium 2.0L Hatchback","ST 2.0L Turbo Hatchback","RS 2.3L Turbo AWD Hatchback","Electric Hatchback"],
  "Ford|Fusion":["S 2.5L Sedan","SE 1.5L EcoBoost","SE 2.0L EcoBoost","SEL 1.5L EcoBoost","Titanium 2.0L EcoBoost AWD","Sport 2.7L EcoBoost V6 AWD","Hybrid SE 2.0L","Hybrid Titanium 2.0L","Energi PHEV 2.0L"],
  "Ford|Edge":["SE 2.0L EcoBoost","SEL 2.0L EcoBoost","Titanium 2.0L EcoBoost","ST 2.7L EcoBoost V6","Sport 2.7L EcoBoost V6 (pre-2019)"],
  "Ford|Ranger":["XL 2.3L EcoBoost","XLT 2.3L EcoBoost","Lariat 2.3L EcoBoost","Tremor 2.3L EcoBoost","Raptor 3.0L EcoBoost V6"],
  "Ford|Bronco":["Base 2.3L EcoBoost","Big Bend 2.3L EcoBoost","Black Diamond 2.7L EcoBoost V6","Outer Banks 2.7L EcoBoost V6","Wildtrak 2.7L EcoBoost V6","Badlands 2.7L EcoBoost V6","Everglades 2.3L EcoBoost","Raptor 3.0L EcoBoost V6"],
  "Ford|C-Max":["SE 2.0L Hybrid","SEL 2.0L Hybrid","Energi SE 2.0L Plug-in Hybrid","Energi SEL 2.0L Plug-in Hybrid","Titanium 2.0L Hybrid"],
  "Toyota|Camry":["LE 2.5L 4cyl Sedan","SE 2.5L 4cyl Sedan","XLE 2.5L 4cyl Sedan","XSE 2.5L 4cyl Sedan","XSE V6 3.5L Sedan","TRD 3.5L V6 Sedan","Hybrid LE 2.5L","Hybrid SE 2.5L","Hybrid XLE 2.5L"],
  "Toyota|Corolla":["L 1.8L Sedan","LE 1.8L Sedan","SE 2.0L Sedan","XLE 1.8L Sedan","XSE 2.0L Sedan","Hatchback SE 2.0L","Hatchback XSE 2.0L","Hybrid LE 1.8L","GR Corolla 1.6L Turbo AWD"],
  "Toyota|RAV4":["LE 2.5L 4cyl","XLE 2.5L 4cyl","XLE Premium 2.5L","Adventure 2.5L 4cyl","TRD Off-Road 2.5L 4cyl","Limited 2.5L 4cyl","Hybrid LE 2.5L","Hybrid XLE 2.5L","Hybrid Limited 2.5L","Prime SE 2.5L PHEV","Prime XSE 2.5L PHEV"],
  "Toyota|Tacoma":["SR 2.7L 4cyl","SR5 3.5L V6","TRD Sport 3.5L V6","TRD Off-Road 3.5L V6","Limited 3.5L V6","TRD Pro 3.5L V6","Trailhunter 2.4L Hybrid"],
  "Toyota|Highlander":["L 2.4L Turbo","LE 2.4L Turbo","XLE 2.4L Turbo","Limited 2.4L Turbo","Platinum 2.4L Turbo","Hybrid LE 2.5L","Hybrid XLE 2.5L","Hybrid Limited 2.5L","Hybrid Platinum 2.5L"],
  "Toyota|Prius":["L Eco 1.8L Hybrid","LE 1.8L Hybrid","XLE 2.0L Hybrid","Limited 2.0L Hybrid","Prime SE 2.0L PHEV","Prime XSE 2.0L PHEV"],
  "Toyota|Tundra":["SR 3.5L V6 Twin-Turbo","SR5 3.5L V6 Twin-Turbo","Limited 3.5L V6 Twin-Turbo","Platinum 3.5L V6 Twin-Turbo","1794 Edition 3.5L V6 Twin-Turbo","TRD Pro 3.5L V6 i-FORCE MAX Hybrid","Capstone 3.5L V6 i-FORCE MAX Hybrid"],
  "Toyota|4Runner":["SR5 4.0L V6","SR5 Premium 4.0L V6","TRD Sport 4.0L V6","TRD Off-Road 4.0L V6","TRD Off-Road Premium 4.0L V6","Limited 4.0L V6","TRD Pro 4.0L V6"],
  "Toyota|Sienna":["LE 2.5L Hybrid AWD","XLE 2.5L Hybrid","XSE 2.5L Hybrid","Limited 2.5L Hybrid","Platinum 2.5L Hybrid"],
  "Honda|Civic":["LX 2.0L Sedan","Sport 2.0L Sedan","Sport 2.0L Hatchback","EX 1.5L Turbo Sedan","EX-L 1.5L Turbo Hatchback","Touring 1.5L Turbo Sedan","Sport Touring 1.5L Turbo Hatchback","Si 1.5L Turbo Sedan","Type R 2.0L Turbo Hatchback","Hybrid Sport 2.0L","Hybrid Sport Touring 2.0L"],
  "Honda|Accord":["LX 1.5L Turbo Sedan","Sport 1.5L Turbo Sedan","Sport 2.0L Turbo Sedan (pre-2023)","EX-L 1.5L Turbo","Touring 2.0L Turbo Sedan (pre-2023)","Hybrid Sport 2.0L","Hybrid EX-L 2.0L","Hybrid Touring 2.0L"],
  "Honda|CR-V":["LX 1.5L Turbo","EX 1.5L Turbo","EX-L 1.5L Turbo","Touring 1.5L Turbo","Hybrid Sport 2.0L","Hybrid Sport-L 2.0L","Hybrid Sport Touring 2.0L"],
  "Honda|Pilot":["Sport 3.5L V6","EX-L 3.5L V6","Touring 3.5L V6","TrailSport 3.5L V6","Elite 3.5L V6","Black Edition 3.5L V6"],
  "Honda|Odyssey":["EX 3.5L V6","EX-L 3.5L V6","Sport 3.5L V6","Touring 3.5L V6","Elite 3.5L V6"],
  "Honda|HR-V":["LX 2.0L","Sport 2.0L","EX-L 2.0L"],
  "Honda|Ridgeline":["Sport 3.5L V6","RTL 3.5L V6","RTL-E 3.5L V6","TrailSport 3.5L V6","Black Edition 3.5L V6"],
  "Nissan|Altima":["S 2.5L Sedan","SV 2.5L Sedan","SR 2.5L Sedan","SR VC-Turbo 2.0L Turbo","SL 2.5L Sedan","Platinum 2.5L Sedan"],
  "Nissan|Maxima":["S 3.5L V6","SV 3.5L V6","SL 3.5L V6","SR 3.5L V6","Platinum 3.5L V6"],
  "Nissan|Sentra":["S 2.0L","SV 2.0L","SR 2.0L"],
  "Nissan|Rogue":["S 1.5L VC-Turbo","SV 1.5L VC-Turbo","SL 1.5L VC-Turbo","Platinum 1.5L VC-Turbo"],
  "Nissan|Pathfinder":["S 3.5L V6","SV 3.5L V6","SL 3.5L V6","Platinum 3.5L V6","Rock Creek 3.5L V6"],
  "Nissan|Frontier":["S 3.8L V6","SV 3.8L V6","PRO-X 3.8L V6","PRO-4X 3.8L V6","SL 3.8L V6"],
  "Nissan|Titan":["S 5.6L V8","SV 5.6L V8","Pro-4X 5.6L V8","Platinum Reserve 5.6L V8"],
  "Chevy|Silverado":["WT 2.7L Turbo","Custom 2.7L Turbo","LT 2.7L Turbo / 5.3L V8","RST 5.3L V8","LT Trail Boss 5.3L V8","LTZ 5.3L V8 / 6.2L V8","High Country 6.2L V8","ZR2 6.2L V8","Duramax 3.0L Diesel I6"],
  "Chevy|Malibu":["LS 1.5L Turbo","RS 1.5L Turbo","LT 1.5L Turbo","Premier 2.0L Turbo (pre-2020)"],
  "Chevy|Equinox":["LS 1.5L Turbo","LT 1.5L Turbo","RS 1.5L Turbo","Premier 1.5L Turbo"],
  "Chevy|Traverse":["LS 3.6L V6","LT 3.6L V6","RS 3.6L V6","Z71 3.6L V6","Premier 3.6L V6","High Country 3.6L V6"],
  "Chevy|Tahoe":["LS 5.3L V8","LT 5.3L V8","RST 5.3L V8 / 6.2L V8","Z71 5.3L V8","Premier 5.3L V8 / 6.2L V8","High Country 6.2L V8","Duramax 3.0L Diesel I6"],
  "Chevy|Suburban":["LS 5.3L V8","LT 5.3L V8","RST 5.3L V8 / 6.2L V8","Z71 5.3L V8","Premier 5.3L V8 / 6.2L V8","High Country 6.2L V8","Duramax 3.0L Diesel I6"],
  "Chevy|Colorado":["WT 2.7L Turbo","LT 2.7L Turbo","Trail Boss 2.7L Turbo","Z71 2.7L Turbo","ZR2 2.7L Turbo High Output"],
  "Chevy|Camaro":["1LS 2.0L Turbo Coupe","1LT 2.0L Turbo / 3.6L V6","2LT 3.6L V6 Convertible","1SS 6.2L V8 Coupe","2SS 6.2L V8 Convertible","ZL1 6.2L V8 Supercharged","LT1 6.2L V8"],
  "Hyundai|Elantra":["SE 2.0L Sedan","SEL 2.0L Sedan","Limited 2.0L Sedan","N Line 1.6L Turbo","N 2.0L Turbo","Hybrid Blue 1.6L Hybrid","Hybrid Limited 1.6L Hybrid"],
  "Hyundai|Sonata":["SE 2.5L Sedan","SEL 2.5L Sedan","SEL Plus 1.6L Turbo","Limited 2.5L Turbo","N Line 2.5L Turbo","Hybrid SEL 2.0L","Hybrid Limited 2.0L"],
  "Hyundai|Tucson":["SE 2.5L","SEL 2.5L","XRT 2.5L","N Line 2.5L","Limited 2.5L","Hybrid Blue 1.6L Turbo Hybrid","Hybrid SEL Convenience 1.6L Hybrid","Hybrid Limited 1.6L Hybrid","Plug-in Hybrid SEL 1.6L PHEV"],
  "Hyundai|Santa Fe":["SE 2.5L","SEL 2.5L","XRT 2.5L","Limited 2.5L Turbo","Calligraphy 2.5L Turbo","Hybrid SEL Premium 1.6L Hybrid","Hybrid Limited 1.6L Hybrid","Plug-in Hybrid SEL 1.6L PHEV"],
  "Hyundai|Palisade":["SE 3.8L V6","SEL 3.8L V6","XRT 3.8L V6","Limited 3.8L V6","Calligraphy 3.8L V6"],
  "Hyundai|Kona":["SE 2.0L","SEL 2.0L","N Line 1.6L Turbo","Limited 1.6L Turbo","N 2.0L Turbo","Electric SE","Electric SEL","Electric Limited"],
  "Kia|Optima":["LX 2.4L","S 2.4L","EX 2.4L","SX 2.0L Turbo","SXL 2.0L Turbo","Hybrid LX 2.0L","Hybrid EX 2.0L"],
  "Kia|Forte":["LX 2.0L","LXS 2.0L","GT-Line 2.0L","GT 1.6L Turbo"],
  "Kia|Sportage":["LX 2.5L","EX 2.5L","SX 2.5L","SX Prestige 2.5L","X-Pro 2.5L","Hybrid LX 1.6L Turbo Hybrid","Hybrid EX 1.6L Hybrid","Hybrid SX Prestige 1.6L Hybrid","Plug-in Hybrid X-Line 1.6L PHEV"],
  "Kia|Sorento":["LX 2.5L","S 2.5L","EX 2.5L Turbo","SX 2.5L Turbo","SX Prestige X-Line 2.5L Turbo","Hybrid EX 1.6L Hybrid","Hybrid SX Prestige 1.6L Hybrid","Plug-in Hybrid SX Prestige 1.6L PHEV"],
  "Kia|Telluride":["LX 3.8L V6","S 3.8L V6","EX 3.8L V6","SX 3.8L V6","SX Prestige 3.8L V6","X-Line 3.8L V6","X-Pro 3.8L V6"],
  "Kia|Soul":["LX 2.0L","S 2.0L","GT-Line 2.0L","EX 2.0L","Turbo 1.6L Turbo"],
  "BMW|3 Series":["330i 2.0L Turbo I4 Sedan","330i xDrive 2.0L Turbo AWD","330e 2.0L PHEV","M340i 3.0L Turbo I6","M340i xDrive 3.0L Turbo I6 AWD","M3 3.0L Twin-Turbo I6","M3 Competition 3.0L Twin-Turbo I6"],
  "BMW|5 Series":["530i 2.0L Turbo I4","530i xDrive 2.0L Turbo I4 AWD","530e 2.0L PHEV","540i 3.0L Turbo I6","540i xDrive 3.0L Turbo I6 AWD","M550i xDrive 4.4L Twin-Turbo V8","M5 4.4L Twin-Turbo V8","M5 Competition 4.4L Twin-Turbo V8"],
  "BMW|X3":["sDrive30i 2.0L Turbo I4","xDrive30i 2.0L Turbo I4 AWD","xDrive30e 2.0L PHEV","M40i 3.0L Turbo I6","X3 M 3.0L Twin-Turbo I6","X3 M Competition 3.0L Twin-Turbo I6"],
  "BMW|X5":["sDrive40i 3.0L Turbo I6","xDrive40i 3.0L Turbo I6 AWD","xDrive45e 3.0L PHEV","xDrive50i 4.4L Twin-Turbo V8 (pre-2020)","M50i 4.4L Twin-Turbo V8","X5 M 4.4L Twin-Turbo V8","X5 M Competition 4.4L Twin-Turbo V8"],
  "BMW|X1":["sDrive28i 2.0L Turbo I4","xDrive28i 2.0L Turbo I4 AWD"],
  "Mercedes|C-Class":["C300 2.0L Turbo I4 Sedan","C300 4MATIC 2.0L Turbo I4 AWD","C43 AMG 3.0L Twin-Turbo V6","C63 AMG 4.0L Twin-Turbo V8","C63 S AMG 4.0L Twin-Turbo V8","C63 S E Performance 2.0L Turbo Hybrid"],
  "Mercedes|E-Class":["E350 2.0L Turbo I4","E350 4MATIC 2.0L Turbo I4 AWD","E450 3.0L Turbo I6","E450 4MATIC 3.0L Turbo I6 AWD","AMG E53 3.0L Turbo I6","AMG E63 S 4.0L Twin-Turbo V8"],
  "Subaru|Outback":["Base 2.5L 4cyl","Premium 2.5L 4cyl","Onyx Edition XT 2.4L Turbo","Limited 2.5L","Touring 2.5L","Limited XT 2.4L Turbo","Touring XT 2.4L Turbo","Wilderness 2.4L Turbo"],
  "Subaru|Forester":["Base 2.5L 4cyl","Premium 2.5L 4cyl","Sport 2.5L 4cyl","Limited 2.5L 4cyl","Touring 2.5L 4cyl","Wilderness 2.5L 4cyl"],
  "Subaru|Impreza":["Base 2.0L Sedan","Sport 2.0L 5-door","Limited 2.0L Sedan","RS 2.5L 5-door"],
  "Subaru|Legacy":["Base 2.5L Sedan","Premium 2.5L Sedan","Sport 2.5L Sedan","Limited 2.5L Sedan","Limited XT 2.4L Turbo","Touring XT 2.4L Turbo"],
  "Subaru|WRX":["Base 2.4L Turbo Sedan","Premium 2.4L Turbo Sedan","Limited 2.4L Turbo Sedan","GT 2.4L Turbo Sedan","TR 2.4L Turbo Sedan"],
  "Subaru|Crosstrek":["Base 2.0L 4cyl","Premium 2.0L 4cyl","Sport 2.5L 4cyl","Limited 2.5L 4cyl","Wilderness 2.5L 4cyl"],
  "Jeep|Wrangler":["Sport 2.0L Turbo I4","Sport S 3.6L V6","Willys 3.6L V6","Sahara 2.0L Turbo I4 / 3.6L V6","Rubicon 3.6L V6 / 6.4L V8","Rubicon 392 6.4L V8 HEMI","4xe Sahara 2.0L Turbo PHEV","4xe Rubicon 2.0L Turbo PHEV"],
  "Jeep|Grand Cherokee":["Laredo 3.6L V6","Limited 3.6L V6","Trailhawk 3.6L V6","Overland 3.6L V6","Summit 3.6L V6 / 5.7L V8 HEMI","SRT 6.4L V8 HEMI (pre-2022)","Trackhawk 6.2L V8 Supercharged (pre-2022)","4xe 2.0L Turbo PHEV"],
  "Jeep|Cherokee":["Latitude 2.4L 4cyl","Latitude Lux 3.2L V6","Trailhawk 3.2L V6","Limited 2.0L Turbo / 3.2L V6","Trailhawk Elite 3.2L V6"],
  "Jeep|Compass":["Sport 2.4L 4cyl","Latitude 2.4L 4cyl","Latitude Lux 2.0L Turbo","Trailhawk 2.4L 4cyl","Limited 2.0L Turbo"],
  "Jeep|Renegade":["Sport 1.3L Turbo","Latitude 1.3L Turbo","Trailhawk 1.3L Turbo","Limited 1.3L Turbo"],
  "Jeep|Gladiator":["Sport 3.6L V6","Sport S 3.6L V6","Willys 3.6L V6","Mojave 3.6L V6","Rubicon 3.6L V6 / 3.0L EcoDiesel V6"],
};
const PARTS_STORES = [
  {name:"AutoZone",color:"#e84a2a",url:q=>"https://www.autozone.com/searchresult?searchText="+encodeURIComponent(q)},
  {name:"RockAuto",color:"#1a6fc4",url:_=>"https://www.rockauto.com/en/catalog/"},
  {name:"O'Reilly",color:"#d92b2b",url:q=>"https://www.oreillyauto.com/shop/b/search?q="+encodeURIComponent(q)},
  {name:"NAPA",color:"#0055a5",url:q=>"https://www.napaonline.com/en/search?q="+encodeURIComponent(q)},
  {name:"Amazon",color:"#ff9900",url:q=>"https://www.amazon.com/s?k="+encodeURIComponent(q)+"+auto+parts"},
];

// Make → Reddit community mapping for scoped, vehicle-specific discussion search
const REDDIT_SUBS = {
  Ford:"Ford",Toyota:"Toyota",Honda:"Honda",Nissan:"Nissan",Chevy:"chevy",
  Hyundai:"Hyundai",Kia:"kia",BMW:"BMW",Mercedes:"mercedes_benz",Infiniti:"infiniti",
  Subaru:"subaru",Mazda:"mazda",Jeep:"Jeep",Dodge:"Dodge",Ram:"ram_trucks",
  GMC:"GMC",Volkswagen:"Volkswagen",Audi:"Audi",Lexus:"Lexus",Acura:"Acura",
  Chrysler:"Chrysler",Buick:"Buick",Cadillac:"Cadillac",
};
function ytSearchUrl(q){return "https://www.youtube.com/results?search_query="+encodeURIComponent(String(q||"").slice(0,150));}
function redditSearchUrl(q,sub){const qq=encodeURIComponent(String(q||"").slice(0,150));return sub?("https://www.reddit.com/r/"+sub+"/search/?q="+qq+"&restrict_sr=1&sort=relevance"):("https://www.reddit.com/search/?q="+qq+"&sort=relevance");}
// Resolve the most specific search topic: prefer the AI's repair_target, fall back to the raw problem
function repairTopic(ctx){const rt=(ctx?.repair_target||"").trim();return rt||String(ctx?.problem||"").slice(0,60);}
// Build YouTube tutorial links — prefer AI terms, but always bias toward the specific repair
function buildYouTubeLinks(ctx,terms){
  const v=[ctx?.year,ctx?.make,ctx?.model].filter(Boolean).join(" ");
  const t=(ctx?.trim||"").split(/[ ]/)[0];
  const base=[v,t].filter(Boolean).join(" ").trim();
  const rt=(ctx?.repair_target||"").trim();
  let list=Array.isArray(terms)?terms.filter(x=>x&&typeof x==="string"):[];
  if(!list.length){const topic=rt||(ctx?.problem||"repair").slice(0,40);list=[base+" "+topic+" replacement",base+" "+topic+" how to fix",base+" "+topic+" diagnosis"];}
  return list.slice(0,5).map(term=>({label:term,url:ytSearchUrl(term),sub:"Search on YouTube"}));
}
// Build Reddit discussion links scoped to the SPECIFIC repair/part (not just the raw symptom)
function buildRedditLinks(ctx){
  const v=[ctx?.year,ctx?.make,ctx?.model].filter(Boolean).join(" ");
  const model=ctx?.model||ctx?.make||"";
  const rt=(ctx?.repair_target||"").trim();
  const topic=repairTopic(ctx);
  const repl=(topic+(rt?" replacement":"")).trim();
  const sub=REDDIT_SUBS[ctx?.make];
  const links=[];
  if(sub)links.push({label:"r/"+sub,url:redditSearchUrl((model+" "+repl).trim(),sub),sub:rt?((model||ctx?.make)+" — "+rt):((model||ctx?.make)+" owner community")});
  links.push({label:"r/MechanicAdvice",url:redditSearchUrl((v+" "+repl).trim(),"MechanicAdvice"),sub:rt?("How to replace "+rt):"DIY mechanic help threads"});
  links.push({label:"r/AskMechanics",url:redditSearchUrl((v+" "+topic).trim(),"AskMechanics"),sub:"Ask professional mechanics"});
  links.push({label:"r/MechanicAdvice — DIY how-to",url:redditSearchUrl((model+" "+repl+" diy").trim(),"MechanicAdvice"),sub:"Step-by-step replacement threads"});
  return links;
}

const MAX_MODEL=60,MAX_PROBLEM=500,MAX_NICK=40,MAX_MILE=12,COOLDOWN_MS=7000,SESSION_MAX=15;
let _sessionCalls=0;

function sanitize(s,m){if(m===undefined)m=300;if(!s||typeof s!=="string")return"";return s.trim().slice(0,m).replace(/<[^>]*>/g,"").replace(/[{}\[\]\\`\x00]/g,"").replace(/\n{3,}/g,"\n\n");}
function isValidYTKey(k){return!k||!k.trim()||/^AIza[0-9A-Za-z_-]{35}$/.test(k.trim());}
function isValidVehicle(v){return v&&typeof v.id==="string"&&v.id.length<60&&VALID_YEARS.has(v.year)&&MAKES.includes(v.make)&&typeof v.model==="string"&&v.model.length>0&&typeof v.addedAt==="number";}
function isValidHistory(h){return h&&typeof h.id==="string"&&h.id.length<60&&VALID_YEARS.has(h.year)&&typeof h.make==="string"&&typeof h.model==="string"&&typeof h.result==="string"&&h.result.length>0&&h.result.length<100000&&typeof h.ts==="number";}
async function copyText(t){try{await navigator.clipboard.writeText(t);return true;}catch{}try{const e=document.createElement("textarea");e.value=t;e.style.cssText="position:fixed;opacity:0";document.body.appendChild(e);e.select();document.execCommand("copy");document.body.removeChild(e);return true;}catch{return false;}}
// Escape HTML to prevent XSS when injecting user/AI content into a print window
function escHTML(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");}
function printGuide(year,make,model,problem,secs,lang){const w=window.open("","_blank");if(!w)return;const body=secs.map(s=>"<h2>"+escHTML(s.title)+"</h2>"+s.lines.map(l=>"<p>"+escHTML(l.replace(/\*\*/g,"").replace(/^[-•]\s*/,"").replace(/^\d+\.\s*/,""))+"</p>").join("")).join("");const disc=lang==="es"?"Guía generada por IA con fines informativos.":"AI-generated for informational purposes.";const title=escHTML(year+" "+make+" "+model);w.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'"><title>'+title+'</title><style>body{font-family:Arial;max-width:720px;margin:40px auto;color:#111;line-height:1.6}h1{font-size:24px;border-bottom:2px solid #c0392b;padding-bottom:8px}h2{font-size:16px;color:#c0392b;margin-top:24px}p{margin-bottom:5px;font-size:14px}.d{margin-top:32px;padding:12px;background:#fff8f5;border:1px solid #f0ccc0;font-size:12px;color:#666}</style></head><body><h1>'+title+'</h1><p style="color:#666">'+escHTML(problem)+'</p>'+body+'<div class="d">⚠️ '+escHTML(disc)+'</div></body></html>');w.document.close();setTimeout(()=>w.print(),400);}
function exportGuide(year,make,model,problem,secs){const hr="─".repeat(44);const c=[year+" "+make+" "+model,problem+"\n",...secs.map(s=>hr+"\n"+s.title.toUpperCase()+"\n"+hr+"\n"+s.lines.map(l=>l.replace(/\*\*/g,"")).join("\n"))].join("\n\n");try{const b=new Blob([c],{type:"text/plain"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download=("repair-"+year+"-"+make+"-"+model+".txt").replace(/\s+/g,"-").toLowerCase();a.click();URL.revokeObjectURL(u);}catch{}}

const ssDraft={save:f=>{try{sessionStorage.setItem("fcai_d",JSON.stringify(f));}catch{}},load:()=>{try{const d=sessionStorage.getItem("fcai_d");return d?JSON.parse(d):null;}catch{return null;}},clear:()=>{try{sessionStorage.removeItem("fcai_d");}catch{}}};
const ssPage={save:p=>{try{sessionStorage.setItem("fcai_p",p);}catch{}},load:()=>{try{return sessionStorage.getItem("fcai_p")||"home";}catch{return"home";}}};
const ssLang={save:l=>{try{sessionStorage.setItem("fcai_l",l);}catch{}},load:()=>{try{return sessionStorage.getItem("fcai_l")||null;}catch{return null;}}};
const sg=async k=>{try{const r=await window.storage.get(k);return r?JSON.parse(r.value):null;}catch{return null;}};
const ss2=async(k,v)=>{try{await window.storage.set(k,JSON.stringify(v));return true;}catch{return false;}};
const sd=async k=>{try{await window.storage.delete(k);return true;}catch{return false;}};
const sl=async pfx=>{try{const r=await window.storage.list(pfx);return r?.keys||[];}catch{return[];}};
const gid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2);
const fmt=ts=>new Date(ts).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
const dclr=d=>{if(!d)return"#888";const l=d.toLowerCase();return l.includes("begin")?"#22c55e":l.includes("adv")?"#ef4444":"#f59e0b";};
const dbg=d=>{if(!d)return"#1a1a1a";const l=d.toLowerCase();return l.includes("begin")?"#052e16":l.includes("adv")?"#2d0000":"#2d1f00";};
const getLR=code=>{const s=US_STATES.find(s=>s.code===code);return s?(LABOR[s.r]||LABOR["Midwest"]):null;};
const getSN=code=>US_STATES.find(s=>s.code===code)?.name||"";
function safeErr(err,lang){
  const raw=err?.message||"unknown error";
  const m=raw.toLowerCase();
  const T=S[lang]||S.en;
  if(m.includes("session_limit"))return T.e_session;
  if(m.includes("rate")||m.includes("429"))return T.e_rate;
  if(/\b(401|403|auth)\b/.test(m))return T.e_auth;
  if(m.includes("timeout"))return T.e_timeout;
  if(m.includes("aborted"))return null;
  // The runtime's "Invalid response format" error means the AI-powered artifacts feature isn't enabled on this account
  if(m.includes("invalid response format")||m.includes("claude completion")){
    return lang==="es"
      ? "La función 'AI-powered artifacts' debe activarse en claude.ai → Configuración → Perfil → Vista previa de funciones (no disponible en la app iOS). Después de activarla, vuelve a abrir este artefacto."
      : "The 'Create AI-powered artifacts' feature must be enabled in claude.ai → Settings → Profile → Feature preview (this toggle is only visible in the desktop web app, not the iOS app). After enabling it, reopen this artifact.";
  }
  return T.e_default+" — "+raw.slice(0,120);
}

// Suppress unhandled promise rejections from bubbling up to the runtime's error UI
// The Claude artifact runtime catches uncaught rejections and shows a full-screen "Error in Claude completion" modal
// We handle errors ourselves in our UI, so we silence the runtime modal here
if (typeof window !== "undefined" && !window.__fcai_rejection_handler) {
  window.__fcai_rejection_handler = true;
  window.addEventListener("unhandledrejection", function(e) {
    const msg = String(e?.reason?.message || e?.reason || "");
    if (msg.includes("Invalid response") || msg.includes("Claude") || msg.includes("complete") || msg.includes("fetch")) {
      console.warn("[FixCost] suppressed unhandledrejection:", msg);
      e.preventDefault();
    }
  });
  window.addEventListener("error", function(e) {
    const msg = String(e?.message || e?.error?.message || "");
    if (msg.includes("Invalid response") || msg.includes("Claude") || msg.includes("complete")) {
      console.warn("[FixCost] suppressed error event:", msg);
      e.preventDefault();
    }
  });
}

// XHR fallback in case fetch is intercept-blocked
function xhrPost(url,body,timeoutMs){
  return new Promise((resolve,reject)=>{
    try{
      const xhr=new XMLHttpRequest();
      xhr.open("POST",url,true);
      xhr.setRequestHeader("Content-Type","application/json");
      xhr.timeout=timeoutMs||60000;
      xhr.onload=()=>resolve({status:xhr.status,ok:xhr.status>=200&&xhr.status<300,text:xhr.responseText});
      xhr.onerror=()=>reject(new Error("xhr network error"));
      xhr.ontimeout=()=>reject(new Error("xhr timeout"));
      xhr.send(body);
    }catch(e){reject(e);}
  });
}

function jsonToSections(g,lang,ctx){
  const es=lang==="es";
  const L=(en,sp)=>es?sp:en;
  const secs=[];
  const push=(title,lines,key)=>{
    const arr=(lines||[]).filter(l=>l&&typeof l==="string"&&l.trim()).map(l=>l.trim());
    if(arr.length)secs.push({title,lines:arr,key});
  };
  const pushLinks=(title,links,kind)=>{
    const arr=(links||[]).filter(l=>l&&l.url&&l.label);
    if(arr.length)secs.push({title,type:"links",kind,links:arr});
  };
  // 1. What's likely wrong
  if(g.overview)push(L("What's Likely Wrong","Qué Falla Probablemente"),[String(g.overview)],"overview");
  // 2. Difficulty
  if(g.difficulty){
    const lines=[g.difficulty];
    if(g.time)lines.push(L("Estimated time: ","Tiempo estimado: ")+g.time);
    if(g.difficulty_reason)lines.push(String(g.difficulty_reason));
    push(L("Difficulty Rating","Nivel de Dificultad"),lines,"difficulty");
  }
  // 3. Diagnosis — confirm the cause
  if(Array.isArray(g.diagnosis)&&g.diagnosis.length)push(L("How to Confirm the Problem","Cómo Confirmar el Problema"),g.diagnosis.map((d,i)=>(i+1)+". "+d),"diagnosis");
  else if(g.diagnosis&&typeof g.diagnosis==="string")push(L("How to Confirm the Problem","Cómo Confirmar el Problema"),[g.diagnosis],"diagnosis");
  // 4. Cost
  if(g.cost){
    const c=g.cost,lines=[];
    if(c.diy_parts)lines.push(L("- DIY parts: ","- Piezas (hazlo tú mismo): ")+c.diy_parts);
    if(c.tools)lines.push(L("- Tools if needed: ","- Herramientas si se necesitan: ")+c.tools);
    if(c.total_diy)lines.push(L("- Total DIY: ","- Total hazlo tú mismo: ")+c.total_diy);
    if(c.shop_labor)lines.push(L("- Shop labor: ","- Mano de obra del taller: ")+c.shop_labor);
    if(c.total_shop)lines.push(L("- Total shop estimate: ","- Estimado total del taller: ")+c.total_shop);
    if(c.savings)lines.push(L("- DIY savings: ","- Ahorro al hacerlo tú mismo: ")+c.savings);
    push(L("Cost Estimate","Estimado de Costo"),lines,"cost");
  }
  // Resolve the specific repair target so links/searches target the actual part, not the raw symptom
  const rt=(g.repair_target&&typeof g.repair_target==="string")?g.repair_target.trim():"";
  const lctx=Object.assign({},ctx,{repair_target:rt});
  // 5. Watch — YouTube tutorials (always present, biased to the specific repair)
  pushLinks(L("Watch — Video Tutorials","Ver — Tutoriales en Video"),buildYouTubeLinks(lctx,g.youtube_searches),"youtube");
  // 6. Community — Reddit discussions for this make/model + specific repair
  pushLinks(L("Community — Reddit Threads","Comunidad — Hilos de Reddit"),buildRedditLinks(lctx),"reddit");
  // 7. Parts (shoppable)
  if(Array.isArray(g.parts)&&g.parts.length)push(L("Parts Needed","Piezas Necesarias"),g.parts.map(p=>"- "+p),"parts");
  // 8. Tools (shoppable)
  if(Array.isArray(g.tools)&&g.tools.length)push(L("Tools Required","Herramientas Necesarias"),g.tools.map(t=>"- "+t),"tools");
  // 9. Step-by-step — prefer removal + installation split, fall back to single steps
  const hasSplit=(Array.isArray(g.removal_steps)&&g.removal_steps.length)||(Array.isArray(g.installation_steps)&&g.installation_steps.length);
  if(hasSplit){
    if(Array.isArray(g.removal_steps)&&g.removal_steps.length)push(L("Removal — Step by Step","Desmontaje — Paso a Paso"),g.removal_steps.map((s,i)=>(i+1)+". "+s),"removal");
    if(Array.isArray(g.installation_steps)&&g.installation_steps.length)push(L("Installation — Step by Step","Instalación — Paso a Paso"),g.installation_steps.map((s,i)=>(i+1)+". "+s),"installation");
  }else if(Array.isArray(g.steps)&&g.steps.length){
    push(L("Step-by-Step Guide","Guía Paso a Paso"),g.steps.map((s,i)=>(i+1)+". "+s),"steps");
  }
  // 10-13. Supporting info
  if(Array.isArray(g.mistakes)&&g.mistakes.length)push(L("Common Mistakes to Avoid","Errores Comunes a Evitar"),g.mistakes.map(m=>"- "+m),"mistakes");
  if(Array.isArray(g.safety)&&g.safety.length)push(L("Safety Warnings","Advertencias de Seguridad"),g.safety.map(s=>"- "+s),"safety");
  if(Array.isArray(g.tips)&&g.tips.length)push(L("Pro Tips","Consejos de Experto"),g.tips.map(t=>"- "+t),"tips");
  if(g.when_to_stop&&typeof g.when_to_stop==="string")push(L("When to Call a Professional","Cuándo Llamar a un Profesional"),[String(g.when_to_stop)],"pro");
  return secs;
}

function sectionsToText(secs){
  return secs.map(s=>"## "+s.title+"\n"+s.lines.join("\n")).join("\n\n");
}

// JSON Schema for structured output (some runtimes require this)
const GUIDE_SCHEMA={
  type:"object",
  properties:{
    overview:{type:"string"},
    difficulty:{type:"string",enum:["Beginner","Intermediate","Advanced"]},
    time:{type:"string"},
    difficulty_reason:{type:"string"},
    cost:{
      type:"object",
      properties:{
        diy_parts:{type:"string"},tools:{type:"string"},total_diy:{type:"string"},
        shop_labor:{type:"string"},total_shop:{type:"string"},savings:{type:"string"}
      }
    },
    tools:{type:"array",items:{type:"string"}},
    parts:{type:"array",items:{type:"string"}},
    steps:{type:"array",items:{type:"string"}},
    mistakes:{type:"array",items:{type:"string"}},
    safety:{type:"array",items:{type:"string"}},
    youtube_searches:{type:"array",items:{type:"string"}}
  },
  required:["overview","difficulty","cost","tools","parts","steps","mistakes","safety","youtube_searches"]
};

// Smart template fallback — generates a useful guide based on inputs when AI is unavailable
// Known make-specific quirks — used to inject vehicle-specific gotchas into templates
const MAKE_QUIRKS = {
  Ford: {
    common: ["Ford bolts often use Torx — check before grabbing a socket", "PCM relearn may be needed after disconnecting battery"],
    suspension: ["Ford sway bar end links on this generation are known to rust — soak with PB Blaster overnight", "On Ford Focus/C-Max/Fiesta, the rear lower control arm bushings fail early"],
    engine: ["Ford 2.0L/2.5L Duratec: cam phasers can rattle on cold start when worn", "Check for TSB 14-0194 on PCM updates if check engine light is intermittent"],
    transmission: ["2011-2016 Ford Fiesta/Focus PowerShift dual-clutch transmissions have known shudder issues — Ford extended warranty applies"],
  },
  Honda: {
    common: ["Honda uses 12-point bolts on some applications — use 6-point sockets to avoid stripping", "Many Hondas need idle relearn after throttle body service"],
    engine: ["Honda VTEC solenoid screens clog with old oil — clean during valve service", "K-series engines: timing chain tensioner can fail — listen for rattle on cold start"],
    suspension: ["Honda compliance bushings on the rear trailing arm wear early — common Civic/Accord issue"],
  },
  Toyota: {
    common: ["Toyota uses 14mm hex head bolts in unusual places — have metric hex socket ready"],
    engine: ["Toyota 2AZ-FE 4-cylinder (2002-2011) has oil consumption issue — extended warranty may apply", "1MZ-FE V6 sludge issue — verify oil change history"],
    suspension: ["Toyota strut mounts on Camry/Corolla fail with characteristic clunk over bumps"],
  },
  Nissan: {
    common: ["Nissan CVT transmissions (2003-2015) have known reliability issues — check fluid color and listen for whining"],
    engine: ["Nissan VQ35DE has timing chain stretch issues past 100k miles"],
  },
  Chevy: {
    common: ["GM uses 7mm and 8mm bolts on plastic shrouds — easy to strip if you use the wrong size"],
    engine: ["GM 3.6L V6 timing chain issues 2007-2014 — listen for rattle", "Active Fuel Management (AFM) lifter failure common on 5.3L V8s"],
  },
  BMW: {
    common: ["BMW requires specific Liqui Moly or BMW-spec fluids — don't mix brands", "Most BMW work requires programming/coding via ISTA or BimmerLink after parts replacement"],
    engine: ["N54/N55 engines: HPFP, water pump, and oil filter housing gasket are known failures"],
  },
  Subaru: {
    common: ["Subaru head gasket failure is common on EJ25 engines 1999-2009"],
    engine: ["Check valve cover gaskets — leaks onto exhaust manifold cause burning smell"],
  },
  Jeep: {
    common: ["Jeep ground straps corrode and cause electrical gremlins — inspect chassis-to-engine grounds"],
    suspension: ["Jeep Wrangler death wobble — track bar, steering damper, and ball joint inspection critical"],
  },
};

// Spanish translations of the make-specific quirks
const MAKE_QUIRKS_ES = {
  Ford: {
    common: ["Los pernos Ford suelen ser Torx — revisa antes de tomar un dado", "Puede requerir reaprendizaje del PCM tras desconectar la batería"],
    suspension: ["Las bieletas Ford de esta generación se oxidan — remoja con PB Blaster toda la noche", "En Ford Focus/C-Max/Fiesta, los bujes traseros del brazo inferior fallan pronto"],
    engine: ["Ford 2.0L/2.5L Duratec: los actuadores de levas (cam phasers) suenan en frío al desgastarse", "Revisa el TSB 14-0194 sobre actualizaciones del PCM si la luz de motor es intermitente"],
    transmission: ["Las transmisiones PowerShift de doble embrague (Ford Fiesta/Focus 2011-2016) tienen vibración conocida — aplica garantía extendida de Ford"],
  },
  Honda: {
    common: ["Honda usa pernos de 12 puntas en algunas aplicaciones — usa dados de 6 puntas para no barrerlos", "Muchos Honda requieren reaprendizaje de ralentí tras limpiar el cuerpo de aceleración"],
    engine: ["Las mallas del solenoide VTEC de Honda se tapan con aceite viejo — límpialas durante el servicio de válvulas", "Motores serie K: el tensor de la cadena puede fallar — escucha cascabeleo en frío"],
    suspension: ["Los bujes de cumplimiento del brazo trasero Honda se gastan pronto — común en Civic/Accord"],
  },
  Toyota: {
    common: ["Toyota usa pernos hexagonales de 14mm en lugares inusuales — ten un dado hexagonal métrico listo"],
    engine: ["El 4 cilindros 2AZ-FE de Toyota (2002-2011) consume aceite — puede aplicar garantía extendida", "El V6 1MZ-FE tiene problema de lodos — verifica el historial de cambios de aceite"],
    suspension: ["Las bases de amortiguador en Camry/Corolla fallan con golpeteo característico en baches"],
  },
  Nissan: {
    common: ["Las transmisiones CVT de Nissan (2003-2015) tienen problemas de fiabilidad — revisa el color del fluido y escucha zumbidos"],
    engine: ["El VQ35DE de Nissan estira la cadena de distribución pasadas las 100k millas"],
  },
  Chevy: {
    common: ["GM usa pernos de 7mm y 8mm en cubiertas de plástico — fáciles de barrer con el tamaño equivocado"],
    engine: ["Problemas de cadena de distribución en el V6 3.6L de GM 2007-2014 — escucha cascabeleo", "Falla de buzos por el Active Fuel Management (AFM) común en V8 5.3L"],
  },
  BMW: {
    common: ["BMW requiere fluidos específicos Liqui Moly o spec BMW — no mezcles marcas", "La mayoría del trabajo BMW requiere programación/codificación con ISTA o BimmerLink tras cambiar piezas"],
    engine: ["Motores N54/N55: la HPFP, la bomba de agua y la junta de la carcasa del filtro de aceite son fallas conocidas"],
  },
  Subaru: {
    common: ["La falla de junta de culata es común en motores EJ25 de Subaru 1999-2009"],
    engine: ["Revisa las juntas de tapa de válvulas — las fugas sobre el múltiple de escape causan olor a quemado"],
  },
  Jeep: {
    common: ["Las tiras de tierra de Jeep se corroen y causan fallas eléctricas — inspecciona las tierras chasis-motor"],
    suspension: ["'Death wobble' del Jeep Wrangler — inspección crítica de barra de dirección, amortiguador de dirección y rótulas"],
  },
};

// Mileage-based maintenance suggestions for a saved garage vehicle
function maintenanceForMileage(miles, make, model, trim, lang) {
  const es = lang === "es";
  const L = (en, sp) => es ? sp : en;
  const m = parseInt(String(miles || "").replace(/[^0-9]/g, "")) || 0;
  if (!m) return null;
  const isHybrid = /hybrid|phev|plug-?in|energi/i.test(trim || "");
  const out = [];
  out.push(L("Oil & filter every 5,000–7,500 mi, plus a tire rotation each time", "Aceite y filtro cada 5,000–7,500 mi, más rotación de llantas cada vez"));
  if (m < 30000) {
    out.push(L("Approaching 30k: replace engine & cabin air filters and inspect the brakes", "Cerca de 30k: cambia filtros de aire del motor y de cabina e inspecciona los frenos"));
  } else if (m < 60000) {
    out.push(L("30k–60k: engine & cabin air filters, brake-fluid flush, and check tire tread depth", "30k–60k: filtros de aire de motor y cabina, purga del líquido de frenos y revisa el dibujo de las llantas"));
  } else if (m < 100000) {
    out.push(L("60k–100k: brake pads & rotors, transmission fluid service, coolant inspection; spark plugs coming due", "60k–100k: pastillas y discos, servicio del fluido de transmisión, inspección de anticongelante; las bujías se acercan"));
  } else if (m < 150000) {
    out.push(L("100k+: iridium spark plugs, coolant flush, timing belt & water pump if belt-driven, full suspension inspection", "100k+: bujías de iridio, purga de anticongelante, banda de distribución y bomba de agua si es por banda, inspección completa de suspensión"));
  } else {
    out.push(L("High mileage (150k+): inspect suspension bushings, motor/trans mounts, CV axles, wheel bearings, and every fluid", "Alto kilometraje (150k+): inspecciona bujes de suspensión, soportes de motor/transmisión, juntas homocinéticas, baleros de rueda y todos los fluidos"));
    out.push(L("Check hoses, belts, and gaskets for leaks; budget ahead for wear-item replacement", "Revisa mangueras, bandas y juntas por fugas; presupuesta el reemplazo de piezas de desgaste"));
  }
  if (isHybrid) out.push(L("Hybrid: check traction-battery health and replace inverter/hybrid coolant on schedule", "Híbrido: revisa la salud de la batería de tracción y reemplaza el anticongelante del inversor/híbrido según el plan"));
  const q = (es ? MAKE_QUIRKS_ES[make] : MAKE_QUIRKS[make]);
  if (q && q.common && q.common[0]) out.push(make + L(" watch-item: ", " punto a vigilar: ") + q.common[0]);
  return out;
}

function templateGuide(year, make, model, trim, problem, stateCode, lang) {
  const es = lang === "es";
  const L = (en, sp) => es ? sp : en;
  const rate = getLR(stateCode);
  const p = (problem || "").toLowerCase();
  const yr = parseInt(year) || 0;
  const t = (trim || "").trim();
  const v = year + " " + make + " " + model + (t ? " " + t : "");
  const lr = rate ? "$" + rate.lo + "-$" + rate.hi + "/hr" : "$100-$150/hr";

  // Parse engine info from trim (e.g. "2.0L", "V6", "Hybrid", "Turbo")
  const engineHint = (() => {
    const liters = t.match(/(\d\.\d)\s*L/i);
    if (liters) return liters[1] + "L";
    if (/v6/i.test(t)) return "V6";
    if (/v8/i.test(t)) return "V8";
    if (/turbo/i.test(t)) return L("turbocharged", "turbo");
    if (/hybrid/i.test(t)) return L("hybrid", "híbrido");
    return "";
  })();
  const engineNote = engineHint ? L(" (" + engineHint + " variant)", " (variante " + engineHint + ")") : "";

  // Build vehicle-specific mistake/safety lines (localized)
  const quirks = (es ? MAKE_QUIRKS_ES[make] : MAKE_QUIRKS[make]) || {};
  const makeMistakes = quirks.common || [];
  const DIFF = { beg: L("Beginner", "Principiante"), int: L("Intermediate", "Intermedio"), adv: L("Advanced", "Avanzado") };

  let cat = "generic", overview = "", difficulty = DIFF.int, time = L("2-4 hours", "2-4 horas");
  let diyParts = "$50-$200", shopLabor = "$150-$400", laborHrs = [1.5, 3], toolsRange = [0, 80], tools = [], parts = [], steps = [], mistakes = [], safety = [], yts = [];

  if (/clunk|knock|bump/i.test(p)) {
    cat = "suspension";
    overview = L("Clunking over bumps on this " + v + engineNote + " almost always traces to the suspension — order of likelihood: sway bar end links (cheapest, most common), then lower control arm bushings, then strut mounts. Inspect each by hand before buying parts.",
      "Un golpeteo al pasar por baches en este " + v + engineNote + " casi siempre viene de la suspensión — en orden de probabilidad: bieletas de la barra estabilizadora (lo más barato y común), luego bujes del brazo de control inferior, y por último las bases de los amortiguadores. Revisa cada uno a mano antes de comprar piezas.");
    difficulty = DIFF.int; time = L("2-4 hours", "2-4 horas"); diyParts = "$40-$180"; shopLabor = "$200-$500"; laborHrs = [1.5, 3];
    tools = L(["3/8\" drive ratchet set", "15mm and 18mm sockets (verify on your specific car)", "Torque wrench (10-100 ft-lb)", "Jack and 2 jack stands rated for vehicle weight", "Penetrating oil (PB Blaster)", "Pry bar"],
      ["Juego de carraca de 3/8\"", "Dados de 15mm y 18mm (verifica en tu auto)", "Llave de torque (10-100 lb-pie)", "Gato y 2 torres de seguridad para el peso del vehículo", "Aceite penetrante (PB Blaster)", "Barra de palanca"]);
    parts = L(["Sway bar end links for " + year + " " + make + " " + model + " (Moog K-series or OEM, ~$25-50/pair)", "Lower control arm bushings if pry test shows movement ($30-80)", "Strut mount bearings if clunk turns with steering ($40-100)"],
      ["Bieletas de barra estabilizadora para " + year + " " + make + " " + model + " (Moog serie K u OEM, ~$25-50/par)", "Bujes del brazo de control inferior si la prueba de palanca muestra juego ($30-80)", "Rodamientos de la base del amortiguador si el golpeteo cambia con la dirección ($40-100)"]);
    steps = L(["Park on level ground, chock rear wheels, loosen front lug nuts (don't fully remove).", "Jack up the front of the " + make + ", place on jack stands rated for the weight. Remove wheels.", "Grab each sway bar end link and shake firmly. Any play = replacement needed.", "Spray penetrating oil on end link nuts. Wait 5 minutes for it to work in.", "Hold the inner ball with a wrench, turn the nut off. Torque new ones to factory spec (typically 40-55 ft-lb for this size — verify in service manual).", "Pry on each control arm bushing. Visible deflection means the bushing is worn.", "If replacing bushings, mark camber alignment before removing arm — shop press required for install.", "Reinstall wheels, torque lugs to spec (verify torque for your specific car; commonly 95-100 ft-lb). Test drive at low speed first."],
      ["Estaciona en suelo nivelado, calza las ruedas traseras y afloja las tuercas delanteras (sin quitarlas del todo).", "Levanta el frente del " + make + " con el gato y colócalo sobre torres para su peso. Quita las ruedas.", "Sujeta cada bieleta de la barra estabilizadora y muévela con fuerza. Cualquier juego = hay que reemplazarla.", "Rocía aceite penetrante en las tuercas de las bieletas. Espera 5 minutos a que penetre.", "Sujeta la rótula interior con una llave y quita la tuerca. Aprieta las nuevas al par de fábrica (típicamente 40-55 lb-pie para este tamaño — verifica en el manual).", "Haz palanca en cada buje del brazo de control. Si se deforma visiblemente, el buje está gastado.", "Si reemplazas bujes, marca la alineación de camber antes de quitar el brazo — se requiere prensa de taller para instalar.", "Reinstala las ruedas y aprieta las tuercas al par (verifica para tu auto; comúnmente 95-100 lb-pie). Haz una prueba de manejo a baja velocidad primero."]);
    mistakes = [
      ...L(["Replacing only one side — sway bar end links should always be replaced as pairs on a " + make,
        "Skipping torque specs — overtightening end link ball joints damages the bushings immediately",
        "Not marking alignment marks before removing the lower control arm — alignment shop visit will be required regardless"],
        ["Reemplazar solo un lado — las bieletas siempre se cambian en pares en un " + make,
        "Ignorar los pares de apriete — apretar de más las rótulas daña los bujes de inmediato",
        "No marcar las marcas de alineación antes de quitar el brazo de control inferior — de todos modos necesitarás alineación"]),
      ...(quirks.suspension || []),
    ];
    safety = [
      ...L(["Use jack stands rated for the " + make + " " + model + " weight — never work under a car on a jack alone",
        "Wear safety glasses when using penetrating oil — backsplash is very common",
        "Let the car settle on stands and rock it before getting underneath"],
        ["Usa torres de seguridad para el peso del " + make + " " + model + " — nunca trabajes bajo un auto solo con el gato",
        "Usa gafas de seguridad al aplicar aceite penetrante — las salpicaduras son muy comunes",
        "Deja que el auto se asiente en las torres y muévelo antes de meterte debajo"]),
      ...(yr >= 2010 && /chevy|gmc|cadillac/i.test(make) ? [L("Some 2010+ GM vehicles use auto-leveling sensors on rear suspension — disconnect before lifting", "Algunos GM 2010+ usan sensores de autonivelación en la suspensión trasera — desconéctalos antes de levantar")] : []),
      ...(make === "BMW" ? [L("BMW requires SRS/airbag system off-mode before working near steering components", "BMW requiere modo apagado del sistema SRS/airbag antes de trabajar cerca de la dirección")] : []),
    ];
    yts = [v + " sway bar end link replacement", year + " " + make + " " + model + " clunking suspension diagnosis", v + " control arm bushing", v + " strut mount replacement"];
  } else if (/bottom|bounce|bouncy|\bsag|rough ride|rides rough|nose ?dive|shock absorber|\bshocks?\b|\bstruts?\b/i.test(p)) {
    cat = "ride";
    overview = L("Bottoming out or excessive bouncing on a " + v + engineNote + " points to worn shocks/struts or sagging springs — the dampers can no longer control suspension travel. Push down hard on each corner: if it rebounds more than once, that damper is worn. Replace struts/shocks in axle pairs.",
      "Que se vaya hasta el fondo o rebote demasiado en un " + v + engineNote + " indica amortiguadores/struts gastados o resortes vencidos — los amortiguadores ya no controlan el recorrido de la suspensión. Empuja con fuerza cada esquina: si rebota más de una vez, ese amortiguador está gastado. Reemplaza struts/amortiguadores en pares por eje.");
    difficulty = DIFF.int; time = L("2-4 hours", "2-4 horas"); diyParts = "$120-$450"; shopLabor = "$400-$900"; laborHrs = [2, 4]; toolsRange = [0, 100];
    tools = L(["Jack and 2 jack stands rated for the vehicle weight", "Spring compressor (ONLY if reusing springs on bare struts — loaded strut assemblies skip this)", "Metric socket set + breaker bar", "Torque wrench (up to 150 ft-lb)", "Penetrating oil"],
      ["Gato y 2 torres de seguridad para el peso del vehículo", "Compresor de resortes (SOLO si reutilizas resortes en struts desnudos — los conjuntos armados no lo necesitan)", "Juego de dados métricos + barra de fuerza", "Llave de torque (hasta 150 lb-pie)", "Aceite penetrante"]);
    parts = L(["Loaded (quick) strut assemblies for " + year + " " + make + " " + model + " — easiest DIY, ~$90-200 each", "Or bare struts/shocks (~$40-120 each) if reusing springs/mounts", "Strut mounts & bearings if worn ($30-80 each)"],
      ["Conjuntos de strut armados ('quick strut') para " + year + " " + make + " " + model + " — lo más fácil, ~$90-200 c/u", "O struts/amortiguadores desnudos (~$40-120 c/u) si reutilizas resortes/bases", "Bases y rodamientos de strut si están gastados ($30-80 c/u)"]);
    steps = L(["Loosen lugs, jack up the " + make + ", set on stands, remove the wheel.", "Support the lower control arm with a floor jack so it doesn't drop when the strut is freed.", "Remove the strut-to-knuckle bolts (often 18-21mm, very tight — use a breaker bar).", "Remove the upper strut mount nuts under the hood/trunk. Lower the assembly out.", "If using loaded assemblies, just bolt the new unit in. If reusing the spring, a spring compressor is required — keep hands clear, a loaded spring can cause serious injury.", "Torque strut-to-knuckle and upper-mount fasteners to factory spec (verify; commonly 90-150 ft-lb lower, 25-40 ft-lb upper).", "Reinstall the wheel, torque lugs, and get a 4-wheel alignment afterward."],
      ["Afloja las tuercas, levanta el " + make + ", ponlo en torres y quita la rueda.", "Apoya el brazo de control inferior con un gato para que no caiga al liberar el strut.", "Quita los pernos del strut a la mangueta (a menudo 18-21mm, muy apretados — usa barra de fuerza).", "Quita las tuercas de la base superior del strut bajo el cofre/cajuela. Baja el conjunto.", "Con conjuntos armados, solo atornilla la unidad nueva. Si reutilizas el resorte, se requiere compresor de resortes — mantén las manos lejos, un resorte cargado puede causar lesiones graves.", "Aprieta los pernos del strut a la mangueta y de la base superior al par de fábrica (verifica; comúnmente 90-150 lb-pie abajo, 25-40 lb-pie arriba).", "Reinstala la rueda, aprieta las tuercas y haz una alineación de 4 ruedas después."]);
    mistakes = [
      ...L(["Replacing only one side — always do shocks/struts in axle pairs or the car will handle unevenly",
        "Reusing a worn strut mount or bearing — causes new noises and uneven tire wear",
        "Skipping the post-job alignment — strut work changes camber and eats tires"],
        ["Reemplazar solo un lado — haz siempre amortiguadores/struts en pares por eje o el auto se comportará disparejo",
        "Reutilizar una base o rodamiento de strut gastado — causa ruidos nuevos y desgaste disparejo de llantas",
        "Saltarte la alineación posterior — el trabajo de struts cambia el camber y desgasta las llantas"]),
      ...(quirks.suspension || makeMistakes),
    ];
    safety = L(["A compressed coil spring stores enormous energy — only use a proper spring compressor and keep your body out of its path", "Use jack stands rated for the vehicle weight; support the control arm before removing the strut", "Wear eye protection; old strut bolts are usually rusted and may shatter rust when broken loose"],
      ["Un resorte comprimido almacena enorme energía — usa solo un compresor de resortes adecuado y mantén el cuerpo fuera de su trayectoria", "Usa torres para el peso del vehículo; apoya el brazo de control antes de quitar el strut", "Usa protección ocular; los pernos viejos de strut suelen estar oxidados y pueden saltar óxido al aflojarse"]);
    yts = [v + " strut replacement", v + " quick strut install", year + " " + make + " " + model + " bouncy suspension fix", v + " shock absorber replacement"];
  } else if (/squeak|squeal|grind|brake/i.test(p)) {
    cat = "brakes";
    overview = L("Brake noise on a " + v + engineNote + " — squeal usually means worn pad wear indicators scraping the rotor (time for pads). Grinding means metal-on-metal contact (replace pads AND rotors immediately, stop driving). Pulsation when braking points to warped rotors.",
      "Ruido de frenos en un " + v + engineNote + " — el chirrido suele ser el indicador de desgaste de las pastillas raspando el disco (toca cambiar pastillas). El rechinido metálico es metal con metal (cambia pastillas Y discos de inmediato, deja de manejar). La pulsación al frenar indica discos deformados.");
    difficulty = DIFF.int; time = L("1-2 hours per axle", "1-2 horas por eje"); diyParts = "$60-$250"; shopLabor = "$250-$550"; laborHrs = [1, 2.5];
    tools = L(["Jack and 2 jack stands", "C-clamp or brake caliper compression tool", "Sockets — verify caliper bolt size on your " + make + " (typically 14-17mm)", "Torque wrench", "Brake cleaner spray", "Wire brush", "Caliper grease (silicone)"],
      ["Gato y 2 torres de seguridad", "Prensa en C o herramienta para comprimir el cáliper", "Dados — verifica el tamaño del perno del cáliper en tu " + make + " (típicamente 14-17mm)", "Llave de torque", "Limpiador de frenos en aerosol", "Cepillo de alambre", "Grasa de cáliper (silicona)"]);
    parts = L(["Brake pads for " + year + " " + make + " " + model + " (ceramic recommended for daily driving, ~$40-90/axle)", "Rotors if scored, grooved, or under minimum thickness spec stamped on rotor ($60-160/pair)", "Brake hardware kit — clips, shims, slide pin boots ($15-30) — always replace with pads"],
      ["Pastillas de freno para " + year + " " + make + " " + model + " (cerámicas recomendadas para uso diario, ~$40-90/eje)", "Discos si están rayados, acanalados o bajo el espesor mínimo grabado en el disco ($60-160/par)", "Kit de herrajes de freno — clips, calzas, fundas de pasadores ($15-30) — cámbialos siempre con las pastillas"]);
    steps = L(["Loosen lugs, jack up the " + make + ", place on stands. Remove wheel.", "Remove caliper bolts. Hang caliper with wire or bungee — DO NOT let it dangle by the brake hose.", "Note exact orientation of old pads, shims, and clips before removing.", "Compress caliper piston with C-clamp. Open the bleeder if fluid is dark to avoid pushing dirty fluid back to ABS unit.", "Clean caliper bracket of rust with wire brush. Apply caliper grease to slide pins.", "Install new hardware kit first, then new pads. Apply anti-squeal compound to pad backing only.", "Torque caliper bolts to factory spec for your " + make + " (verify in service manual — typically 25-35 ft-lb).", "BEFORE driving: pump brake pedal 5-10 times until firm. First press will be soft and may have no braking.", "Bed-in procedure: 5 stops from 30→5 mph allowing cooling between, then 3 stops from 60→20 mph. Critical for pad longevity."],
      ["Afloja las tuercas, levanta el " + make + " y ponlo en torres. Quita la rueda.", "Quita los pernos del cáliper. Cuélgalo con alambre o cuerda — NO lo dejes colgando de la manguera de freno.", "Anota la orientación exacta de pastillas, calzas y clips viejos antes de quitarlos.", "Comprime el pistón del cáliper con la prensa en C. Abre el purgador si el líquido está oscuro para no empujar líquido sucio al ABS.", "Limpia el óxido del soporte del cáliper con cepillo de alambre. Aplica grasa de cáliper a los pasadores.", "Instala primero el kit de herrajes, luego las pastillas nuevas. Aplica compuesto antichirrido solo al respaldo de la pastilla.", "Aprieta los pernos del cáliper al par de fábrica de tu " + make + " (verifica en el manual — típicamente 25-35 lb-pie).", "ANTES de manejar: bombea el pedal de freno 5-10 veces hasta que esté firme. El primer toque estará blando y puede no frenar.", "Asentado: 5 frenadas de 30→5 mph dejando enfriar entre cada una, luego 3 de 60→20 mph. Es clave para la vida de las pastillas."]);
    mistakes = [
      ...L(["Driving away without pumping the brake pedal first — the first stop will have NO braking force",
        "Skipping the bed-in procedure — causes pad glazing, squeal, and dramatically reduced pad life",
        "Reusing old slide pin boots — torn boots let water in, leading to seized calipers within months"],
        ["Arrancar sin bombear primero el pedal — la primera frenada NO tendrá fuerza de frenado",
        "Saltarte el asentado — causa cristalización, chirrido y vida mucho más corta de las pastillas",
        "Reutilizar fundas viejas de pasadores — las fundas rotas dejan entrar agua y trabarán el cáliper en meses"]),
      ...makeMistakes,
    ];
    safety = [
      ...L(["Brake dust may contain harmful materials — wear a dust mask when cleaning brakes",
        "Always wash hands thoroughly after handling brakes before eating",
        "Test brakes at low speed in an empty area before normal driving"],
        ["El polvo de freno puede contener materiales dañinos — usa mascarilla al limpiar los frenos",
        "Lávate bien las manos después de manipular frenos y antes de comer",
        "Prueba los frenos a baja velocidad en un área vacía antes de manejar normal"]),
      ...(make === "BMW" || make === "Mercedes" ? [L("This vehicle likely has electronic parking brake — must be put in service mode before pad replacement or you'll damage the actuator", "Este vehículo probablemente tiene freno de mano electrónico — debes ponerlo en modo de servicio antes de cambiar pastillas o dañarás el actuador")] : []),
    ];
    yts = [v + " brake pad replacement", year + " " + make + " " + model + " rear brake job", "bedding in new brake pads", v + " brake caliper service"];
  } else if (/\btire|\bflat\b|\bpsi\b|tpms|air pressure|low air|tire pressure|valve stem|nail in|tread|wheel balance|rotate tire/i.test(p)) {
    cat = "tire";
    overview = L("Low tire pressure or a slow leak on a " + v + " is usually a small puncture (nail/screw), a leaking valve stem, or a corroded wheel bead — not the tire itself. First inflate to the PSI on the driver's door-jamb sticker, then find the leak. Most punctures in the tread are a cheap DIY plug; sidewall damage means replacement.",
      "La presión baja o una fuga lenta en un " + v + " suele ser un pinchazo pequeño (clavo/tornillo), una válvula que fuga o un rin corroído en el reborde — no la llanta en sí. Primero infla al PSI del adhesivo en el marco de la puerta del conductor, luego busca la fuga. La mayoría de pinchazos en la banda de rodadura se reparan con un tapón barato; el daño en el costado exige reemplazo.");
    difficulty = DIFF.beg; time = L("15-30 minutes", "15-30 minutos"); diyParts = "$0-$25"; shopLabor = "$20-$45"; laborHrs = [0.2, 0.5]; toolsRange = [0, 25];
    tools = L(["Tire pressure gauge ($5-15)", "Portable inflator or gas-station air", "Tire plug/repair kit ($10-15) for tread punctures", "Spray bottle with soapy water to find the leak"],
      ["Medidor de presión de llantas ($5-15)", "Inflador portátil o aire de gasolinera", "Kit de tapones/reparación ($10-15) para pinchazos en la banda", "Botella con agua jabonosa para hallar la fuga"]);
    parts = L(["Air — free to ~$2 at most stations", "Tire plug kit ($10-15) if there's a tread puncture", "New valve stem/core ($3-8) if the leak is at the valve"],
      ["Aire — gratis a ~$2 en la mayoría de estaciones", "Kit de tapones ($10-15) si hay un pinchazo en la banda", "Válvula/núcleo nuevo ($3-8) si la fuga está en la válvula"]);
    steps = L(["Check the pressure on all four tires with a gauge; compare to the door-jamb spec (often 32-36 PSI).", "Inflate the low tire to spec and listen/look for the leak.", "Spray soapy water over the tread, sidewall, and valve stem — bubbles reveal the leak.", "Valve leak: tighten or replace the valve core/stem. Tread puncture: ream the hole and insert a plug per the kit instructions.", "Re-inflate to the door-jamb PSI and re-check with the gauge.", "If the leak is in the sidewall or near the shoulder, do NOT plug it — the tire must be replaced for safety.", "Reset the TPMS light if needed (drive a few miles or follow the relearn procedure)."],
      ["Mide la presión de las cuatro llantas; compara con la especificación del marco de la puerta (a menudo 32-36 PSI).", "Infla la llanta baja a la especificación y escucha/observa la fuga.", "Rocía agua jabonosa sobre la banda, el costado y la válvula — las burbujas revelan la fuga.", "Fuga en la válvula: aprieta o reemplaza el núcleo/válvula. Pinchazo en la banda: escaria el hoyo e inserta un tapón según las instrucciones del kit.", "Vuelve a inflar al PSI del marco de la puerta y verifica con el medidor.", "Si la fuga está en el costado o cerca del hombro, NO la tapes — hay que reemplazar la llanta por seguridad.", "Reinicia la luz del TPMS si es necesario (maneja unos kilómetros o sigue el procedimiento de reaprendizaje)."]);
    mistakes = L(["Inflating to the number on the tire sidewall (that's the MAX) instead of the door-jamb spec", "Plugging a sidewall puncture — it will not hold and is unsafe; replace the tire instead", "Ignoring a TPMS light after fixing — recheck pressures; a sensor may need a relearn"],
      ["Inflar al número del costado de la llanta (ese es el MÁXIMO) en vez de la especificación del marco de la puerta", "Tapar un pinchazo en el costado — no aguanta y es peligroso; mejor reemplaza la llanta", "Ignorar la luz del TPMS tras reparar — revisa las presiones; un sensor puede necesitar reaprendizaje"]);
    safety = L(["Don't drive far on a very low/flat tire — it can destroy the tire and damage the wheel", "If the tire is shredded or the sidewall is damaged, use the spare and get a replacement", "Chock the wheels and use a jack stand if you need to remove the wheel"],
      ["No manejes lejos con una llanta muy baja/ponchada — puede destruir la llanta y dañar el rin", "Si la llanta está deshecha o el costado dañado, usa la de repuesto y consigue un reemplazo", "Calza las ruedas y usa una torre de seguridad si necesitas quitar la rueda"]);
    yts = [v + " tire plug repair", "how to find a slow tire leak", v + " check tire pressure", "TPMS light reset " + make];
  } else if (/check engine|cel|misfire|rough idle/i.test(p)) {
    cat = "engine";
    overview = L("Check engine light or rough idle on a " + v + engineNote + ". First step: scan codes with an OBD-II reader (free loaner at most parts stores). Most common causes for this category: bad spark plugs/coils, vacuum leak, MAF sensor, or O2 sensor. Do not replace parts blindly.",
      "Luz de motor o ralentí irregular en un " + v + engineNote + ". Primer paso: escanea los códigos con un lector OBD-II (préstamo gratis en muchas tiendas de refacciones). Causas más comunes en esta categoría: bujías/bobinas en mal estado, fuga de vacío, sensor MAF o sensor de O2. No reemplaces piezas a ciegas.");
    difficulty = DIFF.int; time = L("1-3 hours depending on cause", "1-3 horas según la causa"); diyParts = "$15-$300"; shopLabor = "$150-$600"; laborHrs = [1, 3];
    tools = L(["OBD-II scanner (BlueDriver, OBDLink MX+, or free parts store loaner)", "Spark plug socket — verify size on your " + make + " (commonly 5/8\" or 16mm)", "Torque wrench (5-25 ft-lb range for plugs)", "MAF sensor cleaner (CRC brand, NOT carb cleaner)", "Vacuum gauge for advanced diagnosis"],
      ["Escáner OBD-II (BlueDriver, OBDLink MX+ o préstamo gratis de la tienda)", "Dado para bujías — verifica el tamaño en tu " + make + " (comúnmente 5/8\" o 16mm)", "Llave de torque (rango 5-25 lb-pie para bujías)", "Limpiador de sensor MAF (marca CRC, NO limpiador de carburador)", "Vacuómetro para diagnóstico avanzado"]);
    parts = L(["Spark plugs — use the EXACT plug specified for " + year + " " + make + " " + model + engineNote + " (iridium typical, $8-15 each)", "Ignition coils if a misfire follows a coil swap test ($30-80 each)", "MAF sensor cleaner ($8) before replacement ($60-200)", "Air filter ($15-25)"],
      ["Bujías — usa la bujía EXACTA especificada para " + year + " " + make + " " + model + engineNote + " (típicamente iridio, $8-15 c/u)", "Bobinas de encendido si la falla sigue a la bobina en la prueba de intercambio ($30-80 c/u)", "Limpiador de MAF ($8) antes de reemplazarlo ($60-200)", "Filtro de aire ($15-25)"]);
    steps = L(["Scan codes — record ALL stored codes AND pending codes before clearing anything.", "Research codes specific to your engine — P0300 = random misfire, P030X = cylinder X misfire, P0171 = lean bank 1.", "Pull spark plugs first (cheapest check). Look at gap, electrode wear, deposit color.", "Coil swap test: move suspected bad coil to a different cylinder. If misfire follows, coil is bad.", "Smoke test or carb cleaner spray around intake gaskets with engine running. RPM change = vacuum leak.", "Clean MAF sensor with proper MAF cleaner only — touching the wire elements damages them.", "After repairs, clear codes and complete a full drive cycle (50+ miles mixed driving) before re-checking."],
      ["Escanea códigos — anota TODOS los códigos guardados Y los pendientes antes de borrar nada.", "Investiga los códigos específicos de tu motor — P0300 = falla aleatoria, P030X = falla en el cilindro X, P0171 = mezcla pobre banco 1.", "Saca primero las bujías (lo más barato de revisar). Revisa la separación, el desgaste del electrodo y el color de los depósitos.", "Prueba de intercambio de bobina: mueve la bobina sospechosa a otro cilindro. Si la falla la sigue, la bobina está mala.", "Prueba de humo o rocía limpiador de carburador alrededor de las juntas de admisión con el motor encendido. Cambio de RPM = fuga de vacío.", "Limpia el sensor MAF solo con limpiador específico de MAF — tocar los filamentos los daña.", "Tras reparar, borra los códigos y completa un ciclo de manejo completo (50+ millas variadas) antes de revisar de nuevo."]);
    mistakes = [
      ...L(["Replacing parts based on guess instead of scanning codes first — wastes money fast",
        "Using a generic spark plug instead of the one specified for the " + year + " " + make + " " + model + " — wrong heat range causes misfires",
        "Touching the MAF sensor wire elements during cleaning — they're extremely fragile"],
        ["Reemplazar piezas por adivinanza en vez de escanear códigos primero — gasta dinero rápido",
        "Usar una bujía genérica en lugar de la especificada para el " + year + " " + make + " " + model + " — el rango térmico incorrecto causa fallas",
        "Tocar los filamentos del sensor MAF al limpiarlo — son extremadamente frágiles"]),
      ...(quirks.engine || []),
    ];
    safety = [
      ...L(["Disconnect battery negative terminal before any ignition system work",
        "Engine and exhaust components retain heat for 30+ minutes after running — let cool fully",
        "Never run the engine in an enclosed garage — carbon monoxide is deadly"],
        ["Desconecta el borne negativo de la batería antes de trabajar en el sistema de encendido",
        "El motor y el escape retienen calor por 30+ minutos después de funcionar — deja enfriar bien",
        "Nunca enciendas el motor en un garaje cerrado — el monóxido de carbono es mortal"]),
      ...(make === "Ford" && /5\.0|5\.4|6\.2|6\.8/.test(t) ? [L("These Ford modular engines are KNOWN for spark plug breakage in cylinder head — research the technique BEFORE attempting", "Estos motores modulares Ford son CONOCIDOS por romper bujías dentro de la culata — investiga la técnica ANTES de intentarlo")] : []),
    ];
    yts = [v + " check engine light diagnosis", v + " spark plug replacement", year + " " + make + " " + model + " misfire fix", v + " rough idle troubleshooting"];
  } else if (/ac |a\/c|air condition|cold|cool/i.test(p)) {
    cat = "ac";
    const refrig = yr >= 2017 ? L("R-1234yf (newer vehicles)", "R-1234yf (vehículos nuevos)") : L("R-134a (typical for this year)", "R-134a (típico para este año)");
    overview = L("AC not cold on a " + v + engineNote + " usually means low refrigerant from a slow leak. " + (yr >= 2017 ? "This year uses R-1234yf which is significantly more expensive than the older R-134a." : "This year likely uses R-134a, the cheaper, older refrigerant.") + " Common leak points: o-rings at line connections, condenser (front of car, vulnerable to rocks), and evaporator (inside dash).",
      "Que el A/C no enfríe en un " + v + engineNote + " suele indicar refrigerante bajo por una fuga lenta. " + (yr >= 2017 ? "Este año usa R-1234yf, bastante más caro que el antiguo R-134a." : "Este año probablemente usa R-134a, el refrigerante antiguo más barato.") + " Puntos de fuga comunes: o-rings en las conexiones, el condensador (al frente, vulnerable a piedras) y el evaporador (dentro del tablero).");
    difficulty = DIFF.int; time = L("1-2 hours", "1-2 horas"); diyParts = "$30-$300"; shopLabor = "$200-$800"; laborHrs = [1.5, 3];
    tools = L(["AC manifold gauge set rated for " + refrig, "Refrigerant: " + refrig, "UV dye and UV flashlight", "Vacuum pump if system was opened"],
      ["Juego de manómetros de A/C para " + refrig, "Refrigerante: " + refrig, "Tinte UV y linterna UV", "Bomba de vacío si se abrió el sistema"]);
    parts = L(["Refrigerant: " + refrig + " ($15-30/can R-134a; $50-100/can R-1234yf)", "AC compressor if seized ($150-500 for " + make + " " + model + ")", "O-ring kit ($10-20)", "Receiver/accumulator dryer if system was opened ($30-60)"],
      ["Refrigerante: " + refrig + " ($15-30/lata R-134a; $50-100/lata R-1234yf)", "Compresor de A/C si está agarrotado ($150-500 para " + make + " " + model + ")", "Kit de o-rings ($10-20)", "Secador/acumulador si se abrió el sistema ($30-60)"]);
    steps = L(["Connect manifold gauges to LOW (blue) and HIGH (red) service ports. Engine off — both gauges should read static pressure (~80-100 psi at 75°F).", "Start engine, set AC to max with fan high. Low side should drop to 25-40 psi, high side rise to 200-300 psi.", "Low pressure on BOTH sides = low refrigerant. Add one can with UV dye if not already in system.", "Run AC 15 minutes, then inspect ALL connections with UV flashlight. Green/yellow glow = leak point.", "Compressor not engaging? Check the AC fuse first, then test clutch coil resistance with multimeter.", "If system was open to atmosphere, vacuum pump for 30+ minutes minimum before recharging."],
      ["Conecta los manómetros a los puertos de servicio BAJO (azul) y ALTO (rojo). Con el motor apagado, ambos deben marcar presión estática (~80-100 psi a 24°C).", "Enciende el motor, pon el A/C al máximo con el ventilador alto. El lado bajo debe caer a 25-40 psi y el alto subir a 200-300 psi.", "Presión baja en AMBOS lados = refrigerante bajo. Agrega una lata con tinte UV si no lo tiene ya.", "Corre el A/C 15 minutos, luego revisa TODAS las conexiones con la linterna UV. Brillo verde/amarillo = punto de fuga.", "¿El compresor no engancha? Revisa primero el fusible del A/C, luego mide la resistencia de la bobina del embrague con multímetro.", "Si el sistema estuvo abierto al ambiente, haz vacío por 30+ minutos mínimo antes de recargar."]);
    mistakes = [
      ...L(["Overcharging the system — kills the compressor and actually cools WORSE than slightly undercharged"], ["Sobrecargar el sistema — daña el compresor y enfría PEOR que un poco bajo de carga"]),
      es ? (yr >= 2017 ? "Usar R-134a en un sistema diseñado para R-1234yf — es ilegal y daña componentes" : "Mezclar R-134a con otros refrigerantes — tapa el tubo de orificio y contamina el sistema")
         : (yr >= 2017 ? "Trying to use R-134a in a system designed for R-1234yf — illegal and damages components" : "Mixing R-134a with other refrigerants — clogs the orifice tube and contaminates the system"),
      L("Skipping the vacuum step after opening the system — moisture inside kills the compressor and condenser", "Saltarte el vacío tras abrir el sistema — la humedad dentro daña el compresor y el condensador"),
      ...makeMistakes,
    ];
    safety = L(["Refrigerant can cause instant frostbite on skin — wear gloves and eye protection always", "Venting refrigerant to atmosphere is illegal under EPA regulations — recover properly", "High side pressure can exceed 300 psi — keep face away when connecting hoses"],
      ["El refrigerante puede causar congelación instantánea en la piel — usa siempre guantes y protección ocular", "Liberar refrigerante a la atmósfera es ilegal según la EPA — recupéralo correctamente", "La presión del lado alto puede superar 300 psi — mantén la cara lejos al conectar las mangueras"]);
    yts = [year + " " + make + " " + model + " AC not cold diagnosis", v + " AC recharge instructions", v + " AC compressor replacement", v + " refrigerant leak detection"];
  } else if (/battery|won.?t start|no start|crank/i.test(p)) {
    cat = "electrical";
    overview = L("Battery issues or no-start on a " + v + engineNote + " usually means one of: battery is at end of life (typical 3-5 years), alternator isn't charging, parasitic drain, or starter is failing. Always start with a load test before replacing anything.",
      "Problemas de batería o que no arranca en un " + v + engineNote + " suele ser una de estas: batería al final de su vida (típico 3-5 años), alternador que no carga, fuga parásita o marcha (motor de arranque) fallando. Empieza siempre con una prueba de carga antes de reemplazar nada.");
    difficulty = DIFF.beg; time = L("30 min - 2 hours", "30 min - 2 horas"); diyParts = "$30-$300"; shopLabor = "$100-$400"; laborHrs = [0.5, 2];
    tools = L(["Multimeter (any $20+ unit works)", "Battery tester or visit parts store for free load test", "10mm wrench for terminals (verify on your " + make + ")", "Battery terminal cleaner brush", "Anti-corrosion spray or grease"],
      ["Multímetro (cualquiera de $20+ sirve)", "Probador de batería o ve a una tienda para una prueba de carga gratis", "Llave de 10mm para los bornes (verifica en tu " + make + ")", "Cepillo limpiador de bornes", "Spray o grasa anticorrosión"]);
    parts = L(["Battery — verify group size by checking the OLD battery's sticker before buying ($120-250)", "Alternator if charging system test fails ($150-400 plus core charge)", "Battery cables if heavily corroded ($20-80)"],
      ["Batería — verifica el tamaño de grupo revisando el adhesivo de la batería VIEJA antes de comprar ($120-250)", "Alternador si falla la prueba del sistema de carga ($150-400 más cargo por núcleo)", "Cables de batería si están muy corroídos ($20-80)"]);
    steps = L(["Visual inspect terminals: green or white powder = corrosion, clean with brush + baking soda paste.", "Engine OFF: test battery voltage — 12.6V healthy, 12.2V partial charge, below 12V likely failing.", "Start engine: voltage at battery should now read 13.8-14.7V. If unchanged or lower, alternator is not charging.", "If alternator output looks normal but battery dies overnight, you have parasitic drain — disconnect negative cable, use multimeter set to amps in series. Above 50mA at rest = drain.", "For battery replacement: disconnect NEGATIVE first, POSITIVE second. Install in reverse order.", "Clean both terminals and posts with the brush before connecting. Apply anti-corrosion grease."],
      ["Inspecciona los bornes: polvo verde o blanco = corrosión, limpia con cepillo + pasta de bicarbonato.", "Motor APAGADO: mide el voltaje de la batería — 12.6V sana, 12.2V carga parcial, bajo 12V probablemente fallando.", "Enciende el motor: el voltaje en la batería debe marcar 13.8-14.7V. Si no cambia o es menor, el alternador no carga.", "Si el alternador se ve normal pero la batería se descarga de noche, tienes fuga parásita — desconecta el cable negativo y usa el multímetro en amperios en serie. Más de 50mA en reposo = fuga.", "Para cambiar la batería: desconecta primero el NEGATIVO, luego el POSITIVO. Instala en orden inverso.", "Limpia ambos bornes y postes con el cepillo antes de conectar. Aplica grasa anticorrosión."]);
    mistakes = [
      ...L(["Disconnecting positive terminal first — risks shorting tools against the car body",
        "Not securing the new battery's hold-down clamp tight — vibration kills batteries in months",
        "Replacing the battery without testing the alternator — common waste of $150"],
        ["Desconectar primero el borne positivo — arriesga hacer corto con las herramientas contra la carrocería",
        "No apretar bien la abrazadera de sujeción de la batería nueva — la vibración mata baterías en meses",
        "Reemplazar la batería sin probar el alternador — desperdicio común de $150"]),
      ...makeMistakes,
    ];
    safety = [
      ...L(["Lead-acid batteries vent hydrogen gas — no open flames or sparks nearby",
        "Battery acid is corrosive — eye protection is mandatory when working near terminals",
        "If terminals spark when reconnecting, something is drawing power — disconnect and find the cause before continuing"],
        ["Las baterías de plomo-ácido liberan gas hidrógeno — sin llamas ni chispas cerca",
        "El ácido de batería es corrosivo — la protección ocular es obligatoria al trabajar cerca de los bornes",
        "Si los bornes chispean al reconectar, algo consume corriente — desconecta y halla la causa antes de continuar"]),
      ...(yr >= 2015 ? [L("This model year may require battery registration via OBD scan tool after replacement — check service manual", "Este año puede requerir registrar la batería con un escáner OBD tras el reemplazo — revisa el manual")] : []),
    ];
    yts = [v + " battery replacement", year + " " + make + " " + model + " alternator test", v + " parasitic battery drain", v + " starter replacement"];
  } else {
    cat = "generic";
    overview = L("For a " + v + engineNote + " with the symptom \"" + problem + "\", use systematic diagnosis: simplest, cheapest checks first (fluid levels, fuses, OBD codes) before replacing any parts. Search the symptom + your exact vehicle on owner forums — there's usually a specific known issue.",
      "Para un " + v + engineNote + " con el síntoma \"" + problem + "\", usa un diagnóstico sistemático: primero lo más simple y barato (niveles de fluidos, fusibles, códigos OBD) antes de reemplazar piezas. Busca el síntoma + tu vehículo exacto en foros de dueños — suele haber un problema conocido específico.");
    difficulty = DIFF.int; time = L("2-4 hours diagnosis + repair", "2-4 horas diagnóstico + reparación");
    tools = L(["OBD-II scanner for any check engine light", "Basic metric socket set (8-19mm)", "Jack and jack stands rated for the " + make, "Multimeter", "Factory service manual or Mitchell1/AllData subscription for " + year + " " + make + " " + model],
      ["Escáner OBD-II para cualquier luz de motor", "Juego básico de dados métricos (8-19mm)", "Gato y torres de seguridad para el " + make, "Multímetro", "Manual de servicio de fábrica o suscripción Mitchell1/AllData para " + year + " " + make + " " + model]);
    parts = L(["Do not buy parts until diagnosis is confirmed — most common waste in DIY repair", "Stock up on common consumables: oil, coolant, transmission fluid (use ONLY the spec listed on dipstick or cap for this vehicle)"],
      ["No compres piezas hasta confirmar el diagnóstico — el desperdicio más común al reparar uno mismo", "Ten a mano consumibles comunes: aceite, anticongelante, líquido de transmisión (usa SOLO la especificación indicada en la varilla o tapa de este vehículo)"]);
    steps = L(["Document the symptom precisely — when, how often, any sound/smell/feel, any related dashboard lights.", "Scan for codes with an OBD-II reader if the check engine light is on.", "Search '" + year + " " + make + " " + model + " " + (problem.slice(0, 30) || "issue") + "' on owner forums — there's almost always a known fix for popular models.", "Watch 2-3 YouTube diagnosis videos on your EXACT vehicle and trim — generic guides often miss model-specific quirks.", "Start with the cheapest, simplest checks before moving to expensive parts.", "Confirm diagnosis with a second test before spending money — multimeter test, swap test, or vacuum test.", "If unsure, pay a trusted mechanic for diagnosis only (~$80-150) and then DIY the actual repair."],
      ["Documenta el síntoma con precisión — cuándo, qué tan seguido, cualquier sonido/olor/sensación, cualquier luz del tablero relacionada.", "Escanea códigos con un lector OBD-II si la luz de motor está encendida.", "Busca '" + year + " " + make + " " + model + " " + (problem.slice(0, 30) || "problema") + "' en foros de dueños — casi siempre hay una solución conocida para modelos populares.", "Mira 2-3 videos de diagnóstico en YouTube de tu vehículo y versión EXACTOS — las guías genéricas suelen omitir detalles del modelo.", "Empieza por lo más barato y simple antes de pasar a piezas caras.", "Confirma el diagnóstico con una segunda prueba antes de gastar — multímetro, intercambio o prueba de vacío.", "Si tienes dudas, paga a un mecánico de confianza solo por el diagnóstico (~$80-150) y luego haz tú la reparación."]);
    mistakes = [
      ...L(["Throwing parts at the problem without proper diagnosis — single biggest DIY mistake",
        "Ignoring other symptoms that could point to the actual root cause",
        "Skipping factory torque specs and procedures — many repairs have specific sequences"],
        ["Cambiar piezas sin un diagnóstico adecuado — el error número uno al reparar uno mismo",
        "Ignorar otros síntomas que podrían señalar la verdadera causa raíz",
        "Saltarte los pares y procedimientos de fábrica — muchas reparaciones tienen secuencias específicas"]),
      ...makeMistakes,
    ];
    safety = L(["Use proper PPE: safety glasses always, gloves for chemicals, dust mask for brakes", "Never work on hot exhaust or engine components — wait minimum 30 minutes after running", "Use jack stands rated for the vehicle weight — never work under a vehicle on just a jack"],
      ["Usa EPP adecuado: gafas de seguridad siempre, guantes para químicos, mascarilla para frenos", "Nunca trabajes en escape o motor caliente — espera mínimo 30 minutos tras funcionar", "Usa torres de seguridad para el peso del vehículo — nunca trabajes bajo un auto solo con el gato"]);
    yts = [v + " " + problem.slice(0, 40) + " diagnosis", year + " " + make + " " + model + " common problems", v + " repair forum", problem.slice(0, 50) + " " + make + " troubleshooting"];
  }

  // ── State-aware cost model ──
  // Parts are roughly national but carry a modest regional markup; shop labor = hours x the
  // state's hourly rate (the big driver of the DIY-vs-shop gap). DIY tools also scale regionally.
  const _rate = getLR(stateCode) || { lo: 90, hi: 150 };
  const _pNums = (diyParts.match(/\d+/g) || ["50", "200"]).map(Number);
  const partsLo = _pNums[0], partsHi = _pNums[_pNums.length - 1];
  const pm = Math.max(0.92, Math.min(1.5, (_rate.lo + _rate.hi) / 220)); // regional cost multiplier
  const dPartsLo = Math.round(partsLo * pm), dPartsHi = Math.round(partsHi * pm);
  const toolsLo = Math.round(toolsRange[0] * pm), toolsHi = Math.round(toolsRange[1] * pm);            // DIY tools (one-time)
  const laborLo = Math.round(laborHrs[0] * _rate.lo);
  const laborHi = Math.round(laborHrs[1] * _rate.hi);
  const diyLo = dPartsLo, diyHi = dPartsHi + toolsHi;          // DIY = parts + tools
  const shopLo = dPartsLo + laborLo, shopHi = dPartsHi + laborHi; // Shop = parts + labor
  const saveLo = Math.max(0, shopLo - diyHi), saveHi = Math.max(0, shopHi - diyLo);
  const money = (a, b) => "$" + a + "-$" + b;
  const totalDIY = money(diyLo, diyHi);
  const savings = money(saveLo, saveHi);
  const diyPartsRegional = money(dPartsLo, dPartsHi);
  const shopLaborRegional = money(laborLo, laborHi) + L(" (" + laborHrs[0] + "-" + laborHrs[1] + " hrs at $" + _rate.lo + "-$" + _rate.hi + "/hr)", " (" + laborHrs[0] + "-" + laborHrs[1] + " h a $" + _rate.lo + "-$" + _rate.hi + "/h)");
  const totalShop = money(shopLo, shopHi);
  const toolsRegional = money(toolsLo, toolsHi) + L(" (one-time; many DIYers already own these)", " (única vez; muchos ya las tienen)");

  // Category-aware diagnosis steps, pro tips, and "when to stop" guidance
  const DIAGNOSIS = {
    suspension: L(["With the car parked, push down hard on each corner and release — a worn strut mount or shock lets the car bounce more than once.", "Have a helper rock the steering wheel back and forth while you watch/listen at each front wheel — a clunk that tracks with steering points to strut mounts or tie rods, not sway bar links.", "Jack up the front and grab each wheel at 12 and 6 o'clock, then 3 and 9 — play at 12/6 suggests ball joints/wheel bearing, play at 3/9 suggests tie rod.", "Grab each sway bar end link by hand and shake — any free play confirms a worn link (the cheapest, most common cause)."],
      ["Con el auto estacionado, empuja con fuerza cada esquina y suelta — una base de amortiguador o amortiguador gastado deja que el auto rebote más de una vez.", "Pide a alguien que mueva el volante de lado a lado mientras observas/escuchas en cada rueda delantera — un golpeteo que sigue a la dirección apunta a bases de amortiguador o terminales, no a bieletas.", "Levanta el frente y sujeta cada rueda a las 12 y 6, luego a las 3 y 9 — juego en 12/6 sugiere rótulas/balero, juego en 3/9 sugiere terminal.", "Sujeta cada bieleta de la barra estabilizadora a mano y muévela — cualquier juego confirma una bieleta gastada (la causa más barata y común)."]),
    brakes: L(["Note WHEN the noise happens: constant squeal that stops when braking = wear indicators (replace pads). Grinding while braking = metal-on-metal (stop driving).", "Feel the brake pedal: pulsation through the pedal under braking points to warped rotors or uneven deposits, not pads.", "After a short drive, carefully feel each wheel for heat — one much hotter wheel suggests a sticking caliper.", "Pull a wheel and measure pad thickness; under ~3mm means replacement is due."],
      ["Nota CUÁNDO ocurre el ruido: chirrido constante que se detiene al frenar = indicadores de desgaste (cambia pastillas). Rechinido al frenar = metal con metal (deja de manejar).", "Siente el pedal: la pulsación al frenar apunta a discos deformados o depósitos disparejos, no a las pastillas.", "Tras un viaje corto, palpa con cuidado el calor de cada rueda — una mucho más caliente sugiere un cáliper trabado.", "Quita una rueda y mide el grosor de la pastilla; bajo ~3mm toca reemplazar."]),
    engine: L(["Scan for OBD-II codes first (free at most parts stores). Record ALL stored and pending codes before clearing anything.", "Research the exact code for THIS engine — P0300 is a random misfire, P030X points to a specific cylinder, P0171 is a lean condition.", "If a misfire code, do a coil-swap test: move the suspected coil to a different cylinder and rescan — if the misfire follows the coil, the coil is bad.", "Spray a little carb cleaner around the intake gaskets with the engine idling; an RPM change reveals a vacuum leak."],
      ["Primero escanea códigos OBD-II (gratis en muchas tiendas). Anota TODOS los códigos guardados y pendientes antes de borrar nada.", "Investiga el código exacto para ESTE motor — P0300 es falla aleatoria, P030X señala un cilindro específico, P0171 es mezcla pobre.", "Si es código de falla, haz la prueba de intercambio de bobina: mueve la bobina sospechosa a otro cilindro y reescanea — si la falla sigue a la bobina, está mala.", "Rocía un poco de limpiador de carburador alrededor de las juntas de admisión en ralentí; un cambio de RPM revela una fuga de vacío."]),
    ac: L(["Connect a manifold gauge set to the low and high service ports with the engine off — both should read equal static pressure (~80-100 psi at 75F).", "Start the engine, set AC to max — the low side should drop to ~25-40 psi and high side rise to ~200-300 psi. Low on both = low refrigerant.", "Add refrigerant with UV dye, run the system 15 minutes, then inspect all line connections with a UV flashlight for a glowing leak point.", "If the compressor clutch never engages, check the AC fuse/relay first, then the clutch coil resistance with a multimeter."],
      ["Conecta los manómetros a los puertos bajo y alto con el motor apagado — ambos deben marcar igual presión estática (~80-100 psi a 24°C).", "Enciende el motor, A/C al máximo — el lado bajo debe caer a ~25-40 psi y el alto subir a ~200-300 psi. Bajo en ambos = refrigerante bajo.", "Agrega refrigerante con tinte UV, corre el sistema 15 minutos y revisa las conexiones con linterna UV buscando un punto brillante de fuga.", "Si el embrague del compresor nunca engancha, revisa primero el fusible/relé del A/C, luego la resistencia de la bobina del embrague con multímetro."]),
    electrical: L(["With the engine off, measure battery voltage: 12.6V healthy, 12.2V partial charge, below 12V likely failing.", "Start the engine and measure again at the battery — 13.8-14.7V means the alternator is charging; unchanged means it isn't.", "If the battery drains overnight, disconnect the negative cable and put a multimeter (amps) in series — over ~50mA at rest indicates a parasitic drain.", "Take the battery to any parts store for a free load test before buying a replacement."],
      ["Con el motor apagado, mide el voltaje de la batería: 12.6V sana, 12.2V carga parcial, bajo 12V probablemente fallando.", "Enciende el motor y mide de nuevo en la batería — 13.8-14.7V indica que el alternador carga; sin cambio indica que no.", "Si la batería se descarga de noche, desconecta el cable negativo y pon un multímetro (amperios) en serie — más de ~50mA en reposo indica fuga parásita.", "Lleva la batería a cualquier tienda para una prueba de carga gratis antes de comprar reemplazo."]),
    generic: L(["Document the symptom precisely: when it happens, how often, any sounds/smells, and any dashboard lights.", "If the check-engine light is on, scan for codes with an OBD-II reader before anything else.", "Search '" + year + " " + make + " " + model + " " + (problem.slice(0, 30) || "issue") + "' on owner forums — popular models usually have a documented known fix.", "Confirm the diagnosis with a second independent test (multimeter, swap test, or visual) before spending money on parts."],
      ["Documenta el síntoma con precisión: cuándo ocurre, qué tan seguido, sonidos/olores y luces del tablero.", "Si la luz de motor está encendida, escanea códigos con un lector OBD-II antes que nada.", "Busca '" + year + " " + make + " " + model + " " + (problem.slice(0, 30) || "problema") + "' en foros de dueños — los modelos populares suelen tener una solución documentada.", "Confirma el diagnóstico con una segunda prueba independiente (multímetro, intercambio o visual) antes de gastar en piezas."]),
    ride: L(["Bounce test: push down hard on each corner and release — more than one rebound means that shock/strut is worn.", "Look behind each wheel for oil streaks down the strut/shock body — leaking dampers are done.", "Compare ride height side-to-side; a sagging corner suggests a tired spring.", "Note when it bottoms out (over bumps, when loaded, braking) to confirm dampers vs springs."],
      ["Prueba de rebote: empuja con fuerza cada esquina y suelta — más de un rebote significa que ese amortiguador/strut está gastado.", "Busca tras cada rueda chorros de aceite por el cuerpo del strut/amortiguador — los amortiguadores con fuga están acabados.", "Compara la altura de manejo de lado a lado; una esquina hundida sugiere un resorte vencido.", "Nota cuándo se va al fondo (en baches, cargado, al frenar) para confirmar amortiguadores vs resortes."]),
    tire: L(["Check all four pressures cold against the door-jamb sticker (not the tire sidewall max).", "Inflate the low tire and spray soapy water over tread, sidewall, and valve — bubbles show the leak.", "Mark the leak; tread punctures are pluggable, sidewall/shoulder damage is not.", "Re-check pressure after an hour and again the next day to confirm the fix held."],
      ["Mide las cuatro presiones en frío contra el adhesivo del marco de la puerta (no el máximo del costado).", "Infla la llanta baja y rocía agua jabonosa sobre banda, costado y válvula — las burbujas muestran la fuga.", "Marca la fuga; los pinchazos en la banda se pueden tapar, el daño en costado/hombro no.", "Revisa la presión una hora después y de nuevo al día siguiente para confirmar que la reparación aguantó."]),
  };
  const TIPS = {
    suspension: L(["Soak all suspension fasteners with penetrating oil and wait 15+ minutes — rusted end-link studs snap easily if you rush.", "Replace end links in pairs; mismatched old/new links wear unevenly.", "After any control-arm or tie-rod work, get a 4-wheel alignment — it protects your new tires."],
      ["Remoja todos los tornillos de la suspensión con aceite penetrante y espera 15+ minutos — los pernos oxidados de las bieletas se rompen fácil si te apuras.", "Cambia las bieletas en pares; mezclar viejas y nuevas causa desgaste disparejo.", "Tras cualquier trabajo de brazo de control o terminal, haz una alineación de 4 ruedas — protege tus llantas nuevas."]),
    brakes: L(["Bed in new pads: 5 moderate stops from 30→5 mph, then 3 harder stops from 60→20 mph, letting them cool between. This prevents squeal and glazing.", "Always replace the hardware/clip kit with new pads — old clips are the #1 cause of brake squeal.", "Apply a thin film of silicone caliper grease to slide pins, never on the friction surface."],
      ["Asienta las pastillas nuevas: 5 frenadas moderadas de 30→5 mph, luego 3 más fuertes de 60→20 mph, dejándolas enfriar entre cada una. Evita chirrido y cristalización.", "Cambia siempre el kit de herrajes/clips con las pastillas nuevas — los clips viejos son la causa #1 del chirrido.", "Aplica una capa fina de grasa de silicona a los pasadores, nunca en la superficie de fricción."]),
    engine: L(["Use the exact spark plug specified for this engine and gap it correctly — wrong heat range causes misfires.", "Clean the MAF sensor only with MAF-specific cleaner; the wire elements are fragile.", "After clearing codes, complete a full drive cycle (~50 mixed miles) before re-checking readiness."],
      ["Usa la bujía exacta especificada para este motor y ajusta bien la separación — el rango térmico incorrecto causa fallas.", "Limpia el sensor MAF solo con limpiador específico de MAF; los filamentos son frágiles.", "Tras borrar códigos, completa un ciclo de manejo completo (~50 millas variadas) antes de revisar la disponibilidad."]),
    ac: L(["Slightly undercharged cools better than overcharged — add refrigerant slowly and watch the gauges.", "If the system was opened to the atmosphere, vacuum it for 30+ minutes to remove moisture before recharging.", "Always replace O-rings and the receiver/drier if the system was open for any length of time."],
      ["Un poco bajo de carga enfría mejor que sobrecargado — agrega refrigerante despacio y observa los manómetros.", "Si el sistema se abrió al ambiente, hazle vacío 30+ minutos para sacar la humedad antes de recargar.", "Reemplaza siempre los o-rings y el secador si el sistema estuvo abierto cualquier tiempo."]),
    electrical: L(["Disconnect the negative terminal first and reconnect it last to avoid shorting tools against the body.", "Clean both terminals and posts with a wire brush and apply dielectric grease to prevent corrosion.", "On 2015+ vehicles, the new battery may need to be registered with a scan tool or it won't charge correctly."],
      ["Desconecta el borne negativo primero y reconéctalo al último para evitar cortos con las herramientas contra la carrocería.", "Limpia ambos bornes y postes con cepillo de alambre y aplica grasa dieléctrica para prevenir corrosión.", "En vehículos 2015+, la batería nueva puede necesitar registrarse con un escáner o no cargará bien."]),
    generic: L(["Take phone photos at each step of disassembly — they're invaluable during reassembly.", "Bag and label fasteners by step so nothing gets mixed up.", "Buy or borrow the factory service manual (or an AllData/Mitchell1 subscription) for exact specs."],
      ["Toma fotos con el celular en cada paso del desarmado — son invaluables al armar de nuevo.", "Embolsa y etiqueta los tornillos por paso para no revolver nada.", "Compra o pide prestado el manual de servicio de fábrica (o una suscripción AllData/Mitchell1) para especificaciones exactas."]),
    ride: L(["Buy loaded 'quick strut' assemblies — they skip the dangerous spring-compressor step entirely.", "Replace shocks/struts in axle pairs and budget for an alignment afterward.", "Spray strut bolts with penetrating oil the night before; they're notoriously seized."],
      ["Compra conjuntos 'quick strut' armados — evitan por completo el peligroso paso del compresor de resortes.", "Cambia amortiguadores/struts en pares por eje y presupuesta una alineación después.", "Rocía los pernos del strut con aceite penetrante la noche anterior; son famosos por agarrotarse."]),
    tire: L(["Set pressure when tires are COLD; driving warms them and reads ~3-4 PSI high.", "Keep a $15 plug kit and a 12V inflator in the trunk — most roadside flats become a 15-minute fix.", "A plug is a proven long-term tread repair; a sidewall puncture always means a new tire."],
      ["Ajusta la presión con las llantas FRÍAS; manejar las calienta y marca ~3-4 PSI de más.", "Lleva un kit de tapones de $15 y un inflador de 12V en la cajuela — la mayoría de ponchaduras en carretera se arreglan en 15 minutos.", "Un tapón es una reparación duradera y comprobada en la banda; un pinchazo en el costado siempre significa llanta nueva."]),
  };
  const WHEN_STOP = {
    suspension: L("If you find damaged ball joints, bent control arms, or any cracked subframe component, stop — these affect steering safety and need professional inspection and alignment.", "Si encuentras rótulas dañadas, brazos de control doblados o algún componente del subchasis agrietado, detente — afectan la seguridad de la dirección y requieren inspección y alineación profesional."),
    brakes: L("If the brake pedal goes to the floor, you see brake fluid leaking, or the ABS light stays on after the job, stop driving and have it professionally inspected — braking is safety-critical.", "Si el pedal se va al fondo, ves fuga de líquido de frenos o la luz de ABS queda encendida tras el trabajo, deja de manejar y haz que un profesional lo inspeccione — el frenado es crítico para la seguridad."),
    engine: L("If you have internal engine codes (low compression, timing, or knock), or the misfire persists after plugs and coils, stop and get a professional diagnosis before risking further damage.", "Si tienes códigos internos del motor (compresión baja, distribución o cascabeleo), o la falla persiste tras bujías y bobinas, detente y consigue un diagnóstico profesional antes de arriesgar más daño."),
    ac: L("If the system needs to be opened beyond a recharge, or you don't have recovery equipment, take it to a shop — venting refrigerant is illegal and high-side pressure can injure you.", "Si hay que abrir el sistema más allá de una recarga, o no tienes equipo de recuperación, llévalo a un taller — liberar refrigerante es ilegal y la presión del lado alto puede lesionarte."),
    electrical: L("If you find melted wiring, repeated blown fuses, or a drain you can't isolate, stop and get a professional — electrical faults can cause fires.", "Si encuentras cableado derretido, fusibles que se queman repetidamente o una fuga que no puedes aislar, detente y busca un profesional — las fallas eléctricas pueden causar incendios."),
    generic: L("If the diagnosis is unclear after basic testing, or the repair involves safety-critical systems (brakes, steering, fuel, airbags) you're not confident in, pay a trusted mechanic for a diagnosis and reassess.", "Si el diagnóstico no queda claro tras pruebas básicas, o la reparación involucra sistemas críticos (frenos, dirección, combustible, airbags) en los que no confías, paga a un mecánico de confianza por el diagnóstico y reevalúa."),
    ride: L("If you'd be reusing springs and don't have a proper spring compressor, stop — a slipping loaded spring can cause serious injury. Let a shop handle bare-strut spring transfers.", "Si vas a reutilizar resortes y no tienes un compresor de resortes adecuado, detente — un resorte cargado que se zafa puede causar lesiones graves. Deja que un taller haga el cambio de resortes en struts desnudos."),
    tire: L("If the damage is in the sidewall or shoulder, the tire is shredded, or the wheel itself is bent/leaking at the bead, don't plug it — install the spare and replace the tire.", "Si el daño está en el costado o el hombro, la llanta está deshecha, o el rin está doblado/fugando en el reborde, no la tapes — pon la de repuesto y reemplaza la llanta."),
  };

  const REPAIR_TARGETS = {
    suspension: "front sway bar end links",
    brakes: "brake pads and rotors",
    engine: "spark plugs and ignition coils",
    ac: "AC refrigerant and compressor",
    electrical: "car battery and alternator",
    ride: "front strut assemblies",
    tire: "tire plug kit and valve stem",
    generic: (problem || "").split(" ").slice(0, 5).join(" "),
  };

  return {
    overview, difficulty, time,
    repair_target: REPAIR_TARGETS[cat] || REPAIR_TARGETS.generic,
    difficulty_reason: difficulty === DIFF.beg ? L("Standard tools, accessible location, low risk if you follow instructions.", "Herramientas estándar, ubicación accesible, bajo riesgo si sigues las instrucciones.") : difficulty === DIFF.adv ? L("Requires specialty tools, programming, or experience to do safely.", "Requiere herramientas especiales, programación o experiencia para hacerlo con seguridad.") : L("Requires some mechanical confidence and standard hand tools — manageable with care.", "Requiere algo de confianza mecánica y herramientas de mano estándar — manejable con cuidado."),
    diagnosis: DIAGNOSIS[cat] || DIAGNOSIS.generic,
    cost: {
      diy_parts: diyPartsRegional,
      tools: toolsRegional,
      total_diy: totalDIY,
      shop_labor: shopLaborRegional,
      total_shop: totalShop,
      savings: savings,
    },
    tools, parts, steps, mistakes, safety,
    tips: TIPS[cat] || TIPS.generic,
    when_to_stop: WHEN_STOP[cat] || WHEN_STOP.generic,
    youtube_searches: yts,
    _template: true,
  };
}

async function callAI(year,make,model,trim,problem,stateCode,lang,externalSignal){
  if(_sessionCalls>=SESSION_MAX)throw new Error("session_limit");
  const rate=getLR(stateCode),sn=getSN(stateCode);
  const ascii=s=>String(s||"").replace(/[\u2010-\u2015]/g,"-").replace(/[\u2018\u2019]/g,"'").replace(/[\u201C\u201D]/g,'"').replace(/[^\x20-\x7E\n]/g,"");
  const rLine=rate?(" Location: "+ascii(sanitize(sn,30))+", labor rate $"+rate.lo+"-$"+rate.hi+"/hr."):"";
  const langInstr=lang==="es"?"\nWRITE ALL STRING VALUES IN SPANISH. Keep JSON keys in English.":"";
  const trimLine=trim?(" Trim/Engine: "+ascii(sanitize(trim,60))+"."):"";

  const prompt=ascii(
    "You are a master auto mechanic and ASE-certified technician with 25+ years of hands-on experience. You explain repairs clearly enough that a careful beginner can follow, while including the depth a pro would want.\n\n"+
    "Vehicle: "+sanitize(year,4)+" "+sanitize(make,30)+" "+sanitize(model,MAX_MODEL)+trimLine+"\n"+
    "Problem: "+sanitize(problem,MAX_PROBLEM)+rLine+langInstr+"\n\n"+
    "Generate a thorough, vehicle-specific repair guide as a JSON object. Use the trim/engine info to give exact torque specs, fluid types/capacities, common failure points, and known issues for THIS engine. Format:\n"+
    "{\"overview\":\"2-4 sentences: what's likely wrong, the most probable root cause for THIS vehicle, and what the repair involves\","+
    "\"repair_target\":\"the SINGLE most likely specific part or repair in short searchable terms — e.g. 'front sway bar end links', 'front brake pads and rotors', 'alternator', 'ignition coil'. This drives parts/forum/video searches, so be precise.\","+
    "\"difficulty\":\"Beginner|Intermediate|Advanced\",\"time\":\"realistic range e.g. 2-4 hours\",\"difficulty_reason\":\"1-2 sentences explaining the rating\","+
    "\"diagnosis\":[\"3-6 ordered steps to CONFIRM the root cause before buying parts — specific tests, what readings/symptoms confirm or rule out each cause, which OBD-II codes matter and what they mean for this engine\"],"+
    "\"cost\":{\"diy_parts\":\"$X-$Y\",\"tools\":\"$X-$Y\",\"total_diy\":\"$X-$Y\",\"shop_labor\":\"$X-$Y"+(rate?" at $"+rate.lo+"-$"+rate.hi+"/hr":"")+"\",\"total_shop\":\"$X-$Y\",\"savings\":\"$X-$Y\"},"+
    "\"tools\":[\"each tool WITH the specific size/spec needed, e.g. '10mm + 13mm sockets', 'torque wrench (10-100 ft-lb)'\"],"+
    "\"parts\":[\"each part with OEM vs aftermarket note and a rough price, e.g. 'Front sway bar end links (Moog K80xxx, ~$25-50/pair)'\"],"+
    "\"steps\":[\"fallback single list ONLY if removal/installation split does not apply\"],"+
    "\"removal_steps\":[\"5-12 SHORT scannable bullet steps to REMOVE the failed part. Each 1-2 sentences: the action plus the exact torque/measurement or a step-specific warning. A beginner should be able to follow without getting stuck.\"],"+
    "\"installation_steps\":[\"5-12 SHORT scannable bullet steps to INSTALL the new part and VERIFY the fix — include torque specs, any reset/relearn procedure, and the final test-drive/confirmation step.\"],"+
    "\"mistakes\":[\"4-6 mistakes UNIQUE to this make/model/year — known failure points, model-specific gotchas, year-range recalls/TSBs, what people commonly get wrong on THIS engine\"],"+
    "\"safety\":[\"4-6 safety warnings, including model-specific ones (electronic parking brake service mode, battery registration, hybrid high-voltage precautions, refrigerant type, etc.)\"],"+
    "\"tips\":[\"2-4 pro tips that make the job easier or prevent comebacks — torque sequences, penetrating-oil soak times, alignment notes, reset/relearn procedures\"],"+
    "\"when_to_stop\":\"1-2 sentences: the specific signs that mean this is beyond a DIY repair and should go to a professional\","+
    "\"youtube_searches\":[\"4 search terms tuned to THIS exact vehicle and repair\"]}\n\n"+
    "Be SPECIFIC to this exact vehicle — real torque values, real part numbers where you know them, real failure points. Avoid generic advice that applies to any car. Respond with ONLY the JSON object — no markdown, no preamble."
  );

  const extractJSON=(raw)=>{
    if(!raw||typeof raw!=="string")return null;
    let t=raw.trim().replace(/^```(?:json)?\s*\n?/i,"").replace(/\n?```\s*$/,"").trim();
    const start=t.indexOf("{"),end=t.lastIndexOf("}");
    if(start<0||end<=start)return null;
    try{return JSON.parse(t.slice(start,end+1));}catch{return null;}
  };
  const valid=(obj)=>obj&&typeof obj==="object"&&!!(obj.overview||obj.difficulty||obj.cost||(Array.isArray(obj.steps)&&obj.steps.length));

  const errChain=[];

  // ── First try: backend Edge Function (works on deployed Vercel/Netlify) ──
  try {
    console.log("[FixCost] trying /api/generate backend");
    const r = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year, make, model, trim, problem, stateCode, lang }),
      signal: externalSignal
    });
    if (r.ok) {
      const data = await r.json();
      const text = data?.result || data?.text || "";
      const obj = extractJSON(text);
      if (valid(obj)) {
        _sessionCalls++;
        console.log("[FixCost] ✓ AI success via /api/generate");
        return { sections: jsonToSections(obj, lang, {year,make,model,trim,problem}), raw: JSON.stringify(obj), template: false };
      }
      errChain.push("/api/generate: response not valid JSON");
    } else if (r.status !== 404) {
      // 404 = no backend deployed, silently skip. Other errors are worth logging.
      errChain.push("/api/generate: HTTP " + r.status);
    }
  } catch (e) {
    // Network error or no /api endpoint (artifact runtime) — silently fall through
    if (!String(e?.message || "").includes("404")) {
      errChain.push("/api/generate: " + (e?.message || "err").slice(0, 50));
    }
  }

  // ── Second try: direct fetch to api.anthropic.com (works in artifact runtime only) ──
  for (const m of ["claude-sonnet-4-20250514", "claude-haiku-4-5-20251001", "claude-3-5-sonnet-20241022"]) {
    try {
      console.log("[FixCost] fetch with " + m);
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: m, max_tokens: 4096, messages: [{ role: "user", content: prompt }] })
      });
      const data = await r.json();
      if (data?.error) { errChain.push(m + ": " + (data.error.message || data.error.type)); continue; }
      const blocks = Array.isArray(data?.content) ? data.content : [];
      const text = blocks.filter(b => b && (b.type === "text" || typeof b.text === "string")).map(b => b.text || "").join("\n");
      const obj = extractJSON(text);
      if (valid(obj)) {
        _sessionCalls++;
        console.log("[FixCost] ✓ AI success via fetch with " + m);
        return { sections: jsonToSections(obj, lang, {year,make,model,trim,problem}), raw: JSON.stringify(obj), template: false };
      }
      errChain.push(m + ": response not valid JSON");
    } catch (e) {
      errChain.push(m + ": " + (e?.message || "err").slice(0, 50));
    }
  }

  // ── Fallback: client-side template generator ──
  console.warn("[FixCost] All AI attempts failed. Using template generator. Errors:", errChain);
  const obj = templateGuide(year, make, model, trim, problem, stateCode, lang);
  return { sections: jsonToSections(obj, lang, {year,make,model,trim,problem}), raw: JSON.stringify(obj), template: true };
}

async function fetchYT(terms,key,signal){
  if(!key||!terms.length)return[];
  const seen=new Set(),results=[];
  for(const term of terms.slice(0,2)){
    if(signal?.aborted)break;
    try{
      const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),8000);
      const r=await fetch("https://www.googleapis.com/youtube/v3/search?part=snippet&q="+encodeURIComponent(sanitize(term,150))+"&type=video&maxResults=3&key="+encodeURIComponent(key)+"&relevanceLanguage=en",{signal:ctrl.signal});
      clearTimeout(timer);
      const d=await r.json();
      if(!r.ok||d.error)break;
      for(const it of(d.items||[]))if(!seen.has(it.id.videoId)&&results.length<4){seen.add(it.id.videoId);results.push(it);}
    }catch{}
  }
  return results;
}

function parseSec(text){const secs=[];let cur=null;for(const l of text.split("\n")){const m=l.match(/^##\s+(.+)/);if(m){if(cur)secs.push(cur);cur={title:m[1].trim().slice(0,80),lines:[]};}else if(cur&&l.trim())cur.lines.push(l.slice(0,500));}if(cur)secs.push(cur);return secs;}
// Universal parser — accepts either JSON (current format) or legacy markdown text
function resultToSections(raw,lang,ctx){
  if(!raw)return [];
  // Try JSON first (current saved format)
  if(typeof raw==="string"&&raw.trim().startsWith("{")){
    try{const obj=JSON.parse(raw);if(obj&&typeof obj==="object")return jsonToSections(obj,lang,ctx);}catch{}
  }
  // Fall back to legacy markdown
  return parseSec(typeof raw==="string"?raw:String(raw));
}
const extractDiff=secs=>{const s=secs.find(s=>s.title.toLowerCase().includes("difficulty"));if(!s)return null;const t=s.lines.join(" ");return/beginner/i.test(t)?"Beginner":/advanced/i.test(t)?"Advanced":"Intermediate";};
const extractYT=secs=>{const s=secs.find(s=>s.title.toLowerCase().includes("youtube"));if(!s)return[];return s.lines.filter(l=>l.trim().startsWith("-")).map(l=>l.replace(/^-\s*/,"").trim().slice(0,200)).filter(Boolean).slice(0,4);};
const partsQ=(y,mk,mo,p,rt)=>{const target=(rt&&String(rt).trim())?String(rt).trim():String(p||"").split(" ").slice(0,4).join(" ");return sanitize(y+" "+mk+" "+mo+" "+target,100);};
const secText=sec=>sec.title+"\n"+sec.lines.map(l=>l.replace(/\*\*/g,"")).join("\n");

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;800;900&family=Barlow:wght@400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:#080808;color:#e8e8e8;font-family:'Barlow',sans-serif;-webkit-font-smoothing:antialiased}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#0a0a0a}::-webkit-scrollbar-thumb{background:#222;border-radius:3px}::-webkit-scrollbar-thumb:hover{background:#e84a2a}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}html{scroll-behavior:auto}}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes slideIn{from{transform:translateX(-10px);opacity:0}to{transform:translateX(0);opacity:1}}
@keyframes scaleIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
.fu{animation:fadeUp .45s cubic-bezier(.22,1,.36,1) both}
.fu2{animation:fadeUp .45s .08s cubic-bezier(.22,1,.36,1) both}
.fu3{animation:fadeUp .45s .16s cubic-bezier(.22,1,.36,1) both}
.fu4{animation:fadeUp .45s .24s cubic-bezier(.22,1,.36,1) both}
.inp{background:#0f0f0f;border:1px solid #222;border-radius:7px;color:#e8e8e8;font-family:'Barlow',sans-serif;font-size:15px;padding:12px 14px;width:100%;outline:none;transition:border-color .2s,box-shadow .2s;appearance:none;-webkit-appearance:none;min-height:44px}
.inp:focus{border-color:#e84a2a;box-shadow:0 0 0 3px #e84a2a18}.inp::placeholder{color:#333}
.inp.err{border-color:#ef444466}
select.inp option{background:#111}
.btn{background:#e84a2a;border:none;border-radius:7px;color:#fff;cursor:pointer;font-family:'Barlow Condensed',sans-serif;font-size:17px;font-weight:800;letter-spacing:2px;padding:14px 28px;text-transform:uppercase;transition:background .2s,transform .12s;display:inline-flex;align-items:center;gap:8px;min-height:44px}
.btn:hover:not(:disabled){background:#ff5535;transform:translateY(-2px)}
.btn:disabled{background:#1a1a1a;color:#444;cursor:not-allowed;transform:none}
.btn-sm{font-size:14px;padding:10px 18px;letter-spacing:1.5px}
.btn-ghost{background:transparent;border:1px solid #252525;border-radius:7px;color:#888;cursor:pointer;font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;letter-spacing:1px;padding:8px 16px;text-transform:uppercase;transition:border-color .2s,color .2s;display:inline-flex;align-items:center;gap:6px;min-height:44px}
.btn-ghost:hover{border-color:#444;color:#ccc;background:#111}
.btn-danger{background:transparent;border:1px solid #4a1111;border-radius:6px;color:#ef4444;cursor:pointer;font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;letter-spacing:1px;padding:6px 14px;text-transform:uppercase;min-height:40px}
.btn-danger:hover{background:#4a111122}
.btn-retry{background:#f59e0b18;border:1px solid #f59e0b40;border-radius:7px;color:#f59e0b;cursor:pointer;font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:800;padding:10px 20px;text-transform:uppercase;display:inline-flex;align-items:center;gap:8px;min-height:44px}
.ltog{display:flex;border:1px solid #222;border-radius:7px;overflow:hidden;height:40px;flex-shrink:0}
.ltog-btn{background:transparent;border:none;color:#555;cursor:pointer;font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:800;letter-spacing:1px;padding:0 14px;transition:background .2s,color .2s}
.ltog-btn.on{background:#e84a2a;color:#fff}
.card{background:#0f0f0f;border:1px solid #1a1a1a;border-radius:10px;overflow:hidden}
.tag{border-radius:20px;font-size:11px;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.8px;padding:4px 12px;text-transform:uppercase;display:inline-block}
.tag-red{background:#e84a2a18;color:#e84a2a;border:1px solid #e84a2a30}
.tag-gray{background:#141414;color:#555;border:1px solid #1e1e1e}
.tag-blue{background:#3b82f618;color:#60a5fa;border:1px solid #3b82f630}
.tag-green{background:#22c55e18;color:#22c55e;border:1px solid #22c55e30}
.tag-yellow{background:#f59e0b18;color:#f59e0b;border:1px solid #f59e0b30}
.lbl{color:#3a3a3a;font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;display:block}
.shimmer{background:linear-gradient(90deg,#1a1a1a 25%,#252525 50%,#1a1a1a 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:4px}
.rs{background:#0f0f0f;border:1px solid #1a1a1a;border-radius:9px;overflow:hidden;animation:slideIn .35s cubic-bezier(.22,1,.36,1) both}
.rs-head{background:#111;border-bottom:1px solid #1a1a1a;padding:10px 16px;display:flex;align-items:center;gap:10px}
.rs-body{padding:14px 16px}
.pill{background:#111;border:1px solid #1e1e1e;border-radius:20px;color:#555;cursor:pointer;font-family:'Barlow',sans-serif;font-size:13px;padding:8px 14px;text-align:left;min-height:40px}
.pill:hover{border-color:#e84a2a55;color:#999}
.pill-on{background:#e84a2a;border-color:#e84a2a;color:#fff;font-weight:600}
.pill-on:hover{background:#e84a2a;border-color:#e84a2a;color:#fff}
.pill:hover{border-color:#e84a2a40;color:#ccc}
.npill{display:flex;align-items:center;gap:7px;padding:7px 12px;border-radius:6px;cursor:pointer;font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#555;border:none;background:transparent;min-height:44px}
.npill:hover{color:#aaa;background:#111}.npill.on{color:#e84a2a;background:#e84a2a0f}
.yt-card{display:flex;align-items:center;background:#0a0a0a;border:1px solid #1a1a1a;border-radius:7px;overflow:hidden;text-decoration:none}
.yt-card:hover{border-color:#ff444440}
.yt-link{display:flex;align-items:center;gap:10px;padding:10px 14px;background:#0a0a0a;border:1px solid #1a1a1a;border-radius:7px;color:#ccc;text-decoration:none;font-size:13px;min-height:44px}
.yt-link:hover{border-color:#ff444440;background:#ff00000a}
.parts-btn{display:flex;align-items:center;gap:8px;padding:10px 14px;background:#0a0a0a;border:1px solid #1a1a1a;border-radius:7px;color:#ccc;text-decoration:none;font-size:13px;font-family:'Barlow Condensed',sans-serif;font-weight:700;min-height:44px}
.parts-btn:hover{border-color:#444;background:#111;color:#fff}
.gcard{background:#0f0f0f;border:1px solid #1a1a1a;border-radius:10px;padding:18px;display:flex;align-items:center;gap:16px;cursor:pointer}
.gcard:hover{border-color:#e84a2a40}
.empty{text-align:center;padding:60px 20px;color:#2a2a2a}
.sbox{background:#0f0f0f;border:1px solid #1a1a1a;border-radius:9px;padding:18px;display:flex;flex-direction:column;gap:4px}
.toast-el{position:fixed;bottom:24px;right:24px;background:#161616;border:1px solid #252525;border-radius:8px;padding:12px 18px;color:#e8e8e8;font-size:14px;z-index:9999;animation:fadeUp .3s ease;display:flex;align-items:center;gap:10px;max-width:320px;box-shadow:0 8px 32px #000}
.ferr{color:#ef4444;font-size:11px;margin-top:5px;display:flex;align-items:center;gap:4px}
.key-wrap{position:relative}
.key-eye{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:#555;cursor:pointer;font-size:14px;padding:6px;min-height:36px;min-width:36px}
.srow{display:flex;flex-direction:column;gap:6px;padding:18px 0;border-bottom:1px solid #111}.srow:last-child{border-bottom:none}
.cpbtn{background:none;border:none;cursor:pointer;color:#2a2a2a;padding:4px 8px;border-radius:4px;min-height:32px;min-width:32px;display:flex;align-items:center;justify-content:center;font-size:13px}
.cpbtn:hover{color:#888;background:#1a1a1a}
.mdd{background:#0c0c0c;border:1px solid #1e1e1e;border-top:none;border-radius:0 0 7px 7px;max-height:180px;overflow-y:auto;position:absolute;left:0;right:0;z-index:100;box-shadow:0 8px 24px #000}
.mdd-opt{padding:10px 14px;cursor:pointer;font-size:14px;color:#888;border-bottom:1px solid #141414;min-height:44px;display:flex;align-items:center}
.mdd-opt:hover{background:#1a1a1a;color:#e8e8e8}
.step-bar{height:3px;background:#1a1a1a;border-radius:2px;overflow:hidden;margin-bottom:16px}
.step-fill{height:100%;background:linear-gradient(90deg,#e84a2a,#ff8c00);transition:width .6s ease}
.modal-bg{position:fixed;inset:0;background:#000000b8;z-index:8000;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(5px);animation:fadeIn .18s ease}
.modal-box{background:#111;border:1px solid #252525;border-radius:13px;padding:28px;max-width:420px;width:100%;animation:scaleIn .2s ease}
.lnav{position:fixed;top:0;left:0;right:0;z-index:500;background:#080808cc;backdrop-filter:blur(14px);border-bottom:1px solid #111;padding:0 24px}
.lnav-inner{max-width:1100px;margin:0 auto;display:flex;align-items:center;height:60px;gap:16px}
.lnav-links{display:flex;gap:4px}
.llink{background:none;border:none;color:#555;cursor:pointer;font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:8px 12px;border-radius:5px;min-height:44px;display:flex;align-items:center}
.llink:hover{color:#ccc}
.wrap{max-width:1100px;margin:0 auto;padding:0 24px}
.fc{background:#0c0c0c;border:1px solid #181818;border-radius:12px;padding:24px}
.fc:hover{border-color:#e84a2a30;transform:translateY(-4px)}
.faq-item{border-bottom:1px solid #111}
.faq-q{width:100%;background:none;border:none;color:#e8e8e8;cursor:pointer;font-family:'Barlow',sans-serif;font-size:16px;font-weight:600;padding:20px 0;text-align:left;display:flex;justify-content:space-between;align-items:center;gap:16px;min-height:44px}
.faq-q:hover{color:#e84a2a}
.faq-a{color:#555;font-size:15px;line-height:1.7;padding-bottom:18px;animation:fadeIn .25s ease}
.foot{border-top:1px solid #111;padding:40px 24px 28px}
.foot-inner{max-width:1100px;margin:0 auto;display:flex;flex-wrap:wrap;gap:40px;justify-content:space-between}
@media(max-width:760px){.lnav-links{display:none}.hgrid{grid-template-columns:1fr!important}.hform{display:none!important}}
@media print{body{background:#fff;color:#111}.rs{border:1px solid #ccc}.rs-head{background:#f5f5f5!important}}
`;

function ToastEl({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  const col = type === "success" ? "#22c55e" : type === "warn" ? "#f59e0b" : "#60a5fa";
  return (
    <div className="toast-el" role="status">
      <span style={{ color: col, fontSize: 16 }}>{type === "success" ? "✓" : type === "warn" ? "⚠" : "ℹ"}</span>
      {message}
    </div>
  );
}

function Spin({ size, color }) {
  const sz = size || 20, c = color || "#fff";
  return (
    <svg width={sz} height={sz} viewBox="0 0 20 20" fill="none" style={{ animation: "spin .9s linear infinite", flexShrink: 0 }}>
      <circle cx="10" cy="10" r="8" stroke={c + "22"} strokeWidth="2.5" />
      <path d="M10 2 A8 8 0 0 1 18 10" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// Animated open-end wrench turning a hex bolt — used on loading screens
function WrenchLoader({ size }) {
  const sz = size || 80;
  return (
    <svg width={sz} height={sz} viewBox="0 0 100 100" aria-hidden="true" style={{ flexShrink: 0 }}>
      {/* Hex bolt, rotating slowly as if being tightened */}
      <g>
        <polygon points="64,50 57,62.1 43,62.1 36,50 43,37.9 57,37.9" fill="#e84a2a" />
        <polygon points="60,50 55,58.7 45,58.7 40,50 45,41.3 55,41.3" fill="#c43e22" />
        <circle cx="50" cy="50" r="5" fill="#0a0a0a" />
        <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="4s" repeatCount="indefinite" />
      </g>
      {/* Open-end wrench gripping the bolt, ratcheting back and forth */}
      <g fill="#9aa0a6">
        <rect x="4" y="46" width="32" height="8" rx="3" />
        <rect x="33" y="38" width="6" height="24" rx="2" />
        <rect x="37" y="38" width="13" height="5" rx="1.5" />
        <rect x="37" y="57" width="13" height="5" rx="1.5" />
        <animateTransform attributeName="transform" type="rotate" values="-12 50 50; 30 50 50; 30 50 50; -12 50 50; -12 50 50" keyTimes="0;0.4;0.52;0.72;1" dur="1.6s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0 0 1 1; 0.4 0 0.2 1; 0 0 1 1" />
      </g>
    </svg>
  );
}

// Realistic double open-end wrench silhouette (angled jaws, 180-degree rotational symmetry)
const WRENCH_PATH = "M180 46C205 46 222 46 242 46C274 24 322 20 350 27C360 32 358 40 348 43L303 52C295 55 295 65 303 68L347 75C357 77 358 85 346 90C322 96 274 96 242 74C222 74 205 74 180 74C155 74 138 74 118 74C86 96 38 100 10 93C0 88 2 80 12 77L57 68C65 65 65 55 57 52L13 45C3 43 2 35 14 30C38 24 86 24 118 46C138 46 155 46 180 46Z";

// Still, tiled wallpaper of small grey double open-end wrenches at a descending slant
function WrenchBackground() {
  return (
    <svg aria-hidden="true" style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }}>
      <defs>
        <path id="bgwrench" d={WRENCH_PATH} />
        <pattern id="wrenchWall" x="0" y="0" width="150" height="150" patternUnits="userSpaceOnUse">
          <g fill="#15151b">
            <use href="#bgwrench" transform="translate(38,34) rotate(33) scale(0.17) translate(-180,-60)" />
            <use href="#bgwrench" transform="translate(113,109) rotate(33) scale(0.17) translate(-180,-60)" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#wrenchWall)" />
    </svg>
  );
}

// Double open-end wrench mark for the app logo (angled, fills a square)
function WrenchMark({ color, size }) {
  const sz = size || 24;
  return (
    <svg width={sz} height={sz} viewBox="0 0 96 96" aria-hidden="true" style={{ display: "block" }}>
      <g transform="translate(48,48) rotate(-32) scale(0.23) translate(-180,-60)" fill={color || "#fff"}>
        <path d={WRENCH_PATH} />
      </g>
    </svg>
  );
}

function DiffBadge({ level }) {
  const lang = useLang(), T = S[lang] || S.en;
  if (!level) return null;
  const tip = level === "Beginner" ? T.diff_beg : level === "Advanced" ? T.diff_adv : T.diff_int;
  return (
    <span title={tip} style={{ background: dbg(level), color: dclr(level), border: "1px solid " + dclr(level) + "33", borderRadius: 5, padding: "3px 10px", fontSize: 11, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase" }}>
      {level}
    </span>
  );
}

function FieldErr({ msg }) {
  if (!msg) return null;
  return <p role="alert" className="ferr">⚠ {msg}</p>;
}

function CharCount({ val, max }) {
  const n = val.length, warn = n > max * 0.8, over = n > max;
  return <span style={{ fontSize: 11, color: over ? "#ef4444" : warn ? "#f59e0b" : "#2a2a2a", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700 }}>{n}/{max}</span>;
}

function CopyBtn({ text }) {
  const lang = useLang(), T = S[lang] || S.en;
  const [ok, setOk] = useState(false);
  return (
    <button className="cpbtn" onClick={async () => { if (await copyText(text)) { setOk(true); setTimeout(() => setOk(false), 2000); } }} aria-label={ok ? T.copied_lbl : T.copy_lbl}>
      <span style={{ color: ok ? "#22c55e" : undefined }}>{ok ? "✓" : "⎘"}</span>
    </button>
  );
}

function LangToggle({ lang, onToggle }) {
  const T = S[lang] || S.en;
  return (
    <div className="ltog" role="group" aria-label="Language / Idioma">
      <button className={"ltog-btn" + (lang === "en" ? " on" : "")} onClick={() => onToggle("en")}>{T.lang_en}</button>
      <button className={"ltog-btn" + (lang === "es" ? " on" : "")} onClick={() => onToggle("es")}>{T.lang_es}</button>
    </div>
  );
}

function ConfirmModal({ title, message, confirmLabel, onConfirm, onCancel }) {
  const lang = useLang(), T = S[lang] || S.en;
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const h = e => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", h);
    return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", h); };
  }, []);
  return (
    <div className="modal-bg" role="dialog" onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="modal-box">
        <h3 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 10 }}>{title}</h3>
        <p style={{ color: "#666", fontSize: 15, lineHeight: 1.65, marginBottom: 24 }}>{message}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button className="btn-ghost" onClick={onCancel}>{T.mc}</button>
          <button className="btn-danger" style={{ padding: "10px 20px", fontSize: 13 }} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function LoadingGuide() {
  const lang = useLang(), T = S[lang] || S.en;
  const steps = [T.ls1, T.ls2, T.ls3, T.ls4, T.ls5];
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 2000); return () => clearInterval(t); }, []);
  const pct = Math.round(((step + 1) / steps.length) * 90);
  return (
    <div role="status">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "8px 0 16px" }}>
        <WrenchLoader size={72} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#e84a2a", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14, letterSpacing: 2, fontWeight: 700, textTransform: "uppercase", textAlign: "center" }}>
          <span>{steps[step]}</span>
        </div>
      </div>
      <div className="step-bar"><div className="step-fill" style={{ width: pct + "%" }} /></div>
      <p style={{ color: "#2a2a2a", fontSize: 11, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: 1, marginBottom: 16 }}>{T.ls_step} {step + 1} {T.ls_of} {steps.length}</p>
      {[80, 60, 90, 55, 75].map((w, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 7, padding: "9px 0" }}>
          <div className="shimmer" style={{ height: 12, width: w + "%" }} />
          <div className="shimmer" style={{ height: 10, width: "88%" }} />
          <div className="shimmer" style={{ height: 10, width: "68%" }} />
        </div>
      ))}
    </div>
  );
}

function ModelInput({ make, value, onChange, error, style }) {
  const lang = useLang(), T = S[lang] || S.en;
  const opts = COMMON_MODELS[make] || [];
  const [customMode, setCustomMode] = useState(false);
  // Reset custom mode and clear stale values when make changes
  useEffect(() => {
    setCustomMode(false);
    if (opts.length > 0 && value && !opts.includes(value)) onChange("");
  }, [make]);
  const handleSelect = (e) => {
    const v = e.target.value;
    if (v === "__OTHER__") { setCustomMode(true); onChange(""); }
    else { onChange(v); }
  };
  // Custom mode — user explicitly chose Other → text input with back-to-list
  if (customMode) {
    return (
      <div>
        <input className={"inp" + (error ? " err" : "")} style={style} placeholder="Type model name…" value={value} maxLength={MAX_MODEL + 5} onChange={e => onChange(e.target.value)} autoFocus autoComplete="off" aria-label={T.f_model} />
        <button type="button" onClick={() => { setCustomMode(false); onChange(""); }} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 11, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: 1, marginTop: 6, padding: "4px 0" }}>← Back to list</button>
      </div>
    );
  }
  // ALWAYS a dropdown by default — same as Year and Make
  return (
    <select className={"inp" + (error ? " err" : "")} style={style} value={value} onChange={handleSelect} aria-label={T.f_model}>
      <option value="">{T.f_model}</option>
      {opts.map(o => <option key={o} value={o}>{o}</option>)}
      <option value="__OTHER__">{T.f_model_other}</option>
    </select>
  );
}

function TrimInput({ make, model, value, onChange, style }) {
  const lang = useLang(), T = S[lang] || S.en;
  const key = make && model ? make + "|" + model.trim() : "";
  const opts = TRIMS[key] || [];
  const [customMode, setCustomMode] = useState(false);
  // Reset custom mode and clear stale values when make/model changes
  useEffect(() => {
    setCustomMode(false);
    if (opts.length > 0 && value && !opts.includes(value)) onChange("");
  }, [make, model]);
  const handleSelect = (e) => {
    const v = e.target.value;
    if (v === "__OTHER__") { setCustomMode(true); onChange(""); }
    else { onChange(v); }
  };
  // Custom mode — user explicitly chose Other
  if (customMode) {
    return (
      <div>
        <input className="inp" style={style} placeholder={T.f_trim_ph} value={value} maxLength={60} onChange={e => onChange(e.target.value)} autoFocus aria-label={T.f_trim} />
        <button type="button" onClick={() => { setCustomMode(false); onChange(""); }} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 11, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: 1, marginTop: 6, padding: "4px 0" }}>← Back to list</button>
      </div>
    );
  }
  // ALWAYS a dropdown — same as Year and Make
  return (
    <select className="inp" style={style} value={value} onChange={handleSelect} aria-label={T.f_trim}>
      <option value="">{T.f_trim}</option>
      {opts.map(o => <option key={o} value={o}>{o}</option>)}
      <option value="__OTHER__">{T.f_trim_other}</option>
    </select>
  );
}

function SecIcon({ title }) {
  const l = title.toLowerCase();
  if (l.includes("likely wrong") || l.includes("overview")) return "🔧"; if (l.includes("difficulty")) return "📊"; if (l.includes("cost")) return "💰";
  if (l.includes("confirm") || l.includes("diagnos")) return "🔍";
  if (l.includes("watch") || l.includes("video") || l.includes("youtube")) return "🎥";
  if (l.includes("community") || l.includes("reddit") || l.includes("thread")) return "💬";
  if (l.includes("forum") || l.includes("guides")) return "📚";
  if (l.includes("removal")) return "🔩"; if (l.includes("installation")) return "🔧";
  if (l.includes("tool")) return "🛠️"; if (l.includes("part")) return "📦"; if (l.includes("step") || l.includes("guide")) return "📋";
  if (l.includes("mistake")) return "⚠️"; if (l.includes("safety")) return "🚨";
  if (l.includes("tip")) return "💡"; if (l.includes("professional") || l.includes("call a")) return "🏁";
  return "•";
}

// Parse a representative dollar amount from a cost string like "$120-$480" → 300 (midpoint)
function parseMoney(s){if(!s)return null;const nums=String(s).match(/\d[\d,]*/g);if(!nums)return null;const vals=nums.map(n=>parseInt(n.replace(/,/g,""),10)).filter(n=>!isNaN(n));if(!vals.length)return null;return vals.length>1?Math.round((vals[0]+vals[vals.length-1])/2):vals[0];}

// SVG visuals: difficulty gauge + DIY-vs-shop cost bar chart, drawn from the guide JSON
function GuideVisuals({ guide }) {
  const lang = useLang(), T = S[lang] || S.en;
  if (!guide || typeof guide !== "object") return null;
  const dl = String(guide.difficulty || "").toLowerCase();
  const diffIdx = dl.includes("begin") ? 0 : dl.includes("adv") ? 2 : 1;
  const dcolors = ["#22c55e", "#f59e0b", "#ef4444"];
  const dlabels = [T.dv_beg, T.dv_int, T.dv_adv];
  const c = guide.cost || {};
  const diy = parseMoney(c.total_diy) ?? parseMoney(c.diy_parts);
  const shop = parseMoney(c.total_shop) ?? parseMoney(c.shop_labor);
  const showCost = diy != null && shop != null && shop > 0;
  const maxV = Math.max(diy || 0, shop || 0, 1);
  const W = 320, barH = 26, innerW = W - 96;
  const diyW = Math.max(4, Math.round((diy / maxV) * innerW));
  const shopW = Math.max(4, Math.round((shop / maxV) * innerW));
  const savings = (diy != null && shop != null) ? Math.max(0, shop - diy) : null;
  const cardStyle = { background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 10, padding: "14px 16px" };
  const hdStyle = { fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 800, color: "#e84a2a", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, marginBottom: 18 }}>
      <div style={cardStyle}>
        <p style={hdStyle}>{T.dv_difficulty}</p>
        <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ flex: 1, height: 8, borderRadius: 4, background: i <= diffIdx ? dcolors[diffIdx] : "#1e1e1e", transition: "background .3s" }} />
          ))}
        </div>
        <p style={{ fontSize: 18, fontWeight: 800, color: dcolors[diffIdx] }}>{dlabels[diffIdx]}</p>
        {guide.time && <p style={{ fontSize: 12, color: "#555", marginTop: 4 }}>⏱ {guide.time}</p>}
      </div>
      {showCost && (
        <div style={cardStyle}>
          <p style={hdStyle}>{T.dv_cost}</p>
          <svg viewBox={"0 0 " + W + " 86"} width="100%" style={{ display: "block" }} role="img" aria-label="DIY versus shop cost comparison">
            <text x="4" y="18" fill="#22c55e" fontSize="12" fontFamily="Barlow Condensed, sans-serif" fontWeight="700">DIY</text>
            <rect x="44" y="6" width={diyW} height={barH} rx="4" fill="#22c55e" />
            <text x={Math.min(44 + diyW + 8, W - 40)} y="24" fill="#ddd" fontSize="13" fontWeight="700">${diy}</text>
            <text x="4" y="62" fill="#ef4444" fontSize="12" fontFamily="Barlow Condensed, sans-serif" fontWeight="700">Shop</text>
            <rect x="44" y="50" width={shopW} height={barH} rx="4" fill="#ef4444" />
            <text x={Math.min(44 + shopW + 8, W - 40)} y="68" fill="#ddd" fontSize="13" fontWeight="700">${shop}</text>
          </svg>
          {savings > 0 && <p style={{ fontSize: 12, color: "#22c55e", marginTop: 6 }}>{T.dv_save} ~${savings} {T.dv_doing_self}</p>}
        </div>
      )}
      {showCost && savings > 0 && shop > 0 && (() => {
        const pct = Math.min(99, Math.round((savings / shop) * 100));
        const r = 34, circ = 2 * Math.PI * r, dash = (pct / 100) * circ;
        return (
          <div style={cardStyle}>
            <p style={hdStyle}>{T.dv_savings}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <svg viewBox="0 0 90 90" width="78" height="78" style={{ flexShrink: 0 }} role="img" aria-label={"DIY saves " + pct + " percent"}>
                <circle cx="45" cy="45" r={r} fill="none" stroke="#1e1e1e" strokeWidth="9" />
                <circle cx="45" cy="45" r={r} fill="none" stroke="#22c55e" strokeWidth="9" strokeLinecap="round"
                  strokeDasharray={dash + " " + circ} transform="rotate(-90 45 45)" />
                <text x="45" y="44" textAnchor="middle" fill="#22c55e" fontSize="20" fontWeight="800" fontFamily="Barlow Condensed, sans-serif">{pct}%</text>
                <text x="45" y="60" textAnchor="middle" fill="#555" fontSize="9" fontFamily="Barlow Condensed, sans-serif" letterSpacing="1">SAVED</text>
              </svg>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color: "#22c55e", lineHeight: 1 }}>${savings}</p>
                <p style={{ fontSize: 12, color: "#555", marginTop: 4, lineHeight: 1.4 }}>{T.dv_vs_shop}</p>
              </div>
            </div>
          </div>
        );
      })()}
      {guide.time && (
        <div style={cardStyle}>
          <p style={hdStyle}>{T.dv_time}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <svg viewBox="0 0 60 60" width="54" height="54" style={{ flexShrink: 0 }} role="img" aria-label="Estimated time">
              <circle cx="30" cy="30" r="24" fill="none" stroke="#1e1e1e" strokeWidth="4" />
              <circle cx="30" cy="30" r="24" fill="none" stroke="#e84a2a" strokeWidth="4" strokeLinecap="round" strokeDasharray="100 150" transform="rotate(-90 30 30)" opacity="0.5" />
              <line x1="30" y1="30" x2="30" y2="15" stroke="#e84a2a" strokeWidth="3" strokeLinecap="round" />
              <line x1="30" y1="30" x2="41" y2="34" stroke="#e8e8e8" strokeWidth="3" strokeLinecap="round" />
              <circle cx="30" cy="30" r="3" fill="#e84a2a" />
            </svg>
            <div>
              <p style={{ fontSize: 20, fontWeight: 800, color: "#e8e8e8", lineHeight: 1.1 }}>{guide.time}</p>
              <p style={{ fontSize: 12, color: "#555", marginTop: 4 }}>{T.dv_hands_on}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultSecs({ sections, videos, ytTerms, hasYT, pq, loadVids, vehicleCtx }) {
  const lang = useLang(), T = S[lang] || S.en;
  // Build vehicle prefix for shop searches (e.g. "2013 Ford C-Max 2.0L")
  const vPrefix = vehicleCtx ? [vehicleCtx.year, vehicleCtx.make, vehicleCtx.model, vehicleCtx.trim].filter(Boolean).join(" ").trim() : "";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {sections.map((sec, i) => {
        const titleLc = sec.title.toLowerCase();
        // ── Link-type sections (YouTube tutorials, Reddit threads) ──
        if (sec.type === "links") {
          const isYT = sec.kind === "youtube";
          const ic = sec.kind === "youtube" ? "▶" : sec.kind === "reddit" ? "💬" : "📚";
          const col = sec.kind === "reddit" ? "#ff4500" : sec.kind === "forum" ? "#4a9eff" : "#e84a2a";
          return (
            <div key={i} className="rs" style={{ animationDelay: (i * 0.04) + "s" }}>
              <div className="rs-head">
                <span style={{ fontSize: 15 }}><SecIcon title={sec.title} /></span>
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 800, color: "#e84a2a", letterSpacing: 1.5, textTransform: "uppercase", flex: 1 }}>{sec.title}</span>
              </div>
              <div className="rs-body">
                {sec.links.map((lk, j) => (
                  <a
                    key={j}
                    href={lk.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "flex", gap: 11, marginBottom: 8, alignItems: "center", padding: "10px 12px", borderRadius: 7, textDecoration: "none", color: "inherit", background: "#0c0c0c", border: "1px solid #181818", transition: "border-color .15s, background .15s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = col + "55"; e.currentTarget.style.background = "#111"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#181818"; e.currentTarget.style.background = "#0c0c0c"; }}
                  >
                    <span style={{ width: 30, height: 30, borderRadius: 6, background: col + "1a", color: col, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{ic}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", color: "#ccc", fontSize: 14, lineHeight: 1.35, overflow: "hidden", textOverflow: "ellipsis" }}>{lk.label}</span>
                      {lk.sub && <span style={{ display: "block", color: "#555", fontSize: 11, marginTop: 2 }}>{lk.sub}</span>}
                    </span>
                    <span style={{ color: "#555", fontSize: 12, flexShrink: 0 }}>↗</span>
                  </a>
                ))}
              </div>
            </div>
          );
        }
        // ── Regular and shoppable sections ──
        const isShoppable = titleLc.includes("tool") || titleLc.includes("part");
        return (
          <div key={i} className="rs" style={{ animationDelay: (i * 0.04) + "s" }}>
            <div className="rs-head">
              <span style={{ fontSize: 15 }}><SecIcon title={sec.title} /></span>
              <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 800, color: "#e84a2a", letterSpacing: 1.5, textTransform: "uppercase", flex: 1 }}>{sec.title}</span>
              <CopyBtn text={secText(sec)} />
            </div>
            <div className="rs-body">
              {sec.lines.map((line, j) => {
                const isN = /^\d+\./.test(line.trim()), isB = /^[-•]/.test(line.trim()) || isN;
                const clean = line.replace(/^[-•]\s*/, "").replace(/^\d+\.\s*/, "").replace(/\*\*/g, "");
                if (isShoppable && clean.trim()) {
                  // Build a focused search query — use the item name (strip parenthetical notes for cleaner search)
                  const itemSearch = clean.split(/[(]/)[0].trim().slice(0, 50);
                  const q = (vPrefix ? vPrefix + " " : "") + itemSearch;
                  return (
                    <a
                      key={j}
                      href={"https://www.autozone.com/searchresult?searchText=" + encodeURIComponent(q)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: "flex", gap: 10, marginBottom: 7, alignItems: "flex-start", padding: "6px 10px", borderRadius: 6, textDecoration: "none", color: "inherit", background: "#0c0c0c", border: "1px solid #181818", transition: "border-color .15s, background .15s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#e84a2a40"; e.currentTarget.style.background = "#111"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#181818"; e.currentTarget.style.background = "#0c0c0c"; }}
                    >
                      <span style={{ color: "#e84a2a", fontSize: 13, marginTop: 1, flexShrink: 0 }}>🛒</span>
                      <span style={{ color: "#bbb", fontSize: 14, lineHeight: 1.5, flex: 1 }}>{clean}</span>
                      <span style={{ color: "#555", fontSize: 11, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, letterSpacing: 1, marginTop: 2, flexShrink: 0 }}>{T.shop_item} ↗</span>
                    </a>
                  );
                }
                return (
                  <div key={j} style={{ display: "flex", gap: 10, marginBottom: 7, alignItems: "flex-start" }}>
                    {isB && <span style={{ color: isN ? "#e84a2a" : "#333", fontSize: isN ? 12 : 14, fontFamily: isN ? "'Barlow Condensed'" : "inherit", fontWeight: isN ? 700 : 400, marginTop: isN ? 2 : 1, flexShrink: 0, minWidth: isN ? 18 : 10 }}>{isN ? (line.match(/^\d+/)?.[0] + ".") : "›"}</span>}
                    <span style={{ color: "#888", fontSize: 14, lineHeight: 1.65 }}>{clean}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      {pq && (
        <div className="rs">
          <div className="rs-head">
            <span style={{ fontSize: 15 }}>🛒</span>
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 800, color: "#e84a2a", letterSpacing: 1.5, textTransform: "uppercase", flex: 1 }}>{T.parts_t}</span>
            <span style={{ fontSize: 11, color: "#333" }}>{T.parts_tab}</span>
          </div>
          <div className="rs-body">
            <p style={{ color: "#444", fontSize: 12, marginBottom: 12 }}>{T.parts_for} <span style={{ color: "#888" }}>{pq}</span></p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 8 }}>
              {PARTS_STORES.map(s => (
                <a key={s.name} className="parts-btn" href={s.url(pq)} target="_blank" rel="noopener noreferrer">
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />{s.name}
                  <span style={{ color: "#2a2a2a", fontSize: 10, marginLeft: "auto" }}>↗</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DiagnosePage({ prefill, onSaveHist, ytKey, defState }) {
  const lang = useLang(), T = S[lang] || S.en;
  const ISSUES = [T.ci1,T.ci2,T.ci3,T.ci4,T.ci5,T.ci6,T.ci7,T.ci8,T.ci9,T.ci10,T.ci11,T.ci12,T.ci13,T.ci14,T.ci15,T.ci16];
  const initForm = () => {
    if (prefill?.problem) return { year: prefill.year || "", make: prefill.make || "", model: prefill.model || "", trim: prefill.trim || "", problem: prefill.problem || "", state: defState || "" };
    const d = ssDraft.load();
    if (d) return { year: VALID_YEARS.has(d.year) ? d.year : (prefill?.year || ""), make: MAKES.includes(d.make) ? d.make : (prefill?.make || ""), model: sanitize(d.model || "", MAX_MODEL) || (prefill?.model || ""), trim: sanitize(d.trim || "", 60) || (prefill?.trim || ""), problem: sanitize(d.problem || "", MAX_PROBLEM), state: VALID_STATES.has(d.state) ? d.state : (defState || "") };
    return { year: prefill?.year || "", make: prefill?.make || "", model: prefill?.model || "", trim: prefill?.trim || "", problem: "", state: defState || "" };
  };
  const [form, setForm] = useState(initForm);
  const [loading, setLd] = useState(false);
  const [loadVids, setLV] = useState(false);
  const [error, setErr] = useState(null);
  const [info, setInfo] = useState(null);
  const [secs, setSecs] = useState([]);
  const [diff, setDiff] = useState(null);
  const [ytTerms, setYT] = useState([]);
  const [videos, setVids] = useState([]);
  const [saved, setSaved] = useState(false);
  const [showIss, setSI] = useState(false);
  const [raw, setRaw] = useState(null);
  const [ferrs, setFerrs] = useState({});
  const [cd, setCd] = useState(0);
  const [sessLeft, setSL] = useState(SESSION_MAX - _sessionCalls);
  const inFlight = useRef(false);
  const lastCall = useRef(0);
  const abortRef = useRef(null);
  const genRef = useRef(null);       // remembers the inputs used for the current result
  const langRef = useRef(lang);      // tracks language to detect toggles
  useEffect(() => () => { abortRef.current?.abort(); }, []);
  useEffect(() => { if (form.problem || form.model) ssDraft.save(form); }, [form]);
  useEffect(() => {
    if (!cd) return;
    const t = setInterval(() => { const r = Math.max(0, Math.ceil((COOLDOWN_MS - (Date.now() - lastCall.current)) / 1000)); setCd(r); if (!r) clearInterval(t); }, 500);
    return () => clearInterval(t);
  }, [cd]);
  // Re-translate the on-screen guide when the language is toggled after generation.
  // Template results regenerate instantly in the new language; AI results re-translate
  // their section structure (titles/labels) from the stored JSON.
  useEffect(() => {
    if (langRef.current === lang) return;
    langRef.current = lang;
    const g = genRef.current;
    if (!g || secs.length === 0) return;
    const ctx = { year: g.year, make: g.make, model: g.model, trim: g.trim, problem: g.problem };
    if (g.wasTemplate) {
      const obj = templateGuide(g.year, g.make, g.model, g.trim, g.problem, g.state, lang);
      const parsed = jsonToSections(obj, lang, ctx);
      setRaw(JSON.stringify(obj)); setSecs(parsed); setDiff(extractDiff(parsed)); setYT(extractYT(parsed));
    } else if (raw) {
      try {
        const obj = JSON.parse(raw);
        setSecs(jsonToSections(obj, lang, ctx));
      } catch {}
    }
  }, [lang]);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const rate = getLR(form.state);
  const validate = f => {
    const e = {};
    if (!f.year || !VALID_YEARS.has(f.year)) e.year = T.v_year;
    if (!f.make || !MAKES.includes(f.make)) e.make = T.v_make;
    const m = f.model.trim();
    if (!m) e.model = T.v_model_req; else if (m.length > MAX_MODEL) e.model = T.v_model_long;
    const p = f.problem.trim();
    if (!p) e.problem = T.v_prob_req; else if (p.length < 6) e.problem = T.v_prob_short; else if (p.length > MAX_PROBLEM) e.problem = T.v_prob_long;
    return e;
  };
  const handleSubmit = async () => {
    if (inFlight.current) return;
    const errs = validate(form);
    if (Object.keys(errs).length) { setFerrs(errs); return; }
    setFerrs({});
    const rem = Math.max(0, Math.ceil((COOLDOWN_MS - (Date.now() - lastCall.current)) / 1000));
    if (rem) { setCd(rem); return; }
    if (_sessionCalls >= SESSION_MAX) { setErr(T.e_session); return; }
    inFlight.current = true;
    lastCall.current = Date.now();
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;
    setLd(true); setErr(null); setInfo(null); setSecs([]); setDiff(null); setYT([]); setVids([]); setSaved(false); setRaw(null);
    try {
      const result = await callAI(form.year, form.make, form.model, form.trim, form.problem, form.state, lang, signal);
      if (signal.aborted) return;
      const parsed = result.sections || parseSec(result.raw || result);
      const rawText = result.raw || (typeof result === "string" ? result : sectionsToText(parsed));
      const d = extractDiff(parsed), terms = extractYT(parsed);
      setRaw(rawText); setSecs(parsed); setDiff(d); setYT(terms); setSL(SESSION_MAX - _sessionCalls); ssDraft.clear();
      genRef.current = { year: form.year, make: form.make, model: form.model, trim: form.trim, problem: form.problem, state: form.state, wasTemplate: !!result.template };
      setInfo(result.template
        ? (lang === "es"
            ? "Modo plantilla activo. La IA no está disponible en este entorno — habilita 'Create AI-powered artifacts' en claude.ai → Configuración → Perfil → Vista previa de funciones."
            : "Template mode active. AI is unavailable in this runtime — enable 'Create AI-powered artifacts' in claude.ai → Settings → Profile → Feature preview.")
        : null);
      if (ytKey && terms.length && !signal.aborted) {
        setLV(true);
        try { const v = await fetchYT(terms, ytKey, signal); if (!signal.aborted) setVids(v); } catch {}
        if (!signal.aborted) setLV(false);
      }
    } catch (e) {
      if (e?.name === "AbortError" || signal.aborted) return;
      const errMsg = safeErr(e, lang);
      if (errMsg) setErr(errMsg);
    } finally {
      inFlight.current = false;
      setLd(false);
      // Shorter cooldown on error (2s) so retry feels responsive; full 7s only on success
      setCd(secs.length > 0 ? Math.ceil(COOLDOWN_MS / 1000) : 2);
    }
  };
  const handleSave = async () => {
    if (!raw) return;
    const rec = { id: gid(), ts: Date.now(), year: form.year, make: form.make, model: form.model, trim: form.trim || "", problem: form.problem, difficulty: diff, result: raw, lang };
    await ss2("history:" + rec.id, rec); onSaveHist(rec); setSaved(true);
  };
  const reset = () => { abortRef.current?.abort(); setSecs([]); setDiff(null); setErr(null); setSaved(false); setYT([]); setVids([]); setRaw(null); setFerrs({}); setForm(f => ({ ...f, problem: "" })); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const hasSecs = secs.length > 0;
  const repairTarget = (() => { try { const g = raw && raw.trim().startsWith("{") ? JSON.parse(raw) : null; return g?.repair_target || ""; } catch { return ""; } })();
  const pq = hasSecs ? partsQ(form.year, form.make, form.model, form.problem, repairTarget) : "";
  const atLimit = sessLeft <= 0, nearLimit = sessLeft <= 3 && !atLimit;
  return (
    <div>
      {!hasSecs && !loading && (
        <div style={{ paddingBottom: 32 }}>
          <div className="fu" style={{ marginBottom: 8 }}><span className="tag tag-red">{T.hero_tag}</span></div>
          <h1 className="fu2" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "clamp(40px,9vw,68px)", fontWeight: 900, lineHeight: 0.95, letterSpacing: -1, marginBottom: 16, marginTop: 14 }}>
            {T.hero_h1}<br /><span style={{ color: "#e84a2a" }}>{T.hero_h1b}</span>
          </h1>
          <p className="fu3" style={{ color: "#555", fontSize: 16, lineHeight: 1.7, maxWidth: 480, marginBottom: 28 }}>{T.hero_desc}</p>
        </div>
      )}
      <div className="card fu" style={{ padding: 24, marginBottom: 22 }}>
        <p className="lbl" style={{ marginBottom: 18 }}>{T.form_title}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 12, marginBottom: 4 }}>
          <div>
            <label className="lbl">{T.f_year}</label>
            <select className={"inp" + (ferrs.year ? " err" : "")} value={form.year} onChange={e => set("year", e.target.value)}>
              <option value="">{T.f_year}</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <FieldErr msg={ferrs.year} />
          </div>
          <div>
            <label className="lbl">{T.f_make}</label>
            <select className={"inp" + (ferrs.make ? " err" : "")} value={form.make} onChange={e => set("make", e.target.value)}>
              <option value="">{T.f_make}</option>
              {MAKES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <FieldErr msg={ferrs.make} />
          </div>
          <div>
            <label className="lbl">{T.f_model}</label>
            <ModelInput make={form.make} value={form.model} onChange={v => set("model", v)} error={ferrs.model} />
            <FieldErr msg={ferrs.model} />
          </div>
          <div>
            <label className="lbl">{T.f_state}</label>
            <select className="inp" value={form.state} onChange={e => set("state", e.target.value)}>
              <option value="">{T.f_state}</option>
              {US_STATES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <label className="lbl">{T.f_trim}</label>
          <TrimInput make={form.make} model={form.model} value={form.trim} onChange={v => set("trim", v)} />
        </div>
        <div style={{ marginBottom: 14, marginTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <label className="lbl" style={{ marginBottom: 0 }}>{T.f_problem}</label>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <CharCount val={form.problem} max={MAX_PROBLEM} />
              <button className="btn-ghost" style={{ fontSize: 11, padding: "6px 10px" }} onClick={() => setSI(v => !v)}>{showIss ? T.f_hide : T.f_common}</button>
            </div>
          </div>
          <textarea className={"inp" + (ferrs.problem ? " err" : "")} placeholder={T.f_ph} value={form.problem} onChange={e => set("problem", e.target.value)} maxLength={MAX_PROBLEM + 20} rows={3} style={{ resize: "vertical" }} />
          <FieldErr msg={ferrs.problem} />
        </div>
        {showIss && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            {ISSUES.map((iss, i) => {
              const sel = (form.problem || "").split(/;\s*/).map(s => s.trim()).includes(iss);
              return (
                <button key={i} type="button" className={"pill" + (sel ? " pill-on" : "")} aria-pressed={sel}
                  onClick={() => {
                    const p = (form.problem || "").split(/;\s*/).map(s => s.trim()).filter(Boolean);
                    const idx = p.indexOf(iss);
                    if (idx >= 0) p.splice(idx, 1); else p.push(iss);
                    set("problem", p.join("; "));
                  }}>{sel ? "✓ " : ""}{iss}</button>
              );
            })}
          </div>
        )}
        {form.state && rate && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#0a0a0a", border: "1px solid #181818", borderRadius: 6, marginBottom: 14 }}>
            <span>📍</span>
            <span style={{ fontSize: 12, color: "#555" }}>{getSN(form.state)} — {T.shop_rate}: <strong style={{ color: "#e84a2a" }}>${rate.lo}–${rate.hi}/hr</strong></span>
          </div>
        )}
        {nearLimit && <div style={{ padding: "8px 12px", background: "#2d1f00", border: "1px solid #f59e0b30", borderRadius: 6, marginBottom: 14, fontSize: 12, color: "#f59e0b" }}>⚠️ {T.warn_near.replace("{n}", sessLeft)}</div>}
        {atLimit && <div style={{ padding: "8px 12px", background: "#1a0000", border: "1px solid #ef444440", borderRadius: 6, marginBottom: 14, fontSize: 12, color: "#ef4444" }}>🚫 {T.warn_limit}</div>}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button className="btn" onClick={handleSubmit} disabled={loading || atLimit} style={{ flex: 1, minWidth: 180, justifyContent: "center" }}>
            {loading ? (<><Spin />{T.btn_analyzing}</>) : T.btn_gen}
          </button>
          {hasSecs && !loading && (
            <>
              <button className="btn-ghost" onClick={reset}>{T.btn_new}</button>
              <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => printGuide(form.year, form.make, form.model, form.problem, secs, lang)}>{T.btn_print}</button>
              <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => exportGuide(form.year, form.make, form.model, form.problem, secs)}>{T.btn_export}</button>
            </>
          )}
          {cd > 0 && !loading && <span style={{ fontSize: 12, color: "#f59e0b", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700 }}>{T.wait} {cd}s…</span>}
        </div>
      </div>
      {error && (
        <div style={{ background: "#1a0000", border: "1px solid #4a0000", borderRadius: 9, padding: 20, marginBottom: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ color: "#ef4444" }}>⚠️ {error}</p>
          <button className="btn-retry" onClick={handleSubmit} disabled={loading || cd > 0} style={{ alignSelf: "flex-start" }}><Spin size={16} color="#f59e0b" />{T.btn_retry}</button>
        </div>
      )}
      {loading && <LoadingGuide />}
      {hasSecs && !loading && (
        <div>
          {info && (
            <div style={{ background: "#0a1825", border: "1px solid #1e3a55", borderRadius: 9, padding: "12px 16px", marginBottom: 14, display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>ℹ️</span>
              <p style={{ color: "#7eb6dd", fontSize: 13, lineHeight: 1.55, flex: 1 }}>{info}</p>
              <button onClick={() => setInfo(null)} style={{ background: "none", border: "none", color: "#456680", cursor: "pointer", fontSize: 16, padding: "0 4px", lineHeight: 1, flexShrink: 0 }} aria-label="Dismiss">✕</button>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, padding: "14px 18px", background: "#0f0f0f", border: "1px solid #1a1a1a", borderLeft: "3px solid #e84a2a", borderRadius: 8, marginBottom: 18 }}>
            <div>
              <p style={{ fontSize: 11, color: "#2a2a2a", fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>{T.guide_lbl}</p>
              <p style={{ fontWeight: 700, fontSize: 16 }}>{form.year} {form.make} {form.model}{form.trim ? <span style={{ color: "#666", fontWeight: 400 }}> · {form.trim}</span> : null}</p>
              <p style={{ color: "#444", fontSize: 13, marginTop: 2 }}>{form.problem}</p>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              {diff && <DiffBadge level={diff} />}
              {form.state && <span className="tag tag-blue">{form.state}</span>}
              <span className="tag">{lang === "es" ? "🇲🇽 ES" : "🇺🇸 EN"}</span>
              <button className={saved ? "btn-ghost" : "btn btn-sm"} onClick={handleSave} disabled={saved}>{saved ? T.btn_saved : T.btn_save}</button>
            </div>
          </div>
          {(() => { try { const g = raw && raw.trim().startsWith("{") ? JSON.parse(raw) : null; return g ? <GuideVisuals guide={g} /> : null; } catch { return null; } })()}
          <ResultSecs sections={secs} videos={videos} ytTerms={ytTerms} hasYT={!!ytKey} pq={pq} loadVids={loadVids} vehicleCtx={{year:form.year,make:form.make,model:form.model,trim:form.trim}} />
          <div style={{ marginTop: 16, padding: "12px 16px", background: "#e84a2a08", border: "1px solid #e84a2a18", borderRadius: 8 }}>
            <p style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>⚠️ <strong style={{ color: "#888" }}>{T.disc_h}</strong> {T.disc}</p>
          </div>
        </div>
      )}
      {!hasSecs && !loading && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
          {[T.inc_1, T.inc_2, T.inc_3, T.inc_4, T.inc_5, T.inc_6, T.inc_7].map(f => <span key={f} className="tag tag-gray">{f}</span>)}
        </div>
      )}
    </div>
  );
}

function GaragePage({ vehicles, onAdd, onDelete, onSelect }) {
  const lang = useLang(), T = S[lang] || S.en;
  const [showForm, setSF] = useState(false);
  const [form, setForm] = useState({ year: "", make: "", model: "", trim: "", nickname: "", mileage: "" });
  const [ferrs, setFerrs] = useState({});
  const [confirm, setC] = useState(null);
  const [maintFor, setMaintFor] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const handleAdd = () => {
    const e = {};
    if (!form.year || !VALID_YEARS.has(form.year)) e.year = T.v_year;
    if (!form.make || !MAKES.includes(form.make)) e.make = T.v_make;
    if (!form.model.trim()) e.model = T.v_model_req; else if (form.model.trim().length > MAX_MODEL) e.model = T.v_model_long;
    if (Object.keys(e).length) { setFerrs(e); return; }
    onAdd({ id: gid(), year: form.year, make: form.make, model: sanitize(form.model, MAX_MODEL), trim: sanitize(form.trim, 60), nickname: sanitize(form.nickname, MAX_NICK), mileage: sanitize(form.mileage, MAX_MILE), addedAt: Date.now() });
    setForm({ year: "", make: "", model: "", trim: "", nickname: "", mileage: "" }); setFerrs({}); setSF(false);
  };
  return (
    <div className="fu">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 36, fontWeight: 900 }}>{T.g_title}</h2>
          <p style={{ color: "#444", fontSize: 14, marginTop: 4 }}>{T.g_sub}</p>
        </div>
        <button className="btn btn-sm" onClick={() => setSF(v => !v)}>{showForm ? T.g_cancel : T.g_add}</button>
      </div>
      {showForm && (
        <div className="card" style={{ padding: 22, marginBottom: 22 }}>
          <p className="lbl" style={{ marginBottom: 16 }}>{T.g_new}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 12, marginBottom: 12 }}>
            <div>
              <label className="lbl">{T.f_year}</label>
              <select className={"inp" + (ferrs.year ? " err" : "")} value={form.year} onChange={e => set("year", e.target.value)}>
                <option value="">{T.f_year}</option>{YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <FieldErr msg={ferrs.year} />
            </div>
            <div>
              <label className="lbl">{T.f_make}</label>
              <select className={"inp" + (ferrs.make ? " err" : "")} value={form.make} onChange={e => set("make", e.target.value)}>
                <option value="">{T.f_make}</option>{MAKES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <FieldErr msg={ferrs.make} />
            </div>
            <div>
              <label className="lbl">{T.f_model}</label>
              <ModelInput make={form.make} value={form.model} onChange={v => set("model", v)} error={ferrs.model} />
              <FieldErr msg={ferrs.model} />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="lbl">{T.f_trim}</label>
            <TrimInput make={form.make} model={form.model} value={form.trim} onChange={v => set("trim", v)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div><label className="lbl">{T.g_nick}</label><input className="inp" placeholder={T.g_nick} value={form.nickname} maxLength={MAX_NICK} onChange={e => set("nickname", e.target.value)} /></div>
            <div><label className="lbl">{T.g_mile}</label><input className="inp" placeholder={T.g_mile} value={form.mileage} maxLength={MAX_MILE} onChange={e => set("mileage", e.target.value.replace(/[^0-9,]/g, ""))} /></div>
          </div>
          <button className="btn btn-sm" onClick={handleAdd}>{T.g_add_btn}</button>
        </div>
      )}
      {vehicles.length === 0 ? (
        <div className="empty">
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚗</div>
          <p style={{ fontSize: 18, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, color: "#222", marginBottom: 8 }}>{T.g_empty_h}</p>
          <p style={{ fontSize: 14, marginBottom: 20 }}>{T.g_empty_p}</p>
          <button className="btn btn-sm" onClick={() => setSF(true)}>{T.g_add_first}</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {vehicles.map(v => {
            const maint = maintenanceForMileage(v.mileage, v.make, v.model, v.trim, lang);
            const open = maintFor === v.id;
            return (
            <div key={v.id} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex" }}>
                <div className="gcard" style={{ flex: 1, borderRadius: open ? "9px 0 0 0" : "9px 0 0 9px", borderRight: "none" }} onClick={() => onSelect(v)}>
                  <div style={{ width: 44, height: 44, background: "#e84a2a18", border: "1px solid #e84a2a22", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🚗</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>{v.year} {v.make} {v.model}{v.trim && <span style={{ color: "#666", fontWeight: 400 }}> · {v.trim}</span>}{v.nickname && <span style={{ color: "#444", fontWeight: 400, fontSize: 14 }}> · {v.nickname}</span>}</p>
                    <div style={{ display: "flex", gap: 10 }}>{v.mileage && <span style={{ fontSize: 12, color: "#444" }}>{v.mileage} mi</span>}<span style={{ fontSize: 12, color: "#2a2a2a" }}>{fmt(v.addedAt)}</span></div>
                  </div>
                  <span style={{ color: "#e84a2a", fontSize: 13, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700 }}>{T.g_cta}</span>
                </div>
                <button className="btn-danger" style={{ borderRadius: open ? "0 9px 0 0" : "0 9px 9px 0", padding: "0 16px", borderLeft: "none" }} onClick={() => setC(v.id)}>✕</button>
              </div>
              {maint && (
                <button type="button" onClick={() => setMaintFor(open ? null : v.id)} style={{ textAlign: "left", background: open ? "#0c0c0c" : "#0a0a0a", border: "1px solid #181818", borderTop: "none", borderRadius: open ? 0 : "0 0 9px 9px", padding: "9px 14px", cursor: "pointer", color: "#e84a2a", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}>
                  🔧 {T.g_maint}{v.mileage ? " — " + v.mileage + " mi" : ""} <span style={{ marginLeft: "auto", color: "#555", transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}>▾</span>
                </button>
              )}
              {maint && open && (
                <div style={{ background: "#0c0c0c", border: "1px solid #181818", borderTop: "none", borderRadius: "0 0 9px 9px", padding: "4px 14px 14px" }}>
                  {maint.map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 9, padding: "6px 0", alignItems: "flex-start" }}>
                      <span style={{ color: "#e84a2a", fontSize: 13, marginTop: 1, flexShrink: 0 }}>›</span>
                      <span style={{ color: "#999", fontSize: 13.5, lineHeight: 1.55 }}>{s}</span>
                    </div>
                  ))}
                  <p style={{ fontSize: 11, color: "#3a3a3a", marginTop: 8, lineHeight: 1.5 }}>{T.g_maint_note}</p>
                </div>
              )}
            </div>
            );
          })}
        </div>
      )}
      {confirm && <ConfirmModal title={T.g_rem_title} message={T.g_rem_msg} confirmLabel="Remove" onConfirm={() => { onDelete(confirm); setC(null); }} onCancel={() => setC(null)} />}
    </div>
  );
}

function HistoryPage({ history, onDelete }) {
  const lang = useLang(), T = S[lang] || S.en;
  const [exp, setExp] = useState(null);
  const [search, setQ] = useState("");
  const [sortBy, setSort] = useState("date");
  const [confirm, setC] = useState(null);
  const D_ORD = { Beginner: 0, Intermediate: 1, Advanced: 2 };
  const filtered = history.filter(h => !search || [h.year, h.make, h.model, h.problem].join(" ").toLowerCase().includes(search.toLowerCase())).sort((a, b) => sortBy === "date" ? b.ts - a.ts : sortBy === "difficulty" ? (D_ORD[b.difficulty] || 0) - (D_ORD[a.difficulty] || 0) : (a.year + a.make + a.model).localeCompare(b.year + b.make + b.model));
  return (
    <div className="fu">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 36, fontWeight: 900, marginBottom: 6 }}>{T.h_title}</h2>
        <p style={{ color: "#444", fontSize: 14 }}>{T.h_sub}</p>
      </div>
      {history.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", gap: 12, marginBottom: 24 }}>
          <div className="sbox"><span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 30, fontWeight: 900, color: "#e84a2a" }}>{history.length}</span><span style={{ fontSize: 11, color: "#333", fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: 1.5, textTransform: "uppercase" }}>{T.h_total}</span></div>
          {["Beginner", "Intermediate", "Advanced"].map(d => (
            <div key={d} className="sbox"><span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 30, fontWeight: 900, color: dclr(d) }}>{history.filter(h => h.difficulty === d).length}</span><span style={{ fontSize: 11, color: "#333", fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: 1.5, textTransform: "uppercase" }}>{d}</span></div>
          ))}
        </div>
      )}
      {history.length > 1 && (
        <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}><label className="lbl">{T.h_slbl}</label><input className="inp" placeholder={T.h_search} value={search} onChange={e => setQ(e.target.value)} /></div>
          <div style={{ minWidth: 200 }}>
            <label className="lbl">{T.h_sortlbl}</label>
            <select className="inp" value={sortBy} onChange={e => setSort(e.target.value)}>
              <option value="date">{T.h_date}</option><option value="difficulty">{T.h_diff}</option><option value="vehicle">{T.h_veh}</option>
            </select>
          </div>
        </div>
      )}
      {filtered.length === 0 ? (
        <div className="empty">
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <p style={{ fontSize: 18, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, color: "#222", marginBottom: 8 }}>{history.length === 0 ? T.h_empty_h : T.h_nores}</p>
          <p style={{ fontSize: 14 }}>{history.length === 0 ? T.h_empty_p : T.h_try}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(h => (
            <div key={h.id} className="card">
              <div style={{ padding: "16px 18px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }} onClick={() => setExp(exp === h.id ? null : h.id)}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{h.year} {h.make} {h.model}{h.trim && <span style={{ color: "#666", fontWeight: 400 }}> · {h.trim}</span>}</span>
                    {h.difficulty && <DiffBadge level={h.difficulty} />}
                    {h.lang === "es" && <span className="tag tag-blue" style={{ fontSize: 10 }}>ES</span>}
                  </div>
                  <p style={{ color: "#555", fontSize: 13, marginBottom: 4 }}>{h.problem}</p>
                  <p style={{ color: "#2a2a2a", fontSize: 11, fontFamily: "'Barlow Condensed',sans-serif" }}>{fmt(h.ts)}</p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button className="btn-danger" onClick={e => { e.stopPropagation(); setC(h.id); }}>Del</button>
                  <span style={{ color: "#2a2a2a", fontSize: 16 }}>{exp === h.id ? "▲" : "▼"}</span>
                </div>
              </div>
              {exp === h.id && h.result && (() => {
                const parsedSecs = resultToSections(h.result, h.lang || lang, {year:h.year,make:h.make,model:h.model,trim:h.trim,problem:h.problem});
                const hRT = (() => { try { const g = h.result && h.result.trim().startsWith("{") ? JSON.parse(h.result) : null; return g?.repair_target || ""; } catch { return ""; } })();
                return (
                  <div style={{ borderTop: "1px solid #111", padding: "18px 18px 20px" }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                      <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => printGuide(h.year, h.make, h.model, h.problem, parsedSecs, h.lang || "en")}>{T.btn_print}</button>
                      <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => exportGuide(h.year, h.make, h.model, h.problem, parsedSecs)}>{T.btn_export}</button>
                    </div>
                    <ResultSecs sections={parsedSecs} videos={[]} ytTerms={extractYT(parsedSecs)} hasYT={false} pq={partsQ(h.year, h.make, h.model, h.problem, hRT)} loadVids={false} vehicleCtx={{year:h.year,make:h.make,model:h.model,trim:h.trim}} />
                  </div>
                );
              })()}
            </div>
          ))}
        </div>
      )}
      {confirm && <ConfirmModal title={T.h_del_title} message={T.h_del_msg} confirmLabel="Delete" onConfirm={() => { onDelete(confirm); setC(null); }} onCancel={() => setC(null)} />}
    </div>
  );
}

function SettingsPage({ ytKey, defState, onSave, onClear, lang, onLangChange }) {
  const T = S[lang] || S.en;
  const [key, setKey] = useState(ytKey || "");
  const [st, setSt] = useState(defState || "");
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);
  const [keyErr, setKErr] = useState("");
  const [confirm, setC] = useState(false);
  const handleSave = () => {
    const trimmed = key.trim();
    if (!isValidYTKey(trimmed)) { setKErr(T.yt_key_err); return; }
    if (st && !VALID_STATES.has(st)) return;
    setKErr(""); onSave({ ytApiKey: trimmed, defaultState: st }); setSaved(true); setTimeout(() => setSaved(false), 2500);
  };
  return (
    <div className="fu">
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 36, fontWeight: 900, marginBottom: 6 }}>{T.st_title}</h2>
        <p style={{ color: "#444", fontSize: 14 }}>{T.st_sub}</p>
      </div>
      <div className="card" style={{ padding: "4px 24px 20px", marginBottom: 18 }}>
        <div className="srow">
          <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{T.st_lang_h}</p>
          <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, marginBottom: 12 }}>{T.st_lang_d}</p>
          <LangToggle lang={lang} onToggle={onLangChange} />
        </div>
        <div className="srow">
          <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{T.st_yt_h}</p>
          <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, marginBottom: 10 }}>{T.st_yt_d} {ytKey ? <span className="tag tag-green">{T.st_active}</span> : <span className="tag tag-gray">{T.st_not_set}</span>}</p>
          <div className="key-wrap">
            <input className={"inp" + (keyErr ? " err" : "")} type={show ? "text" : "password"} placeholder="AIza…" value={key} maxLength={45} onChange={e => { setKey(e.target.value); setKErr(""); }} style={{ paddingRight: 44 }} />
            <button className="key-eye" onClick={() => setShow(v => !v)} type="button">{show ? "🙈" : "👁"}</button>
          </div>
          {keyErr && <FieldErr msg={keyErr} />}
          <div style={{ marginTop: 10, padding: "10px 14px", background: "#090909", border: "1px solid #181818", borderRadius: 7 }}><p style={{ fontSize: 12, color: "#444", lineHeight: 1.7 }}>{T.st_yt_hint}</p></div>
          <div style={{ marginTop: 10, padding: "10px 14px", background: "#0d0a00", border: "1px solid #2a2000", borderRadius: 7 }}><p style={{ fontSize: 12, color: "#665500", lineHeight: 1.6 }}>{T.st_yt_priv}</p></div>
        </div>
        <div className="srow">
          <label style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, display: "block" }}>{T.st_state_h}</label>
          <p style={{ fontSize: 13, color: "#555", marginBottom: 10 }}>{T.st_state_d}</p>
          <select className="inp" value={st} onChange={e => setSt(e.target.value)}>
            <option value="">{T.st_no_default}</option>
            {US_STATES.map(s => <option key={s.code} value={s.code}>{s.name} — ${LABOR[s.r]?.lo}–${LABOR[s.r]?.hi}/hr</option>)}
          </select>
        </div>
        <div style={{ paddingTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn-sm" onClick={handleSave}>{saved ? T.st_saved : T.st_save}</button>
          {key && <button className="btn-ghost" onClick={() => { setKey(""); setKErr(""); onSave({ ytApiKey: "", defaultState: st }); }}>{T.st_clear_key}</button>}
        </div>
      </div>
      <div className="card" style={{ padding: "4px 24px 20px" }}>
        <div className="srow">
          <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{T.st_data_h}</p>
          <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, marginBottom: 12 }}>{T.st_data_d}</p>
          <button className="btn-danger" style={{ padding: "10px 20px", fontSize: 13 }} onClick={() => setC(true)}>{T.st_data_btn}</button>
        </div>
      </div>
      {confirm && <ConfirmModal title={T.st_clear_title} message={T.st_clear_msg} confirmLabel={T.st_clear_confirm} onConfirm={() => { onClear(); setC(false); }} onCancel={() => setC(false)} />}
    </div>
  );
}

function AboutPage() {
  const lang = useLang(), T = S[lang] || S.en;
  const feats = [{ i: "🤖", t: T.f1t, d: T.f1d }, { i: "💰", t: T.f2t, d: T.f2d }, { i: "📊", t: T.f3t, d: T.f3d }, { i: "🛠️", t: T.f4t, d: T.f4d }, { i: "🛒", t: T.f5t, d: T.f5d }, { i: "🎥", t: T.f6t, d: T.f6d }, { i: "🏠", t: T.f7t, d: T.f7d }, { i: "📋", t: T.f8t, d: T.f8d }];
  return (
    <div className="fu">
      <div style={{ marginBottom: 32 }}>
        <span className="tag tag-red" style={{ marginBottom: 14, display: "inline-block" }}>{T.ab_tag}</span>
        <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "clamp(32px,7vw,52px)", fontWeight: 900, lineHeight: 1, marginBottom: 16 }}>
          {T.ab_h}<br /><span style={{ color: "#e84a2a" }}>{T.ab_hb}</span>
        </h2>
        <p style={{ color: "#555", fontSize: 16, lineHeight: 1.7, maxWidth: 520 }}>{T.ab_desc}</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14, marginBottom: 28 }}>
        {feats.map((f, i) => (
          <div key={i} className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 26, marginBottom: 10 }}>{f.i}</div>
            <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 17, fontWeight: 800, marginBottom: 7 }}>{f.t}</p>
            <p style={{ color: "#555", fontSize: 14, lineHeight: 1.6 }}>{f.d}</p>
          </div>
        ))}
      </div>
      <div className="card" style={{ padding: 22, marginBottom: 14 }}>
        <p className="lbl" style={{ marginBottom: 12 }}>{T.ab_vehicles}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {MAKES.filter(m => m !== "Other").map(m => <span key={m} className="tag tag-gray">{m}</span>)}
        </div>
      </div>
      <div style={{ background: "#e84a2a08", border: "1px solid #e84a2a18", borderRadius: 10, padding: 22 }}>
        <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 800, color: "#e84a2a", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>{T.ab_disc_h}</p>
        <p style={{ color: "#555", fontSize: 14, lineHeight: 1.7 }}>{T.ab_disc}</p>
      </div>
    </div>
  );
}

function AppShell({ onGoHome, vehicles, history, ytKey, defState, onSaveSettings, onClearAll, onAddVehicle, onDelVehicle, onSelVehicle, onSaveHist, onDelHist, prefill, lang, onLangChange }) {
  const T = S[lang] || S.en;
  const [page, setPage] = useState(() => ssPage.load());
  const nav = p => { setPage(p); ssPage.save(p); };
  const icons = { home: "🔍", garage: "🏠", history: "📋", settings: "⚙️", about: "ℹ️" };
  const labels = { home: T.nav_diagnose, garage: T.nav_garage, history: T.nav_history, settings: T.nav_settings, about: T.nav_about };
  return (
    <>
      <nav style={{ position: "sticky", top: 0, zIndex: 200, background: "#080808ee", backdropFilter: "blur(12px)", borderBottom: "1px solid #111", padding: "0 16px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", height: 54, gap: 4 }}>
          <button onClick={onGoHome} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, marginRight: 8, padding: "4px 0", minHeight: 44 }}>
            <div style={{ width: 26, height: 26, background: "#e84a2a", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }}><WrenchMark color="#fff" size={24} /></div>
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 18, fontWeight: 900 }}>FIXCOST<span style={{ color: "#e84a2a" }}> AI</span></span>
          </button>
          <div style={{ display: "flex", gap: 2, flex: 1, overflowX: "auto" }}>
            {["home", "garage", "history", "settings", "about"].map(id => (
              <button key={id} className={"npill" + (page === id ? " on" : "")} onClick={() => nav(id)}>
                <span>{icons[id]}</span>
                <span style={{ whiteSpace: "nowrap" }}>{labels[id]}</span>
                {id === "garage" && vehicles.length > 0 && <span style={{ background: "#e84a2a", borderRadius: 10, fontSize: 10, padding: "1px 6px", color: "#fff", fontWeight: 800 }}>{vehicles.length}</span>}
                {id === "history" && history.length > 0 && <span style={{ background: "#252525", borderRadius: 10, fontSize: 10, padding: "1px 6px", color: "#777", fontWeight: 800 }}>{history.length}</span>}
                {id === "settings" && ytKey && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />}
              </button>
            ))}
          </div>
          <LangToggle lang={lang} onToggle={onLangChange} />
        </div>
      </nav>
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 18px 80px" }}>
        {page === "home" && <DiagnosePage key={prefill?.id || "home"} prefill={prefill} onSaveHist={onSaveHist} ytKey={ytKey} defState={defState} />}
        {page === "garage" && <GaragePage vehicles={vehicles} onAdd={onAddVehicle} onDelete={onDelVehicle} onSelect={v => { onSelVehicle(v); nav("home"); }} />}
        {page === "history" && <HistoryPage history={history} onDelete={onDelHist} />}
        {page === "settings" && <SettingsPage ytKey={ytKey} defState={defState} onSave={onSaveSettings} onClear={onClearAll} lang={lang} onLangChange={onLangChange} />}
        {page === "about" && <AboutPage />}
      </main>
    </>
  );
}

function LandingPage({ onLaunch, lang, onLangChange }) {
  const T = S[lang] || S.en;
  const [scrolled, setScrolled] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(null);
  const [hf, setHF] = useState({ year: "", make: "", model: "", trim: "", problem: "" });
  const [showSym, setShowSym] = useState(false);
  const ISSUES = [T.ci1,T.ci2,T.ci3,T.ci4,T.ci5,T.ci6,T.ci7,T.ci8,T.ci9,T.ci10,T.ci11,T.ci12,T.ci13,T.ci14,T.ci15,T.ci16];
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  const scroll = id => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const sh = (k, v) => setHF(f => ({ ...f, [k]: v }));
  const canGo = hf.year && hf.make && hf.model.trim() && hf.problem.trim();
  const feats = [{ i: "🤖", t: T.f1t, d: T.f1d }, { i: "💰", t: T.f2t, d: T.f2d }, { i: "📊", t: T.f3t, d: T.f3d }, { i: "🛠️", t: T.f4t, d: T.f4d }, { i: "🛒", t: T.f5t, d: T.f5d }, { i: "🎥", t: T.f6t, d: T.f6d }, { i: "🏠", t: T.f7t, d: T.f7d }, { i: "📋", t: T.f8t, d: T.f8d }];
  const faqs = [{ q: T.faq_1q, a: T.faq_1a }, { q: T.faq_2q, a: T.faq_2a }, { q: T.faq_3q, a: T.faq_3a }, { q: T.faq_4q, a: T.faq_4a }];
  return (
    <div>
      <nav className="lnav" style={{ borderBottomColor: scrolled ? "#151515" : "transparent" }}>
        <div className="lnav-inner">
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
            <div style={{ width: 28, height: 28, background: "#e84a2a", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }}><WrenchMark color="#fff" size={26} /></div>
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 20, fontWeight: 900 }}>FIXCOST<span style={{ color: "#e84a2a" }}> AI</span></span>
          </div>
          <div className="lnav-links">
            {[[T.lnk_feat, "features"], [T.lnk_how, "how"], [T.lnk_faq, "faq"]].map(([l, id]) => (
              <button key={id} className="llink" onClick={() => scroll(id)}>{l}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <LangToggle lang={lang} onToggle={onLangChange} />
            <button className="btn btn-sm" onClick={() => onLaunch(null)}>{T.launch}</button>
          </div>
        </div>
      </nav>
      <main>
        <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden", paddingTop: 80 }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 40%,#e84a2a0d 0%,transparent 65%)", pointerEvents: "none" }} />
          <div className="wrap" style={{ width: "100%", paddingTop: 40, paddingBottom: 80 }}>
            <div className="hgrid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
              <div>
                <div className="fu" style={{ marginBottom: 16 }}><span className="tag tag-red">{T.hero_tag}</span></div>
                <h1 className="fu2" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "clamp(48px,6vw,84px)", fontWeight: 900, lineHeight: 0.92, letterSpacing: -2, marginBottom: 24 }}>
                  {T.hero_h1}<br /><span style={{ color: "#e84a2a" }}>{T.hero_h1b}</span><br />{T.hero_h1c}
                </h1>
                <p className="fu3" style={{ color: "#555", fontSize: 18, lineHeight: 1.7, marginBottom: 32, maxWidth: 460 }}>{T.hero_desc}</p>
                <div className="fu4" style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                  <button className="btn" style={{ fontSize: 18, padding: "15px 32px" }} onClick={() => onLaunch(null)}>{T.hero_cta}</button>
                  <span style={{ color: "#2a2a2a", fontSize: 13 }}>{T.hero_no_acct}</span>
                </div>
              </div>
              <div className="hform" style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 14, padding: 28 }}>
                <p className="lbl" style={{ marginBottom: 20 }}>{T.hero_quick}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <div><label className="lbl">{T.f_year}</label><select className="inp" style={{ background: "#080808" }} value={hf.year} onChange={e => sh("year", e.target.value)}><option value="">{T.f_year}</option>{YEARS.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
                  <div><label className="lbl">{T.f_make}</label><select className="inp" style={{ background: "#080808" }} value={hf.make} onChange={e => sh("make", e.target.value)}><option value="">{T.f_make}</option>{MAKES.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                </div>
                <div style={{ marginBottom: 12 }}><label className="lbl">{T.f_model}</label><ModelInput make={hf.make} value={hf.model} onChange={v => sh("model", v)} style={{ background: "#080808" }} /></div>
                <div style={{ marginBottom: 12 }}><label className="lbl">{T.f_trim}</label><TrimInput make={hf.make} model={hf.model} value={hf.trim} onChange={v => sh("trim", v)} style={{ background: "#080808" }} /></div>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <label className="lbl" style={{ marginBottom: 0 }}>{T.f_problem}</label>
                    <button type="button" className="btn-ghost" style={{ fontSize: 11, padding: "5px 10px" }} onClick={() => setShowSym(v => !v)}>{showSym ? T.f_hide : T.sym_btn}</button>
                  </div>
                  {showSym && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 12 }}>
                      {ISSUES.map((iss, i) => {
                        const sel = (hf.problem || "").split(/;\s*/).map(s => s.trim()).includes(iss);
                        return (
                          <button key={i} type="button" className={"pill" + (sel ? " pill-on" : "")} aria-pressed={sel}
                            onClick={() => {
                              const p = (hf.problem || "").split(/;\s*/).map(s => s.trim()).filter(Boolean);
                              const idx = p.indexOf(iss);
                              if (idx >= 0) p.splice(idx, 1); else p.push(iss);
                              sh("problem", p.join("; "));
                            }}>{sel ? "✓ " : ""}{iss}</button>
                        );
                      })}
                    </div>
                  )}
                  <textarea className="inp" style={{ background: "#080808", resize: "none" }} placeholder={T.f_ph} value={hf.problem} maxLength={MAX_PROBLEM + 20} onChange={e => sh("problem", e.target.value)} rows={3} />
                </div>
                <button className="btn" style={{ width: "100%", justifyContent: "center", fontSize: 16 }} onClick={() => canGo && onLaunch(hf)} disabled={!canGo}>{T.hero_go}</button>
                <p style={{ fontSize: 12, color: "#2a2a2a", textAlign: "center", marginTop: 12 }}>
                  {T.hero_or} <button style={{ background: "none", border: "none", color: "#e84a2a", cursor: "pointer", fontSize: 12 }} onClick={() => onLaunch(null)}>{T.hero_browse}</button>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="how" style={{ padding: "80px 0", borderTop: "1px solid #0e0e0e" }}>
          <div className="wrap">
            <div style={{ marginBottom: 48, textAlign: "center" }}>
              <span className="tag tag-gray" style={{ marginBottom: 14, display: "inline-block" }}>{T.how_tag}</span>
              <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "clamp(32px,5vw,52px)", fontWeight: 900, letterSpacing: -1 }}>{T.how_h}</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 24 }}>
              {[{ n: "01", t: T.s1t, d: T.s1d }, { n: "02", t: T.s2t, d: T.s2d }, { n: "03", t: T.s3t, d: T.s3d }].map((s, i) => (
                <div key={i} style={{ padding: 24, background: "#0c0c0c", border: "1px solid #181818", borderRadius: 12 }}>
                  <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 48, fontWeight: 900, color: "#e84a2a18", lineHeight: 1, marginBottom: 12 }}>{s.n}</p>
                  <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{s.t}</p>
                  <p style={{ color: "#555", fontSize: 14, lineHeight: 1.65 }}>{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" style={{ padding: "80px 0", background: "#050505", borderTop: "1px solid #0e0e0e", borderBottom: "1px solid #0e0e0e" }}>
          <div className="wrap">
            <div style={{ marginBottom: 48, textAlign: "center" }}>
              <span className="tag tag-gray" style={{ marginBottom: 14, display: "inline-block" }}>{T.feat_tag}</span>
              <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "clamp(32px,5vw,52px)", fontWeight: 900, letterSpacing: -1 }}>
                {T.feat_h}<br /><span style={{ color: "#e84a2a" }}>{T.feat_hb}</span>
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
              {feats.map((f, i) => (
                <article key={i} className="fc">
                  <div style={{ fontSize: 28, marginBottom: 12 }}>{f.i}</div>
                  <h3 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{f.t}</h3>
                  <p style={{ color: "#555", fontSize: 14, lineHeight: 1.65 }}>{f.d}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" style={{ padding: "80px 0", borderBottom: "1px solid #0e0e0e" }}>
          <div className="wrap" style={{ maxWidth: 680, margin: "0 auto" }}>
            <div style={{ marginBottom: 48, textAlign: "center" }}>
              <span className="tag tag-gray" style={{ marginBottom: 14, display: "inline-block" }}>{T.faq_tag}</span>
              <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "clamp(28px,5vw,44px)", fontWeight: 900, letterSpacing: -1 }}>FAQ</h2>
            </div>
            {faqs.map((f, i) => (
              <div key={i} className="faq-item">
                <button className="faq-q" onClick={() => setOpenFAQ(openFAQ === i ? null : i)}>
                  <span>{f.q}</span>
                  <span style={{ color: openFAQ === i ? "#e84a2a" : "#333", fontSize: 20, transition: "transform .2s", transform: openFAQ === i ? "rotate(45deg)" : "none" }}>+</span>
                </button>
                {openFAQ === i && <p className="faq-a">{f.a}</p>}
              </div>
            ))}
          </div>
        </section>

        <section style={{ padding: "80px 0", background: "linear-gradient(135deg,#0e0505,#080808,#050e08)" }}>
          <div className="wrap" style={{ textAlign: "center" }}>
            <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "clamp(36px,6vw,64px)", fontWeight: 900, letterSpacing: -2, lineHeight: 0.95, marginBottom: 20 }}>
              {T.cta_h}<br /><span style={{ color: "#e84a2a" }}>{T.cta_hb}</span>
            </h2>
            <p style={{ color: "#555", fontSize: 17, lineHeight: 1.7, maxWidth: 400, margin: "0 auto 32px" }}>{T.cta_desc}</p>
            <button className="btn" style={{ fontSize: 20, padding: "16px 40px" }} onClick={() => onLaunch(null)}>{T.cta_btn}</button>
          </div>
        </section>
      </main>
      <footer className="foot">
        <div className="foot-inner">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 24, height: 24, background: "#e84a2a", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }}><WrenchMark color="#fff" size={22} /></div>
              <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 17, fontWeight: 900 }}>FIXCOST<span style={{ color: "#e84a2a" }}> AI</span></span>
            </div>
            <p style={{ color: "#2a2a2a", fontSize: 13, lineHeight: 1.7, maxWidth: 260 }}>{T.foot_desc}</p>
          </div>
          <div>
            <p style={{ fontSize: 12, color: "#333", lineHeight: 1.8, maxWidth: 280 }}>{T.foot_legal}</p>
            <p style={{ color: "#1e1e1e", fontSize: 12, marginTop: 16 }}>{T.foot_copy}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("landing");
  const [prefill, setPF] = useState(null);
  const [vehicles, setVeh] = useState([]);
  const [history, setHist] = useState([]);
  const [ytKey, setYtKey] = useState("");
  const [defState, setDS] = useState("");
  const [lang, setLang] = useState(() => ssLang.load() || "en");
  const [toast, setToast] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [vKeys, hKeys, settings] = await Promise.all([sl("garage:"), sl("history:"), sg("settings")]);
        const [vl, hl] = await Promise.all([Promise.all(vKeys.map(k => sg(k))), Promise.all(hKeys.map(k => sg(k)))]);
        setVeh(vl.filter(isValidVehicle));
        setHist(hl.filter(isValidHistory));
        if (settings && typeof settings === "object") {
          if (typeof settings.ytApiKey === "string" && isValidYTKey(settings.ytApiKey)) setYtKey(settings.ytApiKey);
          if (typeof settings.defaultState === "string" && VALID_STATES.has(settings.defaultState)) setDS(settings.defaultState);
          if (settings.lang === "en" || settings.lang === "es") { setLang(settings.lang); ssLang.save(settings.lang); }
        }
      } catch {}
      setLoaded(true);
    })();
  }, []);

  const T = S[lang] || S.en;
  const toast_ = (msg, type) => setToast({ msg, type: type || "success" });
  const goApp = form => { if (form) setPF({ ...form, id: gid() }); setView("app"); window.scrollTo(0, 0); };
  const goHome = () => { setView("landing"); window.scrollTo(0, 0); };
  const changeLang = async l => { setLang(l); ssLang.save(l); const cur = await sg("settings") || {}; await ss2("settings", { ...cur, lang: l }); };
  const addV = async v => { await ss2("garage:" + v.id, v); setVeh(p => [...p, v]); toast_(v.year + " " + v.make + " " + v.model + " " + T.t_added); };
  const delV = async id => { await sd("garage:" + id); setVeh(p => p.filter(v => v.id !== id)); toast_(T.t_removed, "warn"); };
  const selV = v => setPF({ ...v, id: gid() });
  const saveH = r => { setHist(p => [...p, r]); toast_(T.t_gsaved); };
  const delH = async id => { await sd("history:" + id); setHist(p => p.filter(h => h.id !== id)); toast_(T.t_gdel, "warn"); };
  const saveSets = async ({ ytApiKey: k, defaultState: s }) => {
    if (!isValidYTKey(k)) return;
    if (s && !VALID_STATES.has(s)) return;
    const cur = await sg("settings") || {};
    await ss2("settings", { ...cur, ytApiKey: k, defaultState: s });
    setYtKey(k); setDS(s); toast_(T.t_settings);
  };
  const clearAll = async () => {
    const [vk, hk] = await Promise.all([sl("garage:"), sl("history:")]);
    await Promise.all([...vk.map(k => sd(k)), ...hk.map(k => sd(k)), sd("settings")]);
    setVeh([]); setHist([]); setYtKey(""); setDS("");
    try { sessionStorage.clear(); } catch {}
    toast_(T.t_cleared, "warn");
  };

  if (!loaded) {
    return (
      <div style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <WrenchLoader size={88} />
      </div>
    );
  }
  return (
    <LangCtx.Provider value={lang}>
      <style>{CSS}</style>
      <WrenchBackground />
      <div style={{ position: "relative", zIndex: 1 }}>
        {view === "landing" && <LandingPage onLaunch={goApp} lang={lang} onLangChange={changeLang} />}
        {view === "app" && (
          <AppShell onGoHome={goHome} vehicles={vehicles} history={history}
            ytKey={ytKey} defState={defState}
            onSaveSettings={saveSets} onClearAll={clearAll}
            onAddVehicle={addV} onDelVehicle={delV} onSelVehicle={selV}
            onSaveHist={saveH} onDelHist={delH} prefill={prefill}
            lang={lang} onLangChange={changeLang} />
        )}
      </div>
      {toast && <ToastEl message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </LangCtx.Provider>
  );
}
