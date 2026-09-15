import { validateStrongPassword } from "@/lib/security/password";
import { enforceMutationSecurity } from "@/lib/security/http";
import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

type BaseRole = "admin" | "cleaner" | "data_entry";

type UserPayload = {
  id?: string;
  name?: string;
  email?: string;
  password?: string;
  phone_number?: string;
  role?: string;
  role_key?: string;
  source?: string;
  approval_status?: string;
  is_blocked?: boolean;
  is_available?: boolean;
  offering_fixed?: boolean;
  offering_hourly?: boolean;
  hourly_rate?: string;
};

type RoleDefinition = {
  key: string;
  name: string;
  base_role: BaseRole;
  is_system: boolean;
};

const BASE_ROLES = new Set<BaseRole>(["admin", "cleaner", "data_entry"]);
const APPROVAL_STATUSES = new Set(["approved", "pending", "rejected"]);

async function getAdminActor(): Promise<{ id: string } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("role, is_blocked")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.is_blocked === true) return null;
  if (String(profile.role || "").toLowerCase() !== "admin") return null;

  return { id: user.id };
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) return null;

  return createAdminClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

type AdminClient = NonNullable<ReturnType<typeof getAdminClient>>;

function missingAdminKey() {
  return NextResponse.json(
    {
      error:
        "Supabase admin key is not configured. Add SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY) to the server environment and restart/redeploy.",
    },
    { status: 503 },
  );
}

function builtInRoleName(role: BaseRole) {
  if (role === "admin") return "Admin";
  if (role === "data_entry") return "Data Entry";
  return "Cleaner";
}

async function resolveRole(
  admin: AdminClient,
  roleKeyValue?: string,
  fallbackBase?: string,
): Promise<RoleDefinition | null> {
  const roleKey = String(roleKeyValue || fallbackBase || "cleaner")
    .trim()
    .toLowerCase();

  // Admin is a built-in application role and does not need a booking_roles row.
  if (roleKey === "admin") {
    return {
      key: "admin",
      name: "Admin",
      base_role: "admin",
      is_system: true,
    };
  }

  const { data, error } = await admin
    .from("booking_roles")
    .select("key, name, base_role, is_system")
    .eq("key", roleKey)
    .maybeSingle();

  if (error) throw error;

  if (data && BASE_ROLES.has(String(data.base_role) as BaseRole)) {
    return {
      key: data.key,
      name: data.name,
      base_role: data.base_role as BaseRole,
      is_system: Boolean(data.is_system),
    };
  }

  // Compatibility fallback for the two built-in roles.
  if (BASE_ROLES.has(roleKey as BaseRole)) {
    return {
      key: roleKey,
      name: builtInRoleName(roleKey as BaseRole),
      base_role: roleKey as BaseRole,
      is_system: true,
    };
  }

  return null;
}

