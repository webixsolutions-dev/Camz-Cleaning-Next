import { centsToDollars } from "@/lib/crm/money";

export type InvoiceAddress = {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  province?: string | null;
  postal_code?: string | null;
};

export type InvoicePayment = {
  amount_cents: number;
  method?: string | null;
  received_at?: string | null;
  notes?: string | null;
  is_void?: boolean;
};

export type InvoiceLike = {
  billing_address_id?: string | null;
  service_address_id?: string | null;
  invoice_number?: string | null;
  currency?: string | null;
  status?: string | null;
  is_void?: boolean;
  invoice_date?: string | null;
  service_date?: string | null;
  issue_date?: string | null;
  issued_at?: string | null;
  due_date?: string | null;
  notes?: string | null;
  subtotal_cents?: number;
  discount_cents?: number;
  discount_reason?: string | null;
  tax_enabled?: boolean;
  tax_rate_bps?: number;
  tax_cents?: number;
  total_cents?: number;
  amount_paid_cents?: number;
  balance_cents?: number;
  crm_customers?: {
    display_name?: string | null;
    customer_code?: string | null;
    email?: string | null;
    phone?: string | null;
    crm_customer_addresses?: InvoiceAddress[] | null;
  } | null;
  billing_address?: InvoiceAddress | null;
  service_address?: InvoiceAddress | null;
  crm_invoice_items?: Array<{
    description: string;
    details?: string | null;
    quantity: number;
    unit_label?: string | null;
    unit_cents?: number;
    line_total_cents?: number;
    taxable?: boolean;
  }>;
  crm_payments?: InvoicePayment[];
};

export function pickBillingAddress(invoice: {
  billing_address_id?: string | null;
  crm_customers?: {
    crm_customer_addresses?: Array<InvoiceAddress & { id?: string; is_billing?: boolean }> | null;
  } | null;
}): InvoiceAddress | null {
  const addresses = invoice.crm_customers?.crm_customer_addresses || [];
  return (
    addresses.find((row) => row.id && row.id === invoice.billing_address_id) ||
    addresses.find((row) => row.is_billing) ||
    addresses[0] ||
    null
  );
}

export function pickServiceAddress(invoice: {
  service_address_id?: string | null;
  crm_customers?: {
    crm_customer_addresses?: Array<InvoiceAddress & { id?: string; is_service?: boolean }> | null;
  } | null;
}): InvoiceAddress | null {
  const addresses = invoice.crm_customers?.crm_customer_addresses || [];
  return (
    addresses.find((row) => row.id && row.id === invoice.service_address_id) ||
    addresses.find((row) => row.is_service) ||
    null
  );
}

