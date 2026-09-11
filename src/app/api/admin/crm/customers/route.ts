import { normalizeAddress } from "@/lib/crm/services/address";
import { writeCrmAudit } from "@/lib/crm/services/audit";
import { normalizeCustomerCode } from "@/lib/customers/customerCode";
import { enforceMutationSecurity } from "@/lib/security/http";
import { getCrmActor } from "@/lib/crm/staff";
import { NextRequest, NextResponse } from "next/server";

type CustomerBody = {
  id?: string;
  display_name?: string;
  legal_name?: string;
  email?: string;
  phone?: string;
  notes?: string;
  is_active?: boolean;
  user_id?: string | null;
  address?: {
    id?: string;
    label?: string;
    line1?: string;
    line2?: string;
    city?: string;
    province?: string;
    postal_code?: string;
    country?: string;
    is_billing?: boolean;
    is_service?: boolean;
  };
};

export async function GET(request: NextRequest) {
  const { actor, supabase, error, status } = await getCrmActor();
  if (!actor) return NextResponse.json({ error }, { status });
  const code = normalizeCustomerCode(new URL(request.url).searchParams.get("code") || "");

  try {
    let query = supabase.from("crm_customers").select("*, crm_customer_addresses(*)");
    if (code) {
      const { data, error: fetchError } = await query.eq("customer_code", code).maybeSingle();
      if (fetchError) {
        console.error("CRM customer lookup failed:", fetchError);
        return NextResponse.json({ error: fetchError.message }, { status: 400 });
      }
      if (!data) return NextResponse.json({ error: "No CRM customer found for that ID." }, { status: 404 });
      return NextResponse.json({ customer: data, customers: [data] });
    }

    const { data, error: fetchError } = await query.order("created_at", { ascending: false });

    if (fetchError) {
      console.error("CRM customers fetch failed:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 400 });
    }

    return NextResponse.json({ customers: data || [] });
  } catch (err) {
    console.error("CRM customers GET failed:", err);
    return NextResponse.json({ error: "Unable to load customers." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, { bucket: "crm-customers-post", limit: 60, windowSeconds: 60 });
  if (securityError) return securityError;

  const { actor, supabase, error, status } = await getCrmActor();
  if (!actor) return NextResponse.json({ error }, { status });

  try {
    const body = (await request.json()) as CustomerBody;
    const display_name = body.display_name?.trim();
    const email = body.email?.trim().toLowerCase() || "";
    if (!display_name) return NextResponse.json({ error: "Customer name is required." }, { status: 400 });
    if (!email) return NextResponse.json({ error: "Customer email is required." }, { status: 400 });

    const { data: existing } = await supabase
      .from("crm_customers")
      .select("id")
      .ilike("email", email)
      .maybeSingle();

    if (existing) {
      const { data, error: updateError } = await supabase
        .from("crm_customers")
        .update({
          display_name,
          legal_name: body.legal_name?.trim() || null,
          email,
          phone: body.phone?.trim() || null,
          notes: body.notes?.trim() || null,
          is_active: body.is_active !== false,
          user_id: body.user_id || undefined,
        })
        .eq("id", existing.id)
        .select("*")
        .single();
      if (updateError) {
        console.error("CRM customer link update failed:", updateError);
        return NextResponse.json({ error: updateError.message }, { status: 400 });
      }
      const address = body.address ? normalizeAddress(body.address) : null;
      if (address) {
        await supabase.from("crm_customer_addresses").insert({ customer_id: data.id, ...address });
      }
      await writeCrmAudit(supabase, {
        entity_type: "crm_customers",
        entity_id: data.id,
        action: "link",
        after: data,
        actor_id: actor.userId,
      });
      return NextResponse.json({ customer: data, linked: true });
    }

    const { data, error: insertError } = await supabase
      .from("crm_customers")
      .insert({
        display_name,
        legal_name: body.legal_name?.trim() || null,
        email,
        phone: body.phone?.trim() || null,
        notes: body.notes?.trim() || null,
        is_active: body.is_active !== false,
        user_id: body.user_id || null,
        created_by: actor.userId,
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("CRM customer insert failed:", insertError);
      const message = /row-level security policy for table \"customer_code_/i.test(insertError.message)
        ? "Customer ID generator is blocked by database security. Run supabase/migrations/20260912_customer_code_rls_fix.sql in the SQL Editor, then try again."
        : insertError.message;
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const address = body.address ? normalizeAddress(body.address) : null;
    if (address) {
      const { error: addressError } = await supabase.from("crm_customer_addresses").insert({
        customer_id: data.id,
        ...address,
      });
      if (addressError) console.error("CRM address insert failed:", addressError);
    }

    await writeCrmAudit(supabase, {
      entity_type: "crm_customers",
      entity_id: data.id,
      action: "create",
      after: data,
      actor_id: actor.userId,
    });

    return NextResponse.json({ customer: data });
  } catch (err) {
    console.error("CRM customers POST failed:", err);
    return NextResponse.json({ error: "Unable to create customer." }, { status: 500 });
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

    const updates: Record<string, unknown> = {};
    if (body.display_name !== undefined) updates.display_name = body.display_name.trim();
    if (body.legal_name !== undefined) updates.legal_name = body.legal_name.trim() || null;
    if (body.email !== undefined) {
      const email = body.email.trim();
      if (!email) return NextResponse.json({ error: "Customer email is required." }, { status: 400 });
      updates.email = email;
    }
    if (body.phone !== undefined) updates.phone = body.phone.trim() || null;
    if (body.notes !== undefined) updates.notes = body.notes.trim() || null;
    if (body.is_active !== undefined) updates.is_active = body.is_active;
    if (body.user_id !== undefined) updates.user_id = body.user_id || null;

    const { data, error: updateError } = await supabase
      .from("crm_customers")
      .update(updates)
      .eq("id", body.id)
      .select("*")
      .single();

    if (updateError) {
      console.error("CRM customer update failed:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    const address = body.address ? normalizeAddress(body.address) : null;
    if (address) {
      const payload = { customer_id: body.id, ...address };
      if (body.address?.id) {
        const { error: addressError } = await supabase.from("crm_customer_addresses").update(payload).eq("id", body.address.id);
        if (addressError) console.error("CRM address update failed:", addressError);
      } else {
        const { error: addressError } = await supabase.from("crm_customer_addresses").insert(payload);
        if (addressError) console.error("CRM address insert failed:", addressError);
      }
    }

    await writeCrmAudit(supabase, {
      entity_type: "crm_customers",
      entity_id: data.id,
      action: "update",
      after: data,
      actor_id: actor.userId,
    });

    return NextResponse.json({ customer: data });
  } catch (err) {
    console.error("CRM customers PATCH failed:", err);
    return NextResponse.json({ error: "Unable to update customer." }, { status: 500 });
  }
}
