import { getCrmActor } from "@/lib/crm/staff";
import { NextResponse } from "next/server";

export async function GET() {
  const { actor, supabase, error, status } = await getCrmActor();
  if (!actor) return NextResponse.json({ error }, { status });

  try {
    const { data: invoices, error: invoiceError } = await supabase
      .from("crm_invoices")
      .select("status, is_void, total_cents, amount_paid_cents, balance_cents");
    if (invoiceError) {
      console.error("CRM reports invoices failed:", invoiceError);
      return NextResponse.json({ error: invoiceError.message }, { status: 400 });
    }

    const { data: payments, error: paymentError } = await supabase
      .from("crm_payments")
      .select("amount_cents, is_void");
    if (paymentError) {
      console.error("CRM reports payments failed:", paymentError);
      return NextResponse.json({ error: paymentError.message }, { status: 400 });
    }

    const list = invoices || [];
    const collected = (payments || []).filter((row) => !row.is_void).reduce((sum, row) => sum + Number(row.amount_cents || 0), 0);
    const byStatus: Record<string, number> = {};
    for (const invoice of list) {
      const key = invoice.is_void ? "void" : invoice.status;
      byStatus[key] = (byStatus[key] || 0) + 1;
    }

    return NextResponse.json({
      invoice_count: list.length,
      issued_count: list.filter((row) => !row.is_void && row.status !== "draft").length,
      open_balance_cents: list.filter((row) => !row.is_void).reduce((sum, row) => sum + Number(row.balance_cents || 0), 0),
      collected_cents: collected,
      by_status: byStatus,
    });
  } catch (err) {
    console.error("CRM reports GET failed:", err);
    return NextResponse.json({ error: "Unable to load reports." }, { status: 500 });
  }
}
