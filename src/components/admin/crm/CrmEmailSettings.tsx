"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Eye, LoaderCircle, Mail, Plus, Send, Trash2 } from "lucide-react";
import {
  buildCrmTemplateContext,
  CRM_EMAIL_MERGE_FIELDS,
  renderCrmTemplate,
  type CrmEmailType,
} from "@/lib/crm/emailTemplates";

type Settings = {
  automatic_reminders_enabled: boolean;
  default_send_payment_confirmation: boolean;
  invoice_archive_bcc: string;
  invoice_email_subject_template: string;
  invoice_email_body_template: string;
  receipt_email_subject_template: string;
  receipt_email_body_template: string;
  reminder_email_subject_template: string;
  reminder_email_body_template: string;
};

type ReminderRule = {
  id?: string | null;
  days_after_due: number;
  is_active: boolean;
  attach_pdf: boolean;
  sort_order: number;
};

const fieldClass =
  "min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-[14px] font-medium text-slate-700 outline-none transition focus:border-[#4A86F7] focus:ring-4 focus:ring-[#4A86F7]/10 disabled:bg-slate-50 disabled:text-slate-400";

const TEMPLATE_FIELDS: Record<CrmEmailType, { subject: keyof Settings; body: keyof Settings; label: string }> = {
  invoice: {
    subject: "invoice_email_subject_template",
    body: "invoice_email_body_template",
    label: "Invoice",
  },
  receipt: {
    subject: "receipt_email_subject_template",
    body: "receipt_email_body_template",
    label: "Receipt",
  },
  reminder: {
    subject: "reminder_email_subject_template",
    body: "reminder_email_body_template",
    label: "Reminder",
  },
};

const SAMPLE_INVOICE = {
  invoice_number: "INV-00001",
  invoice_date: new Date().toISOString(),
  service_date: new Date().toISOString(),
  due_date: new Date().toISOString(),
  currency: "CAD",
  subtotal_cents: 17900,
  discount_cents: 0,
  tax_cents: 895,
  total_cents: 18795,
  amount_paid_cents: 0,
  balance_cents: 18795,
  crm_customers: { display_name: "Sample Customer" },
};

