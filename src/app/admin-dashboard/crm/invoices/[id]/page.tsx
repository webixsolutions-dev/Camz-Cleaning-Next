import CrmInvoiceEditor from "@/components/admin/crm/CrmInvoiceEditor";
import { isCrmAdminRole } from "@/lib/crm/staff";
import { createClient } from "@/lib/supabase/server";

export default async function CrmInvoiceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ customer?: string }>;
}) {
  const { id } = await params;
  const { customer } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("users").select("role").eq("id", user?.id || "").maybeSingle();
  return <CrmInvoiceEditor invoiceId={id} initialCustomerId={customer} isAdmin={isCrmAdminRole(profile?.role)} />;
}
