import { normalizeAddress, type AddressInput } from "@/lib/crm/address";
import { writeCrmAudit } from "@/lib/crm/services/audit";
import { normalizeCustomerCode } from "@/lib/customers/customerCode";
import { enforceMutationSecurity } from "@/lib/security/http";
import { getCrmActor } from "@/lib/crm/staff";
import { NextRequest, NextResponse } from "next/server";

type CustomerBody = {
  action?: "save_address" | "add_note";
  id?: string;
  customer_id?: string;
  display_name?: string;
  legal_name?: string;
  email?: string;
  phone?: string;
  notes?: string;
  note?: string;
  is_active?: boolean;
  user_id?: string | null;
  confirm_duplicate?: boolean;
  address?: AddressInput;
};

type CustomerRow = {
  id: string;
  display_name: string;
  email: string | null;
  phone: string | null;
  [key: string]: unknown;
};

function cleanPhone(value?: string | null) {
  return String(value || "").replace(/\D/g, "");
}

function cleanEmail(value?: string | null) {
  return String(value || "").trim().toLowerCase();
}

async function findDuplicates(
  supabase: Awaited<ReturnType<typeof getCrmActor>>["supabase"],
  email: string,
  phone: string,
  excludeId?: string,
) {
  if (!email && !phone) return [];
  const { data, error } = await supabase
    .from("crm_customers")
    .select("id, customer_code, display_name, email, phone")
    .order("created_at", { ascending: false });
  if (error) throw error;
  const normalizedPhone = cleanPhone(phone);
  return ((data || []) as CustomerRow[]).filter((row) => {
    if (row.id === excludeId) return false;
    return Boolean(
      (email && cleanEmail(row.email) === email) ||
      (normalizedPhone && cleanPhone(row.phone) === normalizedPhone),
    );
  });
}