export async function POST(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, { bucket: "booking-record-users-post", limit: 60, windowSeconds: 60 });
  if (securityError) return securityError;
  const actor = await getAdminActor();
  if (!actor) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const admin = getAdminClient();
  if (!admin) return missingAdminKey();

  const body = (await request.json()) as UserPayload;
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const phone = body.phone_number?.trim();
  const password = body.password || "";
  const approvalStatus =
    body.approval_status?.trim().toLowerCase() || "approved";
  const source = body.source?.trim() || "Web";

  if (!name || !email || !phone || !password) {
    return NextResponse.json(
      { error: "Name, email, phone, and password are required." },
      { status: 400 },
    );
  }

  const passwordError = validateStrongPassword(password);
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 });
  }

  if (!APPROVAL_STATUSES.has(approvalStatus)) {
    return NextResponse.json({ error: "Invalid approval status." }, { status: 400 });
  }

  let roleDef: RoleDefinition | null = null;
  try {
    roleDef = await resolveRole(admin, body.role_key, body.role);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to resolve role." },
      { status: 400 },
    );
  }

  if (!roleDef) {
    return NextResponse.json(
      { error: "Select a valid Booking User role." },
      { status: 400 },
    );
  }

  const baseRole = roleDef.base_role;

  const metadata = {
    name,
    full_name: name,
    email,
    phone_number: phone,
    phone,
    role: baseRole,
    booking_role_key: baseRole === "admin" ? null : roleDef.key,
    booking_role_name: roleDef.name,
    source,
    approval_status: approvalStatus,
    is_available: baseRole === "cleaner" ? Boolean(body.is_available) : false,
    offering_fixed:
      baseRole === "cleaner" ? body.offering_fixed ?? true : false,
    offering_hourly:
      baseRole === "cleaner" ? Boolean(body.offering_hourly) : false,
    hourly_rate: baseRole === "cleaner" ? body.hourly_rate || "0" : "0",
  };

  const { data: authData, error: authError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata,
    });

  if (authError || !authData.user) {
    return NextResponse.json(
      { error: authError?.message || "Unable to create user." },
      { status: 400 },
    );
  }

  const profile = {
    id: authData.user.id,
    name,
    email,
    phone_number: phone,
    role: baseRole,
    booking_role_key: baseRole === "admin" ? null : roleDef.key,
    approval_status: approvalStatus,
    source,
    is_blocked: false,
    verified: baseRole === "cleaner" ? false : true,
    is_online: false,
    is_available: baseRole === "cleaner" ? Boolean(body.is_available) : false,
    is_working: false,
    offering_fixed:
      baseRole === "cleaner" ? body.offering_fixed ?? true : false,
    offering_hourly:
      baseRole === "cleaner" ? Boolean(body.offering_hourly) : false,
    hourly_rate: baseRole === "cleaner" ? body.hourly_rate || "0" : "0",
  };

  const { error: profileError } = await admin
    .from("users")
    .upsert(profile, { onConflict: "id" });

  if (profileError) {
    await admin.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  return NextResponse.json({ id: authData.user.id, user: profile });
}

