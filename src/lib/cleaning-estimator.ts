export type EstimatorMode = "time" | "price";
export type EstimatorCondition = "maintained" | "attention" | "heavy";
export type EstimatorPhase = "base" | "detail";
export type EstimatorCategory = "bedroom" | "bathroom" | "kitchen" | "common" | "basement";
export type EstimatorBasis = "bedrooms" | "bathrooms" | "property" | "basement" | "item";

export type EstimatorTask = {
  id: string;
  category: EstimatorCategory;
  phase: EstimatorPhase;
  label: string;
  min: number;
  max: number;
  basis: EstimatorBasis;
  baseline?: boolean;
  helper?: string;
  wall?: boolean;
  defaultQty?: number;
};

export type EstimatorConfig = {
  version: string;
  baseCents: number;
  includedMinutes: number;
  extraHourCents: number;
  incrementMinutes: number;
  gstRate: number;
  carpetMinimumCents: number;
  carpetRoomCents: number;
  carpetHallCents: number;
  carpetStairsCents: number;
  carpetClosetCents: number;
  carpetHeavyFromCents: number;
  manualQuoteMinutes: number;
  popupTriggerMinutes: number;
  timeModeEnabled: boolean;
  priceModeEnabled: boolean;
};

export const DEFAULT_ESTIMATOR_CONFIG: EstimatorConfig = {
  version: "camz-estimator-2026-09-v1",
  baseCents: 17900,
  includedMinutes: 240,
  extraHourCents: 4000,
  incrementMinutes: 15,
  gstRate: 0.05,
  carpetMinimumCents: 10000,
  carpetRoomCents: 4000,
  carpetHallCents: 2500,
  carpetStairsCents: 5000,
  carpetClosetCents: 1500,
  carpetHeavyFromCents: 2500,
  manualQuoteMinutes: 600,
  popupTriggerMinutes: 210,
  timeModeEnabled: true,
  priceModeEnabled: true,
};

const task = (
  id: string, category: EstimatorCategory, phase: EstimatorPhase, label: string,
  min: number, max: number, basis: EstimatorBasis, extra: Partial<EstimatorTask> = {},
): EstimatorTask => ({ id, category, phase, label, min, max, basis, ...extra });

