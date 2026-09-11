import CrmInvoiceEditor from "@/components/admin/crm/CrmInvoiceEditor";
import { createClient } from "@/lib/supabase/server";

export default async function CrmInvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("users").select("role").eq("id", user?.id || "").maybeSingle();
  return <CrmInvoiceEditor invoiceId={id} isAdmin={String(profile?.role || "").toLowerCase() === "admin"} />;
}
