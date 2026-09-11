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
  invoice_number?: string | null;
  currency?: string | null;
  status?: string | null;
  is_void?: boolean;
  issue_date?: string | null;
  issued_at?: string | null;
  due_date?: string | null;
  notes?: string | null;
  subtotal_cents?: number;
  tax_cents?: number;
  total_cents?: number;
  amount_paid_cents?: number;
  balance_cents?: number;
  crm_customers?: {
    display_name?: string | null;
    email?: string | null;
    phone?: string | null;
    crm_customer_addresses?: InvoiceAddress[] | null;
  } | null;
  billing_address?: InvoiceAddress | null;
  crm_invoice_items?: Array<{
    description: string;
    quantity: number;
    unit_cents?: number;
    line_total_cents?: number;
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
  const issueDate = formatDate(invoice.issue_date || invoice.issued_at);
  const dueDate = formatDate(invoice.due_date, true);
  const created = formatDate(new Date().toISOString(), true);
  const items = invoice.crm_invoice_items || [];
  const payments = (invoice.crm_payments || []).filter((row) => !row.is_void);
  const paid = Number(invoice.amount_paid_cents || 0);
  const total = Number(invoice.total_cents || 0);
  const tax = Number(invoice.tax_cents || 0);
  const balance = Number(invoice.balance_cents || 0);
  const fullyPaid = paid > 0 && balance <= 0 && !invoice.is_void;

  const itemRows = items
    .map((item) => {
      const line = item.line_total_cents ?? (item.quantity || 0) * (item.unit_cents || 0);
      return `<tr>
        <td>${escapeHtml(item.description)}</td>
        <td class="num">${escapeHtml(item.quantity)}</td>
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
        <div>
          <div class="company">${escapeHtml(companyName)}</div>
          <div class="contact">${escapeHtml(companyEmail)} | ${escapeHtml(companyPhone)}</div>
          ${company.tax_number ? `<div class="contact">GST ${escapeHtml(company.tax_number)}</div>` : ""}
          ${[company.address_line1, company.address_line2, [company.city, company.province].filter(Boolean).join(" "), company.postal_code].filter(Boolean).map((line) => `<div class="contact">${escapeHtml(line)}</div>`).join("")}
        </div>
      </div>
      <div class="meta">
        <div>Invoice #${escapeHtml(number)}</div>
        ${issueDate ? `<div class="muted">Issue date</div><div>${issueDate}</div>` : ""}
      </div>
    </header>
    <div class="rule"></div>
    <h1>Invoice #${escapeHtml(number)}</h1>
    <section class="summary">
      <div>
        <h3>Customer</h3>
        <p>${escapeHtml(customer?.display_name || "Customer")}</p>
        ${customer?.email ? `<p>${escapeHtml(customer.email)}</p>` : ""}
        ${customer?.phone ? `<p>${escapeHtml(customer.phone)}</p>` : ""}
        ${addressLines(address).map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
      </div>
      <div>
        <h3>Invoice Details</h3>
        <p>PDF created ${created}</p>
        <p>${formatMoney(total)}</p>
      </div>
      <div>
        <h3>Payment</h3>
        ${dueDate ? `<p>Due ${dueDate}</p>` : "<p>No due date</p>"}
        <p>${fullyPaid ? formatMoney(paid) : formatMoney(balance)}</p>
      </div>
    </section>
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
        ${tax > 0 ? `<tr class="subtotal"><td colspan="3">Tax</td><td class="num">${formatMoney(tax)}</td></tr>` : ""}
        <tr class="total">
          <td colspan="3">${fullyPaid ? "Total Paid" : "Total"}</td>
          <td class="num">${formatMoney(fullyPaid ? paid : total)}</td>
        </tr>
        ${!fullyPaid ? `<tr class="subtotal"><td colspan="3">Amount paid</td><td class="num">${formatMoney(paid)}</td></tr>
        <tr class="total"><td colspan="3">Balance due</td><td class="num">${formatMoney(balance)}</td></tr>` : ""}
      </tbody>
    </table>
    ${
      paymentRows
        ? `<table class="payments">
            <thead><tr><th>Payments</th><th></th></tr></thead>
            <tbody>${paymentRows}</tbody>
          </table>`
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
  .page { padding: 24px; }
  .sheet {
    width: 816px;
    max-width: 100%;
    margin: 0 auto;
    background: white;
    padding: 48px 56px 64px;
    box-shadow: 0 18px 50px rgba(19,38,58,0.08);
  }
  .letterhead { display: flex; justify-content: space-between; gap: 24px; align-items: flex-start; }
  .brand { display: flex; gap: 14px; align-items: center; }
  .logo { width: 72px; height: 72px; object-fit: contain; }
  .logo-fallback {
    width: 72px; height: 72px; border-radius: 12px; background: #e8f3ff;
    display: flex; align-items: center; justify-content: center;
    color: #00B7EB; font-size: 28px; font-weight: 800;
  }
  .company { font-size: 15px; color: #222; }
  .contact, .muted, .meta { font-size: 13px; color: #4b5563; }
  .meta { text-align: right; font-size: 13px; }
  .rule { height: 10px; background: #8a9aab; margin: 28px 0 32px; }
  h1 { font-size: 34px; margin: 0 0 28px; font-weight: 800; letter-spacing: -0.03em; }
  .summary { display: grid; grid-template-columns: 1.3fr 1fr 1fr; gap: 24px; padding: 18px 0 22px; border-top: 1px solid #d7dde3; border-bottom: 1px solid #d7dde3; }
  .summary h3 { margin: 0 0 10px; font-size: 13px; }
  .summary p { margin: 0 0 4px; font-size: 13px; color: #374151; }
  table { width: 100%; border-collapse: collapse; }
  .items { margin-top: 8px; }
  .items th, .payments th { text-align: left; font-size: 13px; padding: 16px 0; border-bottom: 1px solid #d7dde3; }
  .items td, .payments td { padding: 16px 0; border-bottom: 1px solid #d7dde3; font-size: 13px; }
  .num { text-align: right; white-space: nowrap; }
  .subtotal td { border-bottom: 1px solid #d7dde3; }
  .total td { font-size: 22px; font-weight: 800; padding-top: 22px; border-bottom: 0; }
  .payments { margin-top: 18px; }
  .notes { margin-top: 28px; font-size: 13px; color: #374151; }
  .void { margin-top: 40px; text-align: center; font-size: 48px; letter-spacing: 12px; color: #e11d48; }
  @media print {
    body { background: white; }
    .toolbar { display: none !important; }
    .page { padding: 0; }
    .sheet { width: auto; box-shadow: none; padding: 0; }
  }
`;

export function buildInvoiceHtml(
  invoice: InvoiceLike,
  options?: { company?: CompanyLike; logoSrc?: string; preview?: boolean },
) {
  const number = invoice.invoice_number || "draft";
  const company = options?.company || {};
  const logoSrc = options?.logoSrc || "";
  const preview = options?.preview !== false;
  const filename = `Invoice-${number}.pdf`;
  const documentHtml = invoiceDocument(invoice, company, logoSrc);

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Invoice ${escapeHtml(number)}</title>
    <style>${invoiceCss}</style>
  </head>
  <body>
    ${
      preview
        ? `<div class="toolbar no-print">
            <button type="button" onclick="downloadInvoicePdf()">Download PDF</button>
          </div>`
        : ""
    }
    <div class="page">${documentHtml}</div>
    ${
      preview
        ? `<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.2/html2pdf.bundle.min.js"></script>
           <script>
             function downloadInvoicePdf() {
               var sheet = document.getElementById("invoice-sheet");
               var filename = ${JSON.stringify(filename)};
               var button = document.querySelector(".toolbar button");
               if (!sheet) return;
               if (!window.html2pdf) {
                 if (button) button.textContent = "Loading PDF...";
                 return;
               }
               window.html2pdf().set({
                 margin: [0.4, 0.4, 0.4, 0.4],
                 filename: filename,
                 image: { type: "jpeg", quality: 0.98 },
                 html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
                 jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
               }).from(sheet).save();
             }
           </script>`
        : ""
    }
  </body>
</html>`;
}

export function buildInvoiceEmailHtml(invoice: InvoiceLike, company?: CompanyLike, logoSrc?: string) {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;padding:8px;max-width:816px;">
      ${invoiceDocument(invoice, company || {}, logoSrc || "")}
    </div>
  `;
}
