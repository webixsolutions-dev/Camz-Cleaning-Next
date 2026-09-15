import { getCrmActor } from "@/lib/crm/staff";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { actor, supabase, error, status } = await getCrmActor();
  if (!actor) return NextResponse.json({ error }, { status });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Invoice id is required." }, { status: 400 });

  try {
    const [{ data: events }, { data: emails }, { data: revisions }, { data: audits }] = await Promise.all([
      supabase.from("crm_invoice_events").select("*").eq("invoice_id", id).order("created_at", { ascending: false }),
      supabase.from("crm_invoice_emails").select("id, to_email, subject, status, sent_at, error, created_at").eq("invoice_id", id).order("created_at", { ascending: false }),
      supabase.from("crm_invoice_revisions").select("id, revision_number, created_at, created_by").eq("invoice_id", id).order("revision_number", { ascending: false }),
      supabase.from("crm_audit_logs").select("id, action, created_at, actor_id").eq("entity_id", id).order("created_at", { ascending: false }),
    ]);

    return NextResponse.json({
      events: events || [],
      emails: emails || [],
      revisions: revisions || [],
      audits: audits || [],
    });
  } catch (err) {
    console.error("CRM history GET failed:", err);
    return NextResponse.json({ error: "Unable to load invoice history." }, { status: 500 });
  }
}
