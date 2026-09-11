import CrmInvoicePdfPreview from "@/components/admin/crm/CrmInvoicePdfPreview";

export default async function CrmInvoicePdfPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CrmInvoicePdfPreview invoiceId={id} />;
}
