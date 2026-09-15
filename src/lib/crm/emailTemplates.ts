export type CrmEmailType = "invoice" | "receipt" | "reminder";

export type CrmTemplateContext = Record<string, string | number | null | undefined>;

export type CrmEmailTemplateDefinition = {
  key: CrmEmailType;
  label: string;
  subject: string;
  body: string;
};

export const CRM_EMAIL_MERGE_FIELDS = [
  "company_name",
  "customer_name",
  "invoice_number",
  "invoice_date",
  "service_date",
  "due_date",
  "subtotal",
  "discount",
  "tax",
  "total",
  "amount_paid",
  "balance_due",
  "payment_amount",
  "payment_date",
  "payment_method",
  "payment_reference",
  "e_transfer_instructions",
  "reply_to_email",
] as const;

export const DEFAULT_CRM_EMAIL_TEMPLATES: Record<CrmEmailType, CrmEmailTemplateDefinition> = {
  invoice: {
    key: "invoice",
    label: "Invoice email",
    subject: "Invoice {{invoice_number}} from {{company_name}}",
    body: `
      <p>Hello {{customer_name}},</p>
      <p>Your invoice <strong>{{invoice_number}}</strong> is attached.</p>
      <p><strong>Total:</strong> {{total}}<br />
      <strong>Balance due:</strong> {{balance_due}}<br />
      <strong>Due date:</strong> {{due_date}}</p>
      <p>{{e_transfer_instructions}}</p>
      <p>Thank you,<br />{{company_name}}</p>
    `.trim(),
  },
  receipt: {
    key: "receipt",
    label: "Payment receipt",
    subject: "Payment received - Invoice {{invoice_number}}",
    body: `
      <p>Hello {{customer_name}},</p>
      <p>We received your payment for invoice <strong>{{invoice_number}}</strong>.</p>
      <p><strong>Amount received:</strong> {{payment_amount}}<br />
      <strong>Payment date:</strong> {{payment_date}}<br />
      <strong>Payment method:</strong> {{payment_method}}<br />
      <strong>Reference:</strong> {{payment_reference}}<br />
      <strong>Remaining balance:</strong> {{balance_due}}</p>
      <p>Your updated invoice PDF is attached.</p>
      <p>Thank you,<br />{{company_name}}</p>
    `.trim(),
  },
  reminder: {
    key: "reminder",
    label: "Payment reminder",
    subject: "Payment reminder - Invoice {{invoice_number}}",
    body: `
      <p>Hello {{customer_name}},</p>
      <p>This is a reminder that invoice <strong>{{invoice_number}}</strong> has an outstanding balance of <strong>{{balance_due}}</strong>.</p>
      <p><strong>Due date:</strong> {{due_date}}</p>
      <p>{{e_transfer_instructions}}</p>
      <p>If payment has already been sent, please disregard this reminder.</p>
      <p>Thank you,<br />{{company_name}}</p>
    `.trim(),
  },
};

export function escapeEmailValue(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function sanitizeCrmEmailHtml(value: unknown) {
  return String(value ?? "")
    .replace(/<\s*\/?\s*(script|style|iframe|object|embed|form|input|button|meta|link)[^>]*>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript\s*:/gi, "")
    .trim();
}

export function renderCrmTemplate(template: string, context: CrmTemplateContext, html = false) {
  const safeTemplate = html ? sanitizeCrmEmailHtml(template) : String(template || "").replace(/[\r\n]+/g, " ").trim();

  return safeTemplate.replace(/{{\s*([a-z0-9_]+)\s*}}/gi, (_token, key: string) => {
    const value = context[key.toLowerCase()] ?? "";
    return html ? escapeEmailValue(value) : String(value);
  });
}

export function formatCrmMoney(cents: unknown, currency = "CAD") {
  const numeric = Number(cents || 0);
  return new Intl.NumberFormat("en-CA", { style: "currency", currency }).format(numeric / 100);
}

export function formatCrmDate(value: unknown, timezone = "America/Edmonton") {
  if (!value) return "Not specified";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function customerFromInvoice(invoice: any) {
  return Array.isArray(invoice?.crm_customers) ? invoice.crm_customers[0] : invoice?.crm_customers;
}

export function buildCrmTemplateContext(options: {
  invoice: any;
  settings?: any;
  payment?: any;
}) {
  const { invoice, settings = {}, payment = {} } = options;
  const customer = customerFromInvoice(invoice) || {};
  const currency = invoice?.currency || settings?.default_currency || "CAD";
  const timezone = settings?.timezone || "America/Edmonton";

  return {
    company_name: settings?.trade_name || settings?.legal_name || "Camz Cleaning",
    customer_name: customer?.display_name || customer?.legal_name || "Customer",
    invoice_number: invoice?.invoice_number || "Draft",
    invoice_date: formatCrmDate(invoice?.invoice_date, timezone),
    service_date: formatCrmDate(invoice?.service_date, timezone),
    due_date: formatCrmDate(invoice?.due_date, timezone),
    subtotal: formatCrmMoney(invoice?.subtotal_cents, currency),
    discount: formatCrmMoney(invoice?.discount_cents, currency),
    tax: formatCrmMoney(invoice?.tax_cents, currency),
    total: formatCrmMoney(invoice?.total_cents, currency),
    amount_paid: formatCrmMoney(invoice?.amount_paid_cents, currency),
    balance_due: formatCrmMoney(invoice?.balance_cents, currency),
    payment_amount: formatCrmMoney(payment?.amount_cents, payment?.currency || currency),
    payment_date: formatCrmDate(payment?.received_at || payment?.created_at, timezone),
    payment_method: String(payment?.method || "").replaceAll("_", " "),
    payment_reference: payment?.reference || "Not provided",
    e_transfer_instructions: settings?.e_transfer_instructions || "",
    reply_to_email: settings?.reply_to_email || settings?.email || "",
  } satisfies CrmTemplateContext;
}

export function templateFromSettings(type: CrmEmailType, settings: any) {
  const defaults = DEFAULT_CRM_EMAIL_TEMPLATES[type];
  const prefix = type === "invoice" ? "invoice" : type === "receipt" ? "receipt" : "reminder";

  return {
    subject: String(settings?.[`${prefix}_email_subject_template`] || defaults.subject),
    body: String(settings?.[`${prefix}_email_body_template`] || defaults.body),
  };
}

export function wrapCrmEmailHtml(body: string, settings: any, logoSrc?: string | null) {
  const companyName = escapeEmailValue(settings?.trade_name || settings?.legal_name || "Camz Cleaning");
  const logo = logoSrc
    ? `<img src="${escapeEmailValue(logoSrc)}" alt="${companyName}" style="display:block;max-width:150px;max-height:64px;margin:0 0 18px" />`
    : "";
  return `<!doctype html>
<html>
  <body style="margin:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#172033">
    <div style="padding:28px 12px">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #dbe3ee;border-radius:16px;overflow:hidden">
        <div style="height:5px;background:#4A86F7"></div>
        <div style="padding:28px">
          ${logo}
          <div style="font-size:15px;line-height:1.7">${sanitizeCrmEmailHtml(body)}</div>
        </div>
        <div style="padding:16px 28px;background:#f8fafc;color:#64748b;font-size:12px">Sent by ${companyName}</div>
      </div>
    </div>
  </body>
</html>`;
}
