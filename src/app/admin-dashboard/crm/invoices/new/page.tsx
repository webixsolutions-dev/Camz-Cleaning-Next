import CrmInvoiceEditor from "@/components/admin/crm/CrmInvoiceEditor";
import { createClient } from "@/lib/supabase/server";

export default async function NewCrmInvoicePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("users").select("role").eq("id", user?.id || "").maybeSingle();
  return <CrmInvoiceEditor isAdmin={String(profile?.role || "").toLowerCase() === "admin"} />;
}
