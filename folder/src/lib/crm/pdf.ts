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
    [address.city, address.province].filter(Boolean).join("  "),
    address.postal_code,
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
  const serviceDate = formatDate(invoice.service_date, true);
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
      const unit = item.unit_label ? `<div class="item-detail">per ${escapeHtml(item.unit_label)}</div>` : "";
      return `<tr>
        <td>${escapeHtml(item.description)}${details}</td>
        <td class="num">${escapeHtml(item.quantity)}${unit}</td>
        <td class="num">${formatMoney(item.unit_cents)}</td>
        <td class="num">${formatMoney(line)}</td>
      </tr>`;
    })
    .join("");

  const paymentRows = payments
    .map((payment) => {
      const extra = payment.notes ? `<div class="muted">${escapeHtml(payment.notes)}</div>` : "";
      return `<tr>
        <td>
          ${formatDate(payment.received_at)} (${escapeHtml(paymentLabel(payment.method))})
          ${extra}
        </td>
        <td class="num">${formatMoney(payment.amount_cents)}</td>
      </tr>`;
    })
    .join("");

  const logo = logoSrc
    ? `<img src="${logoSrc}" alt="Camz Cleaning" class="logo" />`
    : `<div class="logo-fallback">C</div>`;

  return `
  <div id="invoice-sheet" class="sheet">
    <header class="letterhead">
      <div class="brand">
        ${logo}
        <div class="brand-copy">
          <div class="company">${escapeHtml(companyName)}</div>
          <div class="contact">${escapeHtml(companyEmail)}</div>
          <div class="contact">${escapeHtml(companyPhone)}</div>
          ${company.tax_number ? `<div class="contact">GST ${escapeHtml(company.tax_number)}</div>` : ""}
          ${[company.address_line1, company.address_line2, [company.city, company.province].filter(Boolean).join(" "), company.postal_code].filter(Boolean).map((line) => `<div class="contact">${escapeHtml(line)}</div>`).join("")}
        </div>
      </div>
      <div class="meta">
        <div class="meta-block">
          <div class="muted">Invoice</div>
          <div class="meta-value">#${escapeHtml(number)}</div>
        </div>
        ${customer?.customer_code ? `<div class="meta-block"><div class="muted">Customer ID</div><div class="meta-value">${escapeHtml(customer.customer_code)}</div></div>` : ""}
        ${issueDate ? `<div class="meta-block"><div class="muted">Invoice date</div><div class="meta-value">${issueDate}</div></div>` : ""}
      </div>
    </header>
    <div class="rule"></div>
    <h1>Invoice #${escapeHtml(number)}</h1>
    <section class="summary">
      <div>
        <h3>Customer</h3>
        ${customer?.customer_code ? `<p>Customer ID ${escapeHtml(customer.customer_code)}</p>` : ""}
        <p>${escapeHtml(customer?.display_name || "Customer")}</p>
        ${customer?.email ? `<p>${escapeHtml(customer.email)}</p>` : ""}
        ${customer?.phone ? `<p>${escapeHtml(customer.phone)}</p>` : ""}
        ${address ? '<p class="muted">Billing address</p>' : ""}
        ${addressLines(address).map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
        ${showServiceAddress ? '<p class="muted service-label">Service address</p>' + addressLines(serviceAddress).map((line) => `<p>${escapeHtml(line)}</p>`).join("") : ""}
      </div>
      <div>
        <h3>Invoice Details</h3>
        <p>PDF created ${created}</p>
        ${serviceDate ? `<p>Service date ${serviceDate}</p>` : ""}
        <p>${formatMoney(total)}</p>
      </div>
      <div>
        <h3>Payment</h3>
        ${dueDate ? `<p>Due ${dueDate}</p>` : "<p>No due date</p>"}
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
        ${discount > 0 ? `<tr class="subtotal"><td colspan="3">Discount${discountReason ? ` — ${escapeHtml(discountReason)}` : ""}</td><td class="num">-${formatMoney(discount)}</td></tr>` : ""}
        ${tax > 0 ? `<tr class="subtotal"><td colspan="3">GST${invoice.tax_rate_bps ? ` (${escapeHtml(Number(invoice.tax_rate_bps) / 100)}%)` : ""}</td><td class="num">${formatMoney(tax)}</td></tr>` : ""}
        <tr class="total">
          <td colspan="3">${fullyPaid ? "Total Paid" : "Total"}</td>
          <td class="num">${formatMoney(fullyPaid ? paid : total)}</td>
        </tr>
        ${!fullyPaid ? `<tr class="subtotal"><td colspan="3">Amount paid</td><td class="num">${formatMoney(paid)}</td></tr>
        <tr class="total"><td colspan="3">Balance due</td><td class="num">${formatMoney(balance)}</td></tr>` : ""}
      </tbody>
    </table>
    </div>
    ${
      paymentRows
        ? `<div class="table-wrap"><table class="payments">
            <thead><tr><th>Payments</th><th></th></tr></thead>
            <tbody>${paymentRows}</tbody>
          </table></div>`
        : ""
    }
    ${invoice.notes ? `<p class="notes"><strong>Notes</strong><br/>${escapeHtml(invoice.notes)}</p>` : ""}
    ${company.e_transfer_instructions ? `<p class="notes"><strong>E-transfer</strong><br/>${escapeHtml(company.e_transfer_instructions)}</p>` : ""}
    ${company.invoice_footer_text ? `<p class="notes">${escapeHtml(company.invoice_footer_text)}</p>` : ""}
    ${invoice.is_void ? `<p class="void">VOID</p>` : ""}
  </div>`;
}

