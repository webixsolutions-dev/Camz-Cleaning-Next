import { sendCrmInvoiceEmail } from "@/lib/crm/email";
import { isDeliverableEmail } from "@/lib/crm/emailAddress";
import {
  buildCrmTemplateContext,
  renderCrmTemplate,
  sanitizeCrmEmailHtml,
  templateFromSettings,
  wrapCrmEmailHtml,
  type CrmEmailType,
} from "@/lib/crm/emailTemplates";
import { loadOfficialLogoDataUri } from "@/lib/crm/logo";
import { writeCrmAudit } from "@/lib/crm/services/audit";
import { renderImmutableInvoicePdf } from "@/lib/crm/services/pdf";

type EmailClient = { from: (table: string) => any };

function customerFromInvoice(invoice: any) {
  return Array.isArray(invoice?.crm_customers) ? invoice.crm_customers[0] : invoice?.crm_customers;
}

async function updateEmailResult(options: {
  supabase: EmailClient;
  emailId: string;
  sent: { ok: true; id: string } | { ok: false; error: string };
}) {
  const sentAt = options.sent.ok ? new Date().toISOString() : null;
  const { error } = await options.supabase
    .from("crm_invoice_emails")
    .update({
      status: options.sent.ok ? "sent" : "failed",
      sent_at: sentAt,
      error: options.sent.ok ? null : options.sent.error,
    })
    .eq("id", options.emailId);
  if (error) console.error("CRM email status update failed:", error);
  return sentAt;
}

async function createEmailLog(options: {
  supabase: EmailClient;
  invoiceId: string;
  to: string;
  subject: string;
  html: string;
  userId?: string | null;
  idempotencyKey?: string | null;
}) {
  if (options.idempotencyKey) {
    const { data: existing } = await options.supabase
      .from("crm_invoice_emails")
      .select("id, status, sent_at")
      .eq("idempotency_key", options.idempotencyKey)
      .maybeSingle();
    if (existing?.status === "sent" || existing?.status === "delivered") {
      return { ok: true as const, duplicate: true as const, row: existing };
    }
    if (existing?.id) {
      const { data: retryRow, error: retryError } = await options.supabase
        .from("crm_invoice_emails")
        .update({
          to_email: options.to,
          subject: options.subject,
          body: options.html,
          status: "queued",
          sent_at: null,
          error: null,
        })
        .eq("id", existing.id)
        .select("id, status, sent_at")
        .single();
      if (retryError) return { ok: false as const, error: retryError.message };
      return { ok: true as const, duplicate: false as const, row: retryRow };
    }
  }

  const { data, error } = await options.supabase
    .from("crm_invoice_emails")
    .insert({
      invoice_id: options.invoiceId,
      to_email: options.to,
      subject: options.subject,
      body: options.html,
      status: "queued",
      idempotency_key: options.idempotencyKey || null,
      created_by: options.userId || null,
    })
    .select("id, status, sent_at")
    .single();
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const, duplicate: false as const, row: data };
}

export async function deliverLoggedInvoiceEmail(options: {
  supabase: EmailClient;
  userId: string;
  invoice: any;
  to: string;
  reminder?: boolean;
  revisionNumber?: number;
  subjectOverride?: string;
  bodyOverride?: string;
  idempotencyKey?: string;
}) {
  const to = options.to.trim();
  if (!isDeliverableEmail(to)) return { ok: false as const, error: "Enter a real customer email address." };

  const [{ data: settings, error: settingsError }, logoSrc] = await Promise.all([
    options.supabase.from("crm_company_settings").select("*").eq("id", 1).maybeSingle(),
    loadOfficialLogoDataUri(),
  ]);
  if (settingsError) return { ok: false as const, error: settingsError.message };

  const pdf = await (renderImmutableInvoicePdf as any)({
    supabase: options.supabase,
    invoiceId: options.invoice.id,
    actorId: options.userId,
    logAsset: false,
    revisionNumber: options.revisionNumber,
  });
  if (!pdf.ok) return { ok: false as const, error: pdf.error || "Unable to attach the invoice PDF." };

  const type: CrmEmailType = options.reminder ? "reminder" : "invoice";
  const invoice = pdf.renderedInvoice || options.invoice;
  const template = templateFromSettings(type, settings || {});
  const context = buildCrmTemplateContext({ invoice, settings });
  const subject = renderCrmTemplate(options.subjectOverride || template.subject, context);
  const renderedBody = renderCrmTemplate(
    sanitizeCrmEmailHtml(options.bodyOverride || template.body),
    context,
    true,
  );
  const html = wrapCrmEmailHtml(renderedBody, settings, settings?.logo_url || logoSrc);
  const revisionNumber = Number(pdf.revisionNumber || options.revisionNumber || options.invoice.current_revision || 0) || undefined;
  const attachmentFilename = options.revisionNumber
    ? pdf.filename.replace(/\.pdf$/i, `-Revision-${revisionNumber}.pdf`)
    : pdf.filename;

  const emailLog = await createEmailLog({
    supabase: options.supabase,
    invoiceId: options.invoice.id,
    to,
    subject,
    html,
    userId: options.userId,
    idempotencyKey: options.idempotencyKey,
  });
  if (!emailLog.ok) return { ok: false as const, error: emailLog.error };
  if (emailLog.duplicate) {
    return { ok: true as const, delivered: true, duplicate: true, email_id: emailLog.row.id, revisionNumber };
  }

  const sent = await sendCrmInvoiceEmail({
    to,
    bcc: settings?.invoice_archive_bcc || undefined,
    subject,
    html,
    replyTo: settings?.reply_to_email || settings?.email,
    attachments: [{ filename: attachmentFilename, content: pdf.pdfBytes, contentType: "application/pdf" }],
  });
  await updateEmailResult({ supabase: options.supabase, emailId: emailLog.row.id, sent });

  await options.supabase.from("crm_invoice_events").insert({
    invoice_id: options.invoice.id,
    event_type: options.reminder ? "reminder_sent" : options.revisionNumber ? "revision_emailed" : "emailed",
    payload: {
      to,
      status: sent.ok ? "sent" : "failed",
      email_id: emailLog.row.id,
      provider_message_id: sent.ok ? sent.id : null,
      pdf_attached: true,
      pdf_filename: attachmentFilename,
      attachment_revision: revisionNumber || null,
    },
    created_by: options.userId,
  });
  await writeCrmAudit(options.supabase, {
    entity_type: "crm_invoice_emails",
    entity_id: emailLog.row.id,
    action: sent.ok ? "delivered" : "failed",
    after: {
      email_type: type,
      to,
      subject,
      provider_message_id: sent.ok ? sent.id : null,
      attachment_revision: revisionNumber || null,
    },
    actor_id: options.userId,
  });

  if (!sent.ok) return { ok: false as const, error: sent.error, logged: true };
  return { ok: true as const, delivered: true, duplicate: false, email_id: emailLog.row.id, revisionNumber };
}

