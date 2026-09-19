export type PricingServiceKey = "standard" | "deep" | "move_in_out";
export type PricingScope = PricingServiceKey | "carpet";
export type PricingAreaKey =
  | "bedrooms"
  | "fullBathrooms"
  | "halfBathrooms"
  | "kitchens"
  | "livingRooms"
  | "finishedBasement"
  | "stairFlights";

export type PricingAreaValues = Record<PricingAreaKey, number>;

export type PricingPackage = {
  id: string;
  name: string;
  description: string;
  basePriceCents: number;
  allowances: PricingAreaValues;
  customerSelectable: boolean;
  customQuote: boolean;
};

export type ServicePricingConfig = {
  id: PricingServiceKey;
  name: string;
  enabled: boolean;
  startingPriceCents: number;
  packages: PricingPackage[];
  additionalCharges: PricingAreaValues;
  includedItems: string[];
};

export type AddOnPriceType = "fixed" | "from" | "per_unit" | "custom_quote";

export type AddOnPricing = {
  id: string;
  name: string;
  priceType: AddOnPriceType;
  priceCents: number | null;
  unit: string | null;
  availableFor: PricingScope[];
  includedFor: PricingScope[];
  active: boolean;
  adminReview: boolean;
  note: string;
};

export type CarpetPricingConfig = {
  enabled: boolean;
  standaloneMinimumCents: number;
  firstStandardRoomCents: number;
  additionalStandardRoomCents: number;
  largeRoomCents: number;
  hallwayCents: number;
  stairFlightCents: number;
  smallAreaRugCents: number;
  heavyStainAreaCents: number;
  petUrineOdorCustomQuote: boolean;
};

export type CleaningPricingConfig = {
  schemaVersion: 1;
  currency: "CAD";
  tax: {
    enabled: boolean;
    label: string;
    rate: number;
  };
  services: Record<PricingServiceKey, ServicePricingConfig>;
  addOns: AddOnPricing[];
  carpet: CarpetPricingConfig;
  heavyCondition: {
    enabled: boolean;
    showReviewNotice: boolean;
    allowPhotoUpload: boolean;
    notifyAdmin: boolean;
    requiresAdminApproval: boolean;
    allowInstantBooking: boolean;
  };
  customQuote: {
    enabled: boolean;
    bedroomThreshold: number;
    unusualLayoutRequiresReview: boolean;
    unsafeOrComplexRequiresReview: boolean;
    petUrineOdorRequiresQuote: boolean;
  };
};

const emptyAllowances = (): PricingAreaValues => ({
  bedrooms: 0,
  fullBathrooms: 0,
  halfBathrooms: 0,
  kitchens: 0,
  livingRooms: 0,
  finishedBasement: 0,
  stairFlights: 0,
});

const allowances = (values: Partial<PricingAreaValues>): PricingAreaValues => ({
  ...emptyAllowances(),
  ...values,
});

export const PRICING_AREA_LABELS: Record<PricingAreaKey, string> = {
  bedrooms: "Bedrooms",
  fullBathrooms: "Full bathrooms",
  halfBathrooms: "Half bathrooms",
  kitchens: "Kitchens",
  livingRooms: "Living / family rooms",
  finishedBasement: "Finished basement",
  stairFlights: "Flights of stairs",
};

export const PRICING_SCOPE_LABELS: Record<PricingScope, string> = {
  standard: "Standard",
  deep: "Deep",
  move_in_out: "Move-In / Move-Out",
  carpet: "Carpet",
};

