import { getInvoiceActor } from "@/lib/crm/staff";
import { NextResponse } from "next/server";

export async function GET() {
  const { actor, supabase, error, status } = await getInvoiceActor();
  if (!actor) return NextResponse.json({ error }, { status });

  try {
    const [{ data: customers, error: customersError }, { data: settings, error: settingsError }] = await Promise.all([
      supabase
        .from("crm_customers")
        .select("*, crm_customer_addresses(*)")
        .order("created_at", { ascending: false }),
      supabase
        .from("crm_company_settings")
        .select("default_currency, default_due_days, default_customer_note, default_tax_enabled, default_tax_bps, tax_number")
        .eq("id", 1)
        .maybeSingle(),
    ]);

    if (customersError) return NextResponse.json({ error: customersError.message }, { status: 400 });
    if (settingsError) return NextResponse.json({ error: settingsError.message }, { status: 400 });

    return NextResponse.json({
      customers: customers || [],
      settings: settings || {},
    });
  } catch (caught) {
    console.error("Invoice bootstrap failed:", caught);
    return NextResponse.json({ error: "Unable to load invoice setup data." }, { status: 500 });
  }
}
