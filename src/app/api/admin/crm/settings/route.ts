import { getCrmActor } from "@/lib/crm/staff";
import { enforceMutationSecurity } from "@/lib/security/http";
import { NextRequest, NextResponse } from "next/server";

function textOrNull(value: unknown) {
  const text = String(value ?? "").trim();
  return text || null;
}

function clampInt(value: unknown, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(parsed)));
}

export async function GET() {
  const { actor, supabase, error, status } = await getCrmActor();
  if (!actor) return NextResponse.json({ error }, { status });

  try {
    const { data, error: fetchError } = await supabase.from("crm_company_settings").select("*").eq("id", 1).maybeSingle();
    if (fetchError) {
      console.error("CRM settings fetch failed:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 400 });
    }
    let settings = data;
    if (settings?.logo_asset_id && !settings.logo_url) {
      const { data: asset } = await supabase.from("crm_invoice_assets").select("public_url").eq("id", settings.logo_asset_id).maybeSingle();
      settings = { ...settings, logo_url: asset?.public_url || null };
    }
    return NextResponse.json({ settings });
  } catch (err) {
    console.error("CRM settings GET failed:", err);
    return NextResponse.json({ error: "Unable to load settings." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, { bucket: "crm-settings-patch", limit: 30, windowSeconds: 60 });
  if (securityError) return securityError;
  const { actor, supabase, error, status } = await getCrmActor();
  if (!actor) return NextResponse.json({ error }, { status });
  if (!actor.isAdmin) return NextResponse.json({ error: "Only an admin can update company settings." }, { status: 403 });

  try {
    const body = await request.json();
    const { data: current, error: currentError } = await supabase
      .from("crm_company_settings")
      .select("next_invoice_seq")
      .eq("id", 1)
      .maybeSingle();
    if (currentError) return NextResponse.json({ error: currentError.message }, { status: 400 });

    const nextSeq = clampInt(body.next_invoice_seq, Number(current?.next_invoice_seq || 1), 1, 999999999);
    if (nextSeq < Number(current?.next_invoice_seq || 1)) {
      return NextResponse.json(
        { error: "Starting invoice number cannot go backwards. Issued numbers are never reused." },
        { status: 400 },
      );
    }

    const gstPercent = body.default_gst_percent !== undefined ? Number(body.default_gst_percent) : undefined;
    const taxBps =
      gstPercent !== undefined && Number.isFinite(gstPercent)
        ? clampInt(Math.round(gstPercent * 100), 0, 0, 100000)
        : clampInt(body.default_tax_bps, 0, 0, 100000);

    const core = {
        legal_name: String(body.legal_name || "").trim() || "Camz Cleaning",
        trade_name: String(body.trade_name || body.display_name || "").trim() || "Camz Cleaning",
        email: textOrNull(body.email),
        phone: textOrNull(body.phone),
        website: textOrNull(body.website),
        address_line1: textOrNull(body.address_line1),
        city: textOrNull(body.city),
        province: textOrNull(body.province),
        postal_code: textOrNull(body.postal_code),
        tax_number: textOrNull(body.tax_number),
        default_tax_bps: taxBps,
        default_currency: String(body.default_currency || "CAD").trim() || "CAD",
        invoice_number_prefix: String(body.invoice_number_prefix || "INV").trim() || "INV",
        next_invoice_seq: nextSeq,
    };
    const extra = {
        reply_to_email: textOrNull(body.reply_to_email),
        address_line2: textOrNull(body.address_line2),
        deposit_percentage: clampInt(body.deposit_percentage, 25, 0, 100),
        e_transfer_instructions: textOrNull(body.e_transfer_instructions),
        invoice_footer_text: textOrNull(body.invoice_footer_text),
        default_customer_note: textOrNull(body.default_customer_note),
        default_due_terms: textOrNull(body.default_due_terms),
        default_due_days: clampInt(body.default_due_days, 14, 0, 365),
        timezone: String(body.timezone || "America/Edmonton").trim() || "America/Edmonton",
    };

    let { data, error: updateError } = await supabase
      .from("crm_company_settings")
      .update({ ...core, ...extra })
      .eq("id", 1)
      .select("*")
      .single();

    if (updateError && /column|schema cache/i.test(updateError.message)) {
      const fallback = await supabase.from("crm_company_settings").update(core).eq("id", 1).select("*").single();
      data = fallback.data;
      updateError = fallback.error;
    }

    if (updateError) {
      console.error("CRM settings update failed:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }
    return NextResponse.json({ settings: data });
  } catch (err) {
    console.error("CRM settings PATCH failed:", err);
    return NextResponse.json({ error: "Unable to update settings." }, { status: 500 });
  }
}
