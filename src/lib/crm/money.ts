export function dollarsToCents(value: string | number): number | null {
  const raw = String(value ?? "")
    .trim()
    .replace(/CAD/gi, "")
    .replace(/[$,\s]/g, "");
  if (!raw) return null;
  const match = raw.match(/^(\d+)(?:\.(\d{1,2}))?$/);
  if (!match) return null;
  const dollars = Number(match[1]);
  const cents = Number((match[2] || "0").padEnd(2, "0"));
  if (!Number.isFinite(dollars) || !Number.isFinite(cents)) return null;
  return dollars * 100 + cents;
}

export function centsToDollars(cents: number | null | undefined) {
  const value = Number(cents || 0);
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(Math.trunc(value));
  return `${sign}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, "0")}`;
}

export function formatCad(cents: number | null | undefined) {
  return `$${centsToDollars(cents)} CAD`;
}

export function lineTotalCents(quantity: number, unitCents: number) {
  const qty = Math.max(0, Math.floor(quantity || 0));
  const unit = Math.max(0, Math.trunc(unitCents || 0));
  return qty * unit;
}

export function invoiceMoneyFromItems(
  items: Array<{ quantity: number; unit_cents: number }>,
  taxCents: number,
) {
  const subtotal_cents = items.reduce(
    (sum, item) => sum + lineTotalCents(item.quantity, item.unit_cents),
    0,
  );
  const tax_cents = Math.max(0, Math.trunc(taxCents || 0));
  const total_cents = subtotal_cents + tax_cents;
  return { subtotal_cents, tax_cents, total_cents };
}