export const DEFAULT_ESTIMATOR_TASKS: EstimatorTask[] = [
  task("bed_dust","bedroom","base","General dusting and accessible surfaces",8,12,"bedrooms",{baseline:true}),
  task("bed_vacuum","bedroom","base","Vacuum flooring",5,10,"bedrooms",{baseline:true}),
  task("bed_mop","bedroom","base","Mop hard flooring",5,8,"bedrooms"),
  task("bed_furniture","bedroom","base","Wipe accessible furniture surfaces",5,10,"bedrooms",{baseline:true}),
  task("bed_baseboards","bedroom","detail","Detail baseboards",8,12,"bedrooms"),
  task("bed_sills","bedroom","detail","Clean window sills and ledges",3,5,"item",{defaultQty:1}),
  task("bed_blinds","bedroom","detail","Detail blinds",5,10,"item",{defaultQty:1}),
  task("bed_doors","bedroom","detail","Wipe doors and frames",3,6,"bedrooms"),
  task("bed_closet","bedroom","detail","Clean accessible empty closet interior",10,20,"item",{defaultQty:1,helper:"Closet must be empty and accessible."}),
  task("bed_wall_spot","bedroom","detail","Spot-clean accessible wall marks",15,30,"item",{defaultQty:1,wall:true}),
  task("bed_wall_full","bedroom","detail","Full wall washing",30,60,"item",{defaultQty:1,wall:true,helper:"Large or heavily soiled walls may require assessment."}),
  task("bath_toilet","bathroom","base","Clean and disinfect toilet",7,10,"bathrooms",{baseline:true}),
  task("bath_sink","bathroom","base","Clean sink, vanity and counter",7,10,"bathrooms",{baseline:true}),
  task("bath_mirror","bathroom","base","Clean mirror",3,5,"bathrooms",{baseline:true}),
  task("bath_tub","bathroom","base","Routine tub or shower cleaning",10,15,"bathrooms",{baseline:true}),
  task("bath_floor","bathroom","base","Vacuum and mop bathroom floor",5,8,"bathrooms",{baseline:true}),
  task("bath_cabinets","bathroom","detail","Wipe exterior cabinets",5,8,"bathrooms"),
  task("bath_baseboards","bathroom","detail","Detail baseboards",5,8,"bathrooms"),
  task("bath_doors","bathroom","detail","Wipe doors and frames",3,5,"bathrooms"),
  task("bath_soap","bathroom","detail","Heavy soap scum or mineral buildup",15,30,"item",{defaultQty:1,helper:"Apply only to affected bathrooms."}),
  task("bath_grout","bathroom","detail","Detailed grout attention",15,30,"item",{defaultQty:1}),
  task("bath_wall_spot","bathroom","detail","Spot-clean accessible wall marks",10,20,"item",{defaultQty:1,wall:true}),
  task("bath_wall_full","bathroom","detail","Full bathroom wall washing",25,45,"item",{defaultQty:1,wall:true}),
  task("kit_surfaces","kitchen","base","Counters and accessible surfaces",8,12,"property",{baseline:true}),
  task("kit_sink","kitchen","base","Clean sink and faucet",5,8,"property",{baseline:true}),
  task("kit_cooktop","kitchen","base","Clean cooktop exterior",8,12,"property",{baseline:true}),
  task("kit_appliances","kitchen","base","Wipe appliance exteriors",8,12,"property",{baseline:true}),
  task("kit_floor","kitchen","base","Vacuum and mop kitchen floor",10,15,"property",{baseline:true}),
  task("kit_backsplash","kitchen","detail","Detail backsplash",5,10,"property"),
  task("kit_cabinet_fronts","kitchen","detail","Detail cabinet fronts",10,20,"property"),
  task("kit_baseboards","kitchen","detail","Detail baseboards",8,12,"property"),
  task("kit_oven","kitchen","detail","Clean inside oven",30,60,"item",{defaultQty:1,helper:"Severe carbon buildup may require assessment."}),
  task("kit_fridge","kitchen","detail","Clean inside emptied refrigerator",25,45,"item",{defaultQty:1,helper:"Customer removes food before arrival."}),
  task("kit_cabinets","kitchen","detail","Clean inside emptied cabinets",45,90,"property",{helper:"Cabinets must be empty and accessible."}),
  task("kit_grease","kitchen","detail","Heavy grease or buildup",30,120,"property",{helper:"Results depend on material and severity."}),
  task("kit_wall_spot","kitchen","detail","Spot-clean accessible wall marks",15,30,"property",{wall:true}),
  task("kit_wall_full","kitchen","detail","Full kitchen wall washing",30,60,"property",{wall:true}),
  task("common_living","common","base","Living room general cleaning",25,40,"property",{baseline:true}),
  task("common_dining","common","base","Dining area cleaning",15,25,"property",{baseline:true}),
  task("common_hall","common","base","Hall and entrance cleaning",10,20,"property",{baseline:true}),
  task("common_stairs","common","base","Vacuum and wipe standard staircase",10,20,"item",{defaultQty:1}),
  task("common_baseboards","common","detail","Detail common-area baseboards",15,30,"property"),
  task("common_sills","common","detail","Clean window sills",3,5,"item",{defaultQty:4}),
  task("common_blinds","common","detail","Detail blinds",5,10,"item",{defaultQty:4}),
  task("common_doors","common","detail","Detail interior doors and frames",3,6,"item",{defaultQty:3}),
  task("common_wall_spot","common","detail","Spot-clean wall marks in selected area",15,30,"item",{defaultQty:1,wall:true}),
  task("common_wall_full","common","detail","Full wall washing in selected area",30,60,"item",{defaultQty:1,wall:true}),
  task("common_pet_hair","common","detail","Heavy pet-hair detailing",30,90,"property"),
  task("basement_general","basement","base","Basement common-area cleaning",30,60,"basement",{baseline:true}),
  task("basement_stairs","basement","detail","Detail basement stairs",10,20,"basement"),
  task("basement_baseboards","basement","detail","Detail basement baseboards",15,30,"basement"),
];

