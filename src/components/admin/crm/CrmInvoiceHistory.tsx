"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Copy,
  Eye,
  FileClock,
  LoaderCircle,
  Mail,
  RefreshCw,
  RotateCcw,
  Send,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

type JsonRecord = Record<string, any>;

type InvoiceRevision = {
  id: string;
  revision_number: number;
  snapshot?: JsonRecord | null;
  created_at?: string | null;
  created_by?: string | null;
};

type TimelineEntry = {
  id: string;
  title: string;
  detail?: string;
  timestamp?: string | null;
  status?: string | null;
  type?: string;
};

type HistoryResponse = {
  invoice?: JsonRecord | null;
  events?: JsonRecord[];
  emails?: JsonRecord[];
  revisions?: InvoiceRevision[];
  payments?: JsonRecord[];
  assets?: JsonRecord[];
  audits?: JsonRecord[];
  timeline?: TimelineEntry[];
  error?: string;
};

type HistoryAction =
  | "create_correction"
  | "duplicate"
  | "delete_draft"
  | "cancel";

type Props = {
  invoiceId: string;
  isAdmin?: boolean;
  customerEmail?: string | null;
  onChanged?: () => void | Promise<void>;
};

const ACTION_DETAILS: Record<
  HistoryAction,
  {
    title: string;
    description: string;
    button: string;
    tone: "blue" | "amber" | "rose";
  }
> = {
  create_correction: {
    title: "Create invoice correction",
    description:
      "Create a new controlled revision while preserving the issued invoice history.",
    button: "Create Correction",
    tone: "blue",
  },
  duplicate: {
    title: "Duplicate invoice",
    description:
      "Create a new draft using this invoice as the starting point.",
    button: "Duplicate Invoice",
    tone: "blue",
  },
  delete_draft: {
    title: "Delete draft invoice",
    description:
      "Delete this draft. Issued invoice records and their revisions cannot be deleted.",
    button: "Delete Draft",
    tone: "rose",
  },
  cancel: {
    title: "Cancel invoice",
    description:
      "Cancel this invoice while retaining its immutable revisions, payments and audit history.",
    button: "Cancel Invoice",
    tone: "rose",
  },
};

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatMoney(
  cents: unknown,
  currency = "CAD",
) {
  const numberValue = Number(cents || 0);

  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
  }).format(numberValue / 100);
}

function getSnapshotInvoice(
  revision?: InvoiceRevision,
) {
  return revision?.snapshot?.invoice || {};
}

function getSnapshotItems(
  revision?: InvoiceRevision,
): JsonRecord[] {
  const snapshot = revision?.snapshot;

  const items =
    snapshot?.items ||
    snapshot?.crm_invoice_items ||
    snapshot?.invoice?.crm_invoice_items ||
    [];

  return Array.isArray(items) ? items : [];
}

function getCustomerEmail(
  invoice?: JsonRecord | null,
) {
  if (!invoice) return "";

  const customer = Array.isArray(
    invoice.crm_customers,
  )
    ? invoice.crm_customers[0]
    : invoice.crm_customers;

  return (
    customer?.email ||
    invoice.customer_email ||
    ""
  );
}

