import {
  CleaningPricingConfig,
  PricingAreaKey,
  PricingAreaValues,
  PricingPackage,
} from "./config";

export type MoveInOutSelection = {
  bedrooms: number;
  fullBathrooms: number;
  halfBathrooms: number;
  kitchens: number;
  livingRooms: number;
  finishedBasement: number;
  stairFlights: number;
  unusualLayout?: boolean;
};

export type MoveInOutPricingLineItem = {
  key: string;
  label: string;
  quantity: number;
  unitPriceCents: number;
  amountCents: number;
};

export type MoveInOutPricingResult = {
  packageId: string;
  packageName: string;
  packageDescription: string;
  packagePriceCents: number;
  packageAllowances: PricingAreaValues;
  selection: MoveInOutSelection;
  lineItems: MoveInOutPricingLineItem[];
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

export function normalizeMoveInOutSelection(
  input: Partial<MoveInOutSelection>,
): MoveInOutSelection {
  return {
    bedrooms: whole(input.bedrooms, 1),
    fullBathrooms: whole(input.fullBathrooms, 1),
    halfBathrooms: whole(input.halfBathrooms, 0),
    kitchens: whole(input.kitchens, 1),
    livingRooms: whole(input.livingRooms, 1),
    finishedBasement: whole(input.finishedBasement, 0),
    stairFlights: whole(input.stairFlights, 0),
    unusualLayout: input.unusualLayout === true,
  };
}

function byId(
  config: CleaningPricingConfig,
  id: string,
): PricingPackage | undefined {
  return config.services.move_in_out.packages.find((pkg) => pkg.id === id);
}

/**
 * Selects the exact Move-In / Move-Out base grid from the specification.
 * Bedroom count establishes the tier; bathroom count selects the applicable
 * variant inside that bedroom tier. Counts above the allowance are then
 * charged once via the service increments.
 */
export function chooseMoveInOutBasePackage(
  config: CleaningPricingConfig,
  selection: MoveInOutSelection,
): PricingPackage {
  const service = config.services.move_in_out;
  let id = "move_studio_1bed_1bath";

  if (selection.bedrooms >= 4) {
    id = selection.fullBathrooms >= 4 ? "move_4bed_4bath" : "move_4bed_3bath";
  } else if (selection.bedrooms === 3) {
    id = selection.fullBathrooms >= 3 ? "move_3bed_3bath" : "move_3bed_2bath";
  } else if (selection.bedrooms === 2) {
    id = "move_2bed_2bath";
  }

  return byId(config, id) || service.packages[0];
}

export function calculateMoveInOutPrice(
  config: CleaningPricingConfig,
  input: Partial<MoveInOutSelection>,
): MoveInOutPricingResult {
  const selection = normalizeMoveInOutSelection(input);
  const service = config.services.move_in_out;
  const basePackage = chooseMoveInOutBasePackage(config, selection);

  const threshold = Math.max(1, config.customQuote.bedroomThreshold || 5);
  const customQuoteForSize =
    config.customQuote.enabled && selection.bedrooms >= threshold;
  const customQuoteForLayout =
    config.customQuote.enabled &&
    config.customQuote.unusualLayoutRequiresReview &&
    selection.unusualLayout === true;

  const lineItems: MoveInOutPricingLineItem[] = [
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
    const unitPriceCents = service.additionalCharges[key] || 0;

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

  const subtotalCents = lineItems.reduce((sum, item) => sum + item.amountCents, 0);
  const taxRate = config.tax.enabled ? config.tax.rate : 0;
  const taxCents = Math.round(subtotalCents * taxRate);
  const totalCents = subtotalCents + taxCents;

  let customQuoteReason: string | null = null;
  if (customQuoteForSize) {
    customQuoteReason = `${threshold}+ bedroom Move-In / Move-Out properties require a custom quote.`;
  } else if (customQuoteForLayout) {
    customQuoteReason = "This property layout requires admin review before the Move-In / Move-Out price is confirmed.";
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
