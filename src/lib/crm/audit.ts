type AuditClient = {
  from: (table: string) => {
    insert: (row: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
  };
};

export async function writeCrmAudit(
  supabase: AuditClient,
  row: {
    entity_type: string;
    entity_id?: string | null;
    action: string;
    before?: unknown;
    after?: unknown;
    actor_id?: string | null;
  },
) {
  const { error } = await supabase.from("crm_audit_logs").insert({
    entity_type: row.entity_type,
    entity_id: row.entity_id || null,
    action: row.action,
    before: row.before ?? null,
    after: row.after ?? null,
    actor_id: row.actor_id || null,
  });
  if (error) {
    console.error("CRM audit insert failed:", error);
  }
}
