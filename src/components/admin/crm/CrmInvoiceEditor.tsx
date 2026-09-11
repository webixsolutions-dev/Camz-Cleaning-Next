"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Ban,
  Bell,
  CheckCircle2,
  FileText,
  Mail,
  Plus,
  Receipt,
  RotateCcw,
  Send,
  ShieldAlert,
  Wallet,
  X,
} from "lucide-react";
import { isDeliverableEmail } from "@/lib/crm/emailAddress";
import { centsToDollars, dollarsToCents, formatCad, invoiceMoneyFromItems } from "@/lib/crm/services/invoiceCalc";
import type { CrmCustomer } from "./CrmCustomersClient";

type Line = {
  id?: string;
  description: string;
  quantity: string;
  unit_dollars: string;
};

type Invoice = {
  id: string;
  invoice_number: string | null;
  status: string;
  customer_id: string;
  due_date: string | null;
  notes: string | null;
  tax_cents: number;
  subtotal_cents: number;
  total_cents: number;
  amount_paid_cents: number;
  balance_cents: number;
  is_void: boolean;
  crm_customers?: { email?: string | null } | null;
  crm_invoice_items?: Array<{
    id: string;
    description: string;
    quantity: number;
    unit_cents: number;
  }>;
  crm_payments?: Array<{
    id: string;
    amount_cents: number;
    method: string | null;
    is_void: boolean;
    received_at: string;
  }>;
  crm_invoice_events?: Array<{
    id: string;
    event_type: string;
    created_at: string;
  }>;
  crm_invoice_emails?: Array<{
    id: string;
    to_email: string;
    status: string;
    error: string | null;
    created_at: string;
  }>;
};

type Notice = {
  kind: "success" | "error";
  title: string;
  detail: string;
};

const fieldClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-[13px] font-medium text-slate-700 outline-none transition focus:border-[#4A86F7] focus:ring-4 focus:ring-[#4A86F7]/10";

const statusTone: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  issued: "bg-blue-50 text-blue-700",
  partially_paid: "bg-amber-50 text-amber-800",
  paid: "bg-emerald-50 text-emerald-700",
  overdue: "bg-orange-50 text-orange-700",
  void: "bg-rose-50 text-rose-700",
};

async function readApi(response: Response) {
  const payload = await response.json().catch(() => ({}));
  return payload as Record<string, unknown>;
}

function formatStatus(status?: string | null) {
  return String(status || "draft").replaceAll("_", " ");
}

