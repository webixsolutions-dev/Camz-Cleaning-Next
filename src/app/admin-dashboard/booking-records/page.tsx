import BookingRecordsPortal, {
  type BookingEditHistory,
  type BookingImage,
  type BookingRecord,
  type BookingRoleDefinition,
  type CleanerUser,
  type PortalUser,
} from "@/components/admin/booking-records/BookingRecordsPortal";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

type JsonRecord = Record<string, unknown>;

type BookingAuditRow = {
  id: string;
  entity_id: string | null;
  actor_id: string | null;
  action: string;
  before: JsonRecord | null;
  after: JsonRecord | null;
  created_at: string;
};

const auditIgnoredFields = new Set([
  "updated_at",
  "edited_at",
  "last_edited_at",
  "modified_at",
  "updated_by",
  "updated_by_user",
  "updated_by_name",
  "edited_by",
  "edited_by_user",
  "edited_by_name",
  "last_edited_by",
  "last_edited_by_name",
  "modified_by",
  "modified_by_name",
]);

function comparable(value: unknown) {
  if (value === undefined) return "__undefined__";
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function changedFields(before: JsonRecord | null, after: JsonRecord | null) {
  const keys = new Set([
    ...Object.keys(before || {}),
    ...Object.keys(after || {}),
  ]);

  return [...keys].filter((key) => {
    if (auditIgnoredFields.has(key)) return false;
    return comparable(before?.[key]) !== comparable(after?.[key]);
  });
}

function firstString(record: JsonRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return null;
}

export default async function BookingRecordsPage() {
  const supabase = await createClient();
  const { data: profileResult } = await supabase.auth.getUser();

  // A Data Entry user may be allowed to edit bookings while RLS still limits
  // the users directory to their own profile. Use the server-side service key
  // only for the booking-user directory/roles so the cleaner picker can load.
  const { data: actorProfile } = profileResult.user
    ? await supabase
        .from("users")
        .select("id, name, role, is_blocked")
        .eq("id", profileResult.user.id)
        .maybeSingle()
    : { data: null };

  const actorRole = String(actorProfile?.role || "").toLowerCase();
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  const canUseDirectoryAdmin =
    Boolean(serviceKey) && ["admin", "data_entry"].includes(actorRole);

  const directoryClient = canUseDirectoryAdmin
    ? createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey!, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : supabase;

  const [
    { data: records },
    { data: assignments },
    { data: images },
    { data: allUsers },
    { data: roleRows },
    { data: auditRows },
  ] = await Promise.all([
    supabase
      .from("booking_records")
      .select("*")
      .order("service_date", { ascending: true })
      .order("service_time", { ascending: true }),

    directoryClient
      .from("booking_record_assignments")
      .select("booking_id, cleaner_id"),

    supabase
      .from("booking_record_images")
      .select("*")
      .order("uploaded_at", { ascending: true }),

    // Directory data is safe-listed before it reaches the client component.
    // Using the service client here fixes the empty cleaner list for Data Entry
    // accounts when users-table RLS only exposes the current user's own row.
    directoryClient
      .from("users")
      .select("*")
      .order("name", { ascending: true }),

    directoryClient
      .from("booking_roles")
      .select("key, name, base_role, is_system, can_access_crm, created_at")
      .order("is_system", { ascending: false })
      .order("name", { ascending: true }),

    // Existing audit storage is reused; no database migration is required.
    directoryClient
      .from("crm_audit_logs")
      .select("id, entity_id, actor_id, action, before, after, created_at")
      .eq("entity_type", "booking_records")
      .in("action", ["update", "status_update", "assignment_update"])
      .order("created_at", { ascending: false })
      .limit(1000),
  ]);


  const bookingRoleDefinitions: BookingRoleDefinition[] =
    roleRows && roleRows.length
      ? roleRows.map((role) => ({
          key: role.key,
          name: role.name,
          base_role: String(role.base_role).toLowerCase() as "cleaner" | "data_entry",
          is_system: Boolean(role.is_system),
          can_access_crm: Boolean(role.can_access_crm),
          created_at: role.created_at,
        }))
      : [
          {
            key: "cleaner",
            name: "Cleaner",
            base_role: "cleaner",
            is_system: true,
            can_access_crm: false,
            created_at: "",
          },
          {
            key: "data_entry",
            name: "Data Entry",
            base_role: "data_entry",
            is_system: true,
            can_access_crm: false,
            created_at: "",
          },
        ];

  const roleDefinitions: BookingRoleDefinition[] = [
    {
      key: "admin",
      name: "Admin",
      base_role: "admin",
      is_system: true,
      can_access_crm: true,
      created_at: "",
    },
    {
      key: "accountant",
      name: "Accountant",
      base_role: "accountant",
      is_system: true,
      can_access_crm: false,
      created_at: "",
    },
    ...bookingRoleDefinitions.filter(
      (role) => role.key !== "admin" && role.key !== "accountant",
    ),
  ];

  const roleMap = new Map(roleDefinitions.map((role) => [role.key, role]));

  const portalUsers = (allUsers || []).map((user) => {
    const storedRole = String(user.role || "customer").toLowerCase();
    const roleKey = String(user.booking_role_key || storedRole).toLowerCase();
    const roleDef = roleMap.get(roleKey) || roleMap.get(storedRole);
    // Prefer the role definition's base role. This also supports older rows
    // where users.role contains a custom booking-role key instead of "cleaner".
    const baseRole = String(roleDef?.base_role || storedRole).toLowerCase();

    return {
      id: user.id,
      name: user.name || "Unnamed user",
      email: user.email || "",
      phone_number: user.phone_number || null,
      role: baseRole,
      booking_role_key: roleKey,
      role_label:
        roleDef?.name || (baseRole === "data_entry" ? "Data Entry" : "Cleaner"),
      approval_status: user.approval_status || "approved",
      source: user.source || "Web",
      is_blocked: user.is_blocked ?? false,
      verified: user.verified ?? false,
      is_online: user.is_online ?? false,
      is_available: user.is_available ?? false,
      is_working: user.is_working ?? false,
      offering_fixed: user.offering_fixed ?? false,
      offering_hourly: user.offering_hourly ?? false,
      hourly_rate: user.hourly_rate ?? "0",
      created_at: user.created_at,
    };
  }) as PortalUser[];

  const usersById = new Map(portalUsers.map((user) => [user.id, user]));

  // Only Admin receives the full booking-user directory in the client UI.
  // Data Entry receives only the cleaner options required for assignment.
  const managedUsers = actorRole === "admin"
    ? portalUsers.filter((user) => ["admin", "accountant", "cleaner", "data_entry"].includes(user.role))
    : [];

  const operationalUserMap = new Map(
    portalUsers.map((user) => [user.id, user]),
  );

  const assignableCleaners = portalUsers.filter(
    (user) => user.role === "cleaner" && !user.is_blocked,
  );

  const assignmentsByBooking = new Map<string, CleanerUser[]>();

  for (const assignment of assignments || []) {
    const assignedUser = operationalUserMap.get(assignment.cleaner_id);
    if (!assignedUser) continue;

    const list = assignmentsByBooking.get(assignment.booking_id) || [];
    list.push({
      id: assignedUser.id,
      name: assignedUser.name || "Assigned Cleaner",
      email: assignedUser.email || "",
      role: assignedUser.role,
      role_key: assignedUser.booking_role_key || assignedUser.role,
      role_label: assignedUser.role_label ?? undefined,
    });
    assignmentsByBooking.set(assignment.booking_id, list);
  }

  const imagesByBooking = new Map<string, BookingImage[]>();
  for (const image of images || []) {
    const list = imagesByBooking.get(image.booking_id) || [];
    list.push(image as BookingImage);
    imagesByBooking.set(image.booking_id, list);
  }

  const auditByBooking = new Map<string, BookingEditHistory[]>();
  for (const rawAudit of (auditRows || []) as BookingAuditRow[]) {
    if (!rawAudit.entity_id) continue;

    const actor = rawAudit.actor_id ? usersById.get(rawAudit.actor_id) : null;
    const list = auditByBooking.get(rawAudit.entity_id) || [];
    list.push({
      id: rawAudit.id,
      actor_id: rawAudit.actor_id,
      actor_name: actor?.name || actor?.email || "Unknown user",
      action: rawAudit.action,
      created_at: rawAudit.created_at,
      changed_fields: changedFields(rawAudit.before, rawAudit.after),
    });
    auditByBooking.set(rawAudit.entity_id, list);
  }

  const currentUser = { data: actorProfile };

  const bookings = (records || []).map((rawRecord) => {
    const record = rawRecord as JsonRecord & {
      id: string;
      created_at?: string | null;
      updated_at?: string | null;
    };
    const history = (auditByBooking.get(record.id) || []).slice(0, 20);
    const latestAudit = history[0] || null;

    const metadataEditorId = firstString(record, [
      "last_edited_by",
      "edited_by",
      "edited_by_user",
      "updated_by",
      "updated_by_user",
      "modified_by",
    ]);
    const metadataEditorName = firstString(record, [
      "last_edited_by_name",
      "edited_by_name",
      "updated_by_name",
      "modified_by_name",
    ]);
    const metadataEditedAt = firstString(record, [
      "last_edited_at",
      "edited_at",
      "modified_at",
      "updated_at",
    ]);

    const createdAt = record.created_at ? new Date(record.created_at).getTime() : 0;
    const editedAt = metadataEditedAt ? new Date(metadataEditedAt).getTime() : 0;
    const metadataShowsEdit =
      Boolean(metadataEditorId || metadataEditorName) ||
      (Number.isFinite(createdAt) && Number.isFinite(editedAt) && editedAt > createdAt + 1000);

    const editorFromMetadata = metadataEditorId
      ? usersById.get(metadataEditorId)
      : null;

    return {
      ...rawRecord,
      assigned_cleaners: assignmentsByBooking.get(record.id) || [],
      service_images: imagesByBooking.get(record.id) || [],
      has_edits: Boolean(latestAudit || metadataShowsEdit),
      last_edited_by: latestAudit?.actor_id || metadataEditorId || null,
      last_edited_by_name:
        latestAudit?.actor_name ||
        metadataEditorName ||
        editorFromMetadata?.name ||
        editorFromMetadata?.email ||
        null,
      last_edited_at: latestAudit?.created_at || metadataEditedAt || null,
      edit_history: history,
    };
  }) as BookingRecord[];

  return (
    <BookingRecordsPortal
      bookings={bookings}
      cleaners={assignableCleaners.map((user) => ({
        id: user.id,
        name: user.name || "Assigned Cleaner",
        email: user.email || "",
        role: user.role,
        role_key: user.booking_role_key || user.role,
        role_label: user.role_label ?? undefined,
      }))}
      assignedUsers={managedUsers}
      roleDefinitions={roleDefinitions}
      currentUser={
        currentUser.data
          ? {
              id: currentUser.data.id,
              name: currentUser.data.name || "Portal User",
              role: currentUser.data.role || "",
            }
          : null
      }
    />
  );
}
