import { dollarsToCents, lineTotalCents } from "@/lib/crm/services/invoiceCalc";
import { deliverLoggedInvoiceEmail } from "@/lib/crm/services/email";
import { getCrmActor } from "@/lib/crm/staff";
import { enforceMutationSecurity } from "@/lib/security/http";
import { NextRequest, NextResponse } from "next/server";

type ItemInput = {
  id?: string;
  description?: string;
  quantity?: number;
  unit_cents?: number;
  unit_dollars?: string;
};

type InvoiceBody = {
  id?: string;
  action?: "save" | "issue" | "send" | "remind" | "void";
  customer_id?: string;
  billing_address_id?: string | null;
  due_date?: string | null;
  notes?: string;
  tax_cents?: number;
  tax_dollars?: string;
  items?: ItemInput[];
  to_email?: string;
  void_reason?: string;
};

export async function GET(request: NextRequest) {
  const { actor, supabase, error, status } = await getCrmActor();
  if (!actor) return NextResponse.json({ error }, { status });

  try {
    const id = new URL(request.url).searchParams.get("id");
    let query = supabase
      .from("crm_invoices")
      .select("*, crm_customers(display_name, email, phone), crm_invoice_items(*), crm_payments(*), crm_invoice_events(*), crm_invoice_emails(*), crm_invoice_revisions(*)")
      .order("created_at", { ascending: false });

    if (id) query = query.eq("id", id);

    const { data, error: fetchError } = await query;
    if (fetchError) {
      console.error("CRM invoices fetch failed:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 400 });
    }

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

    let { data: settings } = await supabase
      .from("crm_company_settings")
      .select("default_currency, default_due_days, default_customer_note")
      .eq("id", 1)
      .maybeSingle();
    if (!settings) {
      const fallback = await supabase.from("crm_company_settings").select("default_currency").eq("id", 1).maybeSingle();
      settings = fallback.data as typeof settings;
    }
    const taxCents = body.tax_cents ?? dollarsToCents(body.tax_dollars || "0") ?? 0;
    const dueDays = Number(settings?.default_due_days || 0);
    const defaultDue =
      !body.due_date && dueDays > 0
        ? new Date(Date.now() + dueDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
        : null;

    const { data, error: insertError } = await supabase
      .from("crm_invoices")
      .insert({
        customer_id: body.customer_id,
        billing_address_id: body.billing_address_id || null,
        due_date: body.due_date || defaultDue,
        notes: body.notes || settings?.default_customer_note || null,
        currency: settings?.default_currency || "CAD",
        tax_cents: taxCents,
        total_cents: taxCents,
        created_by: actor.userId,
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("CRM invoice insert failed:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    await replaceItems(supabase, data.id, body.items || []);
    await supabase.from("crm_invoice_events").insert({
      invoice_id: data.id,
      event_type: "created",
      created_by: actor.userId,
    });

    const { data: invoice } = await supabase
      .from("crm_invoices")
      .select("*, crm_invoice_items(*)")
      .eq("id", data.id)
      .single();

    return NextResponse.json({ invoice });
  } catch (err) {
    console.error("CRM invoices POST failed:", err);
    return NextResponse.json({ error: "Unable to create invoice." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, { bucket: "crm-invoices-patch", limit: 60, windowSeconds: 60 });
  if (securityError) return securityError;
  const { actor, supabase, error, status } = await getCrmActor();
  if (!actor) return NextResponse.json({ error }, { status });

  try {
    const body = (await request.json()) as InvoiceBody;
    if (!body.id) return NextResponse.json({ error: "Invoice id is required." }, { status: 400 });

    const { data: existing } = await supabase
      .from("crm_invoices")
      .select("id, status, is_void")
      .eq("id", body.id)
      .maybeSingle();

    if (existing && existing.status !== "draft" && existing.is_void === false && (!body.action || body.action === "save")) {
      return NextResponse.json({ error: "Issued invoices cannot be edited. Issue is already done — send, collect payment, or void." }, { status: 400 });
    }

    if (body.action === "issue") {
      if (existing?.status && existing.status !== "draft") {
        return NextResponse.json({ error: "This invoice is already issued. Use Send or Record payment." }, { status: 400 });
      }
      const { data, error: rpcError } = await supabase.rpc("crm_issue_invoice", { p_invoice_id: body.id });
      if (rpcError) {
        console.error("CRM issue failed:", rpcError);
        return NextResponse.json({ error: rpcError.message }, { status: 400 });
      }
      return NextResponse.json({ invoice: data });
    }

    if (body.action === "void") {
      if (!actor.isAdmin) return NextResponse.json({ error: "Only an admin can void an invoice." }, { status: 403 });
      const reason = body.void_reason?.trim();
      if (!reason) {
        return NextResponse.json({ error: "Enter a void reason first. Void cancels the invoice without deleting it." }, { status: 400 });
      }
      const { data, error: rpcError } = await supabase.rpc("crm_void_invoice", {
        p_invoice_id: body.id,
        p_reason: reason,
      });
      if (rpcError) {
        console.error("CRM void failed:", rpcError);
        return NextResponse.json({ error: rpcError.message }, { status: 400 });
      }
      return NextResponse.json({ invoice: data });
    }

    if (body.action === "send" || body.action === "remind") {
      return sendInvoice(supabase, actor.userId, body, body.action === "remind");
    }

    const updates: Record<string, unknown> = {};
    if (body.customer_id) updates.customer_id = body.customer_id;
    if (body.billing_address_id !== undefined) updates.billing_address_id = body.billing_address_id;
    if (body.due_date !== undefined) updates.due_date = body.due_date;
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.tax_cents !== undefined || body.tax_dollars !== undefined) {
      const taxCents = body.tax_cents ?? dollarsToCents(body.tax_dollars || "0") ?? 0;
      const { data: current, error: currentError } = await supabase
        .from("crm_invoices")
        .select("subtotal_cents")
        .eq("id", body.id)
        .maybeSingle();
      if (currentError) {
        console.error("CRM invoice tax lookup failed:", currentError);
        return NextResponse.json({ error: currentError.message }, { status: 400 });
      }
      updates.tax_cents = taxCents;
      updates.total_cents = Number(current?.subtotal_cents || 0) + taxCents;
    }

    if (Object.keys(updates).length) {
      const { error: updateError } = await supabase.from("crm_invoices").update(updates).eq("id", body.id);
      if (updateError) {
        console.error("CRM invoice update failed:", updateError);
        return NextResponse.json({ error: updateError.message }, { status: 400 });
      }
    }

    if (body.items) await replaceItems(supabase, body.id, body.items);
    const { error: moneyError } = await supabase.rpc("crm_apply_invoice_money", { p_invoice_id: body.id });
    if (moneyError) {
      console.error("CRM invoice money recalc failed:", moneyError);
      return NextResponse.json({ error: moneyError.message }, { status: 400 });
    }

    const { data: invoice, error: fetchError } = await supabase
      .from("crm_invoices")
      .select("*, crm_invoice_items(*)")
      .eq("id", body.id)
      .single();
    if (fetchError) {
      console.error("CRM invoice reload failed:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 400 });
    }

    return NextResponse.json({ invoice });
  } catch (err) {
    console.error("CRM invoices PATCH failed:", err);
    return NextResponse.json({ error: "Unable to update invoice." }, { status: 500 });
  }
}

async function replaceItems(
  supabase: Awaited<ReturnType<typeof getCrmActor>>["supabase"],
  invoiceId: string,
  items: ItemInput[],
) {
  const { data: existing, error: existingError } = await supabase
    .from("crm_invoice_items")
    .select("id")
    .eq("invoice_id", invoiceId);
  if (existingError) {
    console.error("CRM items load failed:", existingError);
    throw existingError;
  }

  const keepIds = new Set(items.map((item) => item.id).filter(Boolean));
  const toDelete = (existing || []).filter((row) => !keepIds.has(row.id)).map((row) => row.id);
  if (toDelete.length) {
    const { error: deleteError } = await supabase.from("crm_invoice_items").delete().in("id", toDelete);
    if (deleteError) {
      console.error("CRM items delete failed:", deleteError);
      throw deleteError;
    }
  }

  for (const [index, item] of items.entries()) {
    const unit = item.unit_cents ?? dollarsToCents(item.unit_dollars || "0");
    if (!item.description?.trim() || unit == null) continue;
    const quantity = Math.max(1, Math.floor(Number(item.quantity || 1)));
    const payload = {
      invoice_id: invoiceId,
      position: index,
      description: item.description.trim(),
      quantity,
      unit_cents: unit,
      line_total_cents: lineTotalCents(quantity, unit),
    };
    if (item.id) {
      const { error } = await supabase.from("crm_invoice_items").update(payload).eq("id", item.id);
      if (error) {
        console.error("CRM item update failed:", error);
        throw error;
      }
    } else {
      const { error } = await supabase.from("crm_invoice_items").insert(payload);
      if (error) {
        console.error("CRM item insert failed:", error);
        throw error;
      }
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

  if (error || !invoice) {
    console.error("CRM send load failed:", error);
    return NextResponse.json({ error: error?.message || "Invoice not found." }, { status: 400 });
  }
  if (invoice.status === "draft" || invoice.is_void) {
    return NextResponse.json({ error: "Issue the invoice before sending." }, { status: 400 });
  }

  const to = (body.to_email?.trim() || invoice.crm_customers?.email || "").trim();
  const result = await deliverLoggedInvoiceEmail({
    supabase,
    userId,
    invoice,
    to,
    reminder,
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, logged: "logged" in result ? result.logged : false, error: result.error },
      { status: 400 },
    );
  }
  return NextResponse.json({ ok: true, delivered: true, email_id: result.email_id });
}
