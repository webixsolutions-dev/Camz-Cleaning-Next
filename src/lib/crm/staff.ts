import { createClient as createAdminClient, type SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export type CrmActor = {
  userId: string;
  role: "admin" | "cleaner" | "data_entry";
  isAdmin: boolean;
  bookingRoleKey: string | null;
};

export type InvoiceActor = {
  userId: string;
  role: "admin" | "accountant" | "data_entry";
  isAdmin: boolean;
  canManageInvoicePermissions: boolean;
  invoiceAccess: boolean;
  name: string | null;
  email: string | null;
};

export function isCrmAdminRole(value?: string | null) {
  return String(value || "").toLowerCase() === "admin";
}

function getServiceClient(): SupabaseClient | null {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !url) return null;

  return createAdminClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function getCrmActor() {
  const supabase = await createClient();
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { actor: null as CrmActor | null, supabase, error: "Authentication required.", status: 401 };
    }

    const { data: profile, error } = await supabase
      .from("users")
      .select("id, role, booking_role_key, is_blocked")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("CRM staff lookup failed:", error);
      return { actor: null, supabase, error: "Unable to verify staff access.", status: 500 };
    }

    const role = String(profile?.role || "").toLowerCase();
    if (!profile || profile.is_blocked) {
      return { actor: null, supabase, error: "CRM access is not available for this account.", status: 403 };
    }

    if (isCrmAdminRole(role)) {
      return {
        actor: {
          userId: user.id,
          role: "admin" as const,
          isAdmin: true,
          bookingRoleKey: null,
        },
        supabase,
        error: null,
        status: 200,
      };
    }

    if (role !== "cleaner" && role !== "data_entry") {
      return { actor: null, supabase, error: "CRM access is not enabled for this account.", status: 403 };
    }

    const bookingRoleKey = String(profile.booking_role_key || role).toLowerCase();
    const { data: bookingRole, error: bookingRoleError } = await supabase
      .from("booking_roles")
      .select("can_access_crm")
      .eq("key", bookingRoleKey)
      .maybeSingle();

    if (bookingRoleError) {
      console.error("CRM role permission lookup failed:", bookingRoleError);
      return { actor: null, supabase, error: "Unable to verify CRM role permission.", status: 500 };
    }

    if (!bookingRole?.can_access_crm) {
      return { actor: null, supabase, error: "CRM access is not enabled for your role.", status: 403 };
    }

    return {
      actor: {
        userId: user.id,
        role: role as "cleaner" | "data_entry",
        isAdmin: false,
        bookingRoleKey,
      },
      supabase,
      error: null,
      status: 200,
    };
  } catch (error) {
    console.error("CRM staff lookup failed:", error);
    return { actor: null, supabase, error: "Unable to verify staff access.", status: 500 };
  }
}

/**
 * Invoice-specific access is intentionally separate from general CRM access.
 * Admin has full access, Accountant is invoice-only, and Data Entry requires
 * the per-user invoice_access toggle. Cleaner accounts are never invoice users.
 *
 * After the signed-in user has been authorized, invoice routes use the service
 * client when available so existing RLS rules for older CRM roles do not block
 * the newly-added Accountant / per-user Data Entry permission.
 */
export async function getInvoiceActor() {
  const sessionClient = await createClient();

  try {
    const {
      data: { user },
    } = await sessionClient.auth.getUser();

    if (!user) {
      return {
        actor: null as InvoiceActor | null,
        supabase: sessionClient as SupabaseClient,
        error: "Authentication required.",
        status: 401,
      };
    }

    const { data: profile, error } = await sessionClient
      .from("users")
      .select("id, name, email, role, invoice_access, is_blocked")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Invoice staff lookup failed:", error);
      return {
        actor: null,
        supabase: sessionClient as SupabaseClient,
        error: "Unable to verify invoice access.",
        status: 500,
      };
    }

    if (!profile || profile.is_blocked) {
      return {
        actor: null,
        supabase: sessionClient as SupabaseClient,
        error: "Invoice access is not available for this account.",
        status: 403,
      };
    }

    const role = String(profile.role || "").toLowerCase();
    const allowed =
      role === "admin" ||
      role === "accountant" ||
      (role === "data_entry" && Boolean(profile.invoice_access));

    if (!allowed) {
      return {
        actor: null,
        supabase: sessionClient as SupabaseClient,
        error: "Invoice access is not enabled for this account.",
        status: 403,
      };
    }

    const actor: InvoiceActor = {
      userId: user.id,
      role: role as InvoiceActor["role"],
      isAdmin: role === "admin",
      canManageInvoicePermissions: role === "admin",
      invoiceAccess: true,
      name: profile.name || null,
      email: profile.email || user.email || null,
    };

    return {
      actor,
      supabase: getServiceClient() || (sessionClient as SupabaseClient),
      error: null,
      status: 200,
    };
  } catch (error) {
    console.error("Invoice staff lookup failed:", error);
    return {
      actor: null,
      supabase: sessionClient as SupabaseClient,
      error: "Unable to verify invoice access.",
      status: 500,
    };
  }
}
