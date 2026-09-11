import { renderImmutableInvoicePdf } from "@/lib/crm/services/pdf";
import { getCrmActor } from "@/lib/crm/staff";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { actor, supabase, error, status } = await getCrmActor();
  if (!actor) return NextResponse.json({ error }, { status });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Invoice id is required." }, { status: 400 });

  try {
    const result = await renderImmutableInvoicePdf({
      supabase,
      invoiceId: id,
      actorId: actor.userId,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
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