export const DEFAULT_CLEANING_PRICING_CONFIG: CleaningPricingConfig = {
  schemaVersion: 1,
  currency: "CAD",
  tax: {
    enabled: true,
    label: "GST",
    rate: 0.05,
  },
  services: {
    standard: {
      id: "standard",
      name: "Standard Cleaning",
      enabled: true,
      startingPriceCents: 9900,
      packages: [
        {
          id: "essential_standard",
          name: "Essential Standard Clean",
          description: "1 bedroom, 1 full bathroom, 1 kitchen and 1 living area.",
          basePriceCents: 9900,
          allowances: allowances({ bedrooms: 1, fullBathrooms: 1, kitchens: 1, livingRooms: 1 }),
          customerSelectable: true,
          customQuote: false,
        },
        {
          id: "standard_2bed_1bath",
          name: "Standard 2 Bed / 1 Bath",
          description: "Internal pricing tier used for the documented 2 bedroom + 1 bathroom price step.",
          basePriceCents: 12900,
          allowances: allowances({ bedrooms: 2, fullBathrooms: 1, kitchens: 1, livingRooms: 1 }),
          customerSelectable: false,
          customQuote: false,
        },
        {
          id: "complete_standard",
          name: "Complete Standard Clean",
          description: "Up to 2 bedrooms, 2 full bathrooms, 1 kitchen and 1 living area.",
          basePriceCents: 14900,
          allowances: allowances({ bedrooms: 2, fullBathrooms: 2, kitchens: 1, livingRooms: 1 }),
          customerSelectable: true,
          customQuote: false,
        },
      ],
      additionalCharges: allowances({
        bedrooms: 2000,
        fullBathrooms: 3000,
        halfBathrooms: 2000,
        kitchens: 4000,
        livingRooms: 2000,
        finishedBasement: 3000,
        stairFlights: 1500,
      }),
      includedItems: [
        "accessible_dusting",
        "doors_and_handles",
        "switches",
        "window_sills",
        "kitchen_counters",
        "kitchen_backsplash",
        "kitchen_sink",
        "stovetop",
        "appliance_exteriors",
        "general_bathroom_cleaning",
        "garbage_removal",
        "vacuuming_or_sweeping",
        "mopping",
      ],
    },
    deep: {
      id: "deep",
      name: "Deep Cleaning",
      enabled: true,
      startingPriceCents: 15900,
      packages: [
        {
          id: "deep_1bed_1bath",
          name: "Deep Clean — 1 Bed / 1 Bath",
          description: "1 bedroom, 1 bathroom, 1 kitchen and 1 living area.",
          basePriceCents: 15900,
          allowances: allowances({ bedrooms: 1, fullBathrooms: 1, kitchens: 1, livingRooms: 1 }),
          customerSelectable: false,
          customQuote: false,
        },
        {
          id: "deep_2bed_1bath",
          name: "Deep Clean — 2 Bed / 1 Bath",
          description: "2 bedrooms, 1 bathroom, 1 kitchen and 1 living area.",
          basePriceCents: 19900,
          allowances: allowances({ bedrooms: 2, fullBathrooms: 1, kitchens: 1, livingRooms: 1 }),
          customerSelectable: false,
          customQuote: false,
        },
        {
          id: "deep_2bed_2bath",
          name: "Deep Clean — 2 Bed / 2 Bath",
          description: "2 bedrooms, 2 bathrooms, 1 kitchen and 1 living area.",
          basePriceCents: 22900,
          allowances: allowances({ bedrooms: 2, fullBathrooms: 2, kitchens: 1, livingRooms: 1 }),
          customerSelectable: false,
          customQuote: false,
        },
      ],
      additionalCharges: allowances({
        bedrooms: 3000,
        fullBathrooms: 4000,
        halfBathrooms: 2500,
        kitchens: 7000,
        livingRooms: 3000,
        finishedBasement: 4000,
        stairFlights: 2000,
      }),
      includedItems: [
        "inside_microwave",
        "baseboards",
        "door_frames",
        "detailed_doors_and_switches",
        "edges_and_corners",
        "detailed_tub_shower",
        "bathroom_glass_and_fixtures",
      ],
    },
    move_in_out: {
      id: "move_in_out",
      name: "Move-In / Move-Out Cleaning",
      enabled: true,
      startingPriceCents: 19900,
      packages: [
        {
          id: "move_studio_1bed_1bath",
          name: "Studio / 1 Bed + 1 Bath",
          description: "Empty-home turnover cleaning for a studio or 1 bedroom / 1 bathroom property.",
          basePriceCents: 19900,
          allowances: allowances({ bedrooms: 1, fullBathrooms: 1, kitchens: 1, livingRooms: 1 }),
          customerSelectable: false,
          customQuote: false,
        },
        {
          id: "move_2bed_2bath",
          name: "2 Beds + Up to 2 Baths",
          description: "Move-In / Move-Out base tier for 2 bedrooms and up to 2 full bathrooms.",
          basePriceCents: 24900,
          allowances: allowances({ bedrooms: 2, fullBathrooms: 2, kitchens: 1, livingRooms: 1 }),
          customerSelectable: false,
          customQuote: false,
        },
        {
          id: "move_3bed_2bath",
          name: "3 Beds + Up to 2 Baths",
          description: "Move-In / Move-Out base tier for 3 bedrooms and up to 2 full bathrooms.",
          basePriceCents: 29900,
          allowances: allowances({ bedrooms: 3, fullBathrooms: 2, kitchens: 1, livingRooms: 1 }),
          customerSelectable: false,
          customQuote: false,
        },
        {
          id: "move_3bed_3bath",
          name: "3 Beds + 3 Baths",
          description: "Move-In / Move-Out base tier for 3 bedrooms and 3 full bathrooms.",
          basePriceCents: 32900,
          allowances: allowances({ bedrooms: 3, fullBathrooms: 3, kitchens: 1, livingRooms: 1 }),
          customerSelectable: false,
          customQuote: false,
        },
        {
          id: "move_4bed_3bath",
          name: "4 Beds + Up to 3 Baths",
          description: "Move-In / Move-Out base tier for 4 bedrooms and up to 3 full bathrooms.",
          basePriceCents: 36900,
          allowances: allowances({ bedrooms: 4, fullBathrooms: 3, kitchens: 1, livingRooms: 1 }),
          customerSelectable: false,
          customQuote: false,
        },
        {
          id: "move_4bed_4bath",
          name: "4 Beds + 4 Baths",
          description: "Move-In / Move-Out base tier for 4 bedrooms and 4 full bathrooms.",
          basePriceCents: 39900,
          allowances: allowances({ bedrooms: 4, fullBathrooms: 4, kitchens: 1, livingRooms: 1 }),
          customerSelectable: false,
          customQuote: false,
        },
      ],
      additionalCharges: allowances({
        bedrooms: 3000,
        fullBathrooms: 3000,
        halfBathrooms: 2000,
        kitchens: 6000,
        livingRooms: 2500,
        finishedBasement: 3500,
        stairFlights: 1500,
      }),
      includedItems: [
        "standard_turnover_cleaning",
        "baseboards",
        "doors_and_door_frames",
        "switches",
        "empty_closets_and_shelves",
        "inside_fridge",
        "inside_oven",
        "inside_microwave",
        "inside_empty_cabinets",
        "cabinet_fronts",
        "accessible_floors",
      ],
    },
  },
  addOns: [
    { id: "inside_microwave", name: "Inside microwave", priceType: "fixed", priceCents: 1500, unit: null, availableFor: ["standard"], includedFor: ["deep", "move_in_out"], active: true, adminReview: false, note: "Standard only; hidden for Deep and Move-In/Out." },
    { id: "inside_fridge", name: "Inside fridge", priceType: "fixed", priceCents: 3500, unit: null, availableFor: ["standard", "deep"], includedFor: ["move_in_out"], active: true, adminReview: false, note: "Hidden for Move-In/Out because it is already included." },
    { id: "inside_oven", name: "Inside oven", priceType: "fixed", priceCents: 3500, unit: null, availableFor: ["standard", "deep"], includedFor: ["move_in_out"], active: true, adminReview: false, note: "Hidden for Move-In/Out because it is already included." },
    { id: "inside_empty_cabinets", name: "Inside empty cabinets", priceType: "fixed", priceCents: 4000, unit: null, availableFor: ["standard", "deep"], includedFor: ["move_in_out"], active: true, adminReview: false, note: "Hidden for Move-In/Out because it is already included." },
    { id: "baseboards", name: "Baseboards", priceType: "from", priceCents: 3500, unit: null, availableFor: ["standard"], includedFor: ["deep", "move_in_out"], active: true, adminReview: false, note: "Standard only; hidden for Deep and Move-In/Out." },
    { id: "wet_wipe_blinds", name: "Wet-wipe blinds", priceType: "per_unit", priceCents: 1000, unit: "blind", availableFor: ["standard", "deep", "move_in_out", "carpet"], includedFor: [], active: true, adminReview: false, note: "Available for all services." },
    { id: "interior_window_glass_tracks", name: "Interior window glass + tracks", priceType: "per_unit", priceCents: 1200, unit: "window", availableFor: ["standard", "deep", "move_in_out", "carpet"], includedFor: [], active: true, adminReview: false, note: "Available for all services." },
    { id: "bed_linen_change", name: "Bed linen change", priceType: "per_unit", priceCents: 1500, unit: "bed", availableFor: ["standard", "deep"], includedFor: [], active: true, adminReview: false, note: "Occupied-home services only." },
    { id: "dishes", name: "Dishes", priceType: "per_unit", priceCents: 2500, unit: "load", availableFor: ["standard", "deep"], includedFor: [], active: true, adminReview: false, note: "Standard and Deep only." },
    { id: "laundry", name: "Laundry", priceType: "per_unit", priceCents: 3000, unit: "load", availableFor: ["standard", "deep"], includedFor: [], active: true, adminReview: false, note: "Standard and Deep only." },
    { id: "excessive_pet_hair", name: "Excessive pet hair", priceType: "from", priceCents: 4000, unit: null, availableFor: ["standard", "deep", "move_in_out"], includedFor: [], active: true, adminReview: true, note: "Condition dependent." },
    { id: "heavy_duty_condition", name: "Heavy-duty condition", priceType: "from", priceCents: 6000, unit: null, availableFor: ["standard", "deep", "move_in_out"], includedFor: [], active: true, adminReview: true, note: "Photo/admin review." },
    { id: "hard_water_grout_restoration", name: "Hard-water / grout restoration", priceType: "per_unit", priceCents: 5000, unit: "bathroom", availableFor: ["standard", "deep", "move_in_out"], includedFor: [], active: true, adminReview: true, note: "Restoration-level work." },
    { id: "wall_washing", name: "Wall washing", priceType: "per_unit", priceCents: 4000, unit: "room", availableFor: ["standard", "deep", "move_in_out"], includedFor: [], active: true, adminReview: false, note: "Accessible painted walls." },
    { id: "balcony_patio_basic", name: "Balcony / patio basic clean", priceType: "from", priceCents: 2500, unit: null, availableFor: ["standard", "deep", "move_in_out"], includedFor: [], active: true, adminReview: true, note: "Size and condition dependent." },
  ],
  carpet: {
    enabled: true,
    standaloneMinimumCents: 10000,
    firstStandardRoomCents: 4500,
    additionalStandardRoomCents: 3500,
    largeRoomCents: 5000,
    hallwayCents: 2500,
    stairFlightCents: 4000,
    smallAreaRugCents: 3000,
    heavyStainAreaCents: 2000,
    petUrineOdorCustomQuote: true,
  },
  heavyCondition: {
    enabled: true,
    showReviewNotice: true,
    allowPhotoUpload: true,
    notifyAdmin: true,
    requiresAdminApproval: true,
    allowInstantBooking: false,
  },
  customQuote: {
    enabled: true,
    bedroomThreshold: 5,
    unusualLayoutRequiresReview: true,
    unsafeOrComplexRequiresReview: true,
    petUrineOdorRequiresQuote: true,
  },
};

