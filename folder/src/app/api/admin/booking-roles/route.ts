import { enforceMutationSecurity } from "@/lib/security/http";
import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

type BaseRole = "cleaner" | "data_entry";

const BASE_ROLES = new Set<BaseRole>(["cleaner", "data_entry"]);

async function getAdminActor() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("id, role, is_blocked")
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

function slugifyRole(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
}

async function listRoles(admin: AdminClient) {
  const { data, error } = await admin
    .from("booking_roles")
    .select("key, name, base_role, is_system, created_at")
    .order("is_system", { ascending: false })
    .order("name", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function GET() {
  const actor = await getAdminActor();
  if (!actor) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const admin = getAdminClient();
  if (!admin) return missingAdminKey();

  try {
    return NextResponse.json({ roles: await listRoles(admin) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load roles." },
      { status: 400 },
    );
  }
}

export async function POST(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, { bucket: "booking-roles-post", limit: 60, windowSeconds: 60 });
  if (securityError) return securityError;
  const actor = await getAdminActor();
  if (!actor) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const admin = getAdminClient();
  if (!admin) return missingAdminKey();

  const body = (await request.json()) as {
    name?: string;
    base_role?: string;
  };

  const name = body.name?.trim();
  const baseRole = String(body.base_role || "cleaner").toLowerCase() as BaseRole;

  if (!name || name.length < 2) {
    return NextResponse.json(
      { error: "Role name must contain at least 2 characters." },
      { status: 400 },
    );
  }

  if (!BASE_ROLES.has(baseRole)) {
    return NextResponse.json(
      { error: "Base permission must be Cleaner or Data Entry." },
      { status: 400 },
    );
  }

  const key = slugifyRole(name);
  if (!key) {
    return NextResponse.json({ error: "Invalid role name." }, { status: 400 });
  }

  if (key === "cleaner" || key === "data_entry") {
    return NextResponse.json(
      { error: "Cleaner and Data Entry are built-in roles." },
      { status: 400 },
    );
  }

  const { error } = await admin.from("booking_roles").insert({
    key,
    name,
    base_role: baseRole,
    is_system: false,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ roles: await listRoles(admin) });
}

export async function DELETE(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, { bucket: "booking-roles-delete", limit: 60, windowSeconds: 60 });
  if (securityError) return securityError;
  const actor = await getAdminActor();
  if (!actor) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const admin = getAdminClient();
  if (!admin) return missingAdminKey();

  const key = request.nextUrl.searchParams.get("key")?.trim().toLowerCase();
  if (!key) {
    return NextResponse.json({ error: "Role key is required." }, { status: 400 });
  }

  const { data: role, error: roleError } = await admin
    .from("booking_roles")
    .select("key, name, base_role, is_system")
    .eq("key", key)
    .maybeSingle();

  if (roleError) {
    return NextResponse.json({ error: roleError.message }, { status: 400 });
  }

  if (!role) {
    return NextResponse.json({ error: "Role not found." }, { status: 404 });
  }

  if (role.is_system) {
    return NextResponse.json(
      { error: "Built-in Cleaner/Data Entry roles cannot be deleted." },
      { status: 400 },
    );
  }

  // Users are not deleted. They safely fall back to the matching built-in role.
  const { error: fallbackError } = await admin
    .from("users")
    .update({ booking_role_key: role.base_role })
    .eq("booking_role_key", role.key);

  if (fallbackError) {
    return NextResponse.json({ error: fallbackError.message }, { status: 400 });
  }

  const { error: deleteError } = await admin
    .from("booking_roles")
    .delete()
    .eq("key", role.key);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 400 });
  }

  return NextResponse.json({ roles: await listRoles(admin) });
}
