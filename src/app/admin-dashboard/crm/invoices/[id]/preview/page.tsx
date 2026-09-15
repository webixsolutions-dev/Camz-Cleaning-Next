import CrmInvoicePdfPreview from "@/components/admin/crm/CrmInvoicePdfPreview";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CrmInvoicePdfPreviewPage({
  params,
}: PageProps) {
  const { id } = await params;

  return <CrmInvoicePdfPreview invoiceId={id} />;
}