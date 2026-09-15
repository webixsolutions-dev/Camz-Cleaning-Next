import CrmInvoiceEditor from "@/components/admin/crm/CrmInvoiceEditor";
import { isCrmAdminRole } from "@/lib/crm/staff";
import { createClient } from "@/lib/supabase/server";

export default async function NewCrmInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string }>;
}) {
  const { customer } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("users").select("role").eq("id", user?.id || "").maybeSingle();
  return <CrmInvoiceEditor initialCustomerId={customer} isAdmin={isCrmAdminRole(profile?.role)} />;
}
