import type {
  AddOnPricing,
  CleaningPricingConfig,
  PricingAreaValues,
  PricingScope,
} from "@/lib/pricing/config";

export type AddOnSelection = Record<string, number | boolean | string | null | undefined>;

export type AddOnVisibilityContext = {
  bookingMode?: "package" | "custom";
  selectedAreas?: Partial<PricingAreaValues>;
};

const CUSTOM_AREA_RELATED_ADDONS: Partial<Record<string, keyof PricingAreaValues | "any_area">> = {
  inside_microwave: "kitchens",
  inside_fridge: "kitchens",
  inside_oven: "kitchens",
  inside_empty_cabinets: "kitchens",
  baseboards: "any_area",
};

const hasSelectedCustomArea = (
  selectedAreas: Partial<PricingAreaValues> | undefined,
  key: keyof PricingAreaValues | "any_area" | undefined,
) => {
  if (!selectedAreas || !key) return false;
  if (key === "any_area") {
    const areaKeys: Array<keyof PricingAreaValues> = [
      "bedrooms",
      "fullBathrooms",
      "halfBathrooms",
      "kitchens",
      "livingRooms",
      "finishedBasement",
      "stairFlights",
    ];
    return areaKeys.some((areaKey) => Number(selectedAreas[areaKey] || 0) > 0);
  }
  return Number(selectedAreas[key] || 0) > 0;
};

export type AddOnLineItem = {
  id: string;
  label: string;
  quantity: number;
  unitPriceCents: number;
  amountCents: number;
  adminReview: boolean;
};

export type AddOnPricingResult = {
  subtotalCents: number;
  lineItems: AddOnLineItem[];
  visibleAddOns: AddOnPricing[];
  selectedAddOnIds: string[];
  adminReviewRequired: boolean;
  adminReviewReasons: string[];
  customQuote: boolean;
  customQuoteReason: string | null;
};

const DEFAULT_MAX_ADDON_QUANTITY = 20;

export const ADD_ON_QUANTITY_LIMITS: Record<string, number> = {
  // Baseboards are priced per selected room / living area.
  baseboards: 20,
  wet_wipe_blinds: 10,
  interior_window_glass_tracks: 15,
  bed_linen_change: 8,
  dishes: 5,
  laundry: 5,
  hard_water_grout_restoration: 5,
  wall_washing: 10,
  balcony_patio_basic: 5,
};

export const getAddOnQuantityLimit = (id: string) =>
  ADD_ON_QUANTITY_LIMITS[id] ?? DEFAULT_MAX_ADDON_QUANTITY;

export const isQuantityControlledAddOn = (
  id: string,
  priceType: AddOnPricing["priceType"],
) => priceType === "per_unit" || Object.prototype.hasOwnProperty.call(ADD_ON_QUANTITY_LIMITS, id);

const clampQuantity = (value: unknown, maxQuantity = DEFAULT_MAX_ADDON_QUANTITY) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(maxQuantity, Math.max(0, Math.floor(parsed)));
};

export function getVisibleAddOns(
  config: CleaningPricingConfig,
  scope: PricingScope,
  context?: AddOnVisibilityContext,
) {
  const serviceIncludedItems =
    scope === "carpet" ? [] : config.services[scope].includedItems;
  const customMode = context?.bookingMode === "custom" && scope !== "carpet";

  return config.addOns.filter((addOn) => {
    if (!addOn.active) return false;

    if (!customMode) {
      if (!addOn.availableFor.includes(scope)) return false;
      if (addOn.includedFor.includes(scope)) return false;
      if (serviceIncludedItems.includes(addOn.id)) return false;
      return true;
    }

    // In custom mode an included task is only considered included when the
    // related area is actually selected. If the area count is zero, an
    // otherwise-included task may be purchased independently as an add-on.
    const relatedArea = CUSTOM_AREA_RELATED_ADDONS[addOn.id];
    const includedByService =
      addOn.includedFor.includes(scope) || serviceIncludedItems.includes(addOn.id);
    const includedBySelectedScope = includedByService
      ? relatedArea
        ? hasSelectedCustomArea(context?.selectedAreas, relatedArea)
        : Object.values(context?.selectedAreas || {}).some((value) => Number(value) > 0)
      : false;

    if (includedBySelectedScope) return false;

    return (
      addOn.availableFor.includes(scope) ||
      addOn.includedFor.includes(scope) ||
      serviceIncludedItems.includes(addOn.id)
    );
  });
}

export function calculateServiceAddOns(
  config: CleaningPricingConfig,
  scope: PricingScope,
  selection: AddOnSelection | null | undefined,
  context?: AddOnVisibilityContext,
): AddOnPricingResult {
  const visibleAddOns = getVisibleAddOns(config, scope, context);
  const normalizedSelection = selection || {};
  const lineItems: AddOnLineItem[] = [];
  const selectedAddOnIds: string[] = [];
  const adminReviewReasons: string[] = [];
  let subtotalCents = 0;
  let customQuote = false;
  let customQuoteReason: string | null = null;

  for (const addOn of visibleAddOns) {
    const rawValue = normalizedSelection[addOn.id];
    const quantityControlled = isQuantityControlledAddOn(addOn.id, addOn.priceType);
    const quantity = quantityControlled
      ? clampQuantity(rawValue, getAddOnQuantityLimit(addOn.id))
      : rawValue === true || rawValue === 1 || rawValue === "1"
        ? 1
        : 0;

    if (quantity <= 0) continue;

    selectedAddOnIds.push(addOn.id);

    if (addOn.priceType === "custom_quote") {
      customQuote = true;
      customQuoteReason ||= `${addOn.name} requires a custom quote.`;
      if (!adminReviewReasons.includes(addOn.name)) {
        adminReviewReasons.push(addOn.name);
      }
      lineItems.push({
        id: addOn.id,
        label: addOn.name,
        quantity,
        unitPriceCents: 0,
        amountCents: 0,
        adminReview: true,
      });
      continue;
    }

    const unitPriceCents = Math.max(0, addOn.priceCents || 0);
    const amountCents = unitPriceCents * quantity;
    subtotalCents += amountCents;

    if (addOn.adminReview && !adminReviewReasons.includes(addOn.name)) {
      adminReviewReasons.push(addOn.name);
    }

    lineItems.push({
      id: addOn.id,
      label: addOn.name,
      quantity,
      unitPriceCents,
      amountCents,
      adminReview: addOn.adminReview,
    });
  }

  const adminReviewRequired = adminReviewReasons.length > 0;
  if (adminReviewRequired && !customQuote) {
    customQuote = true;
    customQuoteReason = `Admin review is required for: ${adminReviewReasons.join(", ")}.`;
  }

  return {
    subtotalCents,
    lineItems,
    visibleAddOns,
    selectedAddOnIds,
    adminReviewRequired,
    adminReviewReasons,
    customQuote,
    customQuoteReason,
  };
}