export default function CrmEmailSettings({ isAdmin }: { isAdmin: boolean }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [rules, setRules] = useState<ReminderRule[]>([]);
  const [tab, setTab] = useState<CrmEmailType>("invoice");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/crm/email-settings", { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Unable to load email settings.");
      setSettings(payload.settings);
      setRules(payload.rules || []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load email settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const activeDefinition = TEMPLATE_FIELDS[tab];
  const subject = settings ? String(settings[activeDefinition.subject] || "") : "";
  const body = settings ? String(settings[activeDefinition.body] || "") : "";

  const preview = useMemo(() => {
    if (!settings) return { subject: "", body: "" };
    const context = buildCrmTemplateContext({
      invoice: {
        ...SAMPLE_INVOICE,
        amount_paid_cents: tab === "receipt" ? 18795 : 0,
        balance_cents: tab === "receipt" ? 0 : 18795,
      },
      settings: { trade_name: "Camz Cleaning", e_transfer_instructions: "Send e-transfer using the instructions on your invoice." },
      payment: { amount_cents: 18795, received_at: new Date().toISOString(), method: "e_transfer", reference: "TEST-123" },
    });
    return {
      subject: renderCrmTemplate(subject, context),
      body: renderCrmTemplate(body, context, true),
    };
  }, [body, settings, subject, tab]);

  const updateSetting = <Key extends keyof Settings>(key: Key, value: Settings[Key]) => {
    setSettings((current) => (current ? { ...current, [key]: value } : current));
  };

  const updateRule = (index: number, patch: Partial<ReminderRule>) => {
    setRules((current) => current.map((rule, rowIndex) => (rowIndex === index ? { ...rule, ...patch } : rule)));
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!settings || !isAdmin) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/crm/email-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, rules }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Unable to save email settings.");
      setSettings((current) => (current ? { ...current, ...payload.settings } : current));
      setRules(payload.rules || rules);
      setMessage("Email templates and reminder rules saved.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save email settings.");
    } finally {
      setSaving(false);
    }
  };

  const sendTest = async () => {
    if (!settings || !testEmail.trim()) {
      setError("Enter a test recipient email.");
      return;
    }
    setTesting(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/crm/email-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: tab, to: testEmail.trim(), subject, html: body }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Unable to send test email.");
      setMessage(`${activeDefinition.label} template test sent to ${testEmail.trim()}.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to send test email.");
    } finally {
      setTesting(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex min-h-56 items-center justify-center gap-2 p-6 text-sm text-slate-500">
        <LoaderCircle size={18} className="animate-spin" />
        {error || "Loading email settings..."}
      </div>
    );
  }

  return (
    <form onSubmit={save} className="mx-auto w-full max-w-6xl min-w-0 overflow-x-hidden p-4 sm:p-6">
      <div className="mb-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#4A86F7]">Invoice CRM</p>
        <h1 className="mt-1 text-slate-950">Email templates & reminders</h1>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
          Configure customer emails, payment confirmations, reminder timing and company archive copies.
        </p>
      </div>

      {error ? <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
      {message ? (
        <p className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 size={17} /> {message}
        </p>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-base font-bold text-slate-900">Delivery controls</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="flex min-h-16 items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3">
                <span>
                  <span className="block text-sm font-bold text-slate-800">Automatic reminders</span>
                  <span className="mt-0.5 block text-xs text-slate-500">Run enabled due-date rules automatically.</span>
                </span>
                <input
                  type="checkbox"
                  checked={settings.automatic_reminders_enabled}
                  disabled={!isAdmin}
                  onChange={(event) => updateSetting("automatic_reminders_enabled", event.target.checked)}
                  className="h-5 w-5 accent-[#4A86F7]"
                />
              </label>
              <label className="flex min-h-16 items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3">
                <span>
                  <span className="block text-sm font-bold text-slate-800">Payment confirmations</span>
                  <span className="mt-0.5 block text-xs text-slate-500">Default receipt-email option after payment.</span>
                </span>
                <input
                  type="checkbox"
                  checked={settings.default_send_payment_confirmation}
                  disabled={!isAdmin}
                  onChange={(event) => updateSetting("default_send_payment_confirmation", event.target.checked)}
                  className="h-5 w-5 accent-[#4A86F7]"
                />
              </label>
              <label className="text-xs font-bold text-slate-600 sm:col-span-2">
                Invoice archive BCC (optional)
                <input
                  type="email"
                  className={`${fieldClass} mt-1.5`}
                  placeholder="invoices@camzcleaning.com"
                  value={settings.invoice_archive_bcc}
                  disabled={!isAdmin}
                  onChange={(event) => updateSetting("invoice_archive_bcc", event.target.value)}
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Automatic reminder schedule</h2>
                <p className="mt-1 text-xs text-slate-500">Day 0 means the invoice due date. Duplicate rule/day sends are blocked server-side.</p>
              </div>
              <button
                type="button"
                disabled={!isAdmin}
                onClick={() => setRules((current) => [...current, { days_after_due: 1, is_active: true, attach_pdf: true, sort_order: current.length }])}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 disabled:opacity-50"
              >
                <Plus size={15} /> Add rule
              </button>
            </div>
            <div className="mt-4 space-y-2">
              {rules.map((rule, index) => (
                <div key={rule.id || index} className="grid gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-[140px_1fr_1fr_44px] sm:items-center">
                  <label className="text-xs font-semibold text-slate-500">
                    Days after due
                    <input
                      type="number"
                      min={0}
                      max={365}
                      className={`${fieldClass} mt-1`}
                      value={rule.days_after_due}
                      disabled={!isAdmin}
                      onChange={(event) => updateRule(index, { days_after_due: Number(event.target.value || 0) })}
                    />
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={rule.is_active} disabled={!isAdmin} onChange={(event) => updateRule(index, { is_active: event.target.checked })} />
                    Active
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={rule.attach_pdf} disabled={!isAdmin} onChange={(event) => updateRule(index, { attach_pdf: event.target.checked })} />
                    Attach latest PDF
                  </label>
                  <button
                    type="button"
                    aria-label="Remove reminder rule"
                    disabled={!isAdmin}
                    onClick={() => setRules((current) => current.filter((_, rowIndex) => rowIndex !== index))}
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(TEMPLATE_FIELDS) as CrmEmailType[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={`min-h-10 rounded-xl px-4 text-xs font-bold ${tab === key ? "bg-[#4A86F7] text-white" : "border border-slate-200 text-slate-600"}`}
                >
                  {TEMPLATE_FIELDS[key].label}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-4">
              <label className="block text-xs font-bold text-slate-600">
                Subject template
                <input
                  className={`${fieldClass} mt-1.5`}
                  value={subject}
                  disabled={!isAdmin}
                  onChange={(event) => updateSetting(activeDefinition.subject, event.target.value)}
                />
              </label>
              <label className="block text-xs font-bold text-slate-600">
                HTML body template
                <textarea
                  className={`${fieldClass} mt-1.5 min-h-64 py-3 font-mono text-xs leading-5`}
                  value={body}
                  disabled={!isAdmin}
                  onChange={(event) => updateSetting(activeDefinition.body, event.target.value)}
                />
              </label>
              <div>
                <p className="text-xs font-bold text-slate-600">Merge fields</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {CRM_EMAIL_MERGE_FIELDS.map((field) => (
                    <button
                      key={field}
                      type="button"
                      onClick={() => navigator.clipboard?.writeText(`{{${field}}}`)}
                      className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                    >
                      {`{{${field}}}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-5 xl:self-start">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
              <Eye size={16} className="text-[#4A86F7]" />
              <h2 className="text-sm font-bold text-slate-900">Live sample preview</h2>
            </div>
            <div className="p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Subject</p>
              <p className="mt-1 break-words text-sm font-bold text-slate-900">{preview.subject}</p>
              <div className="mt-4 border-t border-slate-100 pt-4 text-sm leading-6 text-slate-700" dangerouslySetInnerHTML={{ __html: preview.body }} />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-[#4A86F7]" />
              <h2 className="text-sm font-bold text-slate-900">Send template test</h2>
            </div>
            <input
              type="email"
              value={testEmail}
              onChange={(event) => setTestEmail(event.target.value)}
              placeholder="your@email.com"
              className={`${fieldClass} mt-3`}
            />
            <button
              type="button"
              disabled={!isAdmin || testing || !testEmail.trim()}
              onClick={() => void sendTest()}
              className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#4A86F7] text-sm font-bold text-[#4A86F7] disabled:opacity-50"
            >
              {testing ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={16} />}
              {testing ? "Sending..." : `Test ${activeDefinition.label}`}
            </button>
          </section>

          <button
            type="submit"
            disabled={!isAdmin || saving}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#4A86F7] px-5 text-sm font-bold text-white shadow-sm disabled:opacity-50"
          >
            {saving ? <LoaderCircle size={17} className="animate-spin" /> : null}
            {saving ? "Saving..." : "Save email settings"}
          </button>
        </aside>
      </div>
    </form>
  );
}
