"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle2, LoaderCircle, Mail, Send, X, XCircle } from "lucide-react";

type ReminderPanelProps = {
  invoiceId: string;
  customerEmail?: string | null;
  disabled?: boolean;
  onChanged?: () => void | Promise<void>;
};

type ReminderData = {
  invoice?: {
    invoice_number?: string | null;
    customer_email?: string;
    automatic_reminders_disabled?: boolean;
    last_reminder_at?: string | null;
  };
  defaults?: { subject?: string; body?: string; attach_pdf?: boolean };
  emails?: Array<{
    id: string;
    to_email: string;
    subject: string;
    status: string;
    error?: string | null;
    sent_at?: string | null;
    created_at?: string | null;
  }>;
};

const fieldClass =
  "min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-700 outline-none transition focus:border-[#4A86F7] focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50";

export default function CrmReminderPanel({
  invoiceId,
  customerEmail,
  disabled = false,
  onChanged,
}: ReminderPanelProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [data, setData] = useState<ReminderData>({});
  const [to, setTo] = useState(customerEmail || "");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachPdf, setAttachPdf] = useState(true);
  const [requestId, setRequestId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/admin/crm/reminders?invoice_id=${encodeURIComponent(invoiceId)}`,
        { cache: "no-store" },
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Unable to load reminder details.");
      setData(payload);
      setTo((current) => current || customerEmail || payload.invoice?.customer_email || "");
      setSubject(payload.defaults?.subject || "");
      setBody(payload.defaults?.body || "");
      setAttachPdf(payload.defaults?.attach_pdf !== false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load reminder details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setRequestId(crypto.randomUUID());
    void load();
  }, [open, invoiceId]);

  const send = async () => {
    if (!to.trim()) {
      setError("Enter the customer email address.");
      return;
    }
    setSending(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/crm/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_id: invoiceId,
          to: to.trim(),
          subject,
          body,
          attach_pdf: attachPdf,
          request_id: requestId,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Unable to send payment reminder.");
      setMessage(payload.duplicate ? "This reminder request was already delivered." : `Reminder sent to ${to.trim()}.`);
      setRequestId(crypto.randomUUID());
      await load();
      await onChanged?.();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to send payment reminder.");
    } finally {
      setSending(false);
    }
  };

  const toggleAutomatic = async () => {
    const nextDisabled = !Boolean(data.invoice?.automatic_reminders_disabled);
    setToggling(true);
    setError("");
    try {
      const response = await fetch("/api/admin/crm/reminders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice_id: invoiceId, disabled: nextDisabled }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Unable to update automatic reminders.");
      setData((current) => ({
        ...current,
        invoice: { ...current.invoice, automatic_reminders_disabled: nextDisabled },
      }));
      setMessage(nextDisabled ? "Automatic reminders disabled for this invoice." : "Automatic reminders enabled for this invoice.");
      await onChanged?.();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update automatic reminders.");
    } finally {
      setToggling(false);
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Bell size={16} />
        Send reminder
      </button>

      {open ? (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-4">
          <div className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Bell size={20} className="text-[#4A86F7]" />
                  <h2 className="text-lg font-bold text-slate-950">Payment reminder</h2>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {data.invoice?.invoice_number ? `Invoice ${data.invoice.invoice_number}` : "Invoice reminder"}
                </p>
              </div>
              <button type="button" onClick={() => setOpen(false)} disabled={sending} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <X size={19} />
              </button>
            </div>

            {error ? (
              <p className="mt-4 flex gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <XCircle size={17} className="mt-0.5 shrink-0" /> {error}
              </p>
            ) : null}
            {message ? (
              <p className="mt-4 flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <CheckCircle2 size={17} className="mt-0.5 shrink-0" /> {message}
              </p>
            ) : null}

            {loading ? (
              <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-slate-500">
                <LoaderCircle size={18} className="animate-spin" /> Loading reminder...
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <label className="block text-xs font-bold text-slate-600">
                  To
                  <input type="email" className={`${fieldClass} mt-1.5`} value={to} onChange={(event) => setTo(event.target.value)} />
                </label>
                <label className="block text-xs font-bold text-slate-600">
                  Subject
                  <input className={`${fieldClass} mt-1.5`} value={subject} onChange={(event) => setSubject(event.target.value)} />
                </label>
                <label className="block text-xs font-bold text-slate-600">
                  Message template
                  <textarea className={`${fieldClass} mt-1.5 min-h-48 py-3 font-mono text-xs leading-5`} value={body} onChange={(event) => setBody(event.target.value)} />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex min-h-14 items-center gap-3 rounded-xl border border-slate-200 px-4 text-sm text-slate-700">
                    <input type="checkbox" checked={attachPdf} onChange={(event) => setAttachPdf(event.target.checked)} />
                    Attach latest invoice PDF
                  </label>
                  <label className="flex min-h-14 items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 text-sm text-slate-700">
                    <span>Automatic reminders</span>
                    <button
                      type="button"
                      disabled={toggling}
                      onClick={() => void toggleAutomatic()}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold ${data.invoice?.automatic_reminders_disabled ? "bg-slate-100 text-slate-600" : "bg-emerald-100 text-emerald-700"}`}
                    >
                      {toggling ? "Saving..." : data.invoice?.automatic_reminders_disabled ? "Disabled" : "Enabled"}
                    </button>
                  </label>
                </div>

                <button
                  type="button"
                  disabled={sending || !to.trim()}
                  onClick={() => void send()}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#4A86F7] px-5 text-sm font-bold text-white disabled:opacity-50"
                >
                  {sending ? <LoaderCircle size={17} className="animate-spin" /> : <Send size={17} />}
                  {sending ? "Sending reminder..." : "Send reminder now"}
                </button>

                {data.emails?.length ? (
                  <section className="border-t border-slate-200 pt-4">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                      <Mail size={16} /> Recent delivery history
                    </h3>
                    <div className="mt-3 space-y-2">
                      {data.emails.slice(0, 8).map((email) => (
                        <div key={email.id} className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs">
                          <div className="flex flex-wrap justify-between gap-2">
                            <span className="font-semibold text-slate-700">{email.to_email}</span>
                            <span className={email.status === "sent" ? "font-bold text-emerald-700" : email.status === "failed" ? "font-bold text-rose-700" : "font-bold text-amber-700"}>
                              {email.status}
                            </span>
                          </div>
                          <p className="mt-1 text-slate-500">{email.subject}</p>
                          {email.error ? <p className="mt-1 text-rose-600">{email.error}</p> : null}
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
