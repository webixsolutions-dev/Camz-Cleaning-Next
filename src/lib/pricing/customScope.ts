import type {
  CleaningPricingConfig,
  PricingAreaKey,
  PricingAreaValues,
  PricingServiceKey,
} from "./config";

export type CustomScopeSelection = PricingAreaValues & {
  unusualLayout?: boolean;
};

export type CustomScopePricingLineItem = {
  key: string;
  label: string;
  quantity: number;
  unitPriceCents: number;
  amountCents: number;
};

export type CustomScopePricingResult = {
  mode: "custom";
  serviceKey: PricingServiceKey;
  packageId: null;
  packageName: string;
  packageDescription: string;
  packagePriceCents: number;
  packageAllowances: PricingAreaValues;
  selection: CustomScopeSelection;
  selectedAreaSubtotalCents: number;
  minimumChargeCents: number;
  minimumAdjustmentCents: number;
  lineItems: CustomScopePricingLineItem[];
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  taxRate: number;
  taxLabel: string;
  customQuote: boolean;
  customQuoteReason: string | null;
};

const AREA_LABELS: Record<PricingAreaKey, string> = {
  bedrooms: "Bedroom",
  fullBathrooms: "Full bathroom",
  halfBathrooms: "Half bathroom",
  kitchens: "Kitchen",
  livingRooms: "Living / family room",
  finishedBasement: "Finished basement living area",
  stairFlights: "Flight of stairs",
};

export const CUSTOM_SCOPE_AREA_KEYS: PricingAreaKey[] = [
  "bedrooms",
  "fullBathrooms",
  "halfBathrooms",
  "kitchens",
  "livingRooms",
  "finishedBasement",
  "stairFlights",
];

const whole = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.floor(parsed));
};

export function normalizeCustomScopeSelection(
  input: Partial<CustomScopeSelection>,
): CustomScopeSelection {
  return {
    bedrooms: whole(input.bedrooms),
    fullBathrooms: whole(input.fullBathrooms),
    halfBathrooms: whole(input.halfBathrooms),
    kitchens: whole(input.kitchens),
    livingRooms: whole(input.livingRooms),
    finishedBasement: whole(input.finishedBasement),
    stairFlights: whole(input.stairFlights),
    unusualLayout: input.unusualLayout === true,
  };
}

export function selectedCustomScopeAreas(selection: CustomScopeSelection) {
  return CUSTOM_SCOPE_AREA_KEYS.filter((key) => selection[key] > 0).map((key) => ({
    key,
    label: AREA_LABELS[key],
    quantity: selection[key],
  }));
}

/**
 * Build Your Own Scope pricing.
 *
 * Formula from the developer change request:
 * CUSTOM AREA SUBTOTAL = sum(selected quantity × service unit value)
 * CUSTOM SERVICE TOTAL = MAX(service minimum, custom area subtotal)
 *
 * Add-ons, carpet charges and tax are deliberately handled by the existing
 * booking aggregator after this service subtotal is calculated.
 */
export function calculateCustomScopePrice(
  config: CleaningPricingConfig,
  serviceKey: PricingServiceKey,
  input: Partial<CustomScopeSelection>,
): CustomScopePricingResult {
  const service = config.services[serviceKey];
  const selection = normalizeCustomScopeSelection(input);
  const minimumChargeCents = Math.max(
    0,
    service.customScope?.minimumChargeCents ?? service.startingPriceCents,
  );

  const areaLineItems: CustomScopePricingLineItem[] = [];
  let selectedAreaSubtotalCents = 0;

  for (const key of CUSTOM_SCOPE_AREA_KEYS) {
    const quantity = selection[key];
    const unitPriceCents = Math.max(0, service.additionalCharges[key] || 0);
    if (quantity <= 0) continue;

    const amountCents = quantity * unitPriceCents;
    selectedAreaSubtotalCents += amountCents;
    areaLineItems.push({
      key,
      label: AREA_LABELS[key],
      quantity,
      unitPriceCents,
      amountCents,
    });
  }

  const serviceSubtotalCents = Math.max(minimumChargeCents, selectedAreaSubtotalCents);
  const minimumAdjustmentCents = Math.max(
    0,
    minimumChargeCents - selectedAreaSubtotalCents,
  );

  const lineItems = [...areaLineItems];
  if (minimumAdjustmentCents > 0) {
    lineItems.push({
      key: "minimum_service_charge_adjustment",
      label: "Minimum service charge adjustment",
      quantity: 1,
      unitPriceCents: minimumAdjustmentCents,
      amountCents: minimumAdjustmentCents,
    });
  }

  const taxRate = config.tax.enabled ? config.tax.rate : 0;
  const taxCents = Math.round(serviceSubtotalCents * taxRate);
  const totalCents = serviceSubtotalCents + taxCents;
  const customQuote =
    config.customQuote.enabled &&
    config.customQuote.unusualLayoutRequiresReview &&
    selection.unusualLayout === true;

  return {
    mode: "custom",
    serviceKey,
    packageId: null,
    packageName: "Build Your Own Scope",
    packageDescription:
      "Only the selected rooms and areas are included. The service minimum applies until the selected area value exceeds it.",
    packagePriceCents: minimumChargeCents,
    packageAllowances: {
      bedrooms: 0,
      fullBathrooms: 0,
      halfBathrooms: 0,
      kitchens: 0,
      livingRooms: 0,
      finishedBasement: 0,
      stairFlights: 0,
    },
    selection,
    selectedAreaSubtotalCents,
    minimumChargeCents,
    minimumAdjustmentCents,
    lineItems,
    subtotalCents: serviceSubtotalCents,
    taxCents,
    totalCents,
    taxRate,
    taxLabel: config.tax.label,
    customQuote,
    customQuoteReason: customQuote
      ? "This property layout requires admin review before the custom-scope price is confirmed."
      : null,
  };
}
