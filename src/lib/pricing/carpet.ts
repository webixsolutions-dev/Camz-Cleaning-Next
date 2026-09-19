import { CleaningPricingConfig } from "./config";

export type CarpetPricingMode = "standalone" | "addon";

export type CarpetSelection = {
  mode: CarpetPricingMode;
  standardRooms: number;
  largeRooms: number;
  hallways: number;
  stairFlights: number;
  smallAreaRugs: number;
  heavyStainAreas: number;
  petUrineOdor: boolean;
};

export type CarpetPricingLineItem = {
  key: string;
  label: string;
  quantity: number;
  unitPriceCents: number;
  amountCents: number;
};

export type CarpetPricingResult = {
  selection: CarpetSelection;
  lineItems: CarpetPricingLineItem[];
  calculatedBeforeMinimumCents: number;
  minimumAdjustmentCents: number;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  taxRate: number;
  taxLabel: string;
  customQuote: boolean;
  customQuoteReason: string | null;
};

const whole = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.floor(parsed));
};

export function normalizeCarpetSelection(
  input: Partial<CarpetSelection>,
  mode: CarpetPricingMode = "standalone",
): CarpetSelection {
  return {
    mode: input.mode === "addon" ? "addon" : mode,
    standardRooms: whole(input.standardRooms),
    largeRooms: whole(input.largeRooms),
    hallways: whole(input.hallways),
    stairFlights: whole(input.stairFlights),
    smallAreaRugs: whole(input.smallAreaRugs),
    heavyStainAreas: whole(input.heavyStainAreas),
    petUrineOdor: input.petUrineOdor === true,
  };
}

export function carpetAreaCount(selection: CarpetSelection) {
  return (
    selection.standardRooms +
    selection.largeRooms +
    selection.hallways +
    selection.stairFlights +
    selection.smallAreaRugs +
    selection.heavyStainAreas
  );
}

export function calculateCarpetPrice(
  config: CleaningPricingConfig,
  input: Partial<CarpetSelection>,
  mode: CarpetPricingMode = "standalone",
): CarpetPricingResult {
  const selection = normalizeCarpetSelection(input, mode);
  const carpet = config.carpet;
  const lineItems: CarpetPricingLineItem[] = [];

  if (selection.standardRooms > 0) {
    lineItems.push({
      key: "first_standard_room",
      label: "First standard carpeted room",
      quantity: 1,
      unitPriceCents: carpet.firstStandardRoomCents,
      amountCents: carpet.firstStandardRoomCents,
    });

    const additional = Math.max(0, selection.standardRooms - 1);
    if (additional > 0) {
      lineItems.push({
        key: "additional_standard_rooms",
        label: "Additional standard carpeted room",
        quantity: additional,
        unitPriceCents: carpet.additionalStandardRoomCents,
        amountCents: additional * carpet.additionalStandardRoomCents,
      });
    }
  }

  const simpleItems: Array<{
    key: keyof Pick<
      CarpetSelection,
      "largeRooms" | "hallways" | "stairFlights" | "smallAreaRugs" | "heavyStainAreas"
    >;
    label: string;
    unitPriceCents: number;
  }> = [
    { key: "largeRooms", label: "Living / larger carpeted room", unitPriceCents: carpet.largeRoomCents },
    { key: "hallways", label: "Carpeted hallway", unitPriceCents: carpet.hallwayCents },
    { key: "stairFlights", label: "Carpeted stairs / flight", unitPriceCents: carpet.stairFlightCents },
    { key: "smallAreaRugs", label: "Small area rug", unitPriceCents: carpet.smallAreaRugCents },
    { key: "heavyStainAreas", label: "Heavy stain treatment / affected area", unitPriceCents: carpet.heavyStainAreaCents },
  ];

  for (const item of simpleItems) {
    const quantity = selection[item.key];
    if (quantity > 0 && item.unitPriceCents > 0) {
      lineItems.push({
        key: item.key,
        label: item.label,
        quantity,
        unitPriceCents: item.unitPriceCents,
        amountCents: quantity * item.unitPriceCents,
      });
    }
  }

  const calculatedBeforeMinimumCents = lineItems.reduce(
    (sum, item) => sum + item.amountCents,
    0,
  );

  const minimumAdjustmentCents =
    selection.mode === "standalone"
      ? Math.max(0, carpet.standaloneMinimumCents - calculatedBeforeMinimumCents)
      : 0;

  if (minimumAdjustmentCents > 0) {
    lineItems.push({
      key: "standalone_minimum",
      label: "Standalone carpet cleaning minimum adjustment",
      quantity: 1,
      unitPriceCents: minimumAdjustmentCents,
      amountCents: minimumAdjustmentCents,
    });
  }

  const subtotalCents = calculatedBeforeMinimumCents + minimumAdjustmentCents;
  const taxRate = config.tax.enabled ? config.tax.rate : 0;
  const taxCents = Math.round(subtotalCents * taxRate);
  const totalCents = subtotalCents + taxCents;
  const customQuote =
    selection.petUrineOdor &&
    (carpet.petUrineOdorCustomQuote || config.customQuote.petUrineOdorRequiresQuote);

  return {
    selection,
    lineItems,
    calculatedBeforeMinimumCents,
    minimumAdjustmentCents,
    subtotalCents,
    taxCents,
    totalCents,
    taxRate,
    taxLabel: config.tax.label,
    customQuote,
    customQuoteReason: customQuote
      ? "Pet urine / odour treatment requires admin review and a custom quote."
      : null,
  };
}
