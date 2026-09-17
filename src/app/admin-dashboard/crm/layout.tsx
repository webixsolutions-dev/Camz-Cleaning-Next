import { getCrmActor } from "@/lib/crm/staff";
import { redirect } from "next/navigation";

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const { actor } = await getCrmActor();

  if (!actor) {
    redirect("/admin-dashboard/booking-records");
  }

  return children;
}
