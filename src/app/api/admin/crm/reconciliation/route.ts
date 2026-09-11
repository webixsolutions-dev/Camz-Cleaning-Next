import { getCrmActor } from "@/lib/crm/staff";
import { enforceMutationSecurity } from "@/lib/security/http";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const { actor, supabase, error, status } = await getCrmActor();
  if (!actor) return NextResponse.json({ error }, { status });

  try {
    const { data, error: fetchError } = await supabase
      .from("crm_reconciliation")
      .select("*")
      .order("period_start", { ascending: false });
    if (fetchError) {
      console.error("CRM reconciliation fetch failed:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 400 });
    }
    return NextResponse.json({ periods: data || [] });
  } catch (err) {
    console.error("CRM reconciliation GET failed:", err);
    return NextResponse.json({ error: "Unable to load reconciliation." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, { bucket: "crm-recon-post", limit: 30, windowSeconds: 60 });
  if (securityError) return securityError;
  const { actor, supabase, error, status } = await getCrmActor();
  if (!actor) return NextResponse.json({ error }, { status });

  try {
    const body = await request.json();
    if (!body.period_start || !body.period_end) {
      return NextResponse.json({ error: "Period start and end are required." }, { status: 400 });
    }

    const { data: paid } = await supabase
      .from("crm_payments")
      .select("amount_cents, received_at, is_void")
      .gte("received_at", `${body.period_start}T00:00:00.000Z`)
      .lte("received_at", `${body.period_end}T23:59:59.999Z`);

    const received = (paid || [])
      .filter((row) => !row.is_void)
      .reduce((sum, row) => sum + Number(row.amount_cents || 0), 0);

    const expected = Number(body.expected_cents || received);
    const variance = received - expected;
    const reconStatus = variance === 0 ? "matched" : "unmatched";

    const { data, error: insertError } = await supabase
      .from("crm_reconciliation")
      .insert({
        period_start: body.period_start,
        period_end: body.period_end,
        expected_cents: expected,
        received_cents: received,
        variance_cents: variance,
        status: body.status || reconStatus,
        notes: body.notes || null,
        created_by: actor.userId,
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("CRM reconciliation insert failed:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }
    return NextResponse.json({ period: data });
  } catch (err) {
    console.error("CRM reconciliation POST failed:", err);
    return NextResponse.json({ error: "Unable to create reconciliation period." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, { bucket: "crm-recon-patch", limit: 30, windowSeconds: 60 });
  if (securityError) return securityError;
  const { actor, supabase, error, status } = await getCrmActor();
  if (!actor) return NextResponse.json({ error }, { status });
  if (!actor.isAdmin) return NextResponse.json({ error: "Only an admin can close a reconciliation period." }, { status: 403 });

  try {
    const body = await request.json();
    if (!body.id) return NextResponse.json({ error: "Period id is required." }, { status: 400 });
    const { data, error: updateError } = await supabase
      .from("crm_reconciliation")
      .update({
        status: body.status,
        notes: body.notes,
      })
      .eq("id", body.id)
      .select("*")
      .single();
    if (updateError) {
      console.error("CRM reconciliation update failed:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }
    return NextResponse.json({ period: data });
  } catch (err) {
    console.error("CRM reconciliation PATCH failed:", err);
    return NextResponse.json({ error: "Unable to update reconciliation." }, { status: 500 });
  }
}
