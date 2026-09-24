import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CrmInvoiceHistory from "@/components/admin/crm/CrmInvoiceHistory";

export default async function CrmInvoiceHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-[1500px]">
        <Link
          href={`/admin-dashboard/crm/invoices/${id}`}
          className="mb-4 inline-flex items-center gap-2 text-[12px] font-bold text-[#4A86F7]"
        >
          <ArrowLeft size={15} />
          Back to invoice
        </Link>
        <CrmInvoiceHistory invoiceId={id} />
      </div>
    </div>
  );
}
