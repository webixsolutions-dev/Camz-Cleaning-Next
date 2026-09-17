import { sendCrmInvoiceEmail } from "@/lib/crm/email";
import { isDeliverableEmail } from "@/lib/crm/emailAddress";
import {
  buildCrmTemplateContext,
  DEFAULT_CRM_EMAIL_TEMPLATES,
  renderCrmTemplate,
  sanitizeCrmEmailHtml,
  type CrmEmailType,
} from "@/lib/crm/emailTemplates";
import { writeCrmAudit } from "@/lib/crm/services/audit";
import { getCrmActor } from "@/lib/crm/staff";
import { enforceMutationSecurity, readJsonBody, securityErrorResponse } from "@/lib/security/http";
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_RULES = [0, 3, 7, 14].map((days, index) => ({
  id: null,
  days_after_due: days,
  is_active: true,
  attach_pdf: true,
  sort_order: index,
}));

function text(value: unknown, max = 20_000) {
  return String(value ?? "").trim().slice(0, max);
}

function emailOrNull(value: unknown) {
  const candidate = text(value, 320);
  if (!candidate) return null;
  if (!isDeliverableEmail(candidate)) throw new Error("Enter a valid archive BCC email address.");
  return candidate;
}

function normalizeRules(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 20).map((row, index) => {
    const record = (row || {}) as Record<string, unknown>;
    const days = Number(record.days_after_due);
    if (!Number.isSafeInteger(days) || days < 0 || days > 365) {
      throw new Error("Reminder days must be whole numbers from 0 to 365.");
    }
    return {
      id: text(record.id, 80) || undefined,
      days_after_due: days,
      is_active: Boolean(record.is_active),
      attach_pdf: record.attach_pdf !== false,
      sort_order: index,
    };
  });
}

