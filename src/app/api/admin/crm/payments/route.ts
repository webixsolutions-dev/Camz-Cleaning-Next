import { dollarsToCents } from "@/lib/crm/services/invoiceCalc";
import { getCrmActor } from "@/lib/crm/staff";
import { enforceMutationSecurity } from "@/lib/security/http";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, { bucket: "crm-payments-post", limit: 60, windowSeconds: 60 });
  if (securityError) return securityError;
  const { actor, supabase, error, status } = await getCrmActor();
  if (!actor) return NextResponse.json({ error }, { status });

  try {
    const body = await request.json();
    const invoiceId = String(body.invoice_id || "").trim();
    const amountFromCents = Number(body.amount_cents);
    const amount =
      Number.isFinite(amountFromCents) && amountFromCents > 0
        ? Math.trunc(amountFromCents)
        : dollarsToCents(body.amount_dollars || "");
    if (!invoiceId) {
      return NextResponse.json({ error: "Open a saved invoice, issue it, then record the payment." }, { status: 400 });
    }
    if (amount == null || amount <= 0) {
      return NextResponse.json({ error: "Enter a payment amount like 150 or 150.00" }, { status: 400 });
    }

    const { data, error: rpcError } = await supabase.rpc("crm_record_payment", {
      p_invoice_id: invoiceId,
      p_amount_cents: amount,
      p_method: body.method || "e_transfer",
      p_reference: body.reference || null,
      p_notes: body.notes || null,
      p_is_deposit: Boolean(body.is_deposit),
    });

    if (!rpcError) {
      return NextResponse.json({ payment: data });
    }

    const rpcMissing = /could not find the function|does not exist|PGRST202/i.test(rpcError.message || "");
    if (!rpcMissing) {
      console.error("CRM payment record failed:", rpcError);
      return NextResponse.json({ error: rpcError.message }, { status: 400 });
    }

    const { data: invoice, error: invoiceError } = await supabase
      .from("crm_invoices")
      .select("id, status, is_void, currency")
      .eq("id", invoiceId)
      .maybeSingle();
    if (invoiceError) return NextResponse.json({ error: invoiceError.message }, { status: 400 });
    if (!invoice) return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    if (invoice.is_void || invoice.status === "draft") {
      return NextResponse.json({ error: "Payments can only be recorded on issued invoices." }, { status: 400 });
    }

    const { data: inserted, error: insertError } = await supabase
      .from("crm_payments")
      .insert({
        invoice_id: invoiceId,
        amount_cents: amount,
        currency: invoice.currency,
        method: body.method || "e_transfer",
        received_at: body.received_at || new Date().toISOString(),
        reference: body.reference || null,
        notes: body.notes || null,
        is_deposit: Boolean(body.is_deposit),
        created_by: actor.userId,
      })
      .select("*")
      .single();
    if (insertError) {
      console.error("CRM payment insert failed:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }
    return NextResponse.json({ payment: inserted });
  } catch (err) {
    console.error("CRM payments POST failed:", err);
    return NextResponse.json({ error: "Unable to record payment." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, { bucket: "crm-payments-patch", limit: 60, windowSeconds: 60 });
  if (securityError) return securityError;
  const { actor, supabase, error, status } = await getCrmActor();
  if (!actor) return NextResponse.json({ error }, { status });
  if (!actor.isAdmin) return NextResponse.json({ error: "Only an admin can void a payment." }, { status: 403 });

  try {
    const body = await request.json();
    if (!body.id) return NextResponse.json({ error: "Payment id is required." }, { status: 400 });
    const { data, error: rpcError } = await supabase.rpc("crm_void_payment", {
      p_payment_id: body.id,
      p_reason: body.void_reason || "",
    });
    if (rpcError) {
      console.error("CRM payment void failed:", rpcError);
      return NextResponse.json({ error: rpcError.message }, { status: 400 });
    }
    return NextResponse.json({ payment: data });
  } catch (err) {
    console.error("CRM payments PATCH failed:", err);
    return NextResponse.json({ error: "Unable to void payment." }, { status: 500 });
  }
}