async function saveAddress(
  supabase: Awaited<ReturnType<typeof getCrmActor>>["supabase"],
  customerId: string,
  input: AddressInput,
) {
  const address = normalizeAddress(input);
  if (!address) throw new Error("Street address is required.");

  if (address.is_billing) {
    const { error } = await supabase
      .from("crm_customer_addresses")
      .update({ is_billing: false })
      .eq("customer_id", customerId)
      .eq("is_billing", true);
    if (error) throw error;
  }

  if (input.id) {
    const { data, error } = await supabase
      .from("crm_customer_addresses")
      .update({ ...address, updated_at: new Date().toISOString() })
      .eq("id", input.id)
      .eq("customer_id", customerId)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from("crm_customer_addresses")
    .insert({ customer_id: customerId, ...address })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

async function loadCustomerDetail(
  supabase: Awaited<ReturnType<typeof getCrmActor>>["supabase"],
  id: string,
) {
  const [customerResult, invoiceResult, notesResult] = await Promise.all([
    supabase.from("crm_customers").select("*, crm_customer_addresses(*)").eq("id", id).single(),
    supabase
      .from("crm_invoices")
      .select("id, invoice_number, status, invoice_date, service_date, due_date, total_cents, amount_paid_cents, balance_cents, is_void, created_at, crm_payments(id, amount_cents, method, reference, received_at, is_void)")
      .eq("customer_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("crm_customer_internal_notes")
      .select("id, note, created_at, edited_at, created_by")
      .eq("customer_id", id)
      .order("created_at", { ascending: false }),
  ]);
  if (customerResult.error) throw customerResult.error;
  if (invoiceResult.error) throw invoiceResult.error;
  if (notesResult.error) throw notesResult.error;

  const invoices = invoiceResult.data || [];
  const billable = invoices.filter((invoice) => !invoice.is_void && !["draft", "void", "cancelled"].includes(invoice.status));
  return {
    customer: customerResult.data,
    invoices,
    internal_notes: notesResult.data || [],
    profile: {
      invoice_count: billable.length,
      total_billed_cents: billable.reduce((sum, invoice) => sum + Number(invoice.total_cents || 0), 0),
      total_paid_cents: billable.reduce((sum, invoice) => sum + Number(invoice.amount_paid_cents || 0), 0),
      outstanding_cents: billable.reduce((sum, invoice) => sum + Number(invoice.balance_cents || 0), 0),
      last_invoice_date: billable[0]?.invoice_date || billable[0]?.created_at || null,
      last_service_date: billable.find((invoice) => invoice.service_date)?.service_date || null,
    },
  };
}

export async function GET(request: NextRequest) {
  const { actor, supabase, error, status } = await getCrmActor();
  if (!actor) return NextResponse.json({ error }, { status });
  const params = new URL(request.url).searchParams;
  const code = normalizeCustomerCode(params.get("code") || "");
  const id = params.get("id") || "";

  try {
    if (id) return NextResponse.json(await loadCustomerDetail(supabase, id));
    let query = supabase.from("crm_customers").select("*, crm_customer_addresses(*)");
    if (code) {
      const { data, error: fetchError } = await query.eq("customer_code", code).maybeSingle();
      if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 400 });
      if (!data) return NextResponse.json({ error: "No CRM customer found for that ID." }, { status: 404 });
      return NextResponse.json({ customer: data, customers: [data] });
    }
    const { data, error: fetchError } = await query.order("created_at", { ascending: false });
    if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 400 });
    return NextResponse.json({ customers: data || [] });
  } catch (err) {
    console.error("CRM customers GET failed:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unable to load customers." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, { bucket: "crm-customers-post", limit: 60, windowSeconds: 60 });
  if (securityError) return securityError;
  const { actor, supabase, error, status } = await getCrmActor();
  if (!actor) return NextResponse.json({ error }, { status });

  try {
    const body = (await request.json()) as CustomerBody;
    if (body.action === "add_note") {
      const customerId = body.customer_id?.trim();
      const note = body.note?.trim();
      if (!customerId || !note) return NextResponse.json({ error: "Customer and note are required." }, { status: 400 });
      const { data, error: noteError } = await supabase
        .from("crm_customer_internal_notes")
        .insert({ customer_id: customerId, note, created_by: actor.userId })
        .select("id, note, created_at, edited_at, created_by")
        .single();
      if (noteError) return NextResponse.json({ error: noteError.message }, { status: 400 });
      await writeCrmAudit(supabase, { entity_type: "crm_customer_internal_notes", entity_id: data.id, action: "create", after: data, actor_id: actor.userId });
      return NextResponse.json({ internal_note: data });
    }

    if (body.action === "save_address") {
      const customerId = body.customer_id?.trim();
      if (!customerId || !body.address) return NextResponse.json({ error: "Customer and address are required." }, { status: 400 });
      const address = await saveAddress(supabase, customerId, body.address);
      await writeCrmAudit(supabase, { entity_type: "crm_customer_addresses", entity_id: address.id, action: body.address.id ? "update" : "create", after: address, actor_id: actor.userId });
      return NextResponse.json({ address });
    }

    const displayName = body.display_name?.trim();
    const email = cleanEmail(body.email) || null;
    const phone = body.phone?.trim() || null;
    if (!displayName) return NextResponse.json({ error: "Customer name is required." }, { status: 400 });
    if (!email && !phone) return NextResponse.json({ error: "Enter an email address or phone number." }, { status: 400 });
    const duplicates = await findDuplicates(supabase, email || "", phone || "");
    if (duplicates.length && !body.confirm_duplicate) {
      return NextResponse.json({ error: "A customer with the same email or phone already exists.", code: "POSSIBLE_DUPLICATE", duplicates }, { status: 409 });
    }

    const { data, error: insertError } = await supabase
      .from("crm_customers")
      .insert({ display_name: displayName, legal_name: body.legal_name?.trim() || null, email, phone, notes: body.notes?.trim() || null, is_active: body.is_active !== false, user_id: body.user_id || null, created_by: actor.userId })
      .select("*")
      .single();
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });
    let address = null;
    if (body.address?.line1?.trim()) address = await saveAddress(supabase, data.id, body.address);
    await writeCrmAudit(supabase, { entity_type: "crm_customers", entity_id: data.id, action: "create", after: data, actor_id: actor.userId });
    return NextResponse.json({ customer: { ...data, crm_customer_addresses: address ? [address] : [] } });
  } catch (err) {
    console.error("CRM customers POST failed:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unable to create customer." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, { bucket: "crm-customers-patch", limit: 60, windowSeconds: 60 });
  if (securityError) return securityError;
  const { actor, supabase, error, status } = await getCrmActor();
  if (!actor) return NextResponse.json({ error }, { status });

  try {
    const body = (await request.json()) as CustomerBody;
    if (!body.id) return NextResponse.json({ error: "Customer id is required." }, { status: 400 });
    const { data: before, error: beforeError } = await supabase.from("crm_customers").select("*").eq("id", body.id).single();
    if (beforeError) return NextResponse.json({ error: beforeError.message }, { status: 404 });

    const displayName = body.display_name?.trim();
    const email = body.email === undefined ? undefined : cleanEmail(body.email) || null;
    const phone = body.phone === undefined ? undefined : body.phone.trim() || null;
    const finalEmail = email === undefined ? cleanEmail(before?.email) || null : email;
    const finalPhone = phone === undefined ? before?.phone || null : phone;
    if (body.display_name !== undefined && !displayName) return NextResponse.json({ error: "Customer name is required." }, { status: 400 });
    if (!finalEmail && !finalPhone) return NextResponse.json({ error: "Enter an email address or phone number." }, { status: 400 });

    const duplicates = await findDuplicates(supabase, finalEmail || "", finalPhone || "", body.id);
    if (duplicates.length && !body.confirm_duplicate) {
      return NextResponse.json({ error: "Another customer has the same email or phone.", code: "POSSIBLE_DUPLICATE", duplicates }, { status: 409 });
    }

    const updates: Record<string, unknown> = {};
    if (body.display_name !== undefined) updates.display_name = displayName;
    if (body.legal_name !== undefined) updates.legal_name = body.legal_name.trim() || null;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (body.notes !== undefined) updates.notes = body.notes.trim() || null;
    if (body.is_active !== undefined) updates.is_active = body.is_active;
    if (body.user_id !== undefined) updates.user_id = body.user_id || null;
    const { data, error: updateError } = await supabase.from("crm_customers").update(updates).eq("id", body.id).select("*").single();
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });
    await writeCrmAudit(supabase, { entity_type: "crm_customers", entity_id: data.id, action: "update", before, after: data, actor_id: actor.userId });
    return NextResponse.json({ customer: data });
  } catch (err) {
    console.error("CRM customers PATCH failed:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unable to update customer." }, { status: 500 });
  }
}