type SupabaseLike = { from: (table: string) => any };

export async function loadEstimatorDefinition(client: SupabaseLike) {
  const [settingsResult, tasksResult] = await Promise.all([
    client.from("cleaning_estimator_settings").select("*").eq("id", true).maybeSingle(),
    client.from("cleaning_estimator_tasks").select("*").eq("admin_active", true).eq("customer_visible", true).order("sort_order"),
  ]);
  const row = settingsResult.data;
  const config: EstimatorConfig = row ? {
    version: row.version,
    baseCents: row.base_price_cents,
    includedMinutes: row.included_minutes,
    extraHourCents: row.extra_hour_cents,
    incrementMinutes: row.billing_increment_minutes,
    gstRate: Number(row.gst_rate),
    carpetMinimumCents: row.carpet_minimum_cents,
    carpetRoomCents: row.carpet_room_cents,
    carpetHallCents: row.carpet_hall_cents,
    carpetStairsCents: row.carpet_stairs_cents,
    carpetClosetCents: row.carpet_closet_cents,
    carpetHeavyFromCents: row.carpet_heavy_from_cents,
    manualQuoteMinutes: row.manual_quote_minutes,
    popupTriggerMinutes: row.popup_trigger_minutes,
    timeModeEnabled: row.time_mode_enabled,
    priceModeEnabled: row.price_mode_enabled,
  } : DEFAULT_ESTIMATOR_CONFIG;
  const tasks: EstimatorTask[] = tasksResult.data?.length ? tasksResult.data.map((item: any) => ({
    id: item.task_id, category: item.category, phase: item.phase, label: item.label,
    min: item.minutes_min, max: item.minutes_max, basis: item.quantity_basis,
    baseline: item.baseline, helper: item.helper || undefined, wall: item.wall_disclaimer,
    defaultQty: item.default_quantity || undefined,
  })) : DEFAULT_ESTIMATOR_TASKS;
  return { config, tasks };
}

