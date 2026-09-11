import { createClient } from "@/lib/supabase/server";

export type CrmActor = {
  userId: string;
  role: "admin" | "data_entry";
  isAdmin: boolean;
};

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
    if (!profile || profile.is_blocked || !["admin", "data_entry"].includes(role)) {
      return { actor: null, supabase, error: "Invoice CRM access required.", status: 403 };
    }

    return {
      actor: {
        userId: user.id,
        role: role as "admin" | "data_entry",
        isAdmin: role === "admin",
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
