import { enforceMutationSecurity } from "@/lib/security/http";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendCrmInvoiceEmail } from "@/lib/crm/email";

type QuoteItemInput = {
  id?: string;
  label?: string;
  quantity?: number;
  unitPrice?: number;
};

type BookingAction =
  | "save_quote"
  | "send_quote"
  | "request_photos"
  | "approve"
  | "reject"
  | "confirm_booking"
  | "complete"
  | "cancel";

type BookingUpdatePayload = {
  id?: string;
  cleaner_id?: string | null;
  status?: string | null;
  action?: BookingAction;
  admin_note?: string;
  quote_note?: string;
  quote_items?: QuoteItemInput[];
};

const ALLOWED_STATUSES = new Set([
  "pending",
  "new_request",
  "under_review",
  "awaiting_photos",
  "quote_sent",
  "approved",
  "booking_confirmed",
  "assigned",
  "accepted",
  "in_progress",
  "completed",
  "cancelled",
  "canceled",
  "custom_quote_required",
]);

const ACTION_STATUS: Record<BookingAction, string | null> = {
  save_quote: null,
  send_quote: "quote_sent",
  request_photos: "awaiting_photos",
  approve: "approved",
  reject: "cancelled",
  confirm_booking: "booking_confirmed",
  complete: "completed",
  cancel: "cancelled",
};

const cleanText = (value: unknown, max = 2000) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const safeMoney = (value: unknown) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.round(Math.max(0, Math.min(number, 1000000)) * 100) / 100;
};

const safeQuantity = (value: unknown) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 1;
  return Math.max(1, Math.min(100, Math.round(number)));
};

function normalizeTaxRate(value: unknown) {
  const raw = Number(value);
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  return raw > 1 ? Math.min(raw / 100, 1) : Math.min(raw, 1);
}

function sanitizeQuoteItems(items: unknown): Array<{
  id: string;
  label: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}> {
  if (!Array.isArray(items)) return [];

  return items
    .slice(0, 40)
    .map((item, index) => {
      const input = (item || {}) as QuoteItemInput;
      const label = cleanText(input.label, 160);
      const quantity = safeQuantity(input.quantity);
      const unitPrice = safeMoney(input.unitPrice);
      return {
        id: cleanText(input.id, 100) || `admin-item-${index + 1}`,
        label,
        quantity,
        unitPrice,
        amount: Math.round(quantity * unitPrice * 100) / 100,
      };
    })
    .filter((item) => item.label && item.amount >= 0);
}

async function authorizeAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { allowed: false, supabase, actor: null as null | { id: string; name: string } };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("name, role, is_blocked")
    .eq("id", user.id)
    .maybeSingle();

  return {
    allowed:
      profile?.role?.toLowerCase() === "admin" && profile.is_blocked === false,
    supabase,
    actor: {
      id: user.id,
      name: profile?.name || user.email || "Admin",
    },
  };
}