export function calculateAuthoritativeEstimate(input: {
  mode: EstimatorMode;
  budget: "fixed" | "extend";
  property: { bedrooms: number; fullBaths: number; halfBaths: number; size: string; basement: string; condition: EstimatorCondition; cleaners: number };
  carpet: { enabled: boolean; rooms: number; largeRooms: number; halls: number; stairs: number; closets: number; heavySoil: boolean; petTreatment: boolean };
  selected: Array<{ task_id: string; quantity?: number }>;
}, config: EstimatorConfig, tasks: EstimatorTask[]) {
  const sizes: Record<string, number> = { "under-900": .9, "900-1499": 1, "1500-1999": 1.15, "2000-2499": 1.3, "2500-plus": 1.5 };
  const selectedMap = new Map(input.selected.map(item => [item.task_id, item]));
  const quantity = (current: EstimatorTask) => {
    if (current.basis === "bedrooms") return input.property.bedrooms;
    if (current.basis === "bathrooms") return input.property.fullBaths + input.property.halfBaths * .6;
    if (current.basis === "basement") return input.property.basement === "none" ? 0 : 1;
    if (current.basis === "item") return Math.max(1, Math.min(30, Number(selectedMap.get(current.id)?.quantity || current.defaultQty || 1)));
    return sizes[input.property.size] || 1;
  };
  const selectedTasks = tasks.filter(current => selectedMap.has(current.id)).map(current => ({
    task_id: current.id, category: current.category, label: current.label,
    minutes_min: current.min, minutes_max: current.max, quantity: quantity(current), quantity_basis: current.basis,
  }));
  const factor = input.property.condition === "maintained" ? 1 : input.property.condition === "attention" ? 1.2 : 1.45;
  const minutes = selectedTasks.reduce((sum, current) => ({
    min: sum.min + current.minutes_min * current.quantity,
    max: sum.max + current.minutes_max * current.quantity,
  }), { min: 0, max: 0 });
  minutes.min *= factor; minutes.max *= factor;
  const shown = input.mode === "price" ? { min: Math.max(config.includedMinutes, minutes.min), max: Math.max(config.includedMinutes, minutes.max) } : minutes;
  const priceFor = (value: number) => {
    if (input.budget === "fixed" || value <= config.includedMinutes) return config.baseCents;
    const extra = Math.ceil((value - config.includedMinutes) / config.incrementMinutes) * config.incrementMinutes;
    return config.baseCents + Math.round(extra / 60 * config.extraHourCents);
  };
  const general = { min: priceFor(shown.min), max: priceFor(shown.max) };
  const c = input.carpet;
  const carpetSelected = c.enabled && c.rooms + c.largeRooms + c.halls + c.stairs + c.closets > 0;
  const carpetComponents = (c.rooms > 0 ? config.carpetMinimumCents + Math.max(0, c.rooms - 1) * config.carpetRoomCents : 0)
    + c.largeRooms * Math.round(config.carpetRoomCents * 1.5) + c.halls * config.carpetHallCents
    + c.stairs * config.carpetStairsCents + c.closets * config.carpetClosetCents + (c.heavySoil ? config.carpetHeavyFromCents : 0);
  const carpetPrice = carpetSelected ? Math.max(config.carpetMinimumCents, carpetComponents) : 0;
  const subtotal = { min: general.min + carpetPrice, max: general.max + carpetPrice };
  const gst = { min: Math.round(subtotal.min * config.gstRate), max: Math.round(subtotal.max * config.gstRate) };
  const total = { min: subtotal.min + gst.min, max: subtotal.max + gst.max };
  const fullWalls = selectedTasks.some(item => item.task_id.includes("wall_full"));
  const manual = input.property.condition === "heavy" || fullWalls || c.petTreatment || minutes.max > config.manualQuoteMinutes;
  const cleaners = Math.max(1, Math.min(4, Number(input.property.cleaners) || 1));
  return { selectedTasks, estimate: {
    estimator_version: config.version, mode: input.mode,
    general_minutes_min: Math.round(minutes.min), general_minutes_max: Math.round(minutes.max),
    general_man_hours_min: Number((minutes.min / 60).toFixed(2)), general_man_hours_max: Number((minutes.max / 60).toFixed(2)),
    cleaner_count: cleaners, onsite_minutes_min: Math.round(minutes.min / cleaners), onsite_minutes_max: Math.round(minutes.max / cleaners),
    base_price_cents: config.baseCents, included_minutes: config.includedMinutes,
    additional_hour_cents: config.extraHourCents, billing_increment_minutes: config.incrementMinutes,
    budget_choice: input.budget,
    general_price_min_cents: input.mode === "price" ? general.min : null, general_price_max_cents: input.mode === "price" ? general.max : null,
    carpet_price_cents: input.mode === "price" ? carpetPrice : null,
    subtotal_min_cents: input.mode === "price" ? subtotal.min : null, subtotal_max_cents: input.mode === "price" ? subtotal.max : null,
    gst_rate: config.gstRate, gst_min_cents: input.mode === "price" ? gst.min : null, gst_max_cents: input.mode === "price" ? gst.max : null,
    total_min_cents: input.mode === "price" ? total.min : null, total_max_cents: input.mode === "price" ? total.max : null,
    requires_manual_quote: manual, calculated_at: new Date().toISOString(),
  }};
}