function buildFallbackTimeline(
  history: HistoryResponse,
): TimelineEntry[] {
  const entries: TimelineEntry[] = [];

  for (const event of history.events || []) {
    entries.push({
      id: `event-${event.id}`,
      title: String(
        event.event_type || "Invoice event",
      )
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) =>
          letter.toUpperCase(),
        ),
      detail:
        event.payload?.reason ||
        event.payload?.to ||
        event.payload?.status ||
        "",
      timestamp: event.created_at,
      status: event.payload?.status,
      type: "event",
    });
  }

  for (const email of history.emails || []) {
    entries.push({
      id: `email-${email.id}`,
      title:
        email.status === "sent"
          ? "Email delivered"
          : email.status === "failed"
            ? "Email failed"
            : "Email queued",
      detail:
        email.to_email ||
        email.error ||
        email.subject ||
        "",
      timestamp:
        email.sent_at ||
        email.created_at,
      status: email.status,
      type: "email",
    });
  }

  for (const revision of history.revisions || []) {
    entries.push({
      id: `revision-${revision.id}`,
      title: `Revision ${revision.revision_number} created`,
      detail: "Immutable invoice snapshot",
      timestamp: revision.created_at,
      status: "revision",
      type: "revision",
    });
  }

  for (const payment of history.payments || []) {
    entries.push({
      id: `payment-${payment.id}`,
      title: payment.voided_at
        ? "Payment reversed"
        : "Payment recorded",
      detail: formatMoney(
        payment.amount_cents,
        payment.currency || "CAD",
      ),
      timestamp:
        payment.voided_at ||
        payment.received_at ||
        payment.created_at,
      status: payment.voided_at
        ? "void"
        : "paid",
      type: "payment",
    });
  }

  for (const audit of history.audits || []) {
    entries.push({
      id: `audit-${audit.id}`,
      title: String(audit.action || "Audit event")
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) =>
          letter.toUpperCase(),
        ),
      detail:
        audit.after?.reason ||
        audit.before?.reason ||
        "",
      timestamp: audit.created_at,
      status: "audit",
      type: "audit",
    });
  }

  return entries.sort((first, second) => {
    const firstTime = new Date(
      first.timestamp || 0,
    ).getTime();

    const secondTime = new Date(
      second.timestamp || 0,
    ).getTime();

    return secondTime - firstTime;
  });
}

function statusDot(status?: string | null) {
  switch (status) {
    case "sent":
    case "paid":
    case "delivered":
      return "bg-emerald-500";

    case "failed":
    case "void":
    case "cancelled":
      return "bg-rose-500";

    case "queued":
    case "pending":
      return "bg-amber-500";

    case "revision":
      return "bg-violet-500";

    default:
      return "bg-blue-500";
  }
}

