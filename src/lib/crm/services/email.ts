import { sendCrmInvoiceEmail } from "@/lib/crm/email";
import { isDeliverableEmail } from "@/lib/crm/emailAddress";
import { loadOfficialLogoDataUri } from "@/lib/crm/logo";
import { buildInvoiceEmailHtml, pickBillingAddress } from "@/lib/crm/pdf";
import { writeCrmAudit } from "@/lib/crm/services/audit";
import { renderImmutableInvoicePdf } from "@/lib/crm/services/pdf";

type EmailClient = {
  from: (table: string) => any;
};

export async function deliverLoggedInvoiceEmail(options: {
  supabase: EmailClient;
  userId: string;
  invoice: any;
  to: string;
  reminder?: boolean;
}) {
  const to = options.to.trim();
  if (!to) return { ok: false as const, error: "Enter a real customer email before sending." };
  if (!isDeliverableEmail(to)) {
    return {
      ok: false as const,
      error: "That address cannot receive mail (example.com / invalid mailbox). Type a live email, then click Send.",
    };
  }

  const subject = options.reminder
    ? `Reminder: Invoice ${options.invoice.invoice_number} from Camz Cleaning`
    : `Invoice ${options.invoice.invoice_number} from Camz Cleaning`;
  const [{ data: settings }, logoSrc] = await Promise.all([
    options.supabase.from("crm_company_settings").select("*").eq("id", 1).maybeSingle(),
    loadOfficialLogoDataUri(),
  ]);
  const html = buildInvoiceEmailHtml(
    { ...options.invoice, billing_address: pickBillingAddress(options.invoice) },
    settings || {},
    settings?.logo_url || logoSrc,
  );
  const pdf = await renderImmutableInvoicePdf({
    supabase: options.supabase,
    invoiceId: options.invoice.id,
    actorId: options.userId,
    logAsset: false,
  });
  if (!pdf.ok) {
    return { ok: false as const, error: pdf.error || "Unable to attach the invoice PDF." };
  }

  const { data: emailRow, error: insertError } = await options.supabase
    .from("crm_invoice_emails")
    .insert({
      invoice_id: options.invoice.id,
      to_email: to,
      subject,
      body: html,
      status: "queued",
      created_by: options.userId,
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("CRM email row failed:", insertError);
    return { ok: false as const, error: insertError.message };
  }

  const sent = await sendCrmInvoiceEmail({
    to,
    subject,
    html,
    replyTo: settings?.reply_to_email || settings?.email,
    attachments: [
      {
        filename: pdf.filename,
        content: pdf.pdfBytes,
        contentType: "application/pdf",
      },
    ],
  });
  const { error: statusError } = await options.supabase
    .from("crm_invoice_emails")
    .update({
      status: sent.ok ? "sent" : "failed",
      sent_at: sent.ok ? new Date().toISOString() : null,
      error: sent.ok ? null : sent.error,
    })
    .eq("id", emailRow.id);

  if (statusError) console.error("CRM email status update failed:", statusError);

  await options.supabase.from("crm_invoice_events").insert({
    invoice_id: options.invoice.id,
    event_type: options.reminder ? "reminder_sent" : "emailed",
    payload: {
      to,
      status: sent.ok ? "sent" : "failed",
      email_id: emailRow.id,
      pdf_attached: true,
      pdf_filename: pdf.filename,
    },
    created_by: options.userId,
  });

  await writeCrmAudit(options.supabase, {
    entity_type: "crm_invoice_emails",
    entity_id: emailRow.id,
    action: sent.ok ? "delivered" : "failed",
    after: { to, subject, status: sent.ok ? "sent" : "failed", pdf_filename: pdf.filename },
    actor_id: options.userId,
  });

  if (!sent.ok) return { ok: false as const, error: sent.error, logged: true };
  return { ok: true as const, delivered: true, email_id: emailRow.id };
}
