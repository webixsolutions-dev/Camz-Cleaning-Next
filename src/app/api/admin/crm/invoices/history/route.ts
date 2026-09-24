import { getInvoiceActor } from "@/lib/crm/staff";
import { NextRequest, NextResponse } from "next/server";

function titleFrom(value: unknown) {
  return String(value || "Invoice activity")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export async function GET(request: NextRequest) {
  const { actor, supabase, error, status } = await getInvoiceActor();
  if (!actor) return NextResponse.json({ error }, { status });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Invoice id is required." }, { status: 400 });

  try {
    const [
      invoiceResult,
      eventsResult,
      emailsResult,
      revisionsResult,
      paymentsResult,
      assetsResult,
      auditsResult,
    ] = await Promise.all([
      supabase
        .from("crm_invoices")
        .select("*, crm_customers(display_name, email, phone), crm_invoice_items(*)")
        .eq("id", id)
        .maybeSingle(),
      supabase.from("crm_invoice_events").select("*").eq("invoice_id", id).order("created_at", { ascending: false }),
      supabase.from("crm_invoice_emails").select("id, to_email, subject, status, sent_at, error, created_at, created_by").eq("invoice_id", id).order("created_at", { ascending: false }),
      supabase.from("crm_invoice_revisions").select("id, revision_number, snapshot, created_at, created_by").eq("invoice_id", id).order("revision_number", { ascending: false }),
      supabase.from("crm_payments").select("*").eq("invoice_id", id).order("created_at", { ascending: false }),
      supabase.from("crm_invoice_assets").select("id, kind, storage_path, public_url, created_at, created_by").eq("invoice_id", id).order("created_at", { ascending: false }),
      supabase.from("crm_audit_logs").select("id, action, before, after, created_at, actor_id").eq("entity_id", id).order("created_at", { ascending: false }),
    ]);

    if (invoiceResult.error) {
      return NextResponse.json({ error: invoiceResult.error.message }, { status: 400 });
    }
    if (!invoiceResult.data) return NextResponse.json({ error: "Invoice not found." }, { status: 404 });

    const events = eventsResult.data || [];
    const emails = emailsResult.data || [];
    const revisions = revisionsResult.data || [];
    const payments = paymentsResult.data || [];
    const assets = assetsResult.data || [];
    const audits = auditsResult.data || [];

    const actorIds = Array.from(new Set([
      ...events.map((row: any) => row.created_by),
      ...emails.map((row: any) => row.created_by),
      ...revisions.map((row: any) => row.created_by),
      ...payments.map((row: any) => row.created_by),
      ...assets.map((row: any) => row.created_by),
      ...audits.map((row: any) => row.actor_id),
      invoiceResult.data.created_by,
    ].filter(Boolean)));

    const { data: staff } = actorIds.length
      ? await supabase.from("users").select("id, name, email").in("id", actorIds)
      : { data: [] as any[] };

    const staffMap = new Map(
      (staff || []).map((row: any) => [row.id, `${row.name || "Staff"}${row.email ? ` <${row.email}>` : ""}`]),
    );
    const by = (idValue: unknown) => staffMap.get(String(idValue || "")) || "System";

    const timeline = [
      ...events.map((row: any) => ({
        id: `event-${row.id}`,
        title: titleFrom(row.event_type),
        detail: [row.payload?.reason || row.payload?.to || row.payload?.status || "", `By ${by(row.created_by)}`].filter(Boolean).join(" · "),
        timestamp: row.created_at,
        status: row.payload?.status || row.event_type,
        type: "event",
      })),
      ...payments.map((row: any) => ({
        id: `payment-${row.id}`,
        title: row.voided_at ? "Payment Reversed" : "Payment Recorded",
        detail: `${new Intl.NumberFormat("en-CA", { style: "currency", currency: row.currency || "CAD" }).format(Number(row.amount_cents || 0) / 100)} · ${String(row.method || "payment").replaceAll("_", " ")} · By ${by(row.created_by)}`,
        timestamp: row.voided_at || row.received_at || row.created_at,
        status: row.voided_at ? "void" : "paid",
        type: "payment",
      })),
      ...assets.map((row: any) => ({
        id: `asset-${row.id}`,
        title: row.kind === "pdf" ? "PDF Generated" : "Invoice Asset Generated",
        detail: `${row.storage_path || row.public_url || "Invoice file"} · By ${by(row.created_by)}`,
        timestamp: row.created_at,
        status: "generated",
        type: "asset",
      })),
      ...revisions.map((row: any) => ({
        id: `revision-${row.id}`,
        title: `Revision ${row.revision_number} Created`,
        detail: `Immutable invoice snapshot · By ${by(row.created_by)}`,
        timestamp: row.created_at,
        status: "revision",
        type: "revision",
      })),
      ...emails.map((row: any) => ({
        id: `email-${row.id}`,
        title: row.status === "sent" ? "Invoice Email Sent" : row.status === "failed" ? "Invoice Email Failed" : "Invoice Email Logged",
        detail: `${row.to_email || row.subject || ""}${row.created_by ? ` · By ${by(row.created_by)}` : ""}`,
        timestamp: row.sent_at || row.created_at,
        status: row.status,
        type: "email",
      })),
      ...audits.map((row: any) => ({
        id: `audit-${row.id}`,
        title: titleFrom(row.action),
        detail: `By ${by(row.actor_id)}`,
        timestamp: row.created_at,
        status: "audit",
        type: "audit",
      })),
    ].sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());

    return NextResponse.json({
      invoice: invoiceResult.data,
      events,
      emails,
      revisions,
      payments,
      assets,
      audits,
      timeline,
    });
  } catch (err) {
    console.error("CRM history GET failed:", err);
    return NextResponse.json({ error: "Unable to load invoice history." }, { status: 500 });
  }
}
