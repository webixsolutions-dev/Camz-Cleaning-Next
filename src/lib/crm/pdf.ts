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
  service_type?: string | null;
  service_name?: string | null;
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

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value.includes("T") ? value : `${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return escapeHtml(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

function paymentLabel(method?: string | null) {
  const key = String(method || "").toLowerCase();
  if (key === "e_transfer") return "E-transfer";
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

function displayStatus(invoice: InvoiceLike) {
  if (invoice.is_void) return "CANCELLED";
  const status = String(invoice.status || "draft").toLowerCase();
  if (status === "draft") return "DRAFT";
  if (status === "issued" || status === "overdue") return "UNPAID";
  if (status === "partially_paid") return "PARTIALLY PAID";
  if (status === "paid") return "PAID";
  if (status === "void" || status === "cancelled") return "CANCELLED";
  return status.replaceAll("_", " ").toUpperCase();
}

function statusClass(status: string) {
  if (status === "PAID") return "status paid";
  if (status === "PARTIALLY PAID") return "status partial";
  if (status === "CANCELLED") return "status cancelled";
  if (status === "DRAFT") return "status draft";
  return "status unpaid";
}

function invoiceDocument(invoice: InvoiceLike, company: CompanyLike, logoSrc: string) {
  const number = invoice.invoice_number || "DRAFT";
  const companyName = company.trade_name || "Camz Cleaning";
  const legalName = company.legal_name || "Camzio Professional Services Inc.";
  const companyEmail = company.email || "info@camzcleaning.com";
  const companyPhone = company.phone || "587-837-1977";
  const companyWebsite = company.website || "www.camzcleaning.com";
  const companyAddress = [
    company.address_line1 || "4 Saddlecreek Terrace NE",
    company.address_line2,
    [company.city || "Calgary", company.province || "AB", company.postal_code || "T3J 4A5"]
      .filter(Boolean)
      .join(" "),
  ].filter(Boolean) as string[];

  const customer = invoice.crm_customers;
  const billingAddress = invoice.billing_address || customer?.crm_customer_addresses?.[0] || null;
  const serviceAddress = invoice.service_address || billingAddress || null;
  const issueDate = formatDate(invoice.invoice_date || invoice.issue_date || invoice.issued_at);
  const dueDate = formatDate(invoice.due_date);
  const serviceDate = formatDate(invoice.service_date);
  const items = invoice.crm_invoice_items || [];
  const serviceType =
    invoice.service_type ||
    invoice.service_name ||
    items[0]?.description ||
    "Cleaning Service";
  const payments = (invoice.crm_payments || []).filter((row) => !row.is_void);
  const paid = Number(invoice.amount_paid_cents || 0);
  const total = Number(invoice.total_cents || 0);
  const tax = Number(invoice.tax_cents || 0);
  const discount = Number(invoice.discount_cents || 0);
  const discountReason = publicDiscountReason(invoice.discount_reason);
  const balance = Number(invoice.balance_cents || 0);
  const status = displayStatus(invoice);

  const itemRows = items
    .map((item) => {
      const line = item.line_total_cents ?? (item.quantity || 0) * (item.unit_cents || 0);
      const details = item.details ? `<div class="item-detail">${escapeHtml(item.details)}</div>` : "";
      return `<tr>
        <td><strong>${escapeHtml(item.description)}</strong>${details}</td>
        <td class="num">${formatQuantity(item.quantity)}</td>
        <td class="num">${formatMoney(item.unit_cents)}</td>
        <td class="num amount">${formatMoney(line)}</td>
      </tr>`;
    })
    .join("");

  const paymentRows = payments
    .map((payment) => {
      const extra = payment.notes ? `<div class="payment-note">${escapeHtml(payment.notes)}</div>` : "";
      return `<div class="payment-row"><span>${formatDate(payment.received_at)} · ${escapeHtml(
        paymentLabel(payment.method),
      )}${extra}</span><strong>${formatMoney(payment.amount_cents)}</strong></div>`;
    })
    .join("");

  const logo = logoSrc
    ? `<img src="${logoSrc}" alt="${escapeHtml(companyName)}" class="logo" />`
    : `<div class="logo-fallback">C</div>`;

  const transferText =
    company.e_transfer_instructions ||
    `Send e-transfer to: ${companyEmail}\nPlease include the invoice number and customer name in the transfer message.\nPayment is recorded manually after the e-transfer is received.`;

  return `
  <div id="invoice-sheet" class="sheet">
    <header class="invoice-header">
      <div class="brand-block">
        <div class="brand-row">
          ${logo}
          <div class="brand-copy">
            <div class="company-name">${escapeHtml(companyName)}</div>
            <div class="company-subtitle">Professional Cleaning Services</div>
          </div>
        </div>
        <div class="operated">Operated by ${escapeHtml(legalName)}</div>
        ${companyAddress.map((line) => `<div class="company-line">${escapeHtml(line)}</div>`).join("")}
        <div class="company-line">${escapeHtml(companyPhone)} | ${escapeHtml(companyEmail)} | ${escapeHtml(
          companyWebsite,
        )}</div>
      </div>

      <div class="invoice-heading-block">
        <div class="invoice-word">INVOICE</div>
        <div class="meta-card">
          <div><span>Invoice #</span><strong>${escapeHtml(number)}</strong></div>
          <div><span>Invoice Date</span><strong>${issueDate || "—"}</strong></div>
          <div><span>Due Date</span><strong>${dueDate || "—"}</strong></div>
          <div><span>Status</span><strong class="${statusClass(status)}">${escapeHtml(status)}</strong></div>
        </div>
      </div>
    </header>

    <section class="party-grid">
      <div class="info-card">
        <div class="section-label">BILL TO</div>
        <div class="primary-value">${escapeHtml(customer?.display_name || "Customer")}</div>
        ${customer?.email ? `<div>${escapeHtml(customer.email)}</div>` : ""}
        ${customer?.phone ? `<div>${escapeHtml(customer.phone)}</div>` : ""}
        ${addressLines(billingAddress).map((line) => `<div>${escapeHtml(line)}</div>`).join("")}
      </div>
      <div class="info-card">
        <div class="section-label">SERVICE ADDRESS</div>
        ${
          addressLines(serviceAddress).length
            ? addressLines(serviceAddress).map((line) => `<div>${escapeHtml(line)}</div>`).join("")
            : `<div class="muted">Not provided</div>`
        }
        <div class="job-detail"><span>Service Date:</span><strong>${serviceDate || "—"}</strong></div>
        <div class="job-detail"><span>Service Type:</span><strong>${escapeHtml(serviceType)}</strong></div>
      </div>
    </section>

    <div class="table-wrap">
      <table class="items">
        <thead>
          <tr>
            <th>SERVICE / DESCRIPTION</th>
            <th class="num">QTY</th>
            <th class="num">RATE</th>
            <th class="num">AMOUNT</th>
          </tr>
        </thead>
        <tbody>${itemRows || `<tr><td colspan="4" class="muted">No line items</td></tr>`}</tbody>
      </table>
    </div>

    <section class="after-items">
      <div class="service-notes">
        <div class="section-label">SERVICE NOTES</div>
        <div class="note-copy">${invoice.notes ? escapeHtml(invoice.notes) : "No additional service notes."}</div>
        <div class="thank-you">Thank you for choosing Camz Cleaning.</div>
      </div>
      <div class="totals-box">
        <div class="total-row"><span>Subtotal</span><strong>${formatMoney(invoice.subtotal_cents)}</strong></div>
        ${
          discount > 0
            ? `<div class="total-row"><span>Discount${discountReason ? ` · ${escapeHtml(discountReason)}` : ""}</span><strong>-${formatMoney(
                discount,
              )}</strong></div>`
            : ""
        }
        ${
          invoice.tax_enabled !== false && tax > 0
            ? `<div class="total-row"><span>GST / Tax${invoice.tax_rate_bps ? ` (${Number(invoice.tax_rate_bps) / 100}%)` : ""}</span><strong>${formatMoney(
                tax,
              )}</strong></div>`
            : ""
        }
        <div class="total-row grand"><span>TOTAL</span><strong>${formatMoney(total)}</strong></div>
        <div class="total-row"><span>Amount Paid</span><strong>${formatMoney(paid)}</strong></div>
        <div class="total-row balance"><span>BALANCE DUE</span><strong>${formatMoney(balance)}</strong></div>
      </div>
    </section>

    ${
      paymentRows
        ? `<section class="payment-history"><div class="section-label">PAYMENTS</div>${paymentRows}</section>`
        : ""
    }

    <section class="transfer-box">
      <div class="section-label">PAY BY E-TRANSFER</div>
      <div class="transfer-copy">${escapeHtml(transferText).replaceAll("\n", "<br />")}</div>
    </section>

    ${company.invoice_footer_text ? `<div class="footer-note">${escapeHtml(company.invoice_footer_text)}</div>` : ""}
    ${invoice.is_void ? `<div class="void">CANCELLED</div>` : ""}

    <footer class="page-footer">
      <span>${escapeHtml(companyName)} | Calgary, Alberta | ${escapeHtml(companyPhone)} | ${escapeHtml(companyWebsite)}</span>
      <span>Page 1 of 1</span>
    </footer>
  </div>`;
}

const invoiceCss = `
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #eef2f6; color: #172033; font-family: Arial, Helvetica, sans-serif; }
  .page { padding: 24px; overflow-x: hidden; }
  .sheet {
    position: relative; width: min(816px, 100%); min-height: 1056px; margin: 0 auto; background: #fff;
    padding: 44px 48px 88px; box-shadow: 0 18px 50px rgba(19,38,58,.08); border-top: 7px solid #0f5ca8;
  }
  .invoice-header { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 34px; align-items: start; }
  .brand-row { display: flex; flex-direction: column; align-items: flex-start; gap: 7px; }
  .logo { width: 168px; height: 82px; object-fit: contain; object-position: left center; display: block; }
  .logo-fallback { width: 82px; height: 82px; display:flex; align-items:center; justify-content:center; border-radius:16px; background:#eaf4ff; color:#0f5ca8; font-size:30px; font-weight:800; }
  .brand-copy { padding-left: 1px; }
  .company-name { font-size: 20px; line-height: 1.15; font-weight: 800; color: #0f5ca8; }
  .company-subtitle { margin-top: 3px; color: #59677b; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
  .operated { margin-top: 12px; font-size: 11px; font-weight: 700; color: #344054; }
  .company-line { margin-top: 3px; font-size: 10.5px; color: #59677b; line-height: 1.35; overflow-wrap: anywhere; }
  .invoice-heading-block { min-width: 0; }
  .invoice-word { text-align: right; font-size: 34px; font-weight: 900; letter-spacing: .05em; color: #172033; }
  .meta-card { margin-top: 12px; border: 1px solid #dbe3ec; border-radius: 14px; overflow: hidden; background: #f8fbff; }
  .meta-card > div { display:grid; grid-template-columns: 1fr auto; gap:12px; align-items:center; padding:8px 12px; border-bottom:1px solid #e7edf4; font-size:10.5px; }
  .meta-card > div:last-child { border-bottom: 0; }
  .meta-card span { color:#6b778c; }
  .meta-card strong { color:#172033; text-align:right; }
  .status { display:inline-flex; justify-content:center; padding:4px 8px; border-radius:999px; font-size:9px; letter-spacing:.05em; }
  .status.unpaid { background:#fff4e5; color:#9a5b00; }.status.paid{background:#e9f8ef;color:#167442}.status.partial{background:#fff8db;color:#8a6500}.status.cancelled{background:#feecef;color:#a8253b}.status.draft{background:#eef1f5;color:#596273}
  .party-grid { display:grid; grid-template-columns:1fr 1fr; gap:18px; margin-top:30px; }
  .info-card { border:1px solid #dbe3ec; border-radius:14px; padding:16px 18px; min-height:132px; font-size:11px; line-height:1.5; color:#475467; }
  .section-label { color:#0f5ca8; font-size:10px; font-weight:900; letter-spacing:.12em; text-transform:uppercase; margin-bottom:9px; }
  .primary-value { color:#172033; font-size:13px; font-weight:800; margin-bottom:4px; }
  .job-detail { display:flex; justify-content:space-between; gap:16px; margin-top:8px; padding-top:8px; border-top:1px dashed #dbe3ec; }
  .job-detail span { color:#6b778c; }.job-detail strong { color:#172033; text-align:right; }
  .muted { color:#98a2b3; }
  .table-wrap { margin-top:24px; width:100%; overflow-x:auto; }
  table { width:100%; border-collapse:collapse; }
  .items { table-layout:fixed; }
  .items th { padding:10px 9px; background:#0f5ca8; color:white; font-size:9.5px; letter-spacing:.05em; text-align:left; }
  .items th:first-child,.items td:first-child{width:52%;}.items th:nth-child(2),.items td:nth-child(2){width:10%;}.items th:nth-child(3),.items td:nth-child(3){width:18%;}.items th:nth-child(4),.items td:nth-child(4){width:20%;}
  .items td { padding:13px 9px; border-bottom:1px solid #e4e9ef; vertical-align:top; font-size:11px; line-height:1.4; color:#344054; }
  .item-detail { margin-top:3px; font-size:10px; color:#7a8699; white-space:pre-wrap; }
  .num { text-align:right !important; white-space:nowrap; }.amount{font-weight:800;color:#172033!important;}
  .after-items { display:grid; grid-template-columns:minmax(0,1fr) 290px; gap:28px; margin-top:24px; align-items:start; }
  .service-notes { padding-top:4px; font-size:11px; color:#59677b; line-height:1.5; }
  .note-copy { min-height:45px; white-space:pre-wrap; overflow-wrap:anywhere; }
  .thank-you { margin-top:16px; color:#0f5ca8; font-weight:700; }
  .totals-box { border:1px solid #dbe3ec; border-radius:14px; overflow:hidden; }
  .total-row { display:flex; justify-content:space-between; gap:18px; padding:9px 12px; border-bottom:1px solid #e7edf4; font-size:11px; }
  .total-row:last-child{border-bottom:0}.total-row span{color:#667085}.total-row strong{color:#172033}.total-row.grand{background:#f3f8fe;font-size:14px;font-weight:900}.total-row.balance{background:#0f5ca8;font-size:15px}.total-row.balance span,.total-row.balance strong{color:#fff;font-weight:900}
  .payment-history { margin-top:20px; border-top:1px solid #dbe3ec; padding-top:14px; }
  .payment-row { display:flex; justify-content:space-between; gap:18px; padding:5px 0; font-size:10.5px; color:#59677b; }
  .payment-note { margin-top:2px; color:#7a8699; }
  .transfer-box { margin-top:26px; border:1px solid #b8d7f7; border-left:5px solid #0f5ca8; border-radius:14px; padding:15px 18px; background:#f2f8ff; }
  .transfer-copy { font-size:11px; line-height:1.55; color:#344054; }
  .footer-note { margin-top:16px; font-size:10px; color:#7a8699; text-align:center; }
  .void { margin-top:24px; text-align:center; font-size:34px; font-weight:900; letter-spacing:8px; color:#c83349; }
  .page-footer { position:absolute; left:48px; right:48px; bottom:28px; display:flex; justify-content:space-between; gap:20px; border-top:1px solid #e4e9ef; padding-top:9px; font-size:9px; color:#8a96a8; }
  @media (max-width:700px) {
    .page{padding:8px}.sheet{min-height:0;padding:24px 14px 32px}.invoice-header{grid-template-columns:1fr}.invoice-word{text-align:left;margin-top:4px}.meta-card{max-width:100%}.party-grid{grid-template-columns:1fr}.after-items{grid-template-columns:1fr}.logo{width:145px;height:70px}.logo-fallback{width:66px;height:66px}.company-name{font-size:18px}.items th,.items td{padding-left:5px;padding-right:5px;font-size:9.5px}.items th:first-child,.items td:first-child{width:48%}.items th:nth-child(2),.items td:nth-child(2){width:10%}.items th:nth-child(3),.items td:nth-child(3){width:20%}.items th:nth-child(4),.items td:nth-child(4){width:22%}.num{white-space:normal;overflow-wrap:anywhere}.page-footer{position:static;margin-top:36px;flex-direction:column;gap:4px}.transfer-box{margin-bottom:0}
  }
  @media print { @page{size:Letter;margin:0} body{background:#fff}.page{padding:0}.sheet{width:8.5in;min-height:11in;margin:0;box-shadow:none} }
`;

export function buildInvoiceHtml(
  invoice: InvoiceLike,
  options?: { company?: CompanyLike; logoSrc?: string; preview?: boolean },
) {
  const number = invoice.invoice_number || "draft";
  const company = options?.company || {};
  const logoSrc = options?.logoSrc || "";
  const documentHtml = invoiceDocument(invoice, company, logoSrc);
  return `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>Invoice ${escapeHtml(
    number,
  )}</title><style>${invoiceCss}</style></head><body><div class="page">${documentHtml}</div></body></html>`;
}

export function buildInvoiceEmailHtml(invoice: InvoiceLike, company?: CompanyLike, logoSrc?: string) {
  return `<style>${invoiceCss}</style><div style="font-family:Arial,Helvetica,sans-serif;padding:8px;max-width:816px;"><p style="font-size:14px;color:#374151;margin:0 0 16px;">Please find your invoice attached as a PDF.</p>${invoiceDocument(
    invoice,
    company || {},
    logoSrc || "",
  )}</div>`;
}
