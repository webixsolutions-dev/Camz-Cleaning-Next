import type { PricingAreaKey, PricingAreaValues } from "./config";

export const PACKAGE_AREA_KEYS: PricingAreaKey[] = [
  "bedrooms",
  "fullBathrooms",
  "halfBathrooms",
  "kitchens",
  "livingRooms",
  "finishedBasement",
  "stairFlights",
];

export type PackageScopeCompensation = {
  addedValueCents: number;
  removedValueCents: number;
  compensationCents: number;
  netIncreaseCents: number;
};

/**
 * A selected package keeps its base price as the floor. If the customer
 * removes an included area, that area's configured unit value becomes an
 * offset against any areas added above the package allowances. The offset
 * can never reduce the selected package below its base price.
 */
export function calculatePackageScopeCompensation(
  allowances: PricingAreaValues,
  selection: Partial<Record<PricingAreaKey, number>>,
  unitPrices: PricingAreaValues,
): PackageScopeCompensation {
  let addedValueCents = 0;
  let removedValueCents = 0;

  for (const key of PACKAGE_AREA_KEYS) {
    const included = Math.max(0, Number(allowances[key] || 0));
    const selected = Math.max(0, Number(selection[key] || 0));
    const unitPriceCents = Math.max(0, Number(unitPrices[key] || 0));

    if (selected > included) {
      addedValueCents += (selected - included) * unitPriceCents;
    } else if (selected < included) {
      removedValueCents += (included - selected) * unitPriceCents;
    }
  }

  const compensationCents = Math.min(addedValueCents, removedValueCents);
  const netIncreaseCents = Math.max(0, addedValueCents - compensationCents);

  return {
    addedValueCents,
    removedValueCents,
    compensationCents,
    netIncreaseCents,
  };
}
