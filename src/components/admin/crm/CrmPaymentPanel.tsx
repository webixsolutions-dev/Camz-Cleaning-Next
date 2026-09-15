"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Send,
  Wallet,
  X,
} from "lucide-react";
import {
  dollarsToCents,
  formatCad,
} from "@/lib/crm/services/invoiceCalc";

type Payment = {
  id: string;
  amount_cents: number;
  method: string | null;
  reference?: string | null;
  notes?: string | null;
  received_at: string;
  is_void: boolean;
  is_deposit?: boolean;
};

type OverpaymentWarning = {
  balance_cents: number;
  payment_cents: number;
  overpayment_cents: number;
};

type ReverseTarget = {
  id: string;
  amount_cents: number;
};

type Props = {
  invoiceId: string;
  issued: boolean;
  isAdmin: boolean;
  balanceCents: number;
  payments?: Payment[];
  defaultSendConfirmation?: boolean;
  onChanged: () => void | Promise<void>;
};

const fieldClass =
  "min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-[16px] font-medium text-slate-700 outline-none transition focus:border-[#4A86F7] focus:ring-4 focus:ring-[#4A86F7]/10 sm:text-[13px]";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function readApi(response: Response) {
  return response
    .json()
    .catch(() => ({})) as Promise<Record<string, unknown>>;
}

function methodLabel(value?: string | null) {
  const method = String(value || "").toLowerCase();

  if (method === "e_transfer") return "E-transfer";
  if (method === "cash") return "Cash";
  if (method === "cheque") return "Cheque";
  if (method === "bank_deposit") return "Bank deposit";
  if (method === "card") return "Card";
  if (method === "other") return "Other";

  return method.replaceAll("_", " ") || "Payment";
}

