import CrmEmailSettings from "@/components/admin/crm/CrmEmailSettings";
import { getCrmActor } from "@/lib/crm/staff";
import { redirect } from "next/navigation";

export default async function CrmEmailSettingsPage() {
  const { actor } = await getCrmActor();

  if (!actor?.isAdmin) {
    redirect("/admin-dashboard/crm");
  }

  return <CrmEmailSettings isAdmin={actor.isAdmin} />;
}
