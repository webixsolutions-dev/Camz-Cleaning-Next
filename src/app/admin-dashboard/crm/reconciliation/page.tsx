import CrmReconciliationClient from "@/components/admin/crm/CrmReconciliationClient";
import { getCrmActor } from "@/lib/crm/staff";
import { redirect } from "next/navigation";

export default async function CrmReconciliationPage() {
  const { actor } = await getCrmActor();
  if (!actor?.isAdmin) {
    redirect("/admin-dashboard/crm");
  }
  return <CrmReconciliationClient isAdmin />;
}