const invoiceCss = `
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: #eef2f6;
    color: #222;
    font-family: Arial, Helvetica, sans-serif;
  }
  .toolbar {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 16px 24px;
    background: rgba(255,255,255,0.96);
    border-bottom: 1px solid #dbe3ee;
  }
  .toolbar button {
    height: 40px;
    padding: 0 18px;
    border: 0;
    border-radius: 10px;
    background: #4A86F7;
    color: white;
    font-weight: 700;
    cursor: pointer;
  }
  .toolbar button.secondary {
    background: white;
    color: #13263A;
    border: 1px solid #d5deea;
  }
  .page { padding: 24px; overflow-x: hidden; }
  .sheet {
    width: 816px;
    max-width: 100%;
    margin: 0 auto;
    background: white;
    padding: 48px 56px 64px;
    box-shadow: 0 18px 50px rgba(19,38,58,0.08);
  }
  .letterhead {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(140px, auto);
    gap: 20px 24px;
    align-items: start;
  }
  .brand { display: flex; gap: 14px; align-items: flex-start; min-width: 0; }
  .brand-copy { min-width: 0; }
  .logo { width: 72px; height: 72px; object-fit: contain; flex-shrink: 0; }
  .logo-fallback {
    width: 72px; height: 72px; border-radius: 12px; background: #e8f3ff;
    display: flex; align-items: center; justify-content: center;
    color: #00B7EB; font-size: 28px; font-weight: 800; flex-shrink: 0;
  }
  .company { font-size: 15px; color: #222; overflow-wrap: anywhere; }
  .contact, .muted { font-size: 13px; color: #4b5563; overflow-wrap: anywhere; }
  .meta { text-align: right; font-size: 13px; color: #4b5563; }
  .meta-block { margin-bottom: 10px; }
  .meta-value { color: #222; font-weight: 700; }
  .rule { height: 10px; background: #8a9aab; margin: 28px 0 32px; }
  h1 { font-size: 34px; margin: 0 0 28px; font-weight: 800; letter-spacing: -0.03em; overflow-wrap: anywhere; }
  .summary { display: grid; grid-template-columns: 1.3fr 1fr 1fr; gap: 24px; padding: 8px 0 28px; }
  .summary h3 { margin: 0 0 10px; font-size: 13px; }
  .summary p { margin: 0 0 4px; font-size: 13px; color: #374151; overflow-wrap: anywhere; }
  table { width: 100%; border-collapse: collapse; }
  .table-wrap { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .items { margin-top: 8px; }
  .items th, .payments th { text-align: left; font-size: 13px; padding: 10px 0 14px; border: 0; }
  .items td, .payments td { padding: 10px 0; border: 0; font-size: 13px; }
  .item-detail { margin-top: 3px; font-size: 11px; color: #6b7280; white-space: pre-wrap; }
  .num { text-align: right; white-space: nowrap; }
  .subtotal td { border: 0; padding-top: 14px; }
  .total td { font-size: 22px; font-weight: 800; padding-top: 18px; border: 0; }
  .payments { margin-top: 18px; }
  .notes { margin-top: 28px; font-size: 13px; color: #374151; overflow-wrap: anywhere; }
  .void { margin-top: 40px; text-align: center; font-size: 48px; letter-spacing: 12px; color: #e11d48; }
  @media (max-width: 700px) {
    .page { padding: 12px; }
    .sheet { width: 100%; padding: 20px 16px 28px; box-shadow: none; }
    .letterhead { grid-template-columns: 1fr; }
    .meta { text-align: left; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .logo, .logo-fallback { width: 56px; height: 56px; }
    h1 { font-size: 22px; margin-bottom: 16px; }
    .rule { margin: 16px 0 18px; }
    .summary { grid-template-columns: 1fr; gap: 16px; }
    .items th, .items td, .payments th, .payments td { font-size: 12px; padding: 10px 6px 10px 0; }
    .total td { font-size: 16px; padding-top: 14px; }
    .void { font-size: 28px; letter-spacing: 6px; }
  }
  @media print {
    body { background: white; }
    .toolbar { display: none !important; }
    .page { padding: 0; }
    .sheet { width: auto; box-shadow: none; padding: 0; }
    .letterhead { grid-template-columns: minmax(0, 1fr) auto; }
    .summary { grid-template-columns: 1.3fr 1fr 1fr; }
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
    <div style="font-family:Arial,Helvetica,sans-serif;padding:8px;max-width:816px;">
      <p style="font-size:14px;color:#374151;margin:0 0 16px;">Please find your invoice attached as a PDF.</p>
      ${invoiceDocument(invoice, company || {}, logoSrc || "")}
    </div>
  `;
}
