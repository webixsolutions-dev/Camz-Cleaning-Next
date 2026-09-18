import { calculateInvoiceTotals, dollarsToCents, lineTotalCents, type InvoiceDiscountType } from "@/lib/crm/services/invoiceCalc";
import { deliverLoggedInvoiceEmail } from "@/lib/crm/services/email";
import { writeCrmAudit } from "@/lib/crm/services/audit";
import { getCrmActor } from "@/lib/crm/staff";
import { enforceMutationSecurity } from "@/lib/security/http";
import { NextRequest, NextResponse } from "next/server";

type ItemInput = {
  id?: string;
  description?: string;
  details?: string;
  quantity?: number;
  unit_label?: string;
  unit_cents?: number;
  unit_dollars?: string;
  taxable?: boolean;
};

type InvoiceBody = {
  id?: string;
  action?: "save" | "issue" | "send" | "remind" | "void" | "add_internal_note";
  customer_id?: string;
  billing_address_id?: string | null;
  service_address_id?: string | null;
  invoice_date?: string | null;
  service_date?: string | null;
  due_date?: string | null;
  notes?: string;
  note?: string;
  discount_type?: InvoiceDiscountType;
  discount_value?: number;
  discount_reason?: string;
  show_discount_reason?: boolean;
  tax_enabled?: boolean;
  tax_rate_bps?: number;
  items?: ItemInput[];
  to_email?: string;
  void_reason?: string;
  confirm_duplicate?: boolean;
};

