import { sendCrmInvoiceEmail } from "@/lib/crm/email";
import { isDeliverableEmail } from "@/lib/crm/emailAddress";
import {
  buildCrmTemplateContext,
  renderCrmTemplate,
  sanitizeCrmEmailHtml,
  templateFromSettings,
  wrapCrmEmailHtml,
} from "@/lib/crm/emailTemplates";
import { writeCrmAudit } from "@/lib/crm/services/audit";
import { renderImmutableInvoicePdf } from "@/lib/crm/services/pdf";

type ReminderClient = {
  from: (table: string) => any;
};

function cleanText(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

export async function sendCrmPaymentReminder(options: {
  supabase: ReminderClient;
  invoice: any;
  actorId?: string | null;
  to: string;
  subjectOverride?: string;
  bodyOverride?: string;
  attachPdf?: boolean;
  idempotencyKey: string;
  automatic?: boolean;
  ruleId?: string | null;
}) {
  const to = cleanText(options.to, 320);
  if (!isDeliverableEmail(to)) {
    return { ok: false as const, error: "Enter a valid customer email address." };
  }
  if (!options.invoice?.id) return { ok: false as const, error: "Invoice is required." };
  if (options.invoice.is_void || options.invoice.status === "draft" || Number(options.invoice.balance_cents || 0) <= 0) {
    return { ok: false as const, error: "Reminders can only be sent for an unpaid invoice balance." };
  }

  const { data: previous } = await options.supabase
    .from("crm_invoice_emails")
    .select("id, status, sent_at")
    .eq("idempotency_key", options.idempotencyKey)
    .maybeSingle();

  if (previous?.status === "sent" || previous?.status === "delivered") {
    return {
      ok: true as const,
      duplicate: true,
      delivered: true,
      email_id: previous.id,
      sent_at: previous.sent_at,
    };
  }

  const { data: settings, error: settingsError } = await options.supabase
    .from("crm_company_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (settingsError) return { ok: false as const, error: settingsError.message };

  const template = templateFromSettings("reminder", settings || {});
  const context = buildCrmTemplateContext({ invoice: options.invoice, settings });
  const subject = renderCrmTemplate(
    cleanText(options.subjectOverride || template.subject, 500),
    context,
  );
  const renderedBody = renderCrmTemplate(
    sanitizeCrmEmailHtml(options.bodyOverride || template.body),
    context,
    true,
  );
  const html = wrapCrmEmailHtml(renderedBody, settings, settings?.logo_url);

  const attachPdf = options.attachPdf !== false;
  let attachment:
    | { filename: string; content: Buffer | Uint8Array; contentType: string }
    | undefined;
  let attachmentRevision: number | null = null;

  if (attachPdf) {
    const pdf = await renderImmutableInvoicePdf({
      supabase: options.supabase,
      invoiceId: options.invoice.id,
      actorId: options.actorId || undefined,
      logAsset: false,
    });
    if (!pdf.ok) return { ok: false as const, error: pdf.error || "Unable to attach the invoice PDF." };
    attachment = { filename: pdf.filename, content: pdf.pdfBytes, contentType: "application/pdf" };
    attachmentRevision = Number((pdf as any).revisionNumber || options.invoice.current_revision || 0) || null;
  }

  let emailId = previous?.id as string | undefined;
  if (emailId) {
    const { error } = await options.supabase
      .from("crm_invoice_emails")
      .update({ to_email: to, subject, body: html, status: "queued", sent_at: null, error: null })
      .eq("id", emailId);
    if (error) return { ok: false as const, error: error.message };
  } else {
    const { data, error } = await options.supabase
      .from("crm_invoice_emails")
      .insert({
        invoice_id: options.invoice.id,
        to_email: to,
        subject,
        body: html,
        status: "queued",
        idempotency_key: options.idempotencyKey,
        created_by: options.actorId || null,
      })
      .select("id")
      .single();
    if (error) return { ok: false as const, error: error.message };
    emailId = data.id;
  }

  const sent = await sendCrmInvoiceEmail({
    to,
    bcc: settings?.invoice_archive_bcc || undefined,
    subject,
    html,
    replyTo: settings?.reply_to_email || settings?.email,
    attachments: attachment ? [attachment] : undefined,
  });
  const sentAt = sent.ok ? new Date().toISOString() : null;

  const { error: statusError } = await options.supabase
    .from("crm_invoice_emails")
    .update({ status: sent.ok ? "sent" : "failed", sent_at: sentAt, error: sent.ok ? null : sent.error })
    .eq("id", emailId);
  if (statusError) console.error("CRM reminder email status update failed:", statusError);

  await options.supabase.from("crm_invoice_events").insert({
    invoice_id: options.invoice.id,
    event_type: "reminder_sent",
    payload: {
      email_id: emailId,
      to,
      status: sent.ok ? "sent" : "failed",
      automatic: Boolean(options.automatic),
      reminder_rule_id: options.ruleId || null,
      idempotency_key: options.idempotencyKey,
      provider_message_id: sent.ok ? sent.id : null,
      pdf_attached: Boolean(attachment),
      attachment_revision: attachmentRevision,
    },
    created_by: options.actorId || null,
  });

  await writeCrmAudit(options.supabase, {
    entity_type: "crm_invoice_emails",
    entity_id: emailId,
    action: sent.ok ? "reminder_delivered" : "reminder_failed",
    after: {
      invoice_id: options.invoice.id,
      to,
      automatic: Boolean(options.automatic),
      rule_id: options.ruleId || null,
      provider_message_id: sent.ok ? sent.id : null,
      attachment_revision: attachmentRevision,
    },
    actor_id: options.actorId || null,
  });

  if (!sent.ok) return { ok: false as const, error: sent.error, logged: true, email_id: emailId };

  await options.supabase
    .from("crm_invoices")
    .update({ last_reminder_at: sentAt })
    .eq("id", options.invoice.id);

  return {
    ok: true as const,
    delivered: true,
    duplicate: false,
    email_id: emailId,
    sent_at: sentAt,
    provider_message_id: sent.id,
    attachment_revision: attachmentRevision,
  };
}
