import CrmReconciliationClient from "@/components/admin/crm/CrmReconciliationClient";
import { createClient } from "@/lib/supabase/server";

export default async function CrmReconciliationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("users").select("role").eq("id", user?.id || "").maybeSingle();
  return <CrmReconciliationClient isAdmin={String(profile?.role || "").toLowerCase() === "admin"} />;
}
