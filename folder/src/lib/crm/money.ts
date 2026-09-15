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
  const qty = Math.max(0, Number(quantity || 0));
  const unit = Math.max(0, Math.trunc(unitCents || 0));
  return Math.round(qty * unit);
}

export type InvoiceDiscountType = "none" | "fixed" | "percent";

export function calculateInvoiceTotals(options: {
  items: Array<{ quantity: number; unit_cents: number; taxable?: boolean }>;
  discountType?: InvoiceDiscountType;
  discountValue?: number;
  taxEnabled?: boolean;
  taxRateBps?: number;
}) {
  const lines = options.items.map((item) => ({
    line_cents: lineTotalCents(item.quantity, item.unit_cents),
    taxable: item.taxable !== false,
  }));
  const subtotal_cents = lines.reduce((sum, item) => sum + item.line_cents, 0);
  const taxableBeforeDiscount = lines
    .filter((item) => item.taxable)
    .reduce((sum, item) => sum + item.line_cents, 0);
  const discountValue = Math.max(0, Number(options.discountValue || 0));
  const requestedDiscount =
    options.discountType === "fixed"
      ? Math.round(discountValue * 100)
      : options.discountType === "percent"
        ? Math.round((subtotal_cents * Math.min(discountValue, 100)) / 100)
        : 0;
  const discount_cents = Math.min(subtotal_cents, requestedDiscount);
  const taxableDiscount = subtotal_cents > 0
    ? Math.round((discount_cents * taxableBeforeDiscount) / subtotal_cents)
    : 0;
  const taxable_subtotal_cents = Math.max(0, taxableBeforeDiscount - taxableDiscount);
  const tax_rate_bps = options.taxEnabled ? Math.max(0, Math.trunc(options.taxRateBps || 0)) : 0;
  const tax_cents = options.taxEnabled
    ? Math.round((taxable_subtotal_cents * tax_rate_bps) / 10000)
    : 0;
  const total_cents = Math.max(0, subtotal_cents - discount_cents) + tax_cents;

  return {
    subtotal_cents,
    discount_cents,
    taxable_subtotal_cents,
    tax_cents,
    total_cents,
    tax_rate_bps,
  };
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
