import { enforceMutationSecurity } from "@/lib/security/http";
import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

type CustomerPayload = {
  id?: string;
  name?: string;
  email?: string;
  phone_number?: string;
  address?: string;
  source?: string;
};

async function authorizeAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase.from("users").select("role, is_blocked").eq("id", user.id).maybeSingle();
  return profile?.role?.toLowerCase() === "admin" && profile.is_blocked === false;
}

function getServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return null;
  return createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function splitAddress(address: string) {
  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) return { address_line: address.trim(), city: "" };
  return { address_line: parts.slice(0, -1).join(", "), city: parts.at(-1) || "" };
}

export async function POST(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, { bucket: "customers-post", limit: 60, windowSeconds: 60 });
  if (securityError) return securityError;
  if (!(await authorizeAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const admin = getServiceClient();
  if (!admin) return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY is not configured on the server." }, { status: 503 });

  const body = await request.json() as CustomerPayload;
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const phone = body.phone_number?.trim();
  if (!name || !email || !phone) return NextResponse.json({ error: "Name, email, and phone are required." }, { status: 400 });

  const temporaryPassword = `${crypto.randomUUID()}Aa1!`;
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: { name, source: body.source || "Manual" },
  });
  if (authError || !authData.user) return NextResponse.json({ error: authError?.message || "Unable to create authentication account." }, { status: 400 });

  const profile = {
    id: authData.user.id,
    name,
    email,
    role: "customer",
    phone_number: phone,
    approval_status: "approved",
    is_blocked: false,
    verified: true,
    source: body.source || "Manual",
  };
  const { error: profileError } = await admin.from("users").upsert(profile, { onConflict: "id" });
  if (profileError) {
    await admin.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  if (body.address?.trim()) {
    const parsed = splitAddress(body.address);
    const { error: addressError } = await admin.from("addresses").insert({ user_id: authData.user.id, label: "home", ...parsed, is_default: true });
    if (addressError) return NextResponse.json({ error: `Customer created, but address failed: ${addressError.message}` }, { status: 207 });
  }
  return NextResponse.json({ id: authData.user.id });
}

export async function PATCH(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, { bucket: "customers-patch", limit: 60, windowSeconds: 60 });
  if (securityError) return securityError;
  if (!(await authorizeAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const admin = getServiceClient();
  if (!admin) return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY is not configured on the server." }, { status: 503 });
  const body = await request.json() as CustomerPayload;
  if (!body.id) return NextResponse.json({ error: "Customer id is required." }, { status: 400 });

  const updates = {
    name: body.name?.trim(),
    email: body.email?.trim().toLowerCase(),
    phone_number: body.phone_number?.trim(),
    source: body.source,
  };
  const { error } = await admin.from("users").update(updates).eq("id", body.id).eq("role", "customer");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (updates.email) await admin.auth.admin.updateUserById(body.id, { email: updates.email });

  if (body.address?.trim()) {
    const parsed = splitAddress(body.address);
    const { data: existing } = await admin.from("addresses").select("id").eq("user_id", body.id).eq("is_default", true).maybeSingle();
    if (existing) await admin.from("addresses").update(parsed).eq("id", existing.id);
    else await admin.from("addresses").insert({ user_id: body.id, label: "home", ...parsed, is_default: true });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, { bucket: "customers-delete", limit: 60, windowSeconds: 60 });
  if (securityError) return securityError;
  if (!(await authorizeAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const admin = getServiceClient();
  if (!admin) return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY is not configured on the server." }, { status: 503 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Customer id is required." }, { status: 400 });

  const { data: customer } = await admin.from("users").select("role").eq("id", id).maybeSingle();
  if (customer?.role?.toLowerCase() !== "customer") return NextResponse.json({ error: "Only customer accounts can be deleted here." }, { status: 400 });
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await admin.from("users").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
