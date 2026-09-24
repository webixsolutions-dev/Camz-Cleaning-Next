import { getCrmActor, getInvoiceActor } from "@/lib/crm/staff";
import { redirect } from "next/navigation";

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const { actor: crmActor } = await getCrmActor();

  if (crmActor) {
    return children;
  }

  const { actor: invoiceActor } = await getInvoiceActor();
  if (!invoiceActor) {
    redirect("/admin-dashboard/booking-records");
  }

  return children;
}
