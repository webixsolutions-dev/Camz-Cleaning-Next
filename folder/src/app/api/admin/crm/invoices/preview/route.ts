import { getCrmActor } from "@/lib/crm/staff";
import { invoiceMoneyFromItems } from "@/lib/crm/services/invoiceCalc";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { actor, supabase, error, status } = await getCrmActor();
  if (!actor) return NextResponse.json({ error }, { status });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Invoice id is required." }, { status: 400 });

  try {
    const { data, error: fetchError } = await supabase
      .from("crm_invoices")
      .select("*, crm_customers(display_name, email, phone), crm_invoice_items(*)")
      .eq("id", id)
      .maybeSingle();
    if (fetchError) {
      console.error("CRM preview failed:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 400 });
    }
    if (!data) return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    const money = invoiceMoneyFromItems(data.crm_invoice_items || [], data.tax_cents);
    return NextResponse.json({ invoice: { ...data, ...money } });
  } catch (err) {
    console.error("CRM preview GET failed:", err);
    return NextResponse.json({ error: "Unable to preview invoice." }, { status: 500 });
  }
}
