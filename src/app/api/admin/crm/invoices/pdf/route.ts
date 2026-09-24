import { renderImmutableInvoicePdf } from "@/lib/crm/services/pdf";
import { getInvoiceActor } from "@/lib/crm/staff";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { actor, supabase, error, status } = await getInvoiceActor();
  if (!actor) return NextResponse.json({ error }, { status });
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const download = url.searchParams.get("download") === "1" || url.searchParams.get("format") === "pdf";
  if (!id) return NextResponse.json({ error: "Invoice id is required." }, { status: 400 });

  try {
    const result = await renderImmutableInvoicePdf({
      supabase,
      invoiceId: id,
      actorId: actor.userId,
      logAsset: true,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    await supabase.from("crm_invoice_events").insert({
      invoice_id: id,
      event_type: "pdf_generated",
      payload: { filename: result.filename, download },
      created_by: actor.userId,
    });

    if (download) {
      const bytes = new Uint8Array(result.pdfBytes);
      return new NextResponse(bytes, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${result.filename}"`,
          "Cache-Control": "no-store",
          "X-CRM-Snapshot": result.snapshotUsed ? "revision" : "live-draft",
        },
      });
    }

    return new NextResponse(result.html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="${result.invoice_number || "draft"}.html"`,
        "X-CRM-Snapshot": result.snapshotUsed ? "revision" : "live-draft",
      },
    });
  } catch (err) {
    console.error("CRM pdf GET failed:", err);
    return NextResponse.json({ error: "Unable to build invoice PDF snapshot." }, { status: 500 });
  }
}