const isFiniteNonNegative = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

const isWholeNonNegative = (value: unknown) =>
  isFiniteNonNegative(value) && Number.isInteger(value);

export function validatePricingConfig(input: unknown): { ok: true; config: CleaningPricingConfig } | { ok: false; error: string } {
  if (!input || typeof input !== "object") return { ok: false, error: "Pricing config is required." };
  const config = input as CleaningPricingConfig;
  if (config.schemaVersion !== 1) return { ok: false, error: "Unsupported pricing config version." };
  if (config.currency !== "CAD") return { ok: false, error: "Currency must be CAD." };
  if (!config.tax || typeof config.tax !== "object") return { ok: false, error: "Tax settings are required." };
  if (typeof config.tax.enabled !== "boolean") return { ok: false, error: "Tax enabled must be true or false." };
  if (typeof config.tax.label !== "string" || !config.tax.label.trim()) return { ok: false, error: "Tax label is required." };
  if (typeof config.tax.rate !== "number" || !Number.isFinite(config.tax.rate) || config.tax.rate < 0 || config.tax.rate > 1) {
    return { ok: false, error: "Tax rate must be between 0 and 1." };
  }

  const serviceKeys: PricingServiceKey[] = ["standard", "deep", "move_in_out"];
  const areaKeys: PricingAreaKey[] = ["bedrooms", "fullBathrooms", "halfBathrooms", "kitchens", "livingRooms", "finishedBasement", "stairFlights"];
  for (const serviceKey of serviceKeys) {
    const service = config.services?.[serviceKey];
    if (!service) return { ok: false, error: `Missing ${serviceKey} pricing.` };
    if (!isFiniteNonNegative(service.startingPriceCents)) return { ok: false, error: `${service.name} starting price is invalid.` };
    if (!Array.isArray(service.packages) || service.packages.length === 0) return { ok: false, error: `${service.name} needs at least one package.` };
    for (const pkg of service.packages) {
      if (!pkg.id?.trim() || !pkg.name?.trim()) return { ok: false, error: `${service.name} contains an unnamed package.` };
      if (!isFiniteNonNegative(pkg.basePriceCents)) return { ok: false, error: `${pkg.name} base price is invalid.` };
      for (const key of areaKeys) {
        if (!isWholeNonNegative(pkg.allowances?.[key])) return { ok: false, error: `${pkg.name} ${key} allowance must be a whole number.` };
      }
    }
    for (const key of areaKeys) {
      if (!isFiniteNonNegative(service.additionalCharges?.[key])) return { ok: false, error: `${service.name} ${key} charge is invalid.` };
    }
    if (!Array.isArray(service.includedItems)) return { ok: false, error: `${service.name} included items are invalid.` };
  }

  if (!Array.isArray(config.addOns)) return { ok: false, error: "Add-on pricing is invalid." };
  const allowedScopes: PricingScope[] = ["standard", "deep", "move_in_out", "carpet"];
  const allowedPriceTypes: AddOnPriceType[] = ["fixed", "from", "per_unit", "custom_quote"];
  for (const addOn of config.addOns) {
    if (!addOn.id?.trim() || !addOn.name?.trim()) return { ok: false, error: "Each add-on needs an id and name." };
    if (!allowedPriceTypes.includes(addOn.priceType)) return { ok: false, error: `${addOn.name} has an invalid price type.` };
    if (addOn.priceType !== "custom_quote" && !isFiniteNonNegative(addOn.priceCents)) return { ok: false, error: `${addOn.name} price is invalid.` };
    if (!Array.isArray(addOn.availableFor) || addOn.availableFor.some(scope => !allowedScopes.includes(scope))) return { ok: false, error: `${addOn.name} availability is invalid.` };
    if (!Array.isArray(addOn.includedFor) || addOn.includedFor.some(scope => !allowedScopes.includes(scope))) return { ok: false, error: `${addOn.name} inclusion rules are invalid.` };
    if (addOn.availableFor.some(scope => addOn.includedFor.includes(scope))) return { ok: false, error: `${addOn.name} cannot be both available and included for the same service.` };
  }

  for (const [key, value] of Object.entries(config.carpet || {})) {
    if (key.endsWith("Cents") && !isFiniteNonNegative(value)) return { ok: false, error: `Carpet ${key} is invalid.` };
  }
  if (!isWholeNonNegative(config.customQuote?.bedroomThreshold) || config.customQuote.bedroomThreshold < 1) {
    return { ok: false, error: "Custom quote bedroom threshold must be at least 1." };
  }
  return { ok: true, config };
}