function formatDate(value?: string | null) {
  if (!value) return "No date";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function CrmPaymentPanel({
  invoiceId,
  issued,
  isAdmin,
  balanceCents,
  payments = [],
  defaultSendConfirmation = false,
  onChanged,
}: Props) {
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(today());
  const [method, setMethod] = useState("e_transfer");
  const [reference, setReference] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [isDeposit, setIsDeposit] = useState(false);
  const [sendConfirmation, setSendConfirmation] = useState(
    defaultSendConfirmation,
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [overpayment, setOverpayment] =
    useState<OverpaymentWarning | null>(null);

  const [reverseTarget, setReverseTarget] =
    useState<ReverseTarget | null>(null);

  const [reverseReason, setReverseReason] = useState("");

  useEffect(() => {
    if (balanceCents > 0) {
      setAmount((balanceCents / 100).toFixed(2));
    }
  }, [balanceCents]);

  useEffect(() => {
    setSendConfirmation(defaultSendConfirmation);
  }, [defaultSendConfirmation]);

  const clearPaymentForm = () => {
    setAmount("");
    setPaymentDate(today());
    setMethod("e_transfer");
    setReference("");
    setInternalNote("");
    setIsDeposit(false);
  };

  const savePayment = async (confirmOverpayment = false) => {
    const amountCents = dollarsToCents(amount);

    if (!issued) {
      setError("Issue the invoice before recording a payment.");
      return;
    }

    if (amountCents == null || amountCents <= 0) {
      setError("Enter a payment amount like 150 or 150.00.");
      return;
    }

    if (!paymentDate) {
      setError("Select the payment date.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/crm/payments/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoice_id: invoiceId,
          amount_cents: amountCents,
          received_at: paymentDate,
          method,
          reference: reference.trim() || null,
          notes: internalNote.trim() || null,
          is_deposit: isDeposit,
          send_confirmation: sendConfirmation,
          confirm_overpayment: confirmOverpayment,
        }),
      });

      const body = await readApi(response);

      if (
        response.status === 409 &&
        body.code === "OVERPAYMENT_CONFIRMATION_REQUIRED"
      ) {
        setOverpayment({
          balance_cents: Number(body.balance_cents || 0),
          payment_cents: Number(body.payment_cents || 0),
          overpayment_cents: Number(
            body.overpayment_cents || 0,
          ),
        });

        return;
      }

      if (!response.ok) {
        throw new Error(
          String(body.error || "Unable to record payment."),
        );
      }

      setOverpayment(null);
      clearPaymentForm();

      setSuccess(
        sendConfirmation
          ? "Payment recorded. Customer confirmation was requested."
          : "Payment recorded and invoice balance updated.",
      );

      await onChanged();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to record payment.",
      );
    } finally {
      setSaving(false);
    }
  };

  const submitPayment = async (event: FormEvent) => {
    event.preventDefault();
    await savePayment(false);
  };

  const reversePayment = async () => {
    if (!isAdmin || !reverseTarget) return;

    if (reverseReason.trim().length < 3) {
      setError("Enter a clear payment reversal reason.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/crm/payments/", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: reverseTarget.id,
          void_reason: reverseReason.trim(),
        }),
      });

      const body = await readApi(response);

      if (!response.ok) {
        throw new Error(
          String(body.error || "Unable to reverse payment."),
        );
      }

      setSuccess(
        `${formatCad(
          reverseTarget.amount_cents,
        )} payment was reversed and the balance was updated.`,
      );

      setReverseTarget(null);
      setReverseReason("");

      await onChanged();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to reverse payment.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <form
        onSubmit={submitPayment}
        className="space-y-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_rgba(19,38,58,0.06)]"
      >
        <div>
          <p className="flex items-center gap-2 text-[13px] font-bold text-slate-800">
            <Wallet size={17} className="text-emerald-600" />
            Record payment
          </p>

          <p className="mt-1 text-[12px] leading-5 text-slate-500">
            Record an offline payment received through
            e-transfer, cash, cheque, bank deposit, or another
            method.
          </p>
        </div>

        {error ? (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-800">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        ) : null}

        {success ? (
          <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-800">
            <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
            <p>{success}</p>
          </div>
        ) : null}

        <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Amount received
          <input
            className={`${fieldClass} mt-1.5`}
            inputMode="decimal"
            placeholder="150.00"
            value={amount}
            disabled={!issued || saving}
            onChange={(event) => setAmount(event.target.value)}
          />
          <span className="mt-1 block normal-case tracking-normal text-slate-400">
            Remaining balance: {formatCad(balanceCents)}
          </span>
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Payment date
            <input
              className={`${fieldClass} mt-1.5`}
              type="date"
              max={today()}
              value={paymentDate}
              disabled={!issued || saving}
              onChange={(event) =>
                setPaymentDate(event.target.value)
              }
            />
          </label>

          <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Method
            <select
              className={`${fieldClass} mt-1.5`}
              value={method}
              disabled={!issued || saving}
              onChange={(event) => setMethod(event.target.value)}
            >
              <option value="e_transfer">E-transfer</option>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
              <option value="bank_deposit">
                Bank deposit
              </option>
              <option value="other">Other</option>
            </select>
          </label>
        </div>

        <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Reference
          <input
            className={`${fieldClass} mt-1.5`}
            placeholder="Confirmation or receipt number"
            value={reference}
            disabled={!issued || saving}
            onChange={(event) => setReference(event.target.value)}
          />
        </label>

        <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Internal payment note
          <textarea
            className="mt-1.5 min-h-20 w-full rounded-xl border border-slate-200 bg-white p-3 text-[13px] text-slate-700 outline-none transition focus:border-[#4A86F7] focus:ring-4 focus:ring-[#4A86F7]/10"
            placeholder="Private note — never shown to customer"
            value={internalNote}
            disabled={!issued || saving}
            onChange={(event) =>
              setInternalNote(event.target.value)
            }
          />
        </label>

        <div className="space-y-2 rounded-xl bg-slate-50 p-3">
          <label className="flex items-center gap-2 text-[13px] text-slate-600">
            <input
              type="checkbox"
              checked={isDeposit}
              disabled={!issued || saving}
              onChange={(event) =>
                setIsDeposit(event.target.checked)
              }
            />
            This payment is a deposit or advance
          </label>

          <label className="flex items-center gap-2 text-[13px] text-slate-600">
            <input
              type="checkbox"
              checked={sendConfirmation}
              disabled={!issued || saving}
              onChange={(event) =>
                setSendConfirmation(event.target.checked)
              }
            />
            Send paid/partial payment confirmation
          </label>
        </div>

        <button
          type="submit"
          disabled={!issued || saving}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-[13px] font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send size={15} />
          {saving ? "Saving payment..." : "Save payment"}
        </button>
      </form>

      {payments.length ? (
        <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_rgba(19,38,58,0.06)]">
          <p className="text-[13px] font-bold text-slate-800">
            Payment history
          </p>

          <p className="mt-1 text-[12px] leading-5 text-slate-500">
            Reversed payments remain visible for audit purposes.
          </p>

          <div className="mt-4 space-y-3">
            {payments.map((payment) => (
              <article
                key={payment.id}
                className={`rounded-2xl border p-3 ${
                  payment.is_void
                    ? "border-rose-100 bg-rose-50/60"
                    : "border-slate-100 bg-slate-50"
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p
                        className={`text-[14px] font-bold ${
                          payment.is_void
                            ? "text-rose-700 line-through"
                            : "text-slate-900"
                        }`}
                      >
                        {formatCad(payment.amount_cents)}
                      </p>

                      {payment.is_deposit ? (
                        <span className="rounded-full bg-blue-50 px-2 py-1 text-[9px] font-bold uppercase text-blue-700">
                          Deposit
                        </span>
                      ) : null}

                      {payment.is_void ? (
                        <span className="rounded-full bg-rose-100 px-2 py-1 text-[9px] font-bold uppercase text-rose-700">
                          Reversed
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-1 text-[12px] text-slate-500">
                      {formatDate(payment.received_at)} ·{" "}
                      {methodLabel(payment.method)}
                    </p>

                    {payment.reference ? (
                      <p className="mt-1 break-words text-[12px] text-slate-600">
                        Reference: {payment.reference}
                      </p>
                    ) : null}

                    {payment.notes ? (
                      <p className="mt-2 whitespace-pre-wrap break-words rounded-lg bg-white px-2.5 py-2 text-[11px] text-slate-500">
                        Internal: {payment.notes}
                      </p>
                    ) : null}
                  </div>

                  {isAdmin && !payment.is_void ? (
                    <button
                      type="button"
                      className="inline-flex shrink-0 items-center gap-1.5 text-[12px] font-bold text-rose-600"
                      onClick={() => {
                        setReverseTarget({
                          id: payment.id,
                          amount_cents: payment.amount_cents,
                        });
                        setReverseReason("");
                        setError("");
                      }}
                    >
                      <RotateCcw size={14} />
                      Reverse
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {overpayment ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
          onClick={() => setOverpayment(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <AlertTriangle size={22} />
              </div>

              <button
                type="button"
                className="text-slate-400"
                onClick={() => setOverpayment(null)}
              >
                <X size={18} />
              </button>
            </div>

            <h2 className="mt-4 text-slate-900">
              Payment exceeds the balance
            </h2>

            <p className="mt-2 text-[13px] leading-6 text-slate-500">
              Confirm only if the business intentionally wants to
              record this overpayment.
            </p>

            <div className="mt-4 space-y-2 rounded-2xl bg-slate-50 p-4 text-[13px] text-slate-600">
              <div className="flex justify-between gap-3">
                <span>Remaining balance</span>
                <strong className="text-slate-900">
                  {formatCad(overpayment.balance_cents)}
                </strong>
              </div>

              <div className="flex justify-between gap-3">
                <span>Payment entered</span>
                <strong className="text-slate-900">
                  {formatCad(overpayment.payment_cents)}
                </strong>
              </div>

              <div className="flex justify-between gap-3 border-t border-slate-200 pt-2 text-amber-700">
                <span>Overpayment</span>
                <strong>
                  {formatCad(overpayment.overpayment_cents)}
                </strong>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                className="h-11 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-700"
                onClick={() => setOverpayment(null)}
              >
                Edit amount
              </button>

              <button
                type="button"
                disabled={saving}
                className="h-11 rounded-xl bg-amber-600 text-[13px] font-bold text-white disabled:opacity-50"
                onClick={() => void savePayment(true)}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {reverseTarget ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
          onClick={() => setReverseTarget(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-[11px] font-bold uppercase tracking-wide text-rose-600">
              Reverse payment
            </p>

            <h2 className="mt-2 text-slate-900">
              Reverse {formatCad(reverseTarget.amount_cents)}?
            </h2>

            <p className="mt-2 text-[13px] leading-6 text-slate-500">
              The payment will remain in history and the invoice
              balance will reopen.
            </p>

            <textarea
              className="mt-4 min-h-24 w-full rounded-xl border border-slate-200 bg-white p-3 text-[13px] outline-none focus:border-rose-400"
              placeholder="Reversal reason (required)"
              value={reverseReason}
              onChange={(event) =>
                setReverseReason(event.target.value)
              }
            />

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                className="h-11 rounded-xl border border-slate-200 text-[13px] font-bold"
                onClick={() => setReverseTarget(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={saving || reverseReason.trim().length < 3}
                className="h-11 rounded-xl bg-rose-600 text-[13px] font-bold text-white disabled:opacity-50"
                onClick={() => void reversePayment()}
              >
                Reverse payment
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}