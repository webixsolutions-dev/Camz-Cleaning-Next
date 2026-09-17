import { createClient } from "@/lib/supabase/server";

export type CrmActor = {
  userId: string;
  role: "admin" | "super_admin" | "cleaner" | "data_entry";
  isAdmin: boolean;
  bookingRoleKey: string | null;
};

export function isCrmAdminRole(value?: string | null) {
  const role = String(value || "").toLowerCase();
  return role === "admin" || role === "super_admin" || role === "superadmin";
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

    const rawRole = String(profile?.role || "").toLowerCase();
    const role = rawRole === "superadmin" ? "super_admin" : rawRole;
    if (!profile || profile.is_blocked) {
      return { actor: null, supabase, error: "CRM access is not available for this account.", status: 403 };
    }

    if (isCrmAdminRole(role)) {
      return {
        actor: {
          userId: user.id,
          role: role === "admin" ? "admin" as const : "super_admin" as const,
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
