import BookingRecordsPortal, {
  type BookingImage,
  type BookingRecord,
  type BookingRoleDefinition,
  type CleanerUser,
  type PortalUser,
} from "@/components/admin/booking-records/BookingRecordsPortal";
import { createClient } from "@/lib/supabase/server";

export default async function BookingRecordsPage() {
  const supabase = await createClient();

  const [
    { data: records },
    { data: assignments },
    { data: images },
    { data: allUsers },
    { data: roleRows },
    { data: profileResult },
  ] = await Promise.all([
    supabase
      .from("booking_records")
      .select("*")
      .order("service_date", { ascending: true }) // ✅ Yahan FALSE ko TRUE kar diya hai!
      .order("service_time", { ascending: true }),

    supabase
      .from("booking_record_assignments")
      .select("booking_id, cleaner_id"),

    supabase
      .from("booking_record_images")
      .select("*")
      .order("uploaded_at", { ascending: true }),

    // Use * here intentionally. If a freshly-added optional column such as
    // booking_role_key is not yet visible in PostgREST's schema cache,
    // explicitly selecting it can make the whole users query fail and the
    // Booking Users list appears empty. Existing fields are read defensively
    // below, so this stays backward-compatible.
    supabase
      .from("users")
      .select("*")
      .order("name", { ascending: true }),

    supabase
      .from("booking_roles")
      .select("key, name, base_role, is_system, created_at")
      .order("is_system", { ascending: false })
      .order("name", { ascending: true }),

    supabase.auth.getUser(),
  ]);

  const bookingRoleDefinitions: BookingRoleDefinition[] =
    roleRows && roleRows.length
      ? roleRows.map((role) => ({
          key: role.key,
          name: role.name,
          base_role: String(role.base_role).toLowerCase() as "cleaner" | "data_entry",
          is_system: Boolean(role.is_system),
          created_at: role.created_at,
        }))
      : [
          {
            key: "cleaner",
            name: "Cleaner",
            base_role: "cleaner",
            is_system: true,
            created_at: "",
          },
          {
            key: "data_entry",
            name: "Data Entry",
            base_role: "data_entry",
            is_system: true,
            created_at: "",
          },
        ];

  // Admin is a real application role, not a custom booking_roles row.
  // Inject it as a built-in option so Calendar > Manage Users can create
  // and display admin accounts without requiring a database migration.
  const roleDefinitions: BookingRoleDefinition[] = [
    {
      key: "admin",
      name: "Admin",
      base_role: "admin",
      is_system: true,
      created_at: "",
    },
    ...bookingRoleDefinitions.filter((role) => role.key !== "admin"),
  ];

  const roleMap = new Map(roleDefinitions.map((role) => [role.key, role]));

  const portalUsers = (allUsers || []).map((user) => {
    const baseRole = String(user.role || "customer").toLowerCase();
    const roleKey = String(user.booking_role_key || baseRole).toLowerCase();
    const roleDef = roleMap.get(roleKey);

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

  const managedUsers = portalUsers.filter((user) =>
    ["admin", "cleaner", "data_entry"].includes(user.role),
  );

  // We map ALL portal users for reference so past assignments don't break
  const operationalUserMap = new Map(
    portalUsers.map((user) => [user.id, user]),
  );

  // 🔥 QA POINT 4 FIX: Only explicitly allow users with the "cleaner" role to be assigned.
  // Admin accounts and Data Entry accounts are safely excluded from the picker.
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
      name: assignedUser.name || "Assigned Cleaner", // 🔥 QA POINT 5 FIX: Fallback label updated
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

  const currentUser = profileResult.user
    ? await supabase
        .from("users")
        .select("id, name, role")
        .eq("id", profileResult.user.id)
        .maybeSingle()
    : { data: null };

  const bookings = (records || []).map((record) => ({
    ...record,
    assigned_cleaners: assignmentsByBooking.get(record.id) || [],
    service_images: imagesByBooking.get(record.id) || [],
  })) as BookingRecord[];

  return (
    <BookingRecordsPortal
      bookings={bookings}
      cleaners={assignableCleaners.map((user) => ({
        id: user.id,
        name: user.name || "Assigned Cleaner", // 🔥 QA POINT 5 FIX: Fallback label updated
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