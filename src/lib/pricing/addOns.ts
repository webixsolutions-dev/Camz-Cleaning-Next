import type {
  AddOnPricing,
  CleaningPricingConfig,
  PricingScope,
} from "@/lib/pricing/config";

export type AddOnSelection = Record<string, number | boolean | string | null | undefined>;

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

const MAX_ADDON_QUANTITY = 50;

const clampQuantity = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(MAX_ADDON_QUANTITY, Math.max(0, Math.floor(parsed)));
};

export function getVisibleAddOns(
  config: CleaningPricingConfig,
  scope: PricingScope,
) {
  const serviceIncludedItems =
    scope === "carpet" ? [] : config.services[scope].includedItems;

  return config.addOns.filter((addOn) => {
    if (!addOn.active) return false;
    if (!addOn.availableFor.includes(scope)) return false;
    if (addOn.includedFor.includes(scope)) return false;
    if (serviceIncludedItems.includes(addOn.id)) return false;
    return true;
  });
}

export function calculateServiceAddOns(
  config: CleaningPricingConfig,
  scope: PricingScope,
  selection: AddOnSelection | null | undefined,
): AddOnPricingResult {
  const visibleAddOns = getVisibleAddOns(config, scope);
  const normalizedSelection = selection || {};
  const lineItems: AddOnLineItem[] = [];
  const selectedAddOnIds: string[] = [];
  const adminReviewReasons: string[] = [];
  let subtotalCents = 0;
  let customQuote = false;
  let customQuoteReason: string | null = null;

  for (const addOn of visibleAddOns) {
    const rawValue = normalizedSelection[addOn.id];
    const quantity =
      addOn.priceType === "per_unit"
        ? clampQuantity(rawValue)
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