export async function deliverLoggedPaymentReceiptEmail(options: {
  supabase: EmailClient;
  userId: string;
  paymentId?: string;
  payment?: any;
  invoice?: any;
  to?: string;
  idempotencyKey?: string;
}) {
  let payment = options.payment;
  if (!payment && options.paymentId) {
    const { data, error } = await options.supabase
      .from("crm_payments")
      .select("*")
      .eq("id", options.paymentId)
      .maybeSingle();
    if (error || !data) return { ok: false as const, error: error?.message || "Payment not found." };
    payment = data;
  }
  if (!payment?.invoice_id && !options.invoice?.id) return { ok: false as const, error: "Payment invoice is required." };

  let invoice = options.invoice;
  if (!invoice) {
    const { data, error } = await options.supabase
      .from("crm_invoices")
      .select("*, crm_customers(display_name, email, phone, crm_customer_addresses(*)), crm_invoice_items(*), crm_payments(*)")
      .eq("id", payment.invoice_id)
      .maybeSingle();
    if (error || !data) return { ok: false as const, error: error?.message || "Invoice not found." };
    invoice = data;
  }

  const to = String(options.to || customerFromInvoice(invoice)?.email || "").trim();
  if (!isDeliverableEmail(to)) return { ok: false as const, error: "Enter a valid customer email address." };

  const [{ data: settings, error: settingsError }, logoSrc] = await Promise.all([
    options.supabase.from("crm_company_settings").select("*").eq("id", 1).maybeSingle(),
    loadOfficialLogoDataUri(),
  ]);
  if (settingsError) return { ok: false as const, error: settingsError.message };

  const pdf = await renderImmutableInvoicePdf({
    supabase: options.supabase,
    invoiceId: invoice.id,
    actorId: options.userId,
    logAsset: false,
  });
  if (!pdf.ok) return { ok: false as const, error: pdf.error || "Unable to attach the paid invoice PDF." };

  const template = templateFromSettings("receipt", settings || {});
  const context = buildCrmTemplateContext({ invoice, settings, payment });
  const subject = renderCrmTemplate(template.subject, context);
  const renderedBody = renderCrmTemplate(template.body, context, true);
  const html = wrapCrmEmailHtml(renderedBody, settings, settings?.logo_url || logoSrc);
  const idempotencyKey = options.idempotencyKey || `payment-receipt:${payment.id}`;
  const emailLog = await createEmailLog({
    supabase: options.supabase,
    invoiceId: invoice.id,
    to,
    subject,
    html,
    userId: options.userId,
    idempotencyKey,
  });
  if (!emailLog.ok) return { ok: false as const, error: emailLog.error };
  if (emailLog.duplicate) return { ok: true as const, delivered: true, duplicate: true, email_id: emailLog.row.id };

  const sent = await sendCrmInvoiceEmail({
    to,
    bcc: settings?.invoice_archive_bcc || undefined,
    subject,
    html,
    replyTo: settings?.reply_to_email || settings?.email,
    attachments: [{ filename: pdf.filename, content: pdf.pdfBytes, contentType: "application/pdf" }],
  });
  await updateEmailResult({ supabase: options.supabase, emailId: emailLog.row.id, sent });
  await options.supabase.from("crm_invoice_events").insert({
    invoice_id: invoice.id,
    event_type: "receipt_emailed",
    payload: {
      payment_id: payment.id,
      email_id: emailLog.row.id,
      to,
      status: sent.ok ? "sent" : "failed",
      provider_message_id: sent.ok ? sent.id : null,
    },
    created_by: options.userId,
  });
  await writeCrmAudit(options.supabase, {
    entity_type: "crm_invoice_emails",
    entity_id: emailLog.row.id,
    action: sent.ok ? "receipt_delivered" : "receipt_failed",
    after: { invoice_id: invoice.id, payment_id: payment.id, to, provider_message_id: sent.ok ? sent.id : null },
    actor_id: options.userId,
  });
  if (!sent.ok) return { ok: false as const, error: sent.error, logged: true };
  return { ok: true as const, delivered: true, duplicate: false, email_id: emailLog.row.id };
}