export async function GET() {
  const { actor, supabase, error, status } = await getCrmActor();
  if (!actor) return NextResponse.json({ error }, { status });
  if (!actor.isAdmin) return NextResponse.json({ error: "Only an admin can view email settings." }, { status: 403 });

  try {
    const [{ data: settings, error: settingsError }, rulesResult] = await Promise.all([
      supabase.from("crm_company_settings").select("*").eq("id", 1).maybeSingle(),
      supabase.from("crm_reminder_rules").select("*").order("sort_order", { ascending: true }),
    ]);

    if (settingsError) return NextResponse.json({ error: settingsError.message }, { status: 400 });

    return NextResponse.json({
      settings: {
        automatic_reminders_enabled: Boolean(settings?.automatic_reminders_enabled),
        default_send_payment_confirmation: settings?.default_send_payment_confirmation !== false,
        invoice_archive_bcc: settings?.invoice_archive_bcc || "",
        invoice_email_subject_template:
          settings?.invoice_email_subject_template || DEFAULT_CRM_EMAIL_TEMPLATES.invoice.subject,
        invoice_email_body_template:
          settings?.invoice_email_body_template || DEFAULT_CRM_EMAIL_TEMPLATES.invoice.body,
        receipt_email_subject_template:
          settings?.receipt_email_subject_template || DEFAULT_CRM_EMAIL_TEMPLATES.receipt.subject,
        receipt_email_body_template:
          settings?.receipt_email_body_template || DEFAULT_CRM_EMAIL_TEMPLATES.receipt.body,
        reminder_email_subject_template:
          settings?.reminder_email_subject_template || DEFAULT_CRM_EMAIL_TEMPLATES.reminder.subject,
        reminder_email_body_template:
          settings?.reminder_email_body_template || DEFAULT_CRM_EMAIL_TEMPLATES.reminder.body,
      },
      rules: rulesResult.error || !rulesResult.data?.length ? DEFAULT_RULES : rulesResult.data,
      schema_warning: rulesResult.error?.message || null,
    });
  } catch (caught) {
    console.error("CRM email settings GET failed:", caught);
    return NextResponse.json({ error: "Unable to load email settings." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, {
    bucket: "crm-email-settings-patch",
    limit: 20,
    windowSeconds: 60,
  });
  if (securityError) return securityError;

  const { actor, supabase, error, status } = await getCrmActor();
  if (!actor) return NextResponse.json({ error }, { status });
  if (!actor.isAdmin) {
    return NextResponse.json({ error: "Only an admin can update email settings." }, { status: 403 });
  }

  try {
    const body = await readJsonBody<Record<string, unknown>>(request, 96 * 1024);
    const rules = normalizeRules(body.rules);
    const updates = {
      automatic_reminders_enabled: Boolean(body.automatic_reminders_enabled),
      default_send_payment_confirmation: body.default_send_payment_confirmation !== false,
      invoice_archive_bcc: emailOrNull(body.invoice_archive_bcc),
      invoice_email_subject_template: text(body.invoice_email_subject_template, 500),
      invoice_email_body_template: sanitizeCrmEmailHtml(text(body.invoice_email_body_template)),
      receipt_email_subject_template: text(body.receipt_email_subject_template, 500),
      receipt_email_body_template: sanitizeCrmEmailHtml(text(body.receipt_email_body_template)),
      reminder_email_subject_template: text(body.reminder_email_subject_template, 500),
      reminder_email_body_template: sanitizeCrmEmailHtml(text(body.reminder_email_body_template)),
      updated_at: new Date().toISOString(),
    };

    for (const [key, value] of Object.entries(updates)) {
      if (key.endsWith("_template") && !String(value || "").trim()) {
        return NextResponse.json({ error: `${key.replaceAll("_", " ")} is required.` }, { status: 400 });
      }
    }

    const { data: savedSettings, error: updateError } = await supabase
      .from("crm_company_settings")
      .update(updates)
      .eq("id", 1)
      .select("*")
      .single();

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });

    const savedRules = [];
    for (const rule of rules) {
      const payload = {
        days_after_due: rule.days_after_due,
        is_active: rule.is_active,
        attach_pdf: rule.attach_pdf,
        sort_order: rule.sort_order,
        updated_by: actor.userId,
        updated_at: new Date().toISOString(),
      };
      const query = rule.id
        ? supabase.from("crm_reminder_rules").update(payload).eq("id", rule.id).select("*").single()
        : supabase
            .from("crm_reminder_rules")
            .insert({ ...payload, created_by: actor.userId })
            .select("*")
            .single();
      const { data, error: ruleError } = await query;
      if (ruleError) return NextResponse.json({ error: ruleError.message }, { status: 400 });
      savedRules.push(data);
    }

    await writeCrmAudit(supabase, {
      entity_type: "crm_company_settings",
      entity_id: null,
      action: "email_settings_updated",
      after: {
        automatic_reminders_enabled: updates.automatic_reminders_enabled,
        default_send_payment_confirmation: updates.default_send_payment_confirmation,
        invoice_archive_bcc: updates.invoice_archive_bcc,
        reminder_rules: savedRules.map((rule) => ({
          id: rule.id,
          days_after_due: rule.days_after_due,
          is_active: rule.is_active,
          attach_pdf: rule.attach_pdf,
        })),
      },
      actor_id: actor.userId,
    });

    return NextResponse.json({ settings: savedSettings, rules: savedRules });
  } catch (caught) {
    const response = securityErrorResponse(caught);
    if (response) return response;
    const message = caught instanceof Error ? caught.message : "Unable to save email settings.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, {
    bucket: "crm-email-template-test",
    limit: 10,
    windowSeconds: 60,
  });
  if (securityError) return securityError;

  const { actor, supabase, error, status } = await getCrmActor();
  if (!actor) return NextResponse.json({ error }, { status });
  if (!actor.isAdmin) return NextResponse.json({ error: "Only an admin can send template tests." }, { status: 403 });

  try {
    const body = await readJsonBody<Record<string, unknown>>(request, 64 * 1024);
    const to = text(body.to, 320);
    const type = text(body.type, 30) as CrmEmailType;
    if (!isDeliverableEmail(to)) {
      return NextResponse.json({ error: "Enter a valid test recipient." }, { status: 400 });
    }
    if (!(["invoice", "receipt", "reminder"] as string[]).includes(type)) {
      return NextResponse.json({ error: "Invalid email template type." }, { status: 400 });
    }

    const { data: settings } = await supabase.from("crm_company_settings").select("*").eq("id", 1).maybeSingle();
    const sampleInvoice = {
      invoice_number: "INV-00001",
      invoice_date: new Date().toISOString(),
      service_date: new Date().toISOString(),
      due_date: new Date().toISOString(),
      currency: "CAD",
      subtotal_cents: 17900,
      discount_cents: 0,
      tax_cents: 895,
      total_cents: 18795,
      amount_paid_cents: type === "receipt" ? 18795 : 0,
      balance_cents: type === "receipt" ? 0 : 18795,
      crm_customers: { display_name: "Sample Customer" },
    };
    const context = buildCrmTemplateContext({
      invoice: sampleInvoice,
      settings,
      payment: { amount_cents: 18795, method: "e_transfer", reference: "TEST-123", received_at: new Date().toISOString() },
    });
    const subject = renderCrmTemplate(text(body.subject, 500), context);
    const html = renderCrmTemplate(text(body.html), context, true);
    const sent = await sendCrmInvoiceEmail({ to, subject, html, replyTo: settings?.reply_to_email || settings?.email });
    if (!sent.ok) return NextResponse.json({ error: sent.error }, { status: 400 });

    await writeCrmAudit(supabase, {
      entity_type: "crm_company_settings",
      entity_id: null,
      action: "email_template_test_sent",
      after: { type, to, provider_message_id: sent.id },
      actor_id: actor.userId,
    });
    return NextResponse.json({ ok: true, provider_message_id: sent.id });
  } catch (caught) {
    const response = securityErrorResponse(caught);
    if (response) return response;
    return NextResponse.json({ error: caught instanceof Error ? caught.message : "Unable to send test email." }, { status: 400 });
  }
}
