import { ensureCrmCustomerForUser } from "@/lib/customers/syncCrmCustomer";
import { enforceMutationSecurity } from "@/lib/security/http";
import { normalizeCustomerCode } from "@/lib/customers/customerCode";
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

export async function GET(request: NextRequest) {
  if (!(await authorizeAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const admin = getServiceClient();
  if (!admin) return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY is not configured on the server." }, { status: 503 });

  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim() || "";
  const code = normalizeCustomerCode(url.searchParams.get("code") || url.searchParams.get("q") || "");
  if (!id && !code) {
    return NextResponse.json({ error: "Pass a 4-digit customer ID (?code=0001) or customer uuid (?id=)." }, { status: 400 });
  }

  try {
    let query = admin
      .from("users")
      .select("id, customer_code, name, email, phone_number, source, created_at, is_blocked, approval_status, verified, role")
      .eq("role", "customer");
    query = id ? query.eq("id", id) : query.eq("customer_code", code);
    const { data: customer, error } = await query.maybeSingle();
    if (error) {
      console.error("Customer lookup failed:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (!customer) return NextResponse.json({ error: "No customer found for that ID." }, { status: 404 });

    const [{ data: addresses }, { data: jobs }] = await Promise.all([
      admin.from("addresses").select("id, label, address_line, city, is_default").eq("user_id", customer.id).order("is_default", { ascending: false }),
      admin
        .from("jobs")
        .select("id, service_name, service_type, date, status, address, total_price, final_price, price, created_at")
        .eq("customer_id", customer.id)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    return NextResponse.json({
      customer: {
        ...customer,
        addresses: addresses || [],
        bookings: jobs || [],
      },
    });
  } catch (err) {
    console.error("Customer GET failed:", err);
    return NextResponse.json({ error: "Unable to look up that customer." }, { status: 500 });
  }
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
    user_metadata: { name, role: "customer", source: body.source || "Manual" },
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

  const { data: created } = await admin
    .from("users")
    .select("id, customer_code, name, email, phone_number")
    .eq("id", authData.user.id)
    .maybeSingle();

  const parsed = body.address?.trim() ? splitAddress(body.address) : null;
  if (parsed) {
    const { error: addressError } = await admin.from("addresses").insert({
      user_id: authData.user.id,
      label: "home",
      ...parsed,
      is_default: true,
    });
    if (addressError) {
      return NextResponse.json({ error: `Customer created, but address failed: ${addressError.message}` }, { status: 207 });
    }
  }

  const linked = created
    ? await ensureCrmCustomerForUser(admin, created, parsed)
    : { ok: false as const, error: "Profile missing" };

  return NextResponse.json({
    id: authData.user.id,
    customer_code: created?.customer_code || (linked.ok ? linked.customer_code : null),
    crm_customer_id: linked.ok ? linked.crm_customer_id : null,
  });
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
    const { data: user } = await admin.from("users").select("id, customer_code, name, email, phone_number").eq("id", body.id).maybeSingle();
    if (user) await ensureCrmCustomerForUser(admin, user, parsed);
  } else {
    const { data: user } = await admin.from("users").select("id, customer_code, name, email, phone_number").eq("id", body.id).maybeSingle();
    if (user) await ensureCrmCustomerForUser(admin, user);
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