export default function CrmInvoiceEditor({
  invoiceId,
  isAdmin,
}: {
  invoiceId?: string;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [customers, setCustomers] = useState<CrmCustomer[]>([]);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customerId, setCustomerId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [taxDollars, setTaxDollars] = useState("0.00");
  const [lines, setLines] = useState<Line[]>([{ description: "", quantity: "1", unit_dollars: "0.00" }]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [saving, setSaving] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("e_transfer");
  const [voidReason, setVoidReason] = useState("");
  const [confirmVoid, setConfirmVoid] = useState(false);
  const [sendEmail, setSendEmail] = useState("");
  const [reverseTarget, setReverseTarget] = useState<{ id: string; amount_cents: number } | null>(null);
  const [reverseReason, setReverseReason] = useState("");

  const draft = !invoice || invoice.status === "draft";
  const issued = Boolean(invoice && invoice.status !== "draft" && !invoice.is_void);
  const selectedCustomer = customers.find((row) => row.id === customerId);

  const showNotice = (next: Notice) => {
    setNotice(next);
  };

  const load = async (id?: string) => {
    try {
      const [customersRes, invoiceRes] = await Promise.all([
        fetch("/api/admin/crm/customers/", { cache: "no-store" }),
        id ? fetch(`/api/admin/crm/invoices/?id=${id}`, { cache: "no-store" }) : Promise.resolve(null),
      ]);
      const customersPayload = await readApi(customersRes);
      if (!customersRes.ok) {
        setError(String(customersPayload.error || "Failed to load customers"));
        return;
      }
      setCustomers((customersPayload.customers as CrmCustomer[]) || []);

      if (invoiceRes) {
        const payload = await readApi(invoiceRes);
        if (!invoiceRes.ok) {
          setError(String(payload.error || "Failed to load invoice"));
          return;
        }
        const current = (payload.invoices as Invoice[] | undefined)?.[0];
        if (!current) {
          setError("Invoice not found");
          return;
        }
        setInvoice(current);
        setCustomerId(current.customer_id);
        setDueDate(current.due_date || "");
        setNotes(current.notes || "");
        setTaxDollars(centsToDollars(current.tax_cents));
        const customerEmail = current.crm_customers?.email || "";
        setSendEmail(isDeliverableEmail(customerEmail) ? customerEmail : sendEmail);
        if (!paymentAmount && current.balance_cents > 0) {
          setPaymentAmount(centsToDollars(current.balance_cents));
        }
        setLines(
          (current.crm_invoice_items || []).length
            ? current.crm_invoice_items.map((item) => ({
                id: item.id,
                description: item.description,
                quantity: String(item.quantity),
                unit_dollars: centsToDollars(item.unit_cents),
              }))
            : [{ description: "", quantity: "1", unit_dollars: "0.00" }],
        );
      }
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load invoice");
    }
  };

  useEffect(() => {
    void load(invoiceId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 4200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const saveDraft = async (options?: { silent?: boolean }) => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        customer_id: customerId,
        due_date: dueDate || null,
        notes,
        tax_dollars: taxDollars,
        items: lines.map((line) => ({
          id: line.id,
          description: line.description,
          quantity: Number(line.quantity || 1),
          unit_dollars: line.unit_dollars,
        })),
      };
      const response = await fetch("/api/admin/crm/invoices/", {
        method: invoice?.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoice?.id ? { id: invoice.id, action: "save", ...payload } : payload),
      });
      const body = await readApi(response);
      if (!response.ok) {
        setError(String(body.error || "Save failed"));
        return null;
      }
      const saved = body.invoice as Invoice;
      if (!options?.silent) {
        showNotice({ kind: "success", title: "Draft saved", detail: "Line items and totals are stored. Issue when the bill is ready." });
      }
      setInvoice(saved);
      if (!invoiceId && saved?.id) {
        router.replace(`/admin-dashboard/crm/invoices/${saved.id}`);
        return saved.id;
      }
      if (saved?.id) await load(saved.id);
      return saved?.id || invoice?.id || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save invoice");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const runAction = async (action: "issue" | "send" | "remind" | "void") => {
    setError("");

    if (action === "void") {
      if (!isAdmin) {
        setError("Only an admin can void an invoice.");
        return;
      }
      if (draft || !invoice?.id) {
        setError("Void is only for issued invoices. A draft is not a legal bill yet, so there is nothing to cancel.");
        return;
      }
      if (!voidReason.trim() || !confirmVoid) {
        setError("Type why you are cancelling this bill, then tick the confirmation box. Void keeps the invoice number on file so it is never reused.");
        return;
      }
    }

    if (action === "issue") {
      if (invoice && invoice.status !== "draft") {
        setError("This invoice is already issued. Use Send or Record payment instead.");
        return;
      }
      if (!customerId) {
        setError("Select a customer before issuing.");
        return;
      }
    }

    if ((action === "send" || action === "remind") && !issued) {
      setError("Issue the invoice first. Sending is only for numbered invoices.");
      return;
    }

    if ((action === "send" || action === "remind") && !isDeliverableEmail(sendEmail)) {
      setError("Enter a live email (not @example.com). The previous send failed because that mailbox does not exist.");
      return;
    }

    setSaving(true);
    try {
      let id = invoice?.id;
      if (action === "issue") {
        id = (await saveDraft({ silent: true })) || undefined;
        setSaving(true);
      }
      if (!id) {
        setError("Save the invoice first.");
        return;
      }

      const payload: Record<string, string> = { id, action };
      if (action === "send" || action === "remind") payload.to_email = sendEmail.trim();
      if (action === "void") payload.void_reason = voidReason.trim();

      const response = await fetch("/api/admin/crm/invoices/", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await readApi(response);
      if (!response.ok || body.ok === false) {
        setError(String(body.error || `${action} failed`));
        await load(id);
        return;
      }
      if (action === "issue") {
        showNotice({
          kind: "success",
          title: "Invoice issued",
          detail: "A unique number is locked. Next: send the invoice or record a payment.",
        });
      } else if (action === "send") {
        showNotice({
          kind: "success",
          title: "Email sent",
          detail: `Invoice emailed to ${sendEmail.trim()}. Delivery is logged in the email history.`,
        });
      } else if (action === "remind") {
        showNotice({
          kind: "success",
          title: "Reminder sent",
          detail: `Payment reminder emailed to ${sendEmail.trim()}.`,
        });
      } else {
        showNotice({
          kind: "success",
          title: "Invoice voided",
          detail: "The record stays in history and this number cannot be reused.",
        });
      }
      setConfirmVoid(false);
      await load(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Unable to ${action} invoice`);
    } finally {
      setSaving(false);
    }
  };

  const openPdfSnapshot = async () => {
    if (!invoice?.id) {
      setError("Save the invoice first, then generate the PDF view.");
      return;
    }
    const preview = window.open(`/admin-dashboard/crm/invoices/${invoice.id}/preview`, "_blank", "noopener,noreferrer");
    if (!preview) {
      setError("Allow pop-ups to open the invoice PDF preview, then click Download PDF.");
      return;
    }
    showNotice({
      kind: "success",
      title: "PDF view generated",
      detail: "Click Download PDF in the new tab. The file saves to your device — it does not open the print dialog.",
    });
  };

  const recordPayment = async (event: FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!invoice?.id || !issued) {
      setError("Issue the invoice first, then enter the amount paid.");
      return;
    }
    const cents = dollarsToCents(paymentAmount);
    if (cents == null || cents <= 0) {
      setError("Enter a payment amount like 150 or 150.00");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/admin/crm/payments/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_id: invoice.id,
          amount_cents: cents,
          amount_dollars: paymentAmount,
          method: paymentMethod,
        }),
      });
      const body = await readApi(response);
      if (!response.ok) {
        setError(String(body.error || "Payment failed"));
        return;
      }
      setPaymentAmount("");
      showNotice({
        kind: "success",
        title: "Payment recorded",
        detail: `${formatCad(cents)} applied. Paid and balance totals updated.`,
      });
      await load(invoice.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to record payment");
    } finally {
      setSaving(false);
    }
  };

  const confirmReversePayment = async () => {
    if (!isAdmin || !reverseTarget) return;
    const reason = reverseReason.trim();
    if (!reason) {
      setError("Enter why this payment is being reversed.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/admin/crm/payments/", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reverseTarget.id, void_reason: reason }),
      });
      const body = await readApi(response);
      if (!response.ok) {
        setError(String(body.error || "Reverse failed"));
        return;
      }
      setReverseTarget(null);
      setReverseReason("");
      showNotice({
        kind: "success",
        title: "Payment reversed",
        detail: `${formatCad(reverseTarget.amount_cents)} was removed from paid. Record a new payment if the customer still owes.`,
      });
      await load(invoice?.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reverse payment");
    } finally {
      setSaving(false);
    }
  };

  const draftTotals = useMemo(() => {
    const items = lines.map((line) => ({
      quantity: Number(line.quantity || 1),
      unit_cents: dollarsToCents(line.unit_dollars) || 0,
    }));
    return invoiceMoneyFromItems(items, dollarsToCents(taxDollars) || 0);
  }, [lines, taxDollars]);

  const subtotal = draft ? draftTotals.subtotal_cents : invoice?.subtotal_cents;
  const tax = draft ? draftTotals.tax_cents : invoice?.tax_cents;
  const total = draft ? draftTotals.total_cents : invoice?.total_cents;

  return (
    <div className="relative min-h-full bg-[#F4F7FB] p-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4A86F7]">Invoice CRM</p>
          <h1 className="mt-1 text-slate-900">{invoice?.invoice_number || "New invoice"}</h1>
          <p className="mt-1 max-w-2xl text-slate-500">
            {selectedCustomer?.display_name || "Select a customer"}, then draft → issue → send / PDF → collect payment.
          </p>
        </div>
        <span className={`inline-flex h-8 items-center rounded-full px-3 text-[11px] font-bold uppercase tracking-wide ${statusTone[invoice?.status || "draft"]}`}>
          {formatStatus(invoice?.is_void ? "void" : invoice?.status)}
        </span>
      </div>

      {error ? (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-800">
          <ShieldAlert size={16} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_18px_50px_rgba(19,38,58,0.06)]">
          <div className="flex items-center justify-between border-b border-slate-100 bg-[linear-gradient(135deg,#13263A_0%,#1E3A5F_55%,#4A86F7_140%)] px-6 py-5 text-white">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">Camz Cleaning</p>
              <p className="mt-1 text-lg font-semibold">{invoice?.invoice_number || "Draft invoice"}</p>
            </div>
            <div className="text-right text-[12px] text-white/80">
              <p>{selectedCustomer?.display_name || "No customer yet"}</p>
              <p>{dueDate ? `Due ${dueDate}` : "No due date"}</p>
            </div>
          </div>

          <div className="space-y-5 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Customer
                <select className={`${fieldClass} mt-1.5`} value={customerId} disabled={!draft} onChange={(event) => setCustomerId(event.target.value)} required>
                  <option value="">Select customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.display_name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Due date
                <input className={`${fieldClass} mt-1.5`} type="date" value={dueDate} disabled={!draft} onChange={(event) => setDueDate(event.target.value)} />
              </label>
            </div>

            <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Notes
              <textarea
                className="mt-1.5 min-h-24 w-full rounded-xl border border-slate-200 bg-white p-3.5 text-[13px] outline-none transition focus:border-[#4A86F7] focus:ring-4 focus:ring-[#4A86F7]/10"
                value={notes}
                disabled={!draft}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Optional notes printed on the invoice"
              />
            </label>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Line items</p>
                {draft ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-[12px] font-bold text-[#4A86F7]"
                    onClick={() => setLines((current) => [...current, { description: "", quantity: "1", unit_dollars: "0.00" }])}
                  >
                    <Plus size={14} />
                    Add line
                  </button>
                ) : null}
              </div>
              <div className="overflow-hidden rounded-2xl border border-slate-100">
                <div className="hidden grid-cols-[1fr_88px_120px_40px] bg-slate-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:grid">
                  <span>Description</span>
                  <span>Qty</span>
                  <span>Unit (CAD)</span>
                  <span />
                </div>
                <div className="divide-y divide-slate-100">
                  {lines.map((line, index) => (
                    <div key={line.id || index} className="grid gap-2 p-3 sm:grid-cols-[1fr_88px_120px_40px]">
                      <input className={fieldClass} placeholder="Description" value={line.description} disabled={!draft} onChange={(event) => setLines((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, description: event.target.value } : row)))} />
                      <input className={fieldClass} placeholder="Qty" value={line.quantity} disabled={!draft} onChange={(event) => setLines((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, quantity: event.target.value } : row)))} />
                      <input className={fieldClass} placeholder="0.00" value={line.unit_dollars} disabled={!draft} onChange={(event) => setLines((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, unit_dollars: event.target.value } : row)))} />
                      {draft ? (
                        <button type="button" className="text-rose-500" onClick={() => setLines((current) => current.filter((_, rowIndex) => rowIndex !== index))}>
                          ×
                        </button>
                      ) : (
                        <span />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-4">
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Tax (CAD)
                <input className={`${fieldClass} mt-1.5 max-w-[180px]`} value={taxDollars} disabled={!draft} onChange={(event) => setTaxDollars(event.target.value)} />
              </label>
              {draft ? (
                <button type="button" disabled={saving || !customerId} onClick={() => void saveDraft()} className="h-11 rounded-xl bg-slate-900 px-5 text-[13px] font-bold text-white shadow-sm disabled:opacity-50">
                  {saving ? "Saving..." : "Save draft"}
                </button>
              ) : null}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_rgba(19,38,58,0.06)]">
            <p className="flex items-center gap-2 text-[12px] font-bold text-slate-800">
              <Receipt size={16} className="text-[#4A86F7]" />
              Totals
            </p>
            <dl className="mt-4 space-y-2 text-[13px] text-slate-600">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatCad(subtotal)}</dd></div>
              <div className="flex justify-between"><dt>Tax</dt><dd>{formatCad(tax)}</dd></div>
              <div className="flex justify-between border-t border-slate-100 pt-2 text-[15px] font-bold text-slate-900">
                <dt>Total</dt>
                <dd>{formatCad(total)}</dd>
              </div>
              <div className="flex justify-between"><dt>Paid</dt><dd className="text-emerald-700">{formatCad(invoice?.amount_paid_cents)}</dd></div>
              <div className="flex justify-between font-semibold text-slate-900"><dt>Balance</dt><dd>{formatCad(invoice?.balance_cents)}</dd></div>
            </dl>
          </div>

          <div className="space-y-3 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_rgba(19,38,58,0.06)]">
            <p className="text-[12px] font-bold text-slate-800">Delivery</p>
            {draft ? (
              <button type="button" disabled={saving || !customerId} onClick={() => void runAction("issue")} className="h-11 w-full rounded-xl bg-[#4A86F7] text-[13px] font-bold text-white shadow-sm disabled:opacity-50">
                Issue invoice
              </button>
            ) : (
              <p className="rounded-xl bg-blue-50 px-3 py-2 text-[12px] text-blue-800">
                Already issued{invoice?.invoice_number ? ` as ${invoice.invoice_number}` : ""}. Send, preview, or collect payment.
              </p>
            )}
            <input className={fieldClass} placeholder="Live customer email" value={sendEmail} onChange={(event) => setSendEmail(event.target.value)} />
            <button type="button" disabled={saving || !issued} onClick={() => void runAction("send")} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-700 disabled:opacity-50">
              <Mail size={15} />
              Send invoice
            </button>
            <button type="button" disabled={saving || !issued} onClick={() => void runAction("remind")} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-700 disabled:opacity-50">
              <Bell size={15} />
              Send reminder
            </button>
            {invoice?.id ? (
              <button type="button" disabled={saving} onClick={() => void openPdfSnapshot()} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-700 disabled:opacity-50">
                <FileText size={15} />
                Preview / PDF snapshot
              </button>
            ) : null}

            {isAdmin && issued ? (
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <p className="text-[12px] font-bold text-slate-800">Cancel bill</p>
                <p className="text-[12px] leading-5 text-slate-500">
                  Void cancels this issued invoice. The unique number and audit trail stay. Data-entry cannot void.
                </p>
                <input className={fieldClass} placeholder="Void reason (required)" value={voidReason} onChange={(event) => setVoidReason(event.target.value)} />
                <label className="flex items-center gap-2 text-[12px] text-slate-600">
                  <input type="checkbox" checked={confirmVoid} onChange={(event) => setConfirmVoid(event.target.checked)} />
                  I understand this cannot be undone
                </label>
                <button type="button" disabled={saving || !voidReason.trim() || !confirmVoid} onClick={() => void runAction("void")} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-rose-600 text-[13px] font-bold text-white disabled:opacity-50">
                  <Ban size={15} />
                  Void invoice
                </button>
              </div>
            ) : !isAdmin ? (
              <p className="text-[12px] text-slate-500">Voiding is admin-only.</p>
            ) : null}
          </div>

          {issued ? (
            <form onSubmit={recordPayment} className="space-y-3 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_rgba(19,38,58,0.06)]">
              <p className="flex items-center gap-2 text-[12px] font-bold text-slate-800">
                <Wallet size={16} className="text-emerald-600" />
                Record payment
              </p>
              <p className="text-[12px] leading-5 text-slate-500">
                Enter what the customer paid. A smaller amount is a partial payment. After a reverse, record a new payment for the correct amount.
              </p>
              <input className={fieldClass} placeholder="Amount e.g. 150.00" value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} />
              <select className={fieldClass} value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
                <option value="e_transfer">E-transfer</option>
                <option value="card">Card</option>
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
              </select>
              <button type="submit" disabled={saving} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-[13px] font-bold text-white">
                <Send size={15} />
                Save payment
              </button>
            </form>
          ) : null}

          {invoice?.crm_payments?.length ? (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 text-[13px] shadow-[0_18px_50px_rgba(19,38,58,0.06)]">
              <p className="mb-1 font-bold text-slate-800">Payments</p>
              <p className="mb-3 text-[12px] leading-5 text-slate-500">
                Reverse is admin-only. It does not delete the payment. It voids it, restores the invoice balance, and you then record the correct payment.
              </p>
              {invoice.crm_payments.map((payment) => (
                <div key={payment.id} className="mb-2 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                  <span>
                    {formatCad(payment.amount_cents)}{" "}
                    <span className="text-slate-500">{payment.is_void ? "(reversed)" : payment.method}</span>
                  </span>
                  {isAdmin && !payment.is_void ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-[12px] font-bold text-rose-600"
                      onClick={() => {
                        setReverseTarget({ id: payment.id, amount_cents: payment.amount_cents });
                        setReverseReason("");
                      }}
                    >
                      <RotateCcw size={13} />
                      Reverse
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          {invoice?.crm_invoice_emails?.length ? (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 text-[12px] text-slate-500 shadow-[0_18px_50px_rgba(19,38,58,0.06)]">
              <p className="mb-2 font-bold text-slate-700">Email log</p>
              {invoice.crm_invoice_emails.map((email) => (
                <p key={email.id}>
                  {email.status} → {email.to_email}
                  {email.error ? ` (${email.error})` : ""}
                </p>
              ))}
            </div>
          ) : null}

          {invoice?.crm_invoice_events?.length ? (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 text-[12px] text-slate-500 shadow-[0_18px_50px_rgba(19,38,58,0.06)]">
              <p className="mb-2 font-bold text-slate-700">History</p>
              {invoice.crm_invoice_events.map((event) => (
                <p key={event.id}>
                  {event.event_type} · {new Date(event.created_at).toLocaleString()}
                </p>
              ))}
            </div>
          ) : null}
        </aside>
      </div>

      {notice ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4" onClick={() => setNotice(null)}>
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${notice.kind === "success" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                {notice.kind === "success" ? <CheckCircle2 size={22} /> : <ShieldAlert size={22} />}
              </div>
              <button type="button" className="text-slate-400" onClick={() => setNotice(null)}>
                <X size={18} />
              </button>
            </div>
            <h2 className="mt-4 text-slate-900">{notice.title}</h2>
            <p className="mt-2 text-slate-500">{notice.detail}</p>
            <button type="button" onClick={() => setNotice(null)} className="mt-5 h-11 w-full rounded-xl bg-slate-900 text-[13px] font-bold text-white">
              OK
            </button>
          </div>
        </div>
      ) : null}

      {reverseTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4" onClick={() => setReverseTarget(null)}>
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <p className="text-[12px] font-bold uppercase tracking-wide text-rose-600">Reverse payment</p>
            <h2 className="mt-2 text-slate-900">Undo {formatCad(reverseTarget.amount_cents)}?</h2>
            <p className="mt-2 text-[13px] leading-6 text-slate-500">
              Reverse does not delete the payment. It marks it void, writes a reversal in the audit log, and adds the amount back to the invoice balance. Then record a new payment for the correct amount (or leave the open balance).
            </p>
            <input
              className={`${fieldClass} mt-4`}
              placeholder="Reason (required)"
              value={reverseReason}
              onChange={(event) => setReverseReason(event.target.value)}
            />
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" className="h-11 rounded-xl border border-slate-200 text-[13px] font-bold" onClick={() => setReverseTarget(null)}>
                Cancel
              </button>
              <button type="button" disabled={saving || !reverseReason.trim()} className="h-11 rounded-xl bg-rose-600 text-[13px] font-bold text-white disabled:opacity-50" onClick={() => void confirmReversePayment()}>
                Reverse payment
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
