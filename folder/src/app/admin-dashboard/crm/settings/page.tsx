import CrmSettingsClient from "@/components/admin/crm/CrmSettingsClient";
import { isCrmAdminRole } from "@/lib/crm/staff";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function CrmSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("users").select("role").eq("id", user?.id || "").maybeSingle();
  if (!isCrmAdminRole(profile?.role)) {
    redirect("/admin-dashboard/crm");
  }
  return <CrmSettingsClient isAdmin />;
}
