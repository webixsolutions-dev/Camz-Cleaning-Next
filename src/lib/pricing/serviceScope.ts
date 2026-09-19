export type CleaningPricingScope = "standard" | "deep" | "move_in_out" | "carpet";

export type CleaningServiceIdentity = {
  service_type?: unknown;
  title?: unknown;
};

const normalized = (value: unknown) =>
  typeof value === "string"
    ? value.toLowerCase().replace(/[–—]/g, "-").replace(/\s+/g, " ").trim()
    : "";

/**
 * Maps the existing services table to the central cleaning pricing scopes.
 * This intentionally supports older DB rows where Deep Cleaning may still be
 * stored as a Residential service and carpet may be stored as Specialty.
 */
export function resolveCleaningPricingScope(
  service: CleaningServiceIdentity | null | undefined,
): CleaningPricingScope | null {
  if (!service) return null;

  const type = normalized(service.service_type).replace(/[-\s]+/g, "_");
  const title = normalized(service.title);

  if (
    type === "move_in_out" ||
    /\bmove[ -]?in\b/.test(title) ||
    /\bmove[ -]?out\b/.test(title)
  ) {
    return "move_in_out";
  }

  if (/\bdeep\b/.test(title)) return "deep";

  if (/\bcarpet\b/.test(title)) return "carpet";

  if (type === "residential") return "standard";

  return null;
}