export async function PATCH(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, { bucket: "booking-record-users-patch", limit: 60, windowSeconds: 60 });
  if (securityError) return securityError;
  const actor = await getAdminActor();
  if (!actor) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const admin = getAdminClient();
  if (!admin) return missingAdminKey();

  const body = (await request.json()) as UserPayload;
  if (!body.id) {
    return NextResponse.json({ error: "User id is required." }, { status: 400 });
  }

  const { data: existing, error: existingError } = await admin
    .from("users")
    .select(
      "id, name, email, phone_number, role, booking_role_key, approval_status, source, is_blocked, is_available, offering_fixed, offering_hourly, hourly_rate",
    )
    .eq("id", body.id)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 400 });
  }

  if (!existing) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const existingBase = String(existing.role || "").toLowerCase();
  if (!BASE_ROLES.has(existingBase as BaseRole)) {
    return NextResponse.json(
      { error: "Only booking operational users can be managed here." },
      { status: 400 },
    );
  }

  let roleDef: RoleDefinition | null = null;
  try {
    roleDef = await resolveRole(
      admin,
      body.role_key || existing.booking_role_key,
      body.role || existingBase,
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to resolve role." },
      { status: 400 },
    );
  }

  if (!roleDef) {
    return NextResponse.json({ error: "Invalid Booking User role." }, { status: 400 });
  }

  const approvalStatus = body.approval_status
    ? body.approval_status.trim().toLowerCase()
    : String(existing.approval_status || "approved");

  if (!APPROVAL_STATUSES.has(approvalStatus)) {
    return NextResponse.json({ error: "Invalid approval status." }, { status: 400 });
  }

  const baseRole = roleDef.base_role;

  if (existingBase === "admin" && baseRole !== "admin") {
    if (body.id === actor.id) {
      return NextResponse.json(
        { error: "You cannot remove your own admin access from the Booking Calendar." },
        { status: 400 },
      );
    }

    const { count, error: countError } = await admin
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 400 });
    }

    if ((count || 0) <= 1) {
      return NextResponse.json(
        { error: "At least one admin account must remain." },
        { status: 400 },
      );
    }
  }
  const name = body.name?.trim() || String(existing.name || "");
  const email = body.email?.trim().toLowerCase() || String(existing.email || "");
  const phone =
    typeof body.phone_number === "string"
      ? body.phone_number.trim()
      : String(existing.phone_number || "");
  const source = body.source?.trim() || String(existing.source || "Web");

  const updates = {
    name,
    email,
    phone_number: phone,
    role: baseRole,
    booking_role_key: baseRole === "admin" ? null : roleDef.key,
    approval_status: approvalStatus,
    source,
    is_blocked:
      typeof body.is_blocked === "boolean"
        ? body.is_blocked
        : Boolean(existing.is_blocked),
    is_available:
      baseRole === "cleaner"
        ? typeof body.is_available === "boolean"
          ? body.is_available
          : Boolean(existing.is_available)
        : false,
    offering_fixed:
      baseRole === "cleaner"
        ? typeof body.offering_fixed === "boolean"
          ? body.offering_fixed
          : Boolean(existing.offering_fixed)
        : false,
    offering_hourly:
      baseRole === "cleaner"
        ? typeof body.offering_hourly === "boolean"
          ? body.offering_hourly
          : Boolean(existing.offering_hourly)
        : false,
    hourly_rate:
      baseRole === "cleaner"
        ? body.hourly_rate ?? String(existing.hourly_rate ?? "0")
        : "0",
  };

  const authChanges: {
    email?: string;
    password?: string;
    user_metadata: Record<string, unknown>;
  } = {
    user_metadata: {
      name,
      full_name: name,
      phone_number: phone,
      phone,
      role: baseRole,
      booking_role_key: baseRole === "admin" ? null : roleDef.key,
      booking_role_name: roleDef.name,
      approval_status: approvalStatus,
      source,
    },
  };

  if (email !== existing.email) authChanges.email = email;

  if (typeof body.password === "string" && body.password.length > 0) {
    const passwordError = validateStrongPassword(body.password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }
    authChanges.password = body.password;
  }

  const { error: authError } = await admin.auth.admin.updateUserById(
    body.id,
    authChanges,
  );

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  const { error: updateError } = await admin
    .from("users")
    .update(updates)
    .eq("id", body.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, { bucket: "booking-record-users-delete", limit: 60, windowSeconds: 60 });
  if (securityError) return securityError;
  const actor = await getAdminActor();
  if (!actor) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const admin = getAdminClient();
  if (!admin) return missingAdminKey();

  const id = request.nextUrl.searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json({ error: "User id is required." }, { status: 400 });
  }

  if (id === actor.id) {
    return NextResponse.json(
      { error: "You cannot delete your own admin account." },
      { status: 400 },
    );
  }

  const { data: target, error: targetError } = await admin
    .from("users")
    .select("id, role")
    .eq("id", id)
    .maybeSingle();

  if (targetError) {
    return NextResponse.json({ error: targetError.message }, { status: 400 });
  }

  if (!target) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const targetRole = String(target.role || "").toLowerCase() as BaseRole;

  if (targetRole === "admin") {
    const { count, error: countError } = await admin
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 400 });
    }

    if ((count || 0) <= 1) {
      return NextResponse.json(
        { error: "The last admin account cannot be deleted." },
        { status: 400 },
      );
    }
  }

  if (!BASE_ROLES.has(targetRole)) {
    return NextResponse.json(
      { error: "Only Admin, Cleaner, or Data Entry users can be deleted here." },
      { status: 400 },
    );
  }

  const { error: assignmentError } = await admin
    .from("booking_record_assignments")
    .delete()
    .eq("cleaner_id", id);

  if (assignmentError) {
    return NextResponse.json({ error: assignmentError.message }, { status: 400 });
  }

  // Keep historical booking rows, but detach deleted Data Entry ownership.
  const { error: bookingOwnerError } = await admin
    .from("booking_records")
    .update({ added_by_user: null })
    .eq("added_by_user", id);

  if (bookingOwnerError) {
    return NextResponse.json({ error: bookingOwnerError.message }, { status: 400 });
  }

  const { error: authDeleteError } = await admin.auth.admin.deleteUser(id);
  if (authDeleteError) {
    return NextResponse.json({ error: authDeleteError.message }, { status: 400 });
  }

  // If your auth delete trigger cascades users, this simply affects zero rows.
  const { error: profileDeleteError } = await admin
    .from("users")
    .delete()
    .eq("id", id);

  if (profileDeleteError) {
    return NextResponse.json({ error: profileDeleteError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
