import {
  CleaningPricingConfig,
  PricingAreaKey,
  PricingAreaValues,
  PricingPackage,
} from "./config";

export type StandardCleaningSelection = {
  bedrooms: number;
  fullBathrooms: number;
  halfBathrooms: number;
  kitchens: number;
  livingRooms: number;
  finishedBasement: number;
  stairFlights: number;
  preferredPackageId?: string | null;
  unusualLayout?: boolean;
};

export type StandardPricingLineItem = {
  key: string;
  label: string;
  quantity: number;
  unitPriceCents: number;
  amountCents: number;
};

export type StandardPricingResult = {
  packageId: string;
  packageName: string;
  packageDescription: string;
  packagePriceCents: number;
  packageAllowances: PricingAreaValues;
  selection: StandardCleaningSelection;
  lineItems: StandardPricingLineItem[];
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  taxRate: number;
  taxLabel: string;
  customQuote: boolean;
  customQuoteReason: string | null;
};

const AREA_LABELS: Record<PricingAreaKey, string> = {
  bedrooms: "Additional bedroom",
  fullBathrooms: "Additional full bathroom",
  halfBathrooms: "Additional half bathroom",
  kitchens: "Additional kitchen",
  livingRooms: "Additional living / family room",
  finishedBasement: "Finished basement living area",
  stairFlights: "Flight of stairs",
};

const normalizeWhole = (value: unknown, minimum = 0) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return minimum;
  return Math.max(minimum, Math.floor(parsed));
};

export function normalizeStandardSelection(
  selection: Partial<StandardCleaningSelection>,
): StandardCleaningSelection {
  return {
    bedrooms: normalizeWhole(selection.bedrooms, 1),
    fullBathrooms: normalizeWhole(selection.fullBathrooms, 1),
    halfBathrooms: normalizeWhole(selection.halfBathrooms, 0),
    kitchens: normalizeWhole(selection.kitchens, 1),
    livingRooms: normalizeWhole(selection.livingRooms, 1),
    finishedBasement: normalizeWhole(selection.finishedBasement, 0),
    stairFlights: normalizeWhole(selection.stairFlights, 0),
    preferredPackageId:
      typeof selection.preferredPackageId === "string"
        ? selection.preferredPackageId
        : null,
    unusualLayout: selection.unusualLayout === true,
  };
}

function packageFitsSelection(
  pkg: PricingPackage,
  selection: StandardCleaningSelection,
) {
  return (
    pkg.allowances.bedrooms <= selection.bedrooms &&
    pkg.allowances.fullBathrooms <= selection.fullBathrooms &&
    pkg.allowances.kitchens <= selection.kitchens &&
    pkg.allowances.livingRooms <= selection.livingRooms
  );
}

function packageCoverageScore(pkg: PricingPackage) {
  return (
    pkg.allowances.bedrooms * 100 +
    pkg.allowances.fullBathrooms * 50 +
    pkg.allowances.kitchens * 20 +
    pkg.allowances.livingRooms * 20
  );
}

/**
 * Select the documented Standard Cleaning base tier without double-charging
 * rooms already included in that tier. This supports the internal 2 bed / 1
 * bath $129 tier as well as the customer-facing $99 and $149 packages.
 */
export function chooseStandardBasePackage(
  config: CleaningPricingConfig,
  selection: StandardCleaningSelection,
): PricingPackage {
  const standard = config.services.standard;
  const candidates = standard.packages
    .filter((pkg) => !pkg.customQuote && packageFitsSelection(pkg, selection))
    .sort((a, b) => {
      const coverage = packageCoverageScore(b) - packageCoverageScore(a);
      if (coverage !== 0) return coverage;
      return b.basePriceCents - a.basePriceCents;
    });

  if (candidates.length > 0) return candidates[0];

  return (
    standard.packages.find((pkg) => pkg.id === "essential_standard") ||
    standard.packages[0]
  );
}

export function calculateStandardCleaningPrice(
  config: CleaningPricingConfig,
  input: Partial<StandardCleaningSelection>,
): StandardPricingResult {
  const selection = normalizeStandardSelection(input);
  const standard = config.services.standard;
  const basePackage = chooseStandardBasePackage(config, selection);

  const threshold = Math.max(1, config.customQuote.bedroomThreshold || 5);
  const customQuoteForSize =
    config.customQuote.enabled && selection.bedrooms >= threshold;
  const customQuoteForLayout =
    config.customQuote.enabled &&
    config.customQuote.unusualLayoutRequiresReview &&
    selection.unusualLayout === true;

  const lineItems: StandardPricingLineItem[] = [
    {
      key: "base_package",
      label: basePackage.name,
      quantity: 1,
      unitPriceCents: basePackage.basePriceCents,
      amountCents: basePackage.basePriceCents,
    },
  ];

  const areaKeys: PricingAreaKey[] = [
    "bedrooms",
    "fullBathrooms",
    "halfBathrooms",
    "kitchens",
    "livingRooms",
    "finishedBasement",
    "stairFlights",
  ];

  for (const key of areaKeys) {
    const selectedCount = selection[key];
    const includedCount = basePackage.allowances[key] || 0;
    const extraCount = Math.max(0, selectedCount - includedCount);
    const unitPriceCents = standard.additionalCharges[key] || 0;

    if (extraCount > 0 && unitPriceCents > 0) {
      lineItems.push({
        key,
        label: AREA_LABELS[key],
        quantity: extraCount,
        unitPriceCents,
        amountCents: extraCount * unitPriceCents,
      });
    }
  }

  const subtotalCents = lineItems.reduce(
    (sum, item) => sum + item.amountCents,
    0,
  );
  const taxRate = config.tax.enabled ? config.tax.rate : 0;
  const taxCents = Math.round(subtotalCents * taxRate);
  const totalCents = subtotalCents + taxCents;

  let customQuoteReason: string | null = null;
  if (customQuoteForSize) {
    customQuoteReason = `${threshold}+ bedroom properties require admin review or a custom quote.`;
  } else if (customQuoteForLayout) {
    customQuoteReason = "This property layout requires admin review before the price is confirmed.";
  }

  return {
    packageId: basePackage.id,
    packageName: basePackage.name,
    packageDescription: basePackage.description,
    packagePriceCents: basePackage.basePriceCents,
    packageAllowances: basePackage.allowances,
    selection,
    lineItems,
    subtotalCents,
    taxCents,
    totalCents,
    taxRate,
    taxLabel: config.tax.label,
    customQuote: customQuoteForSize || customQuoteForLayout,
    customQuoteReason,
  };
}
