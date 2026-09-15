"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Ban,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  Mail,
  Plus,
  Receipt,
  RotateCcw,
  Send,
  ShieldAlert,
  StickyNote,
  Wallet,
  X,
} from "lucide-react";
import { isDeliverableEmail } from "@/lib/crm/emailAddress";
import { calculateInvoiceTotals, centsToDollars, dollarsToCents, formatCad, type InvoiceDiscountType } from "@/lib/crm/services/invoiceCalc";
import type { CrmCustomer } from "./CrmCustomersClient";

type Line = {
  id?: string;
  description: string;
  details: string;
  quantity: string;
  unit_label: string;
  unit_dollars: string;
  taxable: boolean;
};

type Invoice = {
  id: string;
  invoice_number: string | null;
  status: string;
  customer_id: string;
  billing_address_id: string | null;
  service_address_id: string | null;
  invoice_date: string | null;
  service_date: string | null;
  due_date: string | null;
  notes: string | null;
  discount_type: InvoiceDiscountType;
  discount_value: number;
  discount_cents: number;
  discount_reason: string | null;
  tax_enabled: boolean;
  tax_rate_bps: number;
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
    details?: string | null;
    quantity: number;
    unit_label?: string | null;
    unit_cents: number;
    taxable?: boolean;
  }>;
  crm_payments?: Array<{
    id: string;
    amount_cents: number;
    method: string | null;
    is_void: boolean;
    is_deposit?: boolean;
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
  crm_invoice_internal_notes?: Array<{
    id: string;
    note: string;
    created_at: string;
    edited_at?: string | null;
  }>;
};

type CrmSettings = {
  default_due_days?: number;
  default_customer_note?: string | null;
  default_tax_enabled?: boolean;
  default_tax_bps?: number;
  tax_number?: string | null;
};

type Notice = {
  kind: "success" | "error";
  title: string;
  detail: string;
};

const fieldClass =
  "min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-[16px] font-medium text-slate-700 outline-none transition focus:border-[#4A86F7] focus:ring-4 focus:ring-[#4A86F7]/10 sm:text-[13px]";

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

function today() {
  return new Date().toISOString().slice(0, 10);
}

function parseDiscountReason(value?: string | null) {
  const raw = String(value || "");
  if (raw.startsWith("public:")) return { text: raw.slice(7), show: true };
  if (raw.startsWith("internal:")) return { text: raw.slice(9), show: false };
  return { text: raw, show: false };
}

const blankLine = (): Line => ({
  description: "",
  details: "",
  quantity: "1",
  unit_label: "service",
  unit_dollars: "0.00",
  taxable: true,
});

