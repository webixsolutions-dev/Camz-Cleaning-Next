import { buildInvoicePdfBytes, invoicePdfFilename } from "@/lib/crm/invoicePdfBytes";
import { loadOfficialLogoDataUri } from "@/lib/crm/logo";
import { buildInvoiceHtml, pickBillingAddress, pickServiceAddress, type CompanyLike, type InvoiceLike } from "@/lib/crm/pdf";
import { writeCrmAudit } from "@/lib/crm/services/audit";

type PdfClient = {
  from: (table: string) => any;
};

function fromRevisionSnapshot(snapshot: any, live: any): InvoiceLike {
  const invoice = snapshot?.invoice || {};
  const items = snapshot?.items || [];
  return {
    invoice_number: invoice.invoice_number,
    currency: invoice.currency,
    status: live.status,
    is_void: live.is_void,
    invoice_date: invoice.invoice_date || live.invoice_date,
    service_date: invoice.service_date,
    issue_date: invoice.issue_date || live.issue_date,
    issued_at: invoice.issued_at || live.issued_at,
    due_date: invoice.due_date,
    notes: invoice.notes,
    subtotal_cents: invoice.subtotal_cents,
    discount_cents: invoice.discount_cents,
    discount_reason: invoice.discount_reason,
    tax_enabled: invoice.tax_enabled,
    tax_rate_bps: invoice.tax_rate_bps,
    tax_cents: invoice.tax_cents,
    total_cents: invoice.total_cents,
    amount_paid_cents: live.amount_paid_cents,
    balance_cents: live.balance_cents,
    crm_customers: live.crm_customers,
    billing_address: pickBillingAddress(live),
    service_address: pickServiceAddress(live),
    crm_invoice_items: items,
    crm_payments: live.crm_payments || [],
  };
}

export async function renderImmutableInvoicePdf(options: {
  supabase: PdfClient;
  invoiceId: string;
  actorId?: string;
  logAsset?: boolean;
}) {
  const [{ data: live, error }, { data: settings }, logoSrc] = await Promise.all([
    options.supabase
      .from("crm_invoices")
      .select("*, crm_customers(display_name, customer_code, email, phone, crm_customer_addresses(*)), crm_invoice_items(*), crm_payments(*)")
      .eq("id", options.invoiceId)
      .maybeSingle(),
    options.supabase.from("crm_company_settings").select("*").eq("id", 1).maybeSingle(),
    loadOfficialLogoDataUri(),
  ]);

  if (error || !live) {
    return { ok: false as const, error: error?.message || "Invoice not found." };
  }

  let source: InvoiceLike = {
    ...live,
    billing_address: pickBillingAddress(live),
    service_address: pickServiceAddress(live),
  };
  let snapshotUsed = false;

  if (live.status !== "draft" && !live.is_void) {
    const { data: revision } = await options.supabase
      .from("crm_invoice_revisions")
      .select("snapshot, revision_number")
      .eq("invoice_id", options.invoiceId)
      .eq("revision_number", live.current_revision)
      .maybeSingle();

    if (revision?.snapshot) {
      source = fromRevisionSnapshot(revision.snapshot, live);
      snapshotUsed = true;
    }
  }

  const company = (settings || {}) as CompanyLike;
  const resolvedLogo = settings?.logo_url || logoSrc;
  const html = buildInvoiceHtml(source, {
    company,
    logoSrc: resolvedLogo,
    preview: false,
  });
  const pdfBytes = await buildInvoicePdfBytes({
    invoice: source,
    company,
    logoSrc: resolvedLogo,
  });
  const filename = invoicePdfFilename(live.invoice_number);

  if (options.logAsset !== false && options.actorId) {
    const storagePath = `snapshot/${options.invoiceId}/rev-${live.current_revision || 0}-${Date.now()}.pdf`;
    const { error: assetError } = await options.supabase.from("crm_invoice_assets").insert({
      kind: "pdf",
      invoice_id: options.invoiceId,
      storage_path: storagePath,
      public_url: snapshotUsed ? "revision-snapshot" : "live-draft",
      created_by: options.actorId,
    });
    if (assetError) console.error("CRM pdf asset insert failed:", assetError);

    await writeCrmAudit(options.supabase, {
      entity_type: "crm_invoice_assets",
      entity_id: options.invoiceId,
      action: "pdf_snapshot",
      after: { storage_path: storagePath, immutable: snapshotUsed, filename },
      actor_id: options.actorId,
    });
  }

  return {
    ok: true as const,
    html,
    pdfBytes,
    filename,
    invoice_number: live.invoice_number,
    snapshotUsed,
  };
}
