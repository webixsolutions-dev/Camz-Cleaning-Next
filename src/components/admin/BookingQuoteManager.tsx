"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  Plus,
  Save,
  Send,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";

type QuoteItem = {
  id: string;
  label: string;
  quantity: number;
  unitPrice: number;
  amount?: number;
};

type BookingForQuote = {
  id: string;
  status: string | null;
  service_name?: string | null;
  total_price?: string | number | null;
  tax_rate?: string | number | null;
  service_data?: Record<string, any> | null;
};

type UpdatedBooking = Partial<BookingForQuote> & {
  cleaner_id?: string | null;
  final_price?: string | number | null;
  price?: string | number | null;
};

const money = (value: number) => `CAD $${value.toFixed(2)}`;

const normalizeTaxRate = (value: unknown) => {
  const raw = Number(value);
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  return raw > 1 ? raw / 100 : raw;
};

function seedQuoteItems(booking: BookingForQuote): QuoteItem[] {
  const serviceData = booking.service_data || {};
  const existing = serviceData.adminQuote?.items;
  if (Array.isArray(existing) && existing.length) {
    return existing.map((item: any, index: number) => ({
      id: String(item.id || `quote-${index + 1}`),
      label: String(item.label || "Service"),
      quantity: Math.max(1, Math.round(Number(item.quantity) || 1)),
      unitPrice: Math.max(0, Number(item.unitPrice) || 0),
    }));
  }

  const pricing = serviceData.pricingBreakdown;
  if (Array.isArray(pricing) && pricing.length) {
    return pricing.map((item: any, index: number) => ({
      id: String(item.key || `pricing-${index + 1}`),
      label: String(item.label || "Service"),
      quantity: Math.max(1, Math.round(Number(item.quantity) || 1)),
      unitPrice: Math.max(
        0,
        Number(item.unitPrice) ||
          (Number(item.amount) || 0) / Math.max(1, Number(item.quantity) || 1),
      ),
    }));
  }

  const total = Number(booking.total_price);
  return total > 0
    ? [
        {
          id: "base-service",
          label: booking.service_name || "Cleaning service",
          quantity: 1,
          unitPrice: total / (1 + normalizeTaxRate(booking.tax_rate)),
        },
      ]
    : [];
}