export type CompanyLike = {
  legal_name?: string | null;
  trade_name?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  province?: string | null;
  postal_code?: string | null;
  tax_number?: string | null;
  invoice_footer_text?: string | null;
  e_transfer_instructions?: string | null;
  logo_url?: string | null;
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatMoney(cents?: number | null) {
  return `$${centsToDollars(cents)}`;
}

function formatQuantity(value: unknown) {
  const quantity = Number(value);
  if (!Number.isFinite(quantity)) return "0";
  return String(Math.max(0, Math.round(quantity)));
}

function formatDate(value?: string | null, long = false) {
  if (!value) return "";
  const date = new Date(value.includes("T") ? value : `${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return escapeHtml(value);
  return date.toLocaleDateString("en-US", {
    month: long ? "long" : "short",
    day: "numeric",
    year: "numeric",
  });
}

function paymentLabel(method?: string | null) {
  const key = String(method || "").toLowerCase();
  if (key === "e_transfer") return "Transfer";
  if (key === "card") return "Card";
  if (key === "cash") return "Cash";
  if (key === "cheque") return "Cheque";
  return method ? method.replaceAll("_", " ") : "Other";
}

function publicDiscountReason(value?: string | null) {
  const raw = String(value || "");
  return raw.startsWith("public:") ? raw.slice(7).trim() : "";
}

function addressLines(address?: InvoiceAddress | null) {
  if (!address) return [];
  return [
    address.line1,
    address.line2,
    [address.city, address.province, address.postal_code].filter(Boolean).join(" "),
  ].filter(Boolean) as string[];
}

function invoiceDocument(invoice: InvoiceLike, company: CompanyLike, logoSrc: string) {
  const number = invoice.invoice_number || "DRAFT";
  const companyName = company.trade_name || company.legal_name || "Camz Cleaning";
  const companyEmail = company.email || "info@camzcleaning.com";
  const companyPhone = company.phone || "(587) 837-1977";
  const customer = invoice.crm_customers;
  const address = invoice.billing_address || customer?.crm_customer_addresses?.[0] || null;
  const serviceAddress = invoice.service_address || null;
  const showServiceAddress =
    serviceAddress && addressLines(serviceAddress).join("|") !== addressLines(address).join("|");
  const issueDate = formatDate(invoice.invoice_date || invoice.issue_date || invoice.issued_at);
  const dueDate = formatDate(invoice.due_date, true);
  const created = formatDate(new Date().toISOString(), true);
  const items = invoice.crm_invoice_items || [];
  const payments = (invoice.crm_payments || []).filter((row) => !row.is_void);
  const paid = Number(invoice.amount_paid_cents || 0);
  const total = Number(invoice.total_cents || 0);
  const tax = Number(invoice.tax_cents || 0);
  const discount = Number(invoice.discount_cents || 0);
  const discountReason = publicDiscountReason(invoice.discount_reason);
  const balance = Number(invoice.balance_cents || 0);
  const fullyPaid = paid > 0 && balance <= 0 && !invoice.is_void;

  const itemRows = items
    .map((item) => {
      const line = item.line_total_cents ?? (item.quantity || 0) * (item.unit_cents || 0);
      const details = item.details ? `<div class="item-detail">${escapeHtml(item.details)}</div>` : "";
      return `<tr>
        <td>${escapeHtml(item.description)}${details}</td>
        <td class="num">${formatQuantity(item.quantity)}</td>
        <td class="num">${formatMoney(item.unit_cents)}</td>
        <td class="num">${formatMoney(line)}</td>
      </tr>`;
    })
    .join("");

  const paymentRows = payments
    .map((payment) => {
      const extra = payment.notes ? `<div class="payment-note">${escapeHtml(payment.notes)}</div>` : "";
      return `<tr>
        <td>${formatDate(payment.received_at)} (${escapeHtml(paymentLabel(payment.method))})${extra}</td>
        <td class="num">${formatMoney(payment.amount_cents)}</td>
      </tr>`;
    })
    .join("");

  const logo = logoSrc
    ? `<img src="${logoSrc}" alt="${escapeHtml(companyName)}" class="logo" />`
    : `<div class="logo-fallback">C</div>`;

  const companyContact = [companyEmail, companyPhone].filter(Boolean).map(escapeHtml).join(" | ");

  return `
  <div id="invoice-sheet" class="sheet">
    <header class="letterhead">
      <div class="brand">
        ${logo}
        <div class="brand-copy">
          <div class="company">${escapeHtml(companyName)}</div>
          <div class="company-contact">${companyContact}</div>
        </div>
      </div>
      <div class="meta">
        <div class="invoice-meta">Invoice #${escapeHtml(number)}</div>
        ${issueDate ? `<div class="issue-label">Issue date</div><div class="issue-date">${issueDate}</div>` : ""}
      </div>
    </header>

    <div class="rule"></div>

    <h1>Invoice #${escapeHtml(number)}</h1>

    <section class="summary">
      <div class="summary-card">
        <h3>Customer</h3>
        <p>${escapeHtml(customer?.display_name || "Customer")}</p>
        ${customer?.email ? `<p>${escapeHtml(customer.email)}</p>` : ""}
        ${customer?.phone ? `<p>${escapeHtml(customer.phone)}</p>` : ""}
        ${addressLines(address).map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
        ${showServiceAddress ? `<p class="small-label">Service address</p>${addressLines(serviceAddress).map((line) => `<p>${escapeHtml(line)}</p>`).join("")}` : ""}
      </div>
      <div class="summary-card">
        <h3>Invoice Details</h3>
        <p>PDF created ${created}</p>
        <p>${formatMoney(total)}</p>
      </div>
      <div class="summary-card">
        <h3>Payment</h3>
        <p>${dueDate ? `Due ${dueDate}` : "No due date"}</p>
        <p>${fullyPaid ? formatMoney(paid) : formatMoney(balance)}</p>
      </div>
    </section>

    <div class="table-wrap">
      <table class="items">
        <thead>
          <tr>
            <th>Items</th>
            <th class="num">Quantity</th>
            <th class="num">Price</th>
            <th class="num">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows || `<tr><td colspan="4">No line items</td></tr>`}
          <tr class="subtotal">
            <td colspan="3">Subtotal</td>
            <td class="num">${formatMoney(invoice.subtotal_cents)}</td>
          </tr>
          ${discount > 0 ? `<tr class="subtotal"><td colspan="3">Discount${discountReason ? ` - ${escapeHtml(discountReason)}` : ""}</td><td class="num">-${formatMoney(discount)}</td></tr>` : ""}
          ${tax > 0 ? `<tr class="subtotal"><td colspan="3">GST${invoice.tax_rate_bps ? ` (${escapeHtml(Number(invoice.tax_rate_bps) / 100)}%)` : ""}</td><td class="num">${formatMoney(tax)}</td></tr>` : ""}
          <tr class="total">
            <td colspan="3">${fullyPaid ? "Total Paid" : "Total"}</td>
            <td class="num">${formatMoney(fullyPaid ? paid : total)}</td>
          </tr>
          ${!fullyPaid ? `<tr class="subtotal"><td colspan="3">Amount paid</td><td class="num">${formatMoney(paid)}</td></tr>
          <tr class="balance"><td colspan="3">Balance due</td><td class="num">${formatMoney(balance)}</td></tr>` : ""}
        </tbody>
      </table>
    </div>

    ${
      paymentRows
        ? `<div class="table-wrap payment-wrap"><table class="payments">
            <thead><tr><th>Payments</th><th></th></tr></thead>
            <tbody>${paymentRows}</tbody>
          </table></div>`
        : ""
    }

    ${invoice.notes ? `<div class="notes"><strong>Notes</strong><div>${escapeHtml(invoice.notes)}</div></div>` : ""}
    ${company.e_transfer_instructions ? `<div class="notes"><strong>E-transfer</strong><div>${escapeHtml(company.e_transfer_instructions)}</div></div>` : ""}
    ${company.invoice_footer_text ? `<div class="notes footer-note">${escapeHtml(company.invoice_footer_text)}</div>` : ""}
    ${invoice.is_void ? `<div class="void">VOID</div>` : ""}

    <footer class="page-footer">
      <div class="page-number">Page 1 of 1</div>
    </footer>
  </div>`;
}

const invoiceCss = `
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: #eef2f6;
    color: #20262d;
    font-family: Arial, Helvetica, sans-serif;
  }
  .page { padding: 24px; overflow-x: hidden; }
  .sheet {
    position: relative;
    width: 816px;
    min-height: 1056px;
    max-width: 100%;
    margin: 0 auto;
    background: white;
    padding: 52px 56px 132px;
    box-shadow: 0 18px 50px rgba(19,38,58,0.08);
  }
  .letterhead {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 24px;
    align-items: start;
  }
  .brand { display: flex; gap: 18px; align-items: flex-start; min-width: 0; }
  .brand-copy { min-width: 0; padding-top: 2px; }
  .logo { width: 62px; height: 62px; object-fit: contain; flex-shrink: 0; border-radius: 10px; }
  .logo-fallback {
    width: 62px; height: 62px; border-radius: 10px; background: #f1f4f6;
    display: flex; align-items: center; justify-content: center;
    color: #168ac1; font-size: 24px; font-weight: 800; flex-shrink: 0;
  }
  .company { font-size: 15px; line-height: 1.4; font-weight: 700; color: #20262d; overflow-wrap: anywhere; }
  .company-contact { margin-top: 4px; font-size: 13px; line-height: 1.45; color: #20262d; overflow-wrap: anywhere; }
  .meta { min-width: 170px; text-align: right; color: #20262d; }
  .invoice-meta { font-size: 14px; font-weight: 700; line-height: 1.35; }
  .issue-label { margin-top: 20px; font-size: 13px; font-weight: 700; }
  .issue-date { margin-top: 5px; font-size: 13px; }
  .rule { height: 6px; background: #919da8; margin: 32px 0 38px; }
  h1 { font-size: 34px; margin: 0 0 34px; font-weight: 800; letter-spacing: -0.025em; color: #20262d; overflow-wrap: anywhere; }
  .summary { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin-bottom: 20px; }
  .summary-card { border-top: 1px solid #cbd1d6; padding-top: 19px; min-width: 0; }
  .summary h3 { margin: 0 0 8px; font-size: 13px; line-height: 1.35; font-weight: 700; }
  .summary p { margin: 0 0 3px; font-size: 13px; line-height: 1.35; color: #20262d; overflow-wrap: anywhere; }
  .summary .secondary-detail { color: #5f6770; }
  .small-label { margin-top: 9px !important; font-size: 11px !important; color: #6b7280 !important; }
  table { width: 100%; border-collapse: collapse; }
  .table-wrap { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .items { margin-top: 3px; }
  .items thead { border-top: 1px solid #cbd1d6; border-bottom: 1px solid #cbd1d6; }
  .items th { text-align: left; font-size: 13px; font-weight: 700; padding: 13px 0 13px; }
  .items td { padding: 17px 0; border-bottom: 1px solid #cbd1d6; font-size: 13px; line-height: 1.35; vertical-align: top; }
  .item-detail { margin-top: 3px; font-size: 11px; color: #6b7280; white-space: pre-wrap; }
  .num { text-align: right !important; white-space: nowrap; }
  .subtotal td { padding-top: 14px; padding-bottom: 14px; }
  .total td, .balance td { padding-top: 17px; padding-bottom: 17px; font-size: 24px; line-height: 1.2; font-weight: 800; }
  .payment-wrap { margin-top: 14px; }
  .payments thead th { text-align: left; font-size: 13px; font-weight: 700; padding: 0 0 8px; }
  .payments td { padding: 0 0 4px; border: 0; font-size: 13px; line-height: 1.35; vertical-align: top; }
  .payment-note { margin-top: 4px; color: #4b5563; }
  .notes { margin-top: 24px; font-size: 12px; line-height: 1.45; color: #374151; white-space: pre-wrap; overflow-wrap: anywhere; }
  .notes strong { display: block; margin-bottom: 4px; color: #20262d; }
  .footer-note { color: #6b7280; }
  .void { margin-top: 40px; text-align: center; font-size: 48px; font-weight: 800; letter-spacing: 12px; color: #e11d48; }
  .page-footer {
    position: absolute;
    left: 56px;
    right: 56px;
    bottom: 46px;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
  }
  .page-number { margin-left: auto; font-size: 11px; color: #8b95a1; white-space: nowrap; }
  @media (max-width: 700px) {
    .page { padding: 12px; }
    .sheet { width: 100%; min-height: 0; padding: 24px 18px 34px; box-shadow: none; }
    .letterhead { grid-template-columns: 1fr; }
    .meta { min-width: 0; text-align: left; display: grid; grid-template-columns: auto 1fr; gap: 5px 14px; }
    .invoice-meta { grid-column: 1 / -1; }
    .issue-label { margin-top: 8px; }
    .issue-date { margin-top: 8px; }
    .logo, .logo-fallback { width: 54px; height: 54px; }
    .rule { margin: 20px 0 24px; height: 5px; }
    h1 { font-size: 25px; margin-bottom: 24px; }
    .summary { grid-template-columns: 1fr; gap: 18px; }
    .items th, .items td, .payments th, .payments td { font-size: 12px; }
    .total td, .balance td { font-size: 18px; }
    .page-footer { position: static; margin-top: 44px; }
    .void { font-size: 28px; letter-spacing: 6px; }
  }
  @media print {
    @page { size: Letter; margin: 0; }
    body { background: white; }
    .page { padding: 0; }
    .sheet { width: 8.5in; min-height: 11in; box-shadow: none; margin: 0; }
  }
`;

export function buildInvoiceHtml(
  invoice: InvoiceLike,
  options?: { company?: CompanyLike; logoSrc?: string; preview?: boolean },
) {
  const number = invoice.invoice_number || "draft";
  const company = options?.company || {};
  const logoSrc = options?.logoSrc || "";
  const documentHtml = invoiceDocument(invoice, company, logoSrc);

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Invoice ${escapeHtml(number)}</title>
    <style>${invoiceCss}</style>
  </head>
  <body>
    <div class="page">${documentHtml}</div>
  </body>
</html>`;
}

export function buildInvoiceEmailHtml(invoice: InvoiceLike, company?: CompanyLike, logoSrc?: string) {
  return `
    <style>${invoiceCss}</style>
    <div style="font-family:Arial,Helvetica,sans-serif;padding:8px;max-width:816px;">
      <p style="font-size:14px;color:#374151;margin:0 0 16px;">Please find your invoice attached as a PDF.</p>
      ${invoiceDocument(invoice, company || {}, logoSrc || "")}
    </div>
  `;
}
