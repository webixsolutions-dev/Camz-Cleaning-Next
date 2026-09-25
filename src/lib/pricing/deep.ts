import {
  CleaningPricingConfig,
  PricingAreaKey,
  PricingAreaValues,
  PricingPackage,
} from "./config";
import { calculatePackageScopeCompensation } from "./packageCompensation";

export type DeepCleaningSelection = {
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

export type DeepPricingLineItem = {
  key: string;
  label: string;
  quantity: number;
  unitPriceCents: number;
  amountCents: number;
};

export type DeepPricingResult = {
  packageId: string;
  packageName: string;
  packageDescription: string;
  packagePriceCents: number;
  packageAllowances: PricingAreaValues;
  selection: DeepCleaningSelection;
  lineItems: DeepPricingLineItem[];
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

const whole = (value: unknown, minimum = 0) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return minimum;
  return Math.max(minimum, Math.floor(parsed));
};

export function normalizeDeepSelection(
  input: Partial<DeepCleaningSelection>,
): DeepCleaningSelection {
  return {
    bedrooms: whole(input.bedrooms, 0),
    fullBathrooms: whole(input.fullBathrooms, 0),
    halfBathrooms: whole(input.halfBathrooms, 0),
    kitchens: whole(input.kitchens, 0),
    livingRooms: whole(input.livingRooms, 0),
    finishedBasement: whole(input.finishedBasement, 0),
    stairFlights: whole(input.stairFlights, 0),
    preferredPackageId:
      typeof input.preferredPackageId === "string" ? input.preferredPackageId : null,
    unusualLayout: input.unusualLayout === true,
  };
}

function findPackage(
  config: CleaningPricingConfig,
  id: string,
): PricingPackage | undefined {
  return config.services.deep.packages.find((pkg) => pkg.id === id);
}

/**
 * Deep Cleaning uses the dedicated documented tiers:
 * 1 bed / 1 bath = $159, 2 bed / 1 bath = $199, 2 bed / 2 bath = $229.
 * Larger homes start from the 2/2 tier and only pay increments beyond it.
 */
export function chooseDeepBasePackage(
  config: CleaningPricingConfig,
  selection: DeepCleaningSelection,
): PricingPackage {
  const deep = config.services.deep;

  if (selection.preferredPackageId) {
    const preferred = deep.packages.find(
      (pkg) => pkg.id === selection.preferredPackageId && !pkg.customQuote,
    );
    if (preferred) return preferred;
  }

  return findPackage(config, "deep_1bed_1bath") || deep.packages[0];
}

export function calculateDeepCleaningPrice(
  config: CleaningPricingConfig,
  input: Partial<DeepCleaningSelection>,
): DeepPricingResult {
  const selection = normalizeDeepSelection(input);
  const deep = config.services.deep;
  const basePackage = chooseDeepBasePackage(config, selection);

  const scopeCompensation = calculatePackageScopeCompensation(
    basePackage.allowances,
    selection,
    deep.additionalCharges,
  );

  const lineItems: DeepPricingLineItem[] = [
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
    const selected = selection[key];
    const included = basePackage.allowances[key] || 0;
    const extra = Math.max(0, selected - included);
    const unitPriceCents = deep.additionalCharges[key] || 0;

    if (extra > 0 && unitPriceCents > 0) {
      lineItems.push({
        key,
        label: AREA_LABELS[key],
        quantity: extra,
        unitPriceCents,
        amountCents: extra * unitPriceCents,
      });
    }
  }

  if (scopeCompensation.compensationCents > 0) {
    lineItems.push({
      key: "package_compensation",
      label: "Package area compensation",
      quantity: 1,
      unitPriceCents: -scopeCompensation.compensationCents,
      amountCents: -scopeCompensation.compensationCents,
    });
  }

  const subtotalCents = lineItems.reduce((sum, item) => sum + item.amountCents, 0);
  const taxRate = config.tax.enabled ? config.tax.rate : 0;
  const taxCents = Math.round(subtotalCents * taxRate);
  const totalCents = subtotalCents + taxCents;
  const customQuote =
    config.customQuote.enabled &&
    config.customQuote.unusualLayoutRequiresReview &&
    selection.unusualLayout === true;

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
    customQuote,
    customQuoteReason: customQuote
      ? "This property layout requires admin review before the Deep Cleaning price is confirmed."
      : null,
  };
}