export async function PATCH(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, {
    bucket: "bookings-patch",
    limit: 60,
    windowSeconds: 60,
  });
  if (securityError) return securityError;

  const { allowed, supabase, actor } = await authorizeAdmin();
  if (!allowed || !actor) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = (await request.json()) as BookingUpdatePayload;
  if (!body.id) {
    return NextResponse.json({ error: "Booking id is required." }, { status: 400 });
  }

  const { data: existing, error: fetchError } = await supabase
    .from("jobs")
    .select(
      "id, customer_id, guest_email, service_name, cleaner_id, status, total_price, final_price, price, tax_rate, service_data",
    )
    .eq("id", body.id)
    .maybeSingle();

  if (fetchError || !existing) {
    return NextResponse.json(
      { error: fetchError?.message || "Booking not found." },
      { status: 404 },
    );
  }

  const now = new Date().toISOString();
  const serviceData =
    existing.service_data && typeof existing.service_data === "object"
      ? { ...(existing.service_data as Record<string, unknown>) }
      : {};

  const history = Array.isArray(serviceData.adminAuditTrail)
    ? [...(serviceData.adminAuditTrail as Array<Record<string, unknown>>)].slice(-99)
    : [];

  const updates: Record<string, unknown> = {};
  const auditChanges: Record<string, unknown> = {};

  if ("cleaner_id" in body) {
    updates.cleaner_id = body.cleaner_id || null;
    auditChanges.cleaner = {
      from: existing.cleaner_id || null,
      to: body.cleaner_id || null,
    };
  }

  let nextStatus = cleanText(body.status, 60).toLowerCase();
  if (body.action) {
    nextStatus = ACTION_STATUS[body.action] || nextStatus;
  }

  if (nextStatus) {
    if (!ALLOWED_STATUSES.has(nextStatus)) {
      return NextResponse.json({ error: "Unsupported booking status." }, { status: 400 });
    }
    updates.status = nextStatus;
    if (nextStatus !== String(existing.status || "").toLowerCase()) {
      auditChanges.status = { from: existing.status || null, to: nextStatus };
    }
  }

  const adminNote = cleanText(body.admin_note, 2000);
  if (adminNote) {
    const adminNotes = Array.isArray(serviceData.adminNotes)
      ? [...(serviceData.adminNotes as Array<Record<string, unknown>>)].slice(-49)
      : [];
    adminNotes.push({
      note: adminNote,
      createdAt: now,
      createdBy: actor.id,
      createdByName: actor.name,
    });
    serviceData.adminNotes = adminNotes;
    auditChanges.adminNoteAdded = adminNote;
  }

  const quoteItemsProvided = Array.isArray(body.quote_items);
  if (quoteItemsProvided) {
    const items = sanitizeQuoteItems(body.quote_items);
    if ((body.action === "send_quote" || body.action === "approve") && !items.length) {
      return NextResponse.json(
        { error: "Add at least one quote line item before sending or approving the quote." },
        { status: 400 },
      );
    }

    const subtotal = Math.round(items.reduce((sum, item) => sum + item.amount, 0) * 100) / 100;
    const taxRate = normalizeTaxRate(existing.tax_rate);
    const tax = Math.round(subtotal * taxRate * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;
    const previousQuote =
      serviceData.adminQuote && typeof serviceData.adminQuote === "object"
        ? (serviceData.adminQuote as Record<string, unknown>)
        : {};
    const calculatedTotal = safeMoney(serviceData.calculatedTotal);
    const manualOverride = calculatedTotal > 0 && Math.abs(total - calculatedTotal) >= 0.01;

    serviceData.adminQuote = {
      ...previousQuote,
      items,
      subtotal,
      taxRate,
      tax,
      total,
      note: cleanText(body.quote_note, 2000),
      manualPriceOverride: manualOverride,
      originalCalculatedTotal: calculatedTotal || null,
      updatedAt: now,
      updatedBy: actor.id,
      updatedByName: actor.name,
      ...(body.action === "send_quote" ? { sentAt: now } : {}),
      ...(body.action === "approve" ? { approvedAt: now } : {}),
      ...(body.action === "confirm_booking" ? { confirmedAt: now } : {}),
    };

    updates.total_price = total;
    updates.final_price = total;
    updates.price = `$${total.toFixed(2)}`;
    auditChanges.quote = {
      itemCount: items.length,
      subtotal,
      tax,
      total,
      previousTotal:
        existing.total_price === null || existing.total_price === undefined
          ? null
          : safeMoney(existing.total_price),
      manualPriceOverride: manualOverride,
    };
  } else if (body.quote_note !== undefined) {
    const previousQuote =
      serviceData.adminQuote && typeof serviceData.adminQuote === "object"
        ? (serviceData.adminQuote as Record<string, unknown>)
        : {};
    serviceData.adminQuote = {
      ...previousQuote,
      note: cleanText(body.quote_note, 2000),
      updatedAt: now,
      updatedBy: actor.id,
      updatedByName: actor.name,
    };
  }

  if (body.action === "request_photos") {
    serviceData.additionalPhotosRequested = true;
    serviceData.additionalPhotosRequestedAt = now;
    serviceData.additionalPhotosRequestedBy = actor.id;
    auditChanges.additionalPhotosRequested = true;
  }
  if (body.action === "approve") {
    serviceData.quoteApprovedAt = now;
    serviceData.quoteApprovedBy = actor.id;
  }
  if (body.action === "reject") {
    serviceData.rejectedAt = now;
    serviceData.rejectedBy = actor.id;
  }
  if (body.action === "confirm_booking") {
    serviceData.bookingConfirmedAt = now;
    serviceData.bookingConfirmedBy = actor.id;
  }
  if (body.action === "complete") {
    serviceData.completedAt = now;
    serviceData.completedBy = actor.id;
  }

  if (Object.keys(auditChanges).length || body.action) {
    history.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      action: body.action || "update",
      changes: auditChanges,
      createdAt: now,
      createdBy: actor.id,
      createdByName: actor.name,
    });
    serviceData.adminAuditTrail = history;
  }

  if (
    body.action ||
    adminNote ||
    quoteItemsProvided ||
    body.quote_note !== undefined ||
    Object.keys(auditChanges).length > 0
  ) {
    updates.service_data = serviceData;
  }

  if (!Object.keys(updates).length) {
    return NextResponse.json(
      { error: "No booking changes were provided." },
      { status: 400 },
    );
  }

  const { data: updated, error } = await supabase
    .from("jobs")
    .update(updates)
    .eq("id", body.id)
    .select("id, cleaner_id, status, total_price, final_price, price, service_data")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  let notification: { attempted: boolean; sent: boolean; error?: string } = {
    attempted: false,
    sent: false,
  };

  if (body.action === "send_quote" || body.action === "request_photos") {
    let customerEmail = cleanText(existing.guest_email, 180).toLowerCase();
    if (!customerEmail && existing.customer_id) {
      const { data: customer } = await supabase
        .from("users")
        .select("email")
        .eq("id", existing.customer_id)
        .maybeSingle();
      customerEmail = cleanText(customer?.email, 180).toLowerCase();
    }
    if (!customerEmail) {
      customerEmail = cleanText(serviceData.customerEmail, 180).toLowerCase();
    }

    if (customerEmail) {
      notification.attempted = true;
      const quote = serviceData.adminQuote as Record<string, any> | undefined;
      const isQuote = body.action === "send_quote";
      const quoteRows = Array.isArray(quote?.items)
        ? quote!.items
            .map(
              (item: any) => `
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">${escapeHtml(item.label)}</td>
                  <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:center;">${escapeHtml(item.quantity)}</td>
                  <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:right;">CAD $${Number(item.amount || 0).toFixed(2)}</td>
                </tr>`,
            )
            .join("")
        : "";
      const html = isQuote
        ? `<div style="font-family:Arial,sans-serif;color:#13263A;max-width:640px;margin:auto;">
            <h2>Camz Cleaning Quote</h2>
            <p>We have reviewed your ${escapeHtml(existing.service_name || "cleaning")} request. Your updated quote is below.</p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0;">
              <thead><tr><th style="text-align:left;">Service</th><th>Qty</th><th style="text-align:right;">Amount</th></tr></thead>
              <tbody>${quoteRows}</tbody>
            </table>
            <p><strong>Subtotal:</strong> CAD $${Number(quote?.subtotal || 0).toFixed(2)}<br/>
            <strong>Tax:</strong> CAD $${Number(quote?.tax || 0).toFixed(2)}<br/>
            <strong>Total:</strong> CAD $${Number(quote?.total || 0).toFixed(2)}</p>
            ${quote?.note ? `<p>${escapeHtml(quote.note)}</p>` : ""}
            <p>Please contact Camz Cleaning if any detail needs to be adjusted.</p>
          </div>`
        : `<div style="font-family:Arial,sans-serif;color:#13263A;max-width:640px;margin:auto;">
            <h2>Additional Photos Requested</h2>
            <p>Camz Cleaning needs a few more property-condition photos before we can finalize your quote or booking.</p>
            <p>Please open your booking in the customer dashboard and upload the requested photos, or contact our team for assistance.</p>
          </div>`;
      const sent = await sendCrmInvoiceEmail({
        to: customerEmail,
        subject: isQuote
          ? `Camz Cleaning Quote – ${existing.service_name || "Cleaning Service"}`
          : "Camz Cleaning – Additional Photos Requested",
        html,
      });
      notification = sent.ok
        ? { attempted: true, sent: true }
        : { attempted: true, sent: false, error: sent.error };

      const notifiedServiceData = {
        ...(updated.service_data as Record<string, unknown>),
        customerNotification: {
          type: body.action,
          email: customerEmail,
          attemptedAt: new Date().toISOString(),
          sent: notification.sent,
          ...(notification.error ? { error: notification.error } : {}),
        },
      };
      await supabase
        .from("jobs")
        .update({ service_data: notifiedServiceData })
        .eq("id", body.id);
      updated.service_data = notifiedServiceData;
    }
  }

  return NextResponse.json({ ok: true, booking: updated, notification });
}
