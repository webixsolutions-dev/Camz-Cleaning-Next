import { enforceMutationSecurity } from "@/lib/security/http";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type ServicePayload = {
  resource?: "category" | "service";
  id?: string;
  name?: string;
  icon_str?: string;
  color_hex?: string;
  category_id?: string;
  title?: string;
  description?: string;
  pricing_type?: string;
  price?: string;
  hourly_rate?: string;
  tax_rate?: string;
  service_type?: string;
  bedroom_rate?: string;
  washroom_rate?: string;
  sqft_rate?: string;
  vehicle_sedan_rate?: string;
  vehicle_suv_rate?: string;
  fridge_price?: string;
  oven_price?: string;
  window_price?: string;
  has_addons?: boolean;
};

async function authorizeAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { allowed: false, supabase };
  const { data: profile } = await supabase.from("users").select("role, is_blocked").eq("id", user.id).maybeSingle();
  return { allowed: profile?.role?.toLowerCase() === "admin" && profile.is_blocked === false, supabase };
}

function nullableNumber(value: string | undefined) {
  if (value === undefined || value === "") return null;
  return value;
}

export async function POST(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, { bucket: "services-post", limit: 60, windowSeconds: 60 });
  if (securityError) return securityError;
  const { allowed, supabase } = await authorizeAdmin();
  if (!allowed) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const body = (await request.json()) as ServicePayload;
  if (body.resource === "category") {
    const name = body.name?.trim();
    if (!name) return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    const { data, error } = await supabase
      .from("categories")
      .insert({
        name,
        icon_str: body.icon_str || "sparkles",
        color_hex: body.color_hex || "FF3B82F6",
        type: "service",
      })
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ id: data.id });
  }

  if (body.resource === "service") {
    const title = body.title?.trim();
    if (!title || !body.category_id) return NextResponse.json({ error: "Service title and category are required." }, { status: 400 });
    const { data, error } = await supabase
      .from("services")
      .insert({
        category_id: body.category_id,
        title,
        description: body.description || null,
        price: nullableNumber(body.price),
        icon_str: body.icon_str || "sparkles",
        pricing_type: body.pricing_type || "fixed",
        hourly_rate: nullableNumber(body.hourly_rate),
        tax_rate: nullableNumber(body.tax_rate),
        service_type: body.service_type || null,
        bedroom_rate: nullableNumber(body.bedroom_rate),
        washroom_rate: nullableNumber(body.washroom_rate),
        sqft_rate: nullableNumber(body.sqft_rate),
        vehicle_sedan_rate: nullableNumber(body.vehicle_sedan_rate),
        vehicle_suv_rate: nullableNumber(body.vehicle_suv_rate),
        fridge_price: nullableNumber(body.fridge_price),
        oven_price: nullableNumber(body.oven_price),
        window_price: nullableNumber(body.window_price),
        is_active: true,
        has_addons: body.has_addons || false,
      })
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ id: data.id });
  }

  return NextResponse.json({ error: "Unsupported services action." }, { status: 400 });
}

export async function DELETE(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, { bucket: "services-delete", limit: 60, windowSeconds: 60 });
  if (securityError) return securityError;
  const { allowed, supabase } = await authorizeAdmin();
  if (!allowed) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const params = new URL(request.url).searchParams;
  const resource = params.get("resource");
  const id = params.get("id");
  if (!id) return NextResponse.json({ error: "Record id is required." }, { status: 400 });

  if (resource === "category") {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }
  if (resource === "service") {
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unsupported delete action." }, { status: 400 });
}