export default function CrmInvoiceHistory({
  invoiceId,
  isAdmin = false,
  customerEmail,
  onChanged,
}: Props) {
  const router = useRouter();

  const [history, setHistory] =
    useState<HistoryResponse>({});

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [selectedRevisionNumber, setSelectedRevisionNumber] =
    useState<number | null>(null);

  const [action, setAction] =
    useState<HistoryAction | null>(null);

  const [actionReason, setActionReason] =
    useState("");

  const [actionLoading, setActionLoading] =
    useState(false);

  const [emailOpen, setEmailOpen] =
    useState(false);

  const [emailAddress, setEmailAddress] =
    useState(customerEmail || "");

  const [emailLoading, setEmailLoading] =
    useState(false);

  const loadHistory = useCallback(
    async (background = false) => {
      if (background) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const response = await fetch(
          `/api/admin/crm/invoices/history/?id=${encodeURIComponent(
            invoiceId,
          )}`,
          {
            cache: "no-store",
          },
        );

        const payload =
          (await response.json().catch(() => ({}))) as HistoryResponse;

        if (!response.ok) {
          throw new Error(
            payload.error ||
              "Unable to load invoice history.",
          );
        }

        const sortedRevisions = [
          ...(payload.revisions || []),
        ].sort(
          (first, second) =>
            Number(second.revision_number) -
            Number(first.revision_number),
        );

        const nextHistory = {
          ...payload,
          revisions: sortedRevisions,
        };

        setHistory(nextHistory);

        setSelectedRevisionNumber(
          (currentSelection) => {
            const currentStillExists =
              sortedRevisions.some(
                (revision) =>
                  revision.revision_number ===
                  currentSelection,
              );

            if (currentStillExists) {
              return currentSelection;
            }

            const invoiceRevision = Number(
              payload.invoice?.current_revision,
            );

            if (
              Number.isSafeInteger(invoiceRevision) &&
              invoiceRevision > 0 &&
              sortedRevisions.some(
                (revision) =>
                  revision.revision_number ===
                  invoiceRevision,
              )
            ) {
              return invoiceRevision;
            }

            return (
              sortedRevisions[0]
                ?.revision_number || null
            );
          },
        );

        setEmailAddress((currentEmail) => {
          if (currentEmail.trim()) {
            return currentEmail;
          }

          return (
            customerEmail ||
            getCustomerEmail(payload.invoice)
          );
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load invoice history.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [customerEmail, invoiceId],
  );

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const revisions =
    history.revisions || [];

  const selectedRevision = useMemo(
    () =>
      revisions.find(
        (revision) =>
          revision.revision_number ===
          selectedRevisionNumber,
      ),
    [
      revisions,
      selectedRevisionNumber,
    ],
  );

  const selectedRevisionIndex =
    revisions.findIndex(
      (revision) =>
        revision.revision_number ===
        selectedRevisionNumber,
    );

  const previousRevision =
    selectedRevisionIndex >= 0
      ? revisions[selectedRevisionIndex + 1]
      : undefined;

  const selectedInvoice =
    getSnapshotInvoice(selectedRevision);

  const previousInvoice =
    getSnapshotInvoice(previousRevision);

  const selectedItems =
    getSnapshotItems(selectedRevision);

  const previousItems =
    getSnapshotItems(previousRevision);

  const invoice = history.invoice || {};

  const currentRevisionNumber = Number(
    invoice.current_revision || 0,
  );

  const isDraft =
    invoice.status === "draft";

  const isVoid =
    Boolean(invoice.is_void) ||
    invoice.status === "void" ||
    invoice.status === "cancelled";

  const timeline = useMemo(() => {
    if (
      Array.isArray(history.timeline) &&
      history.timeline.length
    ) {
      return history.timeline;
    }

    return buildFallbackTimeline(history);
  }, [history]);

  const openAction = (
    nextAction: HistoryAction,
  ) => {
    setError("");
    setSuccess("");
    setActionReason("");
    setAction(nextAction);
  };

  const closeAction = () => {
    if (actionLoading) return;

    setAction(null);
    setActionReason("");
  };

  const runAction = async () => {
    if (!action) return;

    if (!actionReason.trim()) {
      setError(
        "Enter a reason before continuing.",
      );
      return;
    }

    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "/api/admin/crm/invoices/history",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            action,
            id: invoiceId,
            invoice_id: invoiceId,
            reason: actionReason.trim(),
          }),
        },
      );

      const payload =
        (await response.json().catch(() => ({}))) as JsonRecord;

      if (!response.ok) {
        throw new Error(
          payload.error ||
            "Unable to complete invoice action.",
        );
      }

      setAction(null);
      setActionReason("");

      const createdInvoiceId =
        payload.invoice_id ||
        payload.created_invoice_id ||
        payload.invoice?.id;

      if (action === "delete_draft") {
        router.push(
          "/admin-dashboard/crm/invoices",
        );
        router.refresh();
        return;
      }

      if (
        createdInvoiceId &&
        (action === "create_correction" ||
          action === "duplicate")
      ) {
        router.push(
          `/admin-dashboard/crm/invoices/${createdInvoiceId}`,
        );
        router.refresh();
        return;
      }

      setSuccess(
        action === "cancel"
          ? "Invoice cancelled successfully."
          : "Invoice action completed successfully.",
      );

      await loadHistory(true);
      await onChanged?.();
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to complete invoice action.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openRevisionEmail = () => {
    if (!selectedRevisionNumber) {
      setError(
        "Select an invoice revision first.",
      );
      return;
    }

    setError("");
    setSuccess("");
    setEmailOpen(true);
  };

  const sendRevisionEmail = async () => {
    const to = emailAddress.trim();

    if (!to) {
      setError(
        "Enter the customer email address.",
      );
      return;
    }

    if (!selectedRevisionNumber) {
      setError(
        "Select an invoice revision first.",
      );
      return;
    }

    setEmailLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "/api/admin/crm/invoices",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            action: "send",
            id: invoiceId,
            to_email: to,
            revision_number:
              selectedRevisionNumber,
          }),
        },
      );

      const payload =
        (await response.json().catch(() => ({}))) as JsonRecord;

      if (!response.ok) {
        throw new Error(
          payload.error ||
            "Unable to email this invoice revision.",
        );
      }

      setEmailOpen(false);

      setSuccess(
        `Revision ${selectedRevisionNumber} was emailed to ${to}.`,
      );

      await loadHistory(true);
      await onChanged?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to email this invoice revision.",
      );
    } finally {
      setEmailLoading(false);
    }
  };

  const comparisonRows = [
    {
      label: "Invoice date",
      previous:
        previousInvoice.invoice_date,
      selected:
        selectedInvoice.invoice_date,
    },
    {
      label: "Service date",
      previous:
        previousInvoice.service_date,
      selected:
        selectedInvoice.service_date,
    },
    {
      label: "Due date",
      previous:
        previousInvoice.due_date,
      selected:
        selectedInvoice.due_date,
    },
    {
      label: "Subtotal",
      previous: formatMoney(
        previousInvoice.subtotal_cents,
        previousInvoice.currency ||
          invoice.currency ||
          "CAD",
      ),
      selected: formatMoney(
        selectedInvoice.subtotal_cents,
        selectedInvoice.currency ||
          invoice.currency ||
          "CAD",
      ),
    },
    {
      label: "Discount",
      previous: formatMoney(
        previousInvoice.discount_cents,
        previousInvoice.currency ||
          invoice.currency ||
          "CAD",
      ),
      selected: formatMoney(
        selectedInvoice.discount_cents,
        selectedInvoice.currency ||
          invoice.currency ||
          "CAD",
      ),
    },
    {
      label: "Tax",
      previous: formatMoney(
        previousInvoice.tax_cents,
        previousInvoice.currency ||
          invoice.currency ||
          "CAD",
      ),
      selected: formatMoney(
        selectedInvoice.tax_cents,
        selectedInvoice.currency ||
          invoice.currency ||
          "CAD",
      ),
    },
    {
      label: "Total",
      previous: formatMoney(
        previousInvoice.total_cents,
        previousInvoice.currency ||
          invoice.currency ||
          "CAD",
      ),
      selected: formatMoney(
        selectedInvoice.total_cents,
        selectedInvoice.currency ||
          invoice.currency ||
          "CAD",
      ),
    },
    {
      label: "Line items",
      previous: String(
        previousItems.length,
      ),
      selected: String(
        selectedItems.length,
      ),
    },
  ];

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <LoaderCircle
            size={18}
            className="animate-spin"
          />
          Loading invoice history...
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <FileClock
                size={20}
                className="text-[#4A86F7]"
              />
              <h2 className="text-base font-bold text-slate-950">
                Corrections & Revision History
              </h2>
            </div>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Review immutable versions, compare changes,
              download PDFs and resend a selected revision.
            </p>
          </div>

          <button
            type="button"
            disabled={refreshing}
            onClick={() =>
              void loadHistory(true)
            }
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />
            Refresh
          </button>
        </div>

        {error ? (
          <div className="mx-4 mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:mx-6">
            <XCircle
              size={18}
              className="mt-0.5 shrink-0"
            />
            <span>{error}</span>
          </div>
        ) : null}

        {success ? (
          <div className="mx-4 mt-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 sm:mx-6">
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0"
            />
            <span>{success}</span>
          </div>
        ) : null}

        <div className="grid gap-5 p-4 sm:p-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <div className="min-w-0">
            <h3 className="mb-3 text-sm font-bold text-slate-900">
              Invoice revisions
            </h3>

            {revisions.length ? (
              <div className="space-y-2">
                {revisions.map(
                  (revision) => {
                    const selected =
                      revision.revision_number ===
                      selectedRevisionNumber;

                    const current =
                      revision.revision_number ===
                      currentRevisionNumber;

                    return (
                      <button
                        key={revision.id}
                        type="button"
                        onClick={() => {
                          setSelectedRevisionNumber(
                            revision.revision_number,
                          );
                          setError("");
                          setSuccess("");
                        }}
                        className={`w-full rounded-xl border p-3 text-left transition ${
                          selected
                            ? "border-[#4A86F7] bg-blue-50"
                            : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-slate-900">
                            Revision{" "}
                            {
                              revision.revision_number
                            }
                          </span>

                          {current ? (
                            <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                              Current
                            </span>
                          ) : null}
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(
                            revision.created_at,
                          )}
                        </p>
                      </button>
                    );
                  },
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 p-4 text-xs leading-5 text-slate-500">
                No immutable revision has been created yet.
                Draft invoices use their current live data.
              </div>
            )}
          </div>

          <div className="min-w-0 space-y-5">
            {selectedRevision ? (
              <>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Revision{" "}
                        {
                          selectedRevision.revision_number
                        }
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Created{" "}
                        {formatDate(
                          selectedRevision.created_at,
                        )}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <a
                        href={`/admin-dashboard/crm/invoices/${invoiceId}/preview?revision=${selectedRevision.revision_number}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                      >
                        <Eye size={15} />
                        Preview PDF
                      </a>

                      <button
                        type="button"
                        onClick={
                          openRevisionEmail
                        }
                        disabled={isVoid}
                        className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#4A86F7] px-3 text-xs font-bold text-white transition hover:bg-[#3975e7] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Mail size={15} />
                        Email Revision
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Invoice date
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-900">
                        {selectedInvoice.invoice_date ||
                          "—"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Due date
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-900">
                        {selectedInvoice.due_date ||
                          "—"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Items
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-900">
                        {selectedItems.length}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Total
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-900">
                        {formatMoney(
                          selectedInvoice.total_cents,
                          selectedInvoice.currency ||
                            invoice.currency ||
                            "CAD",
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                    <h3 className="text-sm font-bold text-slate-900">
                      Revision comparison
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      {previousRevision
                        ? `Revision ${previousRevision.revision_number} compared with revision ${selectedRevision.revision_number}.`
                        : "This is the first saved revision."}
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500">
                          <th className="px-4 py-3 font-semibold">
                            Field
                          </th>
                          <th className="px-4 py-3 font-semibold">
                            Previous
                          </th>
                          <th className="px-4 py-3 font-semibold">
                            Selected
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {comparisonRows.map(
                          (row) => {
                            const changed =
                              previousRevision &&
                              String(
                                row.previous ?? "",
                              ) !==
                                String(
                                  row.selected ?? "",
                                );

                            return (
                              <tr
                                key={row.label}
                                className={`border-b border-slate-100 last:border-b-0 ${
                                  changed
                                    ? "bg-amber-50/60"
                                    : ""
                                }`}
                              >
                                <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700">
                                  {row.label}
                                </td>

                                <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                                  {previousRevision
                                    ? row.previous ||
                                      "—"
                                    : "—"}
                                </td>

                                <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">
                                  {row.selected ||
                                    "—"}
                                </td>
                              </tr>
                            );
                          },
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                Select a revision to see its immutable invoice details.
              </div>
            )}

            {isAdmin ? (
              <div className="rounded-2xl border border-slate-200 p-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Invoice actions
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Every action requires a reason and is stored in the audit history.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {!isDraft && !isVoid ? (
                    <button
                      type="button"
                      onClick={() =>
                        openAction(
                          "create_correction",
                        )
                      }
                      className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#4A86F7] px-3 text-xs font-bold text-white"
                    >
                      <RotateCcw size={15} />
                      Create Correction
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() =>
                      openAction("duplicate")
                    }
                    className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <Copy size={15} />
                    Duplicate
                  </button>

                  {isDraft ? (
                    <button
                      type="button"
                      onClick={() =>
                        openAction(
                          "delete_draft",
                        )
                      }
                      className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 text-xs font-bold text-rose-700"
                    >
                      <Trash2 size={15} />
                      Delete Draft
                    </button>
                  ) : null}

                  {!isDraft && !isVoid ? (
                    <button
                      type="button"
                      onClick={() =>
                        openAction("cancel")
                      }
                      className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 text-xs font-bold text-rose-700"
                    >
                      <XCircle size={15} />
                      Cancel Invoice
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="border-t border-slate-200 px-4 py-5 sm:px-6">
          <h3 className="text-sm font-bold text-slate-900">
            Complete activity timeline
          </h3>

          {timeline.length ? (
            <div className="mt-4 space-y-4">
              {timeline.map((entry) => (
                <div
                  key={entry.id}
                  className="relative flex gap-3"
                >
                  <div className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100">
                    <span
                      className={`h-2 w-2 rounded-full ${statusDot(
                        entry.status,
                      )}`}
                    />
                  </div>

                  <div className="min-w-0 flex-1 border-b border-slate-100 pb-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {entry.title}
                      </p>

                      <p className="text-[11px] text-slate-500">
                        {formatDate(
                          entry.timestamp,
                        )}
                      </p>
                    </div>

                    {entry.detail ? (
                      <p className="mt-1 break-words text-xs leading-5 text-slate-500">
                        {entry.detail}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-xs text-slate-500">
              No invoice activity has been recorded yet.
            </p>
          )}
        </div>
      </section>

      {emailOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Mail
                    size={19}
                    className="text-[#4A86F7]"
                  />

                  <h3 className="text-base font-bold text-slate-950">
                    Email revision{" "}
                    {selectedRevisionNumber}
                  </h3>
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  The immutable PDF and email body will both use this exact revision.
                </p>
              </div>

              <button
                type="button"
                disabled={emailLoading}
                onClick={() =>
                  setEmailOpen(false)
                }
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <label className="mt-5 block">
              <span className="text-xs font-bold text-slate-700">
                Customer email
              </span>

              <input
                type="email"
                value={emailAddress}
                disabled={emailLoading}
                onChange={(event) =>
                  setEmailAddress(
                    event.target.value,
                  )
                }
                placeholder="customer@email.com"
                className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-[#4A86F7] focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={emailLoading}
                onClick={() =>
                  setEmailOpen(false)
                }
                className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  emailLoading ||
                  !emailAddress.trim()
                }
                onClick={() =>
                  void sendRevisionEmail()
                }
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#4A86F7] px-4 text-sm font-bold text-white disabled:opacity-50"
              >
                {emailLoading ? (
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Send size={16} />
                )}

                {emailLoading
                  ? "Sending..."
                  : "Send Revision"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {action ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    size={19}
                    className={
                      ACTION_DETAILS[action]
                        .tone === "rose"
                        ? "text-rose-600"
                        : "text-amber-600"
                    }
                  />

                  <h3 className="text-base font-bold text-slate-950">
                    {
                      ACTION_DETAILS[action]
                        .title
                    }
                  </h3>
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {
                    ACTION_DETAILS[action]
                      .description
                  }
                </p>
              </div>

              <button
                type="button"
                disabled={actionLoading}
                onClick={closeAction}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <label className="mt-5 block">
              <span className="text-xs font-bold text-slate-700">
                Action reason
              </span>

              <textarea
                value={actionReason}
                disabled={actionLoading}
                onChange={(event) =>
                  setActionReason(
                    event.target.value,
                  )
                }
                rows={4}
                placeholder="Explain why this action is required..."
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-[#4A86F7] focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={closeAction}
                className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700"
              >
                Close
              </button>

              <button
                type="button"
                disabled={
                  actionLoading ||
                  !actionReason.trim()
                }
                onClick={() =>
                  void runAction()
                }
                className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold text-white disabled:opacity-50 ${
                  ACTION_DETAILS[action]
                    .tone === "rose"
                    ? "bg-rose-600"
                    : "bg-[#4A86F7]"
                }`}
              >
                {actionLoading ? (
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Clock3 size={16} />
                )}

                {actionLoading
                  ? "Processing..."
                  : ACTION_DETAILS[action]
                      .button}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}