type CompanySettings = {
  default_currency?: string;
  default_due_days?: number;
  default_customer_note?: string | null;
  default_tax_enabled?: boolean;
  default_tax_bps?: number;
  tax_number?: string | null;
  duplicate_invoice_window_days?: number;
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function encodeDiscountReason(reason?: string, show = false) {
  const text = String(reason || "").trim();
  if (!text) return null;
  return `${show ? "public" : "internal"}:${text}`;
}

function normalizeItems(items: ItemInput[]) {
  return items.flatMap((item) => {
    const description = item.description?.trim() || "";
    const quantity = Number(item.quantity ?? 1);
    const unitCents = item.unit_cents ?? dollarsToCents(item.unit_dollars || "0");
    if (!description || !Number.isFinite(quantity) || quantity <= 0 || unitCents == null || unitCents < 0) return [];
    const wholeQuantity = Math.max(1, Math.round(quantity));
    return [{
      id: item.id,
      description,
      details: item.details?.trim() || null,
      quantity: wholeQuantity,
      unit_label: String(item.unit_label || "item").trim() || "item",
      unit_cents: unitCents,
      taxable: item.taxable !== false,
    }];
  });
}

async function loadSettings(supabase: Awaited<ReturnType<typeof getCrmActor>>["supabase"]) {
  const { data, error } = await supabase.from("crm_company_settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw error;
  return (data || {}) as CompanySettings;
}

async function loadInvoice(supabase: Awaited<ReturnType<typeof getCrmActor>>["supabase"], id: string) {
  return supabase
    .from("crm_invoices")
    .select("*, crm_customers(display_name, customer_code, email, phone, crm_customer_addresses(*)), crm_invoice_items(*), crm_payments(*), crm_invoice_events(*), crm_invoice_emails(*), crm_invoice_revisions(*), crm_invoice_internal_notes(*)")
    .eq("id", id)
    .single();
}

async function findPossibleDuplicates(
  supabase: Awaited<ReturnType<typeof getCrmActor>>["supabase"],
  invoice: {
    id: string;
    customer_id: string;
    service_address_id?: string | null;
    invoice_date?: string | null;
    total_cents?: number;
  },
  windowDays: number,
) {
  const invoiceDate = invoice.invoice_date || today();
  const base = new Date(`${invoiceDate}T12:00:00Z`);
  const start = new Date(base);
  const end = new Date(base);
  start.setUTCDate(start.getUTCDate() - Math.max(0, windowDays));
  end.setUTCDate(end.getUTCDate() + Math.max(0, windowDays));

  let query = supabase
    .from("crm_invoices")
    .select("id, invoice_number, status, invoice_date, total_cents, service_address_id, created_at")
    .eq("customer_id", invoice.customer_id)
    .neq("id", invoice.id)
    .eq("is_void", false)
    .gte("invoice_date", start.toISOString().slice(0, 10))
    .lte("invoice_date", end.toISOString().slice(0, 10));

  query = invoice.service_address_id
    ? query.eq("service_address_id", invoice.service_address_id)
    : query.is("service_address_id", null);

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  const total = Number(invoice.total_cents || 0);
  const tolerance = Math.max(500, Math.round(total * 0.05));
  return (data || []).filter((row) => Math.abs(Number(row.total_cents || 0) - total) <= tolerance);
}

function validateDates(invoiceDate?: string | null, dueDate?: string | null) {
  if (invoiceDate && dueDate && dueDate < invoiceDate) return "Due date cannot be earlier than the invoice date.";
  return null;
}

export async function GET(request: NextRequest) {
  const { actor, supabase, error, status } = await getCrmActor();
  if (!actor) return NextResponse.json({ error }, { status });
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (id) {
      const { data, error: fetchError } = await loadInvoice(supabase, id);
      if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 400 });
      return NextResponse.json({ invoices: data ? [data] : [] });
    }
    const { data, error: fetchError } = await supabase
      .from("crm_invoices")
      .select("*, crm_customers(display_name, email, phone)")
      .order("created_at", { ascending: false });
    if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 400 });
    return NextResponse.json({ invoices: data || [] });
  } catch (err) {
    console.error("CRM invoices GET failed:", err);
    return NextResponse.json({ error: "Unable to load invoices." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, { bucket: "crm-invoices-post", limit: 60, windowSeconds: 60 });
  if (securityError) return securityError;
  const { actor, supabase, error, status } = await getCrmActor();
  if (!actor) return NextResponse.json({ error }, { status });

  try {
    const body = (await request.json()) as InvoiceBody;
    if (!body.customer_id) return NextResponse.json({ error: "Customer is required." }, { status: 400 });
    const settings = await loadSettings(supabase);
    const invoiceDate = body.invoice_date || today();
    const dueDays = Number(settings.default_due_days || 0);
    const defaultDue = new Date(`${invoiceDate}T12:00:00Z`);
    defaultDue.setUTCDate(defaultDue.getUTCDate() + dueDays);
    const dueDate = body.due_date === null ? null : body.due_date || defaultDue.toISOString().slice(0, 10);
    const dateError = validateDates(invoiceDate, dueDate);
    if (dateError) return NextResponse.json({ error: dateError }, { status: 400 });

    const items = normalizeItems(body.items || []);
    const discountType = body.discount_type || "none";
    const discountValue = Math.max(0, Number(body.discount_value || 0));
    const taxEnabled = body.tax_enabled ?? settings.default_tax_enabled ?? true;
    const taxRateBps = body.tax_rate_bps ?? Number(settings.default_tax_bps || 0);
    const totals = calculateInvoiceTotals({
      items,
      discountType,
      discountValue,
      taxEnabled,
      taxRateBps,
    });

    const { data: created, error: insertError } = await supabase
      .from("crm_invoices")
      .insert({
        customer_id: body.customer_id,
        billing_address_id: body.billing_address_id || null,
        service_address_id: body.service_address_id || null,
        invoice_date: invoiceDate,
        service_date: body.service_date || null,
        due_date: dueDate,
        notes: body.notes ?? settings.default_customer_note ?? null,
        currency: settings.default_currency || "CAD",
        discount_type: discountType,
        discount_value: discountValue,
        discount_cents: 0,
        discount_reason: encodeDiscountReason(body.discount_reason, body.show_discount_reason),
        tax_enabled: taxEnabled,
        tax_rate_bps: totals.tax_rate_bps,
        taxable_subtotal_cents: 0,
        subtotal_cents: 0,
        tax_cents: 0,
        total_cents: 0,
        created_by: actor.userId,
      })
      .select("*")
      .single();
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });

    await replaceItems(supabase, created.id, items);
    const { error: totalError } = await supabase
      .from("crm_invoices")
      .update(totals)
      .eq("id", created.id);
    if (totalError) return NextResponse.json({ error: totalError.message }, { status: 400 });

    await supabase.from("crm_invoice_events").insert({ invoice_id: created.id, event_type: "created", created_by: actor.userId });
    await writeCrmAudit(supabase, {
      entity_type: "crm_invoices",
      entity_id: created.id,
      action: "create_draft",
      after: { ...created, ...totals, items },
      actor_id: actor.userId,
    });
    const { data: invoice, error: fetchError } = await loadInvoice(supabase, created.id);
    if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 400 });
    return NextResponse.json({ invoice });
  } catch (err) {
    console.error("CRM invoices POST failed:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unable to create invoice." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, { bucket: "crm-invoices-patch", limit: 90, windowSeconds: 60 });
  if (securityError) return securityError;
  const { actor, supabase, error, status } = await getCrmActor();
  if (!actor) return NextResponse.json({ error }, { status });

  try {
    const body = (await request.json()) as InvoiceBody;
    if (!body.id) return NextResponse.json({ error: "Invoice id is required." }, { status: 400 });
    const { data: existing, error: existingError } = await loadInvoice(supabase, body.id);
    if (existingError || !existing) return NextResponse.json({ error: existingError?.message || "Invoice not found." }, { status: 404 });

    if (body.action === "add_internal_note") {
      const note = body.note?.trim();
      if (!note) return NextResponse.json({ error: "Internal note is required." }, { status: 400 });
      const { data, error: noteError } = await supabase
        .from("crm_invoice_internal_notes")
        .insert({ invoice_id: body.id, note, created_by: actor.userId })
        .select("*")
        .single();
      if (noteError) return NextResponse.json({ error: noteError.message }, { status: 400 });
      await writeCrmAudit(supabase, { entity_type: "crm_invoice_internal_notes", entity_id: data.id, action: "create", after: data, actor_id: actor.userId });
      return NextResponse.json({ internal_note: data });
    }

    if (body.action === "issue") {
      if (existing.status !== "draft") return NextResponse.json({ error: "This invoice is already issued." }, { status: 400 });
      const settings = await loadSettings(supabase);
      if (!existing.customer_id) return NextResponse.json({ error: "Select a customer before issuing." }, { status: 400 });
      if (!existing.crm_invoice_items?.length) return NextResponse.json({ error: "Add at least one valid service line before issuing." }, { status: 400 });
      const dateError = validateDates(existing.invoice_date, existing.due_date);
      if (dateError) return NextResponse.json({ error: dateError }, { status: 400 });
      if (existing.tax_enabled && Number(existing.tax_rate_bps || 0) > 0 && !settings.tax_number?.trim()) {
        return NextResponse.json({ error: "Add the company GST number in CRM Settings before issuing a GST invoice." }, { status: 400 });
      }
      const duplicates = await findPossibleDuplicates(
        supabase,
        existing,
        Math.max(0, Number(settings.duplicate_invoice_window_days || 7)),
      );
      if (duplicates.length && !body.confirm_duplicate) {
        return NextResponse.json(
          { error: "A similar invoice may already exist.", code: "POSSIBLE_DUPLICATE_INVOICE", duplicates },
          { status: 409 },
        );
      }
      const { data, error: rpcError } = await supabase.rpc("crm_issue_invoice", { p_invoice_id: body.id });
      if (rpcError) return NextResponse.json({ error: rpcError.message }, { status: 400 });
      return NextResponse.json({ invoice: data });
    }

    if (body.action === "void") {
      const reason = body.void_reason?.trim();
      if (!reason) return NextResponse.json({ error: "Enter a void reason first." }, { status: 400 });
      const { data, error: rpcError } = await supabase.rpc("crm_void_invoice", { p_invoice_id: body.id, p_reason: reason });
      if (rpcError) return NextResponse.json({ error: rpcError.message }, { status: 400 });
      return NextResponse.json({ invoice: data });
    }

    if (body.action === "send" || body.action === "remind") {
      return sendInvoice(supabase, actor.userId, body, body.action === "remind");
    }

    if (existing.status !== "draft" && !existing.is_void) {
      return NextResponse.json({ error: "Issued invoices cannot be edited. Create a correction instead." }, { status: 400 });
    }

    const settings = await loadSettings(supabase);
    const invoiceDate = body.invoice_date ?? existing.invoice_date ?? today();
    const dueDate = body.due_date === undefined ? existing.due_date : body.due_date;
    const dateError = validateDates(invoiceDate, dueDate);
    if (dateError) return NextResponse.json({ error: dateError }, { status: 400 });
    const items = normalizeItems(body.items || existing.crm_invoice_items || []);
    const discountType = body.discount_type ?? existing.discount_type ?? "none";
    const discountValue = Math.max(0, Number(body.discount_value ?? existing.discount_value ?? 0));
    const taxEnabled = body.tax_enabled ?? existing.tax_enabled ?? settings.default_tax_enabled ?? true;
    const taxRateBps = body.tax_rate_bps ?? existing.tax_rate_bps ?? Number(settings.default_tax_bps || 0);
    const totals = calculateInvoiceTotals({ items, discountType, discountValue, taxEnabled, taxRateBps });

    if (body.items) await replaceItems(supabase, body.id, items);
    const updates = {
      customer_id: body.customer_id || existing.customer_id,
      billing_address_id: body.billing_address_id === undefined ? existing.billing_address_id : body.billing_address_id,
      service_address_id: body.service_address_id === undefined ? existing.service_address_id : body.service_address_id,
      invoice_date: invoiceDate,
      service_date: body.service_date === undefined ? existing.service_date : body.service_date,
      due_date: dueDate,
      notes: body.notes === undefined ? existing.notes : body.notes,
      discount_type: discountType,
      discount_value: discountValue,
      discount_reason:
        body.discount_reason === undefined
          ? existing.discount_reason
          : encodeDiscountReason(body.discount_reason, body.show_discount_reason),
      tax_enabled: taxEnabled,
      ...totals,
    };
    const { error: updateError } = await supabase.from("crm_invoices").update(updates).eq("id", body.id);
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });

    await writeCrmAudit(supabase, { entity_type: "crm_invoices", entity_id: body.id, action: "draft_update", before: existing, after: { ...updates, items }, actor_id: actor.userId });
    const { data: invoice, error: fetchError } = await loadInvoice(supabase, body.id);
    if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 400 });
    return NextResponse.json({ invoice });
  } catch (err) {
    console.error("CRM invoices PATCH failed:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unable to update invoice." }, { status: 500 });
  }
}