export default function CrmInvoiceEditor({
  invoiceId,
  initialCustomerId,
  isAdmin,
}: {
  invoiceId?: string;
  initialCustomerId?: string;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [customers, setCustomers] = useState<CrmCustomer[]>([]);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customerId, setCustomerId] = useState("");
  const [billingAddressId, setBillingAddressId] = useState("");
  const [serviceAddressId, setServiceAddressId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(today());
  const [serviceDate, setServiceDate] = useState("");
  const [dueDate, setDueDate] = useState(today());
  const [notes, setNotes] = useState("");
  const [discountType, setDiscountType] = useState<InvoiceDiscountType>("none");
  const [discountValue, setDiscountValue] = useState("0");
  const [discountReason, setDiscountReason] = useState("");
  const [showDiscountReason, setShowDiscountReason] = useState(false);
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [taxRatePercent, setTaxRatePercent] = useState("5");
  const [lines, setLines] = useState<Line[]>([blankLine()]);
  const [settings, setSettings] = useState<CrmSettings>({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [saving, setSaving] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("e_transfer");
  const [isDeposit, setIsDeposit] = useState(false);
  const [voidReason, setVoidReason] = useState("");
  const [confirmVoid, setConfirmVoid] = useState(false);
  const [sendEmail, setSendEmail] = useState("");
  const [reverseTarget, setReverseTarget] = useState<{ id: string; amount_cents: number } | null>(null);
  const [reverseReason, setReverseReason] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [saveState, setSaveState] = useState<"saved" | "unsaved" | "saving">("saved");
  const [duplicateInvoices, setDuplicateInvoices] = useState<Array<{ id: string; invoice_number: string | null; invoice_date: string; total_cents: number }>>([]);
  const lastSavedFingerprint = useRef("");

  const draft = !invoice || invoice.status === "draft";
  const issued = Boolean(invoice && invoice.status !== "draft" && !invoice.is_void);
  const selectedCustomer = customers.find((row) => row.id === customerId);

  const updateLine = (index: number, patch: Partial<Line>) => {
    setLines((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)));
  };

  const moveLine = (index: number, direction: -1 | 1) => {
    setLines((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const chooseCustomer = (nextId: string, source = customers) => {
    const nextCustomer = source.find((row) => row.id === nextId);
    const addresses = nextCustomer?.crm_customer_addresses || [];
    setCustomerId(nextId);
    setBillingAddressId(addresses.find((address) => address.is_billing)?.id || "");
    setServiceAddressId(addresses.find((address) => address.is_service)?.id || "");
    const nextEmail = nextCustomer?.email || "";
    setSendEmail(isDeliverableEmail(nextEmail) ? nextEmail : "");
  };

  const showNotice = (next: Notice) => {
    setNotice(next);
  };

  const load = async (id?: string) => {
    try {
      const [customersRes, settingsRes, invoiceRes] = await Promise.all([
        fetch("/api/admin/crm/customers/", { cache: "no-store" }),
        fetch("/api/admin/crm/settings/", { cache: "no-store" }),
        id ? fetch(`/api/admin/crm/invoices/?id=${id}`, { cache: "no-store" }) : Promise.resolve(null),
      ]);
      const customersPayload = await readApi(customersRes);
      if (!customersRes.ok) {
        setError(String(customersPayload.error || "Failed to load customers"));
        return;
      }
      const loadedCustomers = (customersPayload.customers as CrmCustomer[]) || [];
      setCustomers(loadedCustomers);
      if (!id && initialCustomerId && loadedCustomers.some((row) => row.id === initialCustomerId)) {
        chooseCustomer(initialCustomerId, loadedCustomers);
      }
      const settingsPayload = await readApi(settingsRes);
      if (settingsRes.ok) {
        const nextSettings = (settingsPayload.settings || {}) as CrmSettings;
        setSettings(nextSettings);
        if (!id) {
          const nextInvoiceDate = today();
          const due = new Date(`${nextInvoiceDate}T12:00:00Z`);
          due.setUTCDate(due.getUTCDate() + Number(nextSettings.default_due_days || 0));
          setInvoiceDate(nextInvoiceDate);
          setDueDate(due.toISOString().slice(0, 10));
          setNotes(nextSettings.default_customer_note || "");
          setTaxEnabled(nextSettings.default_tax_enabled !== false);
          setTaxRatePercent(String(Number(nextSettings.default_tax_bps || 0) / 100));
        }
      }

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
        setBillingAddressId(current.billing_address_id || "");
        setServiceAddressId(current.service_address_id || "");
        setInvoiceDate(current.invoice_date || today());
        setServiceDate(current.service_date || "");
        setDueDate(current.due_date || "");
        setNotes(current.notes || "");
        setDiscountType(current.discount_type || "none");
        setDiscountValue(String(current.discount_value || 0));
        const parsedReason = parseDiscountReason(current.discount_reason);
        setDiscountReason(parsedReason.text);
        setShowDiscountReason(parsedReason.show);
        setTaxEnabled(current.tax_enabled !== false);
        setTaxRatePercent(String(Number(current.tax_rate_bps || 0) / 100));
        const customerEmail = current.crm_customers?.email || "";
        setSendEmail(isDeliverableEmail(customerEmail) ? customerEmail : sendEmail);
        if (!paymentAmount && current.balance_cents > 0) {
          setPaymentAmount(centsToDollars(current.balance_cents));
        }
        const invoiceItems = current.crm_invoice_items || [];
        setLines(
          invoiceItems.length
            ? invoiceItems.map((item) => ({
                id: item.id,
                description: item.description,
                details: item.details || "",
                quantity: String(item.quantity),
                unit_label: item.unit_label || "service",
                unit_dollars: centsToDollars(item.unit_cents),
                taxable: item.taxable !== false,
              }))
            : [blankLine()],
        );
      }
      setError("");
      setSaveState("saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load invoice");
    }
  };

  useEffect(() => {
    void load(invoiceId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId, initialCustomerId]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 4200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const saveDraft = async (options?: { silent?: boolean }) => {
    setSaving(true);
    setSaveState("saving");
    setError("");
    try {
      const payload = {
        customer_id: customerId,
        billing_address_id: billingAddressId || null,
        service_address_id: serviceAddressId || null,
        invoice_date: invoiceDate,
        service_date: serviceDate || null,
        due_date: dueDate || null,
        notes,
        discount_type: discountType,
        discount_value: Number(discountValue || 0),
        discount_reason: discountReason,
        show_discount_reason: showDiscountReason,
        tax_enabled: taxEnabled,
        tax_rate_bps: Math.max(0, Math.round(Number(taxRatePercent || 0) * 100)),
        items: lines.map((line) => ({
          id: line.id,
          description: line.description,
          details: line.details,
          quantity: Number(line.quantity || 0),
          unit_label: line.unit_label,
          unit_dollars: line.unit_dollars,
          taxable: line.taxable,
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
      lastSavedFingerprint.current = JSON.stringify(payload);
      setSaveState("saved");
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
      setSaveState("unsaved");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const runAction = async (action: "issue" | "send" | "remind" | "void", confirmDuplicate = false) => {
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

      const payload: Record<string, string | boolean> = { id, action };
      if (action === "send" || action === "remind") payload.to_email = sendEmail.trim();
      if (action === "void") payload.void_reason = voidReason.trim();
      if (action === "issue" && confirmDuplicate) payload.confirm_duplicate = true;

      const response = await fetch("/api/admin/crm/invoices/", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await readApi(response);
      if (response.status === 409 && body.code === "POSSIBLE_DUPLICATE_INVOICE") {
        setDuplicateInvoices((body.duplicates as typeof duplicateInvoices) || []);
        return;
      }
      if (!response.ok || body.ok === false) {
        setError(String(body.error || `${action} failed`));
        await load(id);
        return;
      }
      if (action === "issue") {
        setDuplicateInvoices([]);
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
    const preview = window.open("", "_blank");
    if (!preview) {
      setError("Allow pop-ups to open the invoice PDF preview, then click Download PDF.");
      return;
    }
    const id = invoice?.id || (await saveDraft({ silent: true }));
    if (!id) {
      preview.close();
      setError("Complete the customer and saveable invoice details before previewing.");
      return;
    }
    preview.location.href = `/admin-dashboard/crm/invoices/${id}/preview`;
    showNotice({
      kind: "success",
      title: "PDF view generated",
      detail: "Click Download PDF in the new tab. The file saves to your device — it does not open the print dialog.",
    });
  };

  const addInternalNote = async (event: FormEvent) => {
    event.preventDefault();
    if (!invoice?.id || !internalNote.trim()) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/admin/crm/invoices/", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: invoice.id, action: "add_internal_note", note: internalNote }),
      });
      const body = await readApi(response);
      if (!response.ok) throw new Error(String(body.error || "Unable to save internal note"));
      setInternalNote("");
      await load(invoice.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save internal note");
    } finally {
      setSaving(false);
    }
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
          is_deposit: isDeposit,
        }),
      });
      const body = await readApi(response);
      if (!response.ok) {
        setError(String(body.error || "Payment failed"));
        return;
      }
      setPaymentAmount("");
      setIsDeposit(false);
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
      quantity: Number(line.quantity || 0),
      unit_cents: dollarsToCents(line.unit_dollars) || 0,
      taxable: line.taxable,
    }));
    return calculateInvoiceTotals({
      items,
      discountType,
      discountValue: Number(discountValue || 0),
      taxEnabled,
      taxRateBps: Math.max(0, Math.round(Number(taxRatePercent || 0) * 100)),
    });
  }, [discountType, discountValue, lines, taxEnabled, taxRatePercent]);

  const subtotal = draft ? draftTotals.subtotal_cents : invoice?.subtotal_cents;
  const discount = draft ? draftTotals.discount_cents : invoice?.discount_cents;
  const tax = draft ? draftTotals.tax_cents : invoice?.tax_cents;
  const total = draft ? draftTotals.total_cents : invoice?.total_cents;

  const draftFingerprint = useMemo(
    () =>
      JSON.stringify({
        customer_id: customerId,
        billing_address_id: billingAddressId || null,
        service_address_id: serviceAddressId || null,
        invoice_date: invoiceDate,
        service_date: serviceDate || null,
        due_date: dueDate || null,
        notes,
        discount_type: discountType,
        discount_value: Number(discountValue || 0),
        discount_reason: discountReason,
        show_discount_reason: showDiscountReason,
        tax_enabled: taxEnabled,
        tax_rate_bps: Math.max(0, Math.round(Number(taxRatePercent || 0) * 100)),
        items: lines.map((line) => ({
          id: line.id,
          description: line.description,
          details: line.details,
          quantity: Number(line.quantity || 1),
          unit_label: line.unit_label,
          unit_dollars: line.unit_dollars,
          taxable: line.taxable,
        })),
      }),
    [billingAddressId, customerId, discountReason, discountType, discountValue, dueDate, invoiceDate, lines, notes, serviceAddressId, serviceDate, showDiscountReason, taxEnabled, taxRatePercent],
  );

  useEffect(() => {
    if (!draft || draftFingerprint === lastSavedFingerprint.current) return;
    setSaveState("unsaved");
    if (!invoice?.id || !customerId) return;
    const timer = window.setTimeout(() => {
      void saveDraft({ silent: true });
    }, 2500);
    return () => window.clearTimeout(timer);
    // saveDraft intentionally follows the latest controlled form state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, draft, draftFingerprint, invoice?.id]);

  return (
    <div className="relative min-h-full overflow-x-hidden bg-[#F4F7FB] p-4 pb-28 sm:p-6 sm:pb-28 xl:pb-6">
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
          <div className="flex flex-col gap-3 border-b border-slate-100 bg-[linear-gradient(135deg,#13263A_0%,#1E3A5F_55%,#4A86F7_140%)] px-4 py-4 text-white sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">Camz Cleaning</p>
              <p className="mt-1 break-words text-lg font-semibold">{invoice?.invoice_number || "Draft invoice"}</p>
            </div>
            <div className="min-w-0 text-[12px] text-white/80 sm:text-right">
              <p className="break-words">{selectedCustomer?.display_name || "No customer yet"}</p>
              <p>{dueDate ? `Due ${dueDate}` : "No due date"}</p>
            </div>
          </div>

          <div className="space-y-5 p-4 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Customer
                <select
                  className={`${fieldClass} mt-1.5`}
                  value={customerId}
                  disabled={!draft}
                  onChange={(event) => chooseCustomer(event.target.value)}
                  required
                >
                  <option value="">Select customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.customer_code ? `#${customer.customer_code} · ` : ""}
                      {customer.display_name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Invoice date
                <input className={`${fieldClass} mt-1.5`} type="date" value={invoiceDate} disabled={!draft} onChange={(event) => setInvoiceDate(event.target.value)} />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Service date
                <input className={`${fieldClass} mt-1.5`} type="date" value={serviceDate} disabled={!draft} onChange={(event) => setServiceDate(event.target.value)} />
              </label>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Due date
                <input className={`${fieldClass} mt-1.5`} type="date" min={invoiceDate} value={dueDate} disabled={!draft} onChange={(event) => setDueDate(event.target.value)} />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Service address
                <select className={`${fieldClass} mt-1.5`} value={serviceAddressId} disabled={!draft || !customerId} onChange={(event) => setServiceAddressId(event.target.value)}>
                  <option value="">No service address</option>
                  {(selectedCustomer?.crm_customer_addresses || []).filter((address) => address.is_service).map((address) => (
                    <option key={address.id} value={address.id}>
                      {[address.label, address.line1, address.city, address.postal_code].filter(Boolean).join(" · ")}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Billing address
                <select className={`${fieldClass} mt-1.5`} value={billingAddressId} disabled={!draft || !customerId} onChange={(event) => setBillingAddressId(event.target.value)}>
                  <option value="">No billing address</option>
                  {(selectedCustomer?.crm_customer_addresses || []).map((address) => (
                    <option key={address.id} value={address.id}>
                      {address.is_billing ? "Default · " : ""}{[address.label, address.line1, address.city, address.postal_code].filter(Boolean).join(" · ")}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Customer-visible notes
              <textarea
                className="mt-1.5 min-h-24 w-full rounded-xl border border-slate-200 bg-white p-3.5 text-[13px] outline-none transition focus:border-[#4A86F7] focus:ring-4 focus:ring-[#4A86F7]/10"
                value={notes}
                disabled={!draft}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Optional notes shown on the PDF and email"
              />
              <span className="mt-1 block normal-case tracking-normal text-slate-400">This text is visible to the customer.</span>
            </label>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Line items</p>
                {draft ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-[12px] font-bold text-[#4A86F7]"
                    onClick={() => setLines((current) => [...current, blankLine()])}
                  >
                    <Plus size={14} />
                    Add line
                  </button>
                ) : null}
              </div>
              <div className="space-y-3">
                {lines.map((line, index) => {
                  const quantity = Number(line.quantity || 0);
                  const unitCents = dollarsToCents(line.unit_dollars) || 0;
                  return (
                    <div key={line.id || index} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3 sm:p-4">
                      <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_100px_150px_130px]">
                        <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Service description
                          <input
                            className={`${fieldClass} mt-1.5`}
                            placeholder="e.g. Standard home cleaning"
                            value={line.description}
                            disabled={!draft}
                            onChange={(event) => updateLine(index, { description: event.target.value })}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" && draft) {
                                event.preventDefault();
                                setLines((current) => [...current, blankLine()]);
                              }
                            }}
                          />
                        </label>
                        <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Quantity
                          <input className={`${fieldClass} mt-1.5`} type="number" min="0.001" step="0.001" inputMode="decimal" value={line.quantity} disabled={!draft} onChange={(event) => updateLine(index, { quantity: event.target.value })} />
                        </label>
                        <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Unit
                          <select className={`${fieldClass} mt-1.5`} value={line.unit_label} disabled={!draft} onChange={(event) => updateLine(index, { unit_label: event.target.value })}>
                            <option value="each">Each</option>
                            <option value="hour">Hour</option>
                            <option value="manpower hour">Manpower hour</option>
                            <option value="service">Service</option>
                            <option value="flat">Flat</option>
                          </select>
                        </label>
                        <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Rate (CAD)
                          <input className={`${fieldClass} mt-1.5`} inputMode="decimal" placeholder="0.00" value={line.unit_dollars} disabled={!draft} onChange={(event) => updateLine(index, { unit_dollars: event.target.value })} />
                        </label>
                      </div>
                      <label className="mt-3 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Optional details
                        <textarea className="mt-1.5 min-h-16 w-full rounded-xl border border-slate-200 bg-white p-3 text-[13px] outline-none focus:border-[#4A86F7] focus:ring-4 focus:ring-[#4A86F7]/10" placeholder="Extra scope shown beneath this line" value={line.details} disabled={!draft} onChange={(event) => updateLine(index, { details: event.target.value })} />
                      </label>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <label className="inline-flex items-center gap-2 text-[12px] font-semibold text-slate-600">
                          <input type="checkbox" checked={line.taxable} disabled={!draft} onChange={(event) => updateLine(index, { taxable: event.target.checked })} />
                          Taxable
                        </label>
                        <div className="flex items-center gap-1.5">
                          <span className="mr-2 text-[13px] font-bold text-slate-800">{formatCad(Math.round(quantity * unitCents))}</span>
                          {draft ? (
                            <>
                              <button type="button" aria-label="Move line up" disabled={index === 0} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 disabled:opacity-30" onClick={() => moveLine(index, -1)}><ChevronUp size={15} /></button>
                              <button type="button" aria-label="Move line down" disabled={index === lines.length - 1} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 disabled:opacity-30" onClick={() => moveLine(index, 1)}><ChevronDown size={15} /></button>
                              <button type="button" aria-label="Copy line" className="rounded-lg border border-slate-200 bg-white p-2 text-[#4A86F7]" onClick={() => setLines((current) => [...current.slice(0, index + 1), { ...line, id: undefined }, ...current.slice(index + 1)])}><Copy size={15} /></button>
                              <button type="button" aria-label="Remove line" disabled={lines.length === 1} className="rounded-lg border border-rose-200 bg-white p-2 text-rose-500 disabled:opacity-30" onClick={() => setLines((current) => current.filter((_, rowIndex) => rowIndex !== index))}><X size={15} /></button>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Discount and GST</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Discount type
                  <select className={`${fieldClass} mt-1.5`} value={discountType} disabled={!draft} onChange={(event) => setDiscountType(event.target.value as InvoiceDiscountType)}>
                    <option value="none">No discount</option>
                    <option value="fixed">Fixed amount</option>
                    <option value="percent">Percentage</option>
                  </select>
                </label>
                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Discount value
                  <input className={`${fieldClass} mt-1.5`} type="number" min="0" step={discountType === "percent" ? "0.01" : "0.01"} value={discountValue} disabled={!draft || discountType === "none"} onChange={(event) => setDiscountValue(event.target.value)} />
                </label>
                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  GST rate (%)
                  <input className={`${fieldClass} mt-1.5`} type="number" min="0" step="0.01" value={taxRatePercent} disabled={!draft || !taxEnabled} onChange={(event) => setTaxRatePercent(event.target.value)} />
                </label>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Discount reason
                  <input className={`${fieldClass} mt-1.5`} placeholder="Optional reason" value={discountReason} disabled={!draft || discountType === "none"} onChange={(event) => setDiscountReason(event.target.value)} />
                </label>
                <div className="space-y-2 pb-1 text-[12px] text-slate-600">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={showDiscountReason} disabled={!draft || discountType === "none"} onChange={(event) => setShowDiscountReason(event.target.checked)} /> Show reason on invoice</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={taxEnabled} disabled={!draft} onChange={(event) => setTaxEnabled(event.target.checked)} /> Apply GST</label>
                </div>
              </div>
              {taxEnabled && Number(taxRatePercent || 0) > 0 && !settings.tax_number?.trim() ? (
                <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-[12px] text-amber-800">Add the company GST number in CRM Settings before issuing this invoice.</p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-[12px] font-semibold text-slate-500">
                {saveState === "saving" ? "Saving…" : saveState === "unsaved" ? "Unsaved changes" : "All changes saved"}
              </p>
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
              {Number(discount || 0) > 0 ? <div className="flex justify-between text-emerald-700"><dt>Discount</dt><dd>−{formatCad(discount)}</dd></div> : null}
              <div className="flex justify-between"><dt>GST{taxEnabled ? ` (${Number(taxRatePercent || 0)}%)` : ""}</dt><dd>{formatCad(tax)}</dd></div>
              <div className="flex justify-between border-t border-slate-100 pt-2 text-[15px] font-bold text-slate-900">
                <dt>Total</dt>
                <dd>{formatCad(total)}</dd>
              </div>
              <div className="flex justify-between"><dt>Paid</dt><dd className="text-emerald-700">{formatCad(draft ? 0 : invoice?.amount_paid_cents)}</dd></div>
              <div className="flex justify-between font-semibold text-slate-900"><dt>Balance</dt><dd>{formatCad(draft ? total : invoice?.balance_cents)}</dd></div>
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
            <button type="button" disabled={saving || !customerId} onClick={() => void openPdfSnapshot()} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-700 disabled:opacity-50">
              <Eye size={15} />
              Preview / PDF snapshot
            </button>

            {isAdmin && issued ? (
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <p className="text-[12px] font-bold text-slate-800">Cancel bill</p>
                <p className="text-[12px] leading-5 text-slate-500">
                  Void cancels this issued invoice. The unique number and audit trail stay.
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

          <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-5 shadow-[0_18px_50px_rgba(19,38,58,0.04)]">
            <p className="flex items-center gap-2 text-[12px] font-bold text-amber-900">
              <StickyNote size={16} />
              INTERNAL — customer cannot see this
            </p>
            <p className="mt-1 text-[12px] leading-5 text-amber-800">These notes never appear in the PDF or invoice email.</p>
            {invoice?.id ? (
              <form className="mt-3 space-y-2" onSubmit={addInternalNote}>
                <textarea className="min-h-20 w-full rounded-xl border border-amber-200 bg-white p-3 text-[13px] outline-none focus:border-amber-400" placeholder="Private staff note" value={internalNote} onChange={(event) => setInternalNote(event.target.value)} />
                <button type="submit" disabled={saving || !internalNote.trim()} className="h-10 w-full rounded-xl bg-amber-900 text-[12px] font-bold text-white disabled:opacity-50">Add internal note</button>
              </form>
            ) : (
              <p className="mt-3 text-[12px] text-amber-800">Save the draft once before adding internal notes.</p>
            )}
            {invoice?.crm_invoice_internal_notes?.length ? (
              <div className="mt-3 space-y-2 border-t border-amber-200 pt-3">
                {invoice.crm_invoice_internal_notes.map((note) => (
                  <div key={note.id} className="rounded-xl bg-white/90 px-3 py-2 text-[12px] text-slate-700">
                    <p className="whitespace-pre-wrap break-words">{note.note}</p>
                    <p className="mt-1 text-[10px] text-slate-400">{new Date(note.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
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
              <label className="flex items-center gap-2 text-[13px] text-slate-600">
                <input type="checkbox" checked={isDeposit} onChange={(event) => setIsDeposit(event.target.checked)} />
                This is a deposit / advance
              </label>
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
                <div key={payment.id} className="mb-2 flex flex-col gap-2 rounded-xl bg-slate-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="break-words">
                    {formatCad(payment.amount_cents)}{" "}
                    <span className="text-slate-500">
                      {payment.is_void ? "(reversed)" : payment.method}
                      {payment.is_deposit ? " · deposit" : ""}
                    </span>
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

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-12px_35px_rgba(15,23,42,0.12)] backdrop-blur xl:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Invoice total</p>
            <p className="truncate text-lg font-extrabold text-slate-900">{formatCad(total)}</p>
          </div>
          {draft ? (
            <button type="button" disabled={saving || !customerId} onClick={() => void saveDraft()} className="h-11 rounded-xl border border-slate-200 px-4 text-[12px] font-bold text-slate-700 disabled:opacity-50">Save</button>
          ) : null}
          <button type="button" disabled={saving || !customerId} onClick={() => void openPdfSnapshot()} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#4A86F7] px-4 text-[12px] font-bold text-white disabled:opacity-50"><Eye size={15} /> Preview</button>
        </div>
      </div>

      {duplicateInvoices.length ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4" onClick={() => setDuplicateInvoices([])}>
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-600">Possible duplicate</p>
            <h2 className="mt-2 text-slate-900">A similar invoice already exists</h2>
            <p className="mt-2 text-[13px] leading-6 text-slate-500">Review these invoices before creating another numbered bill for the same customer, address, date and similar total.</p>
            <div className="mt-4 max-h-52 space-y-2 overflow-y-auto">
              {duplicateInvoices.map((row) => (
                <div key={row.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-[12px]">
                  <span className="font-bold text-slate-800">{row.invoice_number || "Draft"}</span>
                  <span className="text-slate-500">{row.invoice_date} · {formatCad(row.total_cents)}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button type="button" className="h-11 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-700" onClick={() => setDuplicateInvoices([])}>Go back</button>
              <button type="button" disabled={saving} className="h-11 rounded-xl bg-amber-600 text-[13px] font-bold text-white disabled:opacity-50" onClick={() => void runAction("issue", true)}>Issue anyway</button>
            </div>
          </div>
        </div>
      ) : null}

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