export default function BookingQuoteManager({
  booking,
  onUpdated,
}: {
  booking: BookingForQuote;
  onUpdated?: (booking: UpdatedBooking) => void;
}) {
  const [items, setItems] = useState<QuoteItem[]>(() => seedQuoteItems(booking));
  const [quoteNote, setQuoteNote] = useState(
    String(booking.service_data?.adminQuote?.note || ""),
  );
  const [adminNote, setAdminNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setItems(seedQuoteItems(booking));
    setQuoteNote(String(booking.service_data?.adminQuote?.note || ""));
  }, [booking.id, booking.service_data, booking.total_price, booking.tax_rate]);

  const taxRate = normalizeTaxRate(booking.tax_rate);
  const totals = useMemo(() => {
    const subtotal =
      Math.round(
        items.reduce(
          (sum, item) =>
            sum +
            Math.max(1, Math.round(Number(item.quantity) || 1)) *
              Math.max(0, Number(item.unitPrice) || 0),
          0,
        ) * 100,
      ) / 100;
    const tax = Math.round(subtotal * taxRate * 100) / 100;
    return {
      subtotal,
      tax,
      total: Math.round((subtotal + tax) * 100) / 100,
    };
  }, [items, taxRate]);

  const updateItem = (id: string, patch: Partial<QuoteItem>) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  const addItem = () => {
    setItems((current) => [
      ...current,
      {
        id: `admin-${Date.now()}`,
        label: "Additional service",
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const runAction = async (
    action:
      | "save_quote"
      | "send_quote"
      | "request_photos"
      | "approve"
      | "reject"
      | "confirm_booking"
      | "complete",
    includeQuote = false,
  ) => {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: booking.id,
          action,
          ...(includeQuote
            ? {
                quote_items: items,
                quote_note: quoteNote,
              }
            : {}),
          ...(adminNote.trim() ? { admin_note: adminNote.trim() } : {}),
        }),
      });
      const result = (await response.json()) as {
        error?: string;
        booking?: UpdatedBooking;
      };
      if (!response.ok || !result.booking) {
        throw new Error(result.error || "Unable to update this booking.");
      }

      const labels: Record<string, string> = {
        save_quote: "Quote saved.",
        send_quote: "Quote marked as sent to the customer.",
        request_photos: "Additional photos requested.",
        approve: "Quote/request approved.",
        reject: "Request rejected and cancelled.",
        confirm_booking: "Booking confirmed.",
        complete: "Booking marked completed.",
      };
      setMessage(labels[action]);
      setAdminNote("");
      onUpdated?.(result.booking);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update this booking.");
    } finally {
      setSaving(false);
    }
  };

  const serviceData = booking.service_data || {};
  const calculatedSubtotal = Number(serviceData.calculatedSubtotal || 0);
  const calculatedTax = Number(serviceData.calculatedTax || 0);
  const calculatedTotal = Number(serviceData.calculatedTotal || 0);
  const currentQuote = serviceData.adminQuote;
  const auditTrail = Array.isArray(serviceData.adminAuditTrail)
    ? [...serviceData.adminAuditTrail].reverse().slice(0, 6)
    : [];
  const cancelled = ["cancelled", "canceled"].includes(
    String(booking.status || "").toLowerCase(),
  );

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CircleDollarSign size={17} className="text-[#4A86F7]" />
            <h3 className="font-bold text-[#13263A]">Quote Management</h3>
          </div>
          <p className="mt-1 text-[10px] leading-5 text-slate-500">
            Review the automatic calculation, adjust services if required, and send or approve a custom quote.
          </p>
        </div>
        {currentQuote?.manualPriceOverride && (
          <span className="inline-flex w-fit items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[9px] font-extrabold uppercase text-amber-700">
            <AlertTriangle size={12} /> Manual price override
          </span>
        )}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-[8px] font-extrabold uppercase text-slate-400">Auto subtotal</div>
          <div className="mt-1 text-sm font-black text-slate-800">{money(calculatedSubtotal)}</div>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-[8px] font-extrabold uppercase text-slate-400">Auto tax</div>
          <div className="mt-1 text-sm font-black text-slate-800">{money(calculatedTax)}</div>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-[8px] font-extrabold uppercase text-slate-400">Auto total</div>
          <div className="mt-1 text-sm font-black text-slate-800">{money(calculatedTotal)}</div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
        <div className="grid grid-cols-[1fr_58px_92px_34px] gap-2 bg-slate-50 px-3 py-2 text-[8px] font-extrabold uppercase text-slate-400 sm:grid-cols-[1fr_70px_120px_36px]">
          <span>Service / item</span>
          <span>Qty</span>
          <span>Unit price</span>
          <span />
        </div>
        <div className="divide-y divide-slate-100">
          {items.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[1fr_58px_92px_34px] gap-2 px-3 py-2 sm:grid-cols-[1fr_70px_120px_36px]"
            >
              <input
                value={item.label}
                disabled={saving || cancelled}
                onChange={(event) => updateItem(item.id, { label: event.target.value })}
                className="h-9 min-w-0 rounded-lg border border-slate-200 px-2 text-[10px] font-semibold outline-none focus:border-blue-400"
              />
              <input
                type="number"
                min={1}
                step={1}
                value={item.quantity}
                disabled={saving || cancelled}
                onChange={(event) =>
                  updateItem(item.id, {
                    quantity: Math.max(1, Math.round(Number(event.target.value) || 1)),
                  })
                }
                className="h-9 rounded-lg border border-slate-200 px-2 text-[10px] font-semibold outline-none focus:border-blue-400"
              />
              <input
                type="number"
                min={0}
                step="0.01"
                value={item.unitPrice}
                disabled={saving || cancelled}
                onChange={(event) =>
                  updateItem(item.id, {
                    unitPrice: Math.max(0, Number(event.target.value) || 0),
                  })
                }
                className="h-9 rounded-lg border border-slate-200 px-2 text-[10px] font-semibold outline-none focus:border-blue-400"
              />
              <button
                type="button"
                disabled={saving || cancelled}
                onClick={() => removeItem(item.id)}
                className="flex h-9 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
                aria-label="Remove quote item"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {!items.length && (
            <div className="px-4 py-5 text-center text-[10px] text-slate-500">
              No quote line items yet. Add the services that should appear on the quote.
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        disabled={saving || cancelled}
        onClick={addItem}
        className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 text-[9px] font-bold text-blue-700 hover:bg-blue-100 disabled:opacity-40"
      >
        <Plus size={13} /> Add service / item
      </button>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_260px]">
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-[9px] font-extrabold uppercase text-slate-400">Customer quote note</span>
            <textarea
              value={quoteNote}
              disabled={saving || cancelled}
              onChange={(event) => setQuoteNote(event.target.value)}
              rows={3}
              placeholder="Scope clarification, quote validity, or customer-facing note..."
              className="w-full resize-none rounded-xl border border-slate-200 p-3 text-[10px] leading-5 outline-none focus:border-blue-400"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[9px] font-extrabold uppercase text-slate-400">Internal admin note</span>
            <textarea
              value={adminNote}
              disabled={saving || cancelled}
              onChange={(event) => setAdminNote(event.target.value)}
              rows={2}
              placeholder="Internal note (saved to audit history)..."
              className="w-full resize-none rounded-xl border border-slate-200 p-3 text-[10px] leading-5 outline-none focus:border-blue-400"
            />
          </label>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <div className="space-y-2 text-[10px]">
            <div className="flex justify-between gap-3 text-slate-500">
              <span>Quote subtotal</span>
              <strong className="text-slate-800">{money(totals.subtotal)}</strong>
            </div>
            <div className="flex justify-between gap-3 text-slate-500">
              <span>Tax ({(taxRate * 100).toFixed(0)}%)</span>
              <strong className="text-slate-800">{money(totals.tax)}</strong>
            </div>
            <div className="flex justify-between gap-3 border-t border-slate-200 pt-2 text-xs">
              <span className="font-black text-slate-700">Quote total</span>
              <strong className="text-base text-blue-600">{money(totals.total)}</strong>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-[10px] font-semibold text-red-700">{error}</div>
      )}
      {message && (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-[10px] font-semibold text-emerald-700">{message}</div>
      )}

      {!cancelled && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <button type="button" disabled={saving} onClick={() => runAction("save_quote", true)} className="flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-[9px] font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40">
            <Save size={13} /> Save Quote
          </button>
          <button type="button" disabled={saving || !items.length} onClick={() => runAction("send_quote", true)} className="flex h-9 items-center justify-center gap-2 rounded-lg bg-[#4A86F7] text-[9px] font-bold text-white hover:bg-blue-600 disabled:opacity-40">
            <Send size={13} /> Send Quote
          </button>
          <button type="button" disabled={saving} onClick={() => runAction("request_photos")} className="flex h-9 items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 text-[9px] font-bold text-amber-700 hover:bg-amber-100 disabled:opacity-40">
            <Camera size={13} /> Request Photos
          </button>
          <button type="button" disabled={saving || !items.length} onClick={() => runAction("approve", true)} className="flex h-9 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 text-[9px] font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-40">
            <ShieldCheck size={13} /> Approve
          </button>
          <button type="button" disabled={saving} onClick={() => runAction("confirm_booking", Boolean(items.length))} className="flex h-9 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 text-[9px] font-bold text-blue-700 hover:bg-blue-100 disabled:opacity-40">
            <CheckCircle2 size={13} /> Confirm Booking
          </button>
          <button type="button" disabled={saving} onClick={() => runAction("complete")} className="flex h-9 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white text-[9px] font-bold text-emerald-700 hover:bg-emerald-50 disabled:opacity-40">
            <CheckCircle2 size={13} /> Mark Completed
          </button>
          <button type="button" disabled={saving} onClick={() => runAction("reject")} className="flex h-9 items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white text-[9px] font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-40">
            <XCircle size={13} /> Reject Request
          </button>
        </div>
      )}

      {auditTrail.length > 0 && (
        <div className="mt-5 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2">
            <FileText size={13} className="text-slate-400" />
            <p className="text-[9px] font-extrabold uppercase text-slate-400">Recent admin history</p>
          </div>
          <div className="mt-2 space-y-2">
            {auditTrail.map((entry: any, index: number) => (
              <div key={String(entry.id || index)} className="rounded-lg bg-slate-50 px-3 py-2 text-[9px] text-slate-600">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="capitalize text-slate-800">{String(entry.action || "update").replaceAll("_", " ")}</strong>
                  <span>{entry.createdAt ? new Date(entry.createdAt).toLocaleString("en-CA") : ""}</span>
                </div>
                {entry.createdByName && <div className="mt-0.5 text-slate-400">By {entry.createdByName}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