async function replaceItems(
  supabase: Awaited<ReturnType<typeof getCrmActor>>["supabase"],
  invoiceId: string,
  items: ReturnType<typeof normalizeItems>,
) {
  const { data: existing, error: existingError } = await supabase.from("crm_invoice_items").select("id").eq("invoice_id", invoiceId);
  if (existingError) throw existingError;
  const keepIds = new Set(items.map((item) => item.id).filter(Boolean));
  const toDelete = (existing || []).filter((row) => !keepIds.has(row.id)).map((row) => row.id);
  if (toDelete.length) {
    const { error } = await supabase.from("crm_invoice_items").delete().in("id", toDelete);
    if (error) throw error;
  }
  for (const [position, item] of items.entries()) {
    const payload = {
      invoice_id: invoiceId,
      position,
      description: item.description,
      details: item.details,
      quantity: item.quantity,
      unit_label: item.unit_label,
      unit_cents: item.unit_cents,
      line_total_cents: lineTotalCents(item.quantity, item.unit_cents),
      taxable: item.taxable,
      updated_at: new Date().toISOString(),
    };
    if (item.id) {
      const { error } = await supabase.from("crm_invoice_items").update(payload).eq("id", item.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("crm_invoice_items").insert(payload);
      if (error) throw error;
    }
  }
}

async function sendInvoice(
  supabase: Awaited<ReturnType<typeof getCrmActor>>["supabase"],
  userId: string,
  body: InvoiceBody,
  reminder = false,
) {
  const { data: invoice, error } = await supabase
    .from("crm_invoices")
    .select("*, crm_customers(display_name, email, phone, crm_customer_addresses(*)), crm_invoice_items(*), crm_payments(*)")
    .eq("id", body.id)
    .single();
  if (error || !invoice) return NextResponse.json({ error: error?.message || "Invoice not found." }, { status: 400 });
  if (invoice.status === "draft" || invoice.is_void) return NextResponse.json({ error: "Issue the invoice before sending." }, { status: 400 });
  const to = (body.to_email?.trim() || invoice.crm_customers?.email || "").trim();
  const result = await deliverLoggedInvoiceEmail({ supabase, userId, invoice, to, reminder });
  if (!result.ok) {
    return NextResponse.json({ ok: false, logged: "logged" in result ? result.logged : false, error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, delivered: true, email_id: result.email_id });
}
