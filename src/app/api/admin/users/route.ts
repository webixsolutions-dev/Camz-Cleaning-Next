import { validateStrongPassword } from "@/lib/security/password";
import { enforceMutationSecurity } from "@/lib/security/http";
import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { sendCredentialsEmail } from "@/lib/email"; // ✅ NEW: Import kiya

type UserPayload = {
  name?: string;
  email?: string;
  password?: string;
  phone_number?: string;
  role?: string;
  source?: string;
  approval_status?: string;
  is_available?: boolean;
  offering_fixed?: boolean;
  offering_hourly?: boolean;
  hourly_rate?: string;
  invoice_access?: boolean;
};

const CREATABLE_ROLES_BY_ACTOR: Record<string, Set<string>> = {
  admin: new Set(["admin", "accountant", "customer", "cleaner", "data_entry"]),
};
const APPROVAL_STATUSES = new Set(["approved", "pending", "rejected"]);

async function getActor(): Promise<{ id: string; role: string } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("users").select("role, is_blocked").eq("id", user.id).maybeSingle();
  if (!profile || profile.is_blocked !== false) return null;
  return { id: user.id, role: String(profile.role || "").toLowerCase() };
}

function getServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return null;
  return createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, { bucket: "users-post", limit: 60, windowSeconds: 60 });
  if (securityError) return securityError;
  const actor = await getActor();
  if (!actor) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const creatable = CREATABLE_ROLES_BY_ACTOR[actor.role];
  if (!creatable) return NextResponse.json({ error: "You do not have permission to create users." }, { status: 403 });
  const admin = getServiceClient();
  if (!admin) return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY is not configured on the server." }, { status: 503 });

  const body = (await request.json()) as UserPayload;
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password || "";
  const phone = body.phone_number?.trim();
  const role = body.role?.trim().toLowerCase() || "cleaner";
  const requestedApprovalStatus = body.approval_status || "approved";

  if (!name || !email || !phone || !password) return NextResponse.json({ error: "Name, email, phone, and password are required." }, { status: 400 });
  const passwordError = validateStrongPassword(password);
  if (passwordError) return NextResponse.json({ error: passwordError }, { status: 400 });
  if (!creatable.has(role)) return NextResponse.json({ error: "You are not allowed to create a user with this role." }, { status: 403 });
  if (actor.role === "admin" && !APPROVAL_STATUSES.has(requestedApprovalStatus)) {
    return NextResponse.json({ error: "Selected approval status is not allowed." }, { status: 400 });
  }

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role },
  });
  if (authError || !authData.user) return NextResponse.json({ error: authError?.message || "Unable to create login account." }, { status: 400 });

  const profile = {
    id: authData.user.id,
    name,
    email,
    role,
    phone_number: phone,
    approval_status: actor.role === "admin" ? requestedApprovalStatus : "approved",
    is_blocked: false,
    source: actor.role === "admin" ? body.source || "Web" : "Web",
    verified: role === "cleaner" ? false : true,
    is_available: role === "cleaner" ? Boolean(body.is_available) : false,
    is_online: false,
    is_working: false,
    offering_fixed: role === "cleaner" ? body.offering_fixed ?? true : false,
    offering_hourly: role === "cleaner" ? Boolean(body.offering_hourly) : false,
    hourly_rate: role === "cleaner" ? body.hourly_rate || "0" : "0",
    invoice_access: role === "accountant" ? true : role === "data_entry" ? Boolean(body.invoice_access) : false,
  };

  const { error: profileError } = await admin.from("users").upsert(profile, { onConflict: "id" });
  if (profileError) {
    await admin.auth.admin.deleteUser(authData.user.id);
    if (profileError.message.includes("invalid input value for enum user_role")) {
      return NextResponse.json({ error: "The selected staff role is missing from the Supabase user_role enum. Run the latest invoice roles migration before creating Accountant or Data Entry users." }, { status: 400 });
    }
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  // ✅ NEW: Agar account success ho gaya, toh ab email send karein
  await sendCredentialsEmail(email, name, password, role);

  return NextResponse.json({ id: authData.user.id });
}

export async function PATCH(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, { bucket: "users-patch", limit: 60, windowSeconds: 60 });
  if (securityError) return securityError;
  const actor = await getActor();
  if (actor?.role !== "admin") return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const admin = getServiceClient();
  if (!admin) return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY is not configured on the server." }, { status: 503 });

  const body = (await request.json()) as UserPayload & { id?: string; is_blocked?: boolean };
  if (!body.id) return NextResponse.json({ error: "User id is required." }, { status: 400 });

  const { data: target, error: targetError } = await admin
    .from("users")
    .select("id, role")
    .eq("id", body.id)
    .maybeSingle();
  if (targetError) return NextResponse.json({ error: targetError.message }, { status: 400 });
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const updates: Record<string, string | boolean> = {};
  if (typeof body.is_blocked === "boolean") updates.is_blocked = body.is_blocked;
  if (body.approval_status) updates.approval_status = body.approval_status;
  if (typeof body.invoice_access === "boolean") {
    if (String(target.role || "").toLowerCase() !== "data_entry") {
      return NextResponse.json({ error: "Invoice Access can only be toggled for Data Entry users." }, { status: 400 });
    }
    updates.invoice_access = body.invoice_access;
  }
  if (!Object.keys(updates).length) return NextResponse.json({ error: "No user changes were provided." }, { status: 400 });

  const { error } = await admin.from("users").update(updates).eq("id", body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, { bucket: "users-delete", limit: 20, windowSeconds: 60 });
  if (securityError) return securityError;

  const actor = await getActor();
  if (actor?.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const admin = getServiceClient();
  if (!admin) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY is not configured on the server." }, { status: 503 });
  }

  const id = new URL(request.url).searchParams.get("id")?.trim();
  if (!id) return NextResponse.json({ error: "User id is required." }, { status: 400 });
  if (id === actor.id) {
    return NextResponse.json({ error: "You cannot remove your own Admin account." }, { status: 400 });
  }

  const { data: target, error: targetError } = await admin
    .from("users")
    .select("id, role, email")
    .eq("id", id)
    .maybeSingle();

  if (targetError) return NextResponse.json({ error: targetError.message }, { status: 400 });
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const { error: authDeleteError } = await admin.auth.admin.deleteUser(id);
  if (authDeleteError) {
    return NextResponse.json({ error: authDeleteError.message }, { status: 400 });
  }

  // Auth-user deletion normally cascades to the profile. Keep this fallback so
  // environments without that FK cascade do not leave a portal account behind.
  const { error: profileDeleteError } = await admin.from("users").delete().eq("id", id);
  if (profileDeleteError) {
    console.warn("User auth account removed but profile cleanup failed:", profileDeleteError);
  }

  return NextResponse.json({ ok: true });
}
