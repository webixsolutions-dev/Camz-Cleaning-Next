import { createClient } from "@/lib/supabase/server";

export type CrmActor = {
  userId: string;
  role: "admin" | "super_admin";
  isAdmin: boolean;
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
      .select("id, role, is_blocked")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("CRM staff lookup failed:", error);
      return { actor: null, supabase, error: "Unable to verify staff access.", status: 500 };
    }

    const role = String(profile?.role || "").toLowerCase();
    if (!profile || profile.is_blocked || !isCrmAdminRole(role)) {
      return { actor: null, supabase, error: "Administrator access is required for Invoice CRM.", status: 403 };
    }

    return {
      actor: {
        userId: user.id,
        role: role === "admin" ? "admin" as const : "super_admin" as const,
        isAdmin: true,
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
