import { enforceMutationSecurity } from "@/lib/security/http";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { sendAssignmentEmail } from "@/lib/email";
import { writeCrmAudit } from "@/lib/crm/services/audit";

type BookingPayload = Record<string, unknown> & {
  id?: string;
  assigned_cleaner_ids?: string[];
  image?: {
    booking_id: string;
    image_type: "before" | "after";
    url: string;
    storage_path?: string;
    name?: string;
    width?: number;
    height?: number;
    format?: string;
  };
  image_update?: {
    id: string;
    url: string;
    storage_path?: string;
    name?: string;
    width?: number;
    height?: number;
    format?: string;
  };
};

type BookingAssignmentRow = {
  cleaner_id: string;
};

function getServiceClient(): any {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return createAdminClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function validateCleanerAssignments(
  db: any,
  cleanerIds: string[],
) {
  const uniqueIds = [...new Set(cleanerIds.filter(Boolean))];
  if (!uniqueIds.length) return null;

  const client = db as any;

  const { data: users, error } = await client
    .from("users")
    .select("id, role, booking_role_key, is_blocked")
    .in("id", uniqueIds);

  if (error) return error.message;

  const roleKeys = [...new Set(
    (users || [])
      .map((row: any) => String(row.booking_role_key || row.role || "").toLowerCase())
      .filter(Boolean),
  )];

  const { data: roleRows } = roleKeys.length
    ? await client.from("booking_roles").select("key, base_role").in("key", roleKeys)
    : { data: [] as { key: string; base_role: string }[] };

  const roleBaseMap = new Map(
    (roleRows || []).map((row: any) => [String(row.key).toLowerCase(), String(row.base_role).toLowerCase()]),
  );

  const validIds = new Set(
    (users || [])
      .filter((row: any) => {
        if (row.is_blocked === true) return false;
        const storedRole = String(row.role || "").toLowerCase();
        const roleKey = String(row.booking_role_key || storedRole).toLowerCase();
        const baseRole = roleBaseMap.get(roleKey) || storedRole;
        return baseRole === "cleaner";
      })
      .map((row: any) => row.id),
  );

  const invalidIds = uniqueIds.filter((id) => !validIds.has(id));
  return invalidIds.length ? "Only active Cleaner users can be assigned to a booking." : null;
}

function getRole(profile: { role?: unknown } | null) {
  return String(profile?.role || "").toLowerCase();
}

function todayInBusinessTz() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Edmonton", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function isStatusOnlyUpdate(body: BookingPayload) {
  return Object.keys(body).every((key) => ["id", "status"].includes(key)) && ["pending", "ongoing", "completed"].includes(String(body.status));
}

async function getPortalUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { allowed: false, supabase, user: null, profile: null };
  const { data: profile } = await supabase.from("users").select("id, name, role, is_blocked").eq("id", user.id).maybeSingle();
  const role = getRole(profile);
  return { allowed: !!profile && !profile.is_blocked && ["admin", "data_entry", "cleaner"].includes(role || ""), supabase, user, profile };
}

function cleanBookingPayload(body: BookingPayload) {
  const useManpowerTime = Boolean(body.use_manpower_time);
  return {
    full_name: String(body.full_name || "").trim(),
    cleaning_type: String(body.cleaning_type || "").trim(),
    area: String(body.area || "").trim(),
    focus_details: String(body.focus_details || "").trim() || null,
    service_date: String(body.service_date || ""),
    service_time: String(body.service_time || ""),
    full_address: String(body.full_address || "").trim(),
    price: Number(body.price || 0),
    show_price_to_cleaner: Boolean(body.show_price_to_cleaner),
    use_manpower_time: useManpowerTime,
    manpower_min_hours: useManpowerTime ? Number(body.manpower_min_hours || 0) : null,
    manpower_max_hours: useManpowerTime ? Number(body.manpower_max_hours || 0) : null,
    email: String(body.email || "").trim(),
    phone: String(body.phone || "").trim(),
    added_by: String(body.added_by || "").trim() || null,
    scope_of_work: String(body.scope_of_work || "").trim() || null,
    parking_instructions: String(body.parking_instructions || "").trim() || null,
    status: String(body.status || "pending"),
    start_date: String(body.start_date || "") || null,
    start_time: String(body.start_time || "") || null,
    end_date: String(body.end_date || "") || null,
    end_time: String(body.end_time || "") || null,
    completion_remarks: String(body.completion_remarks || "").trim() || null,
    worked_hours: Number(body.worked_hours || 0),
    hours_approved: Boolean(body.hours_approved),
    approved_hours: Number(body.approved_hours || 0),
  };
}


function applyEditorMetadata(
  existing: Record<string, unknown>,
  updates: Record<string, unknown>,
  userId: string,
  editorName: string,
) {
  const now = new Date().toISOString();

  for (const key of [
    "updated_by",
    "updated_by_user",
    "edited_by",
    "edited_by_user",
    "last_edited_by",
    "modified_by",
  ]) {
    if (key in existing) updates[key] = userId;
  }

  for (const key of [
    "updated_by_name",
    "edited_by_name",
    "last_edited_by_name",
    "modified_by_name",
  ]) {
    if (key in existing) updates[key] = editorName;
  }

  for (const key of ["updated_at", "edited_at", "last_edited_at", "modified_at"]) {
    if (key in existing) updates[key] = now;
  }

  return updates;
}

function validateManpowerTime(payload: ReturnType<typeof cleanBookingPayload>) {
  if (!payload.use_manpower_time) return null;
  if (!payload.manpower_min_hours || !payload.manpower_max_hours) return "Please enter both minimum and maximum manpower hours.";
  if (payload.manpower_max_hours < payload.manpower_min_hours) return "Maximum manpower hours must be greater than or equal to minimum hours.";
  return null;
}

async function syncAssignments(supabase: any, bookingId: string, cleanerIds: string[], assignedBy: string) {
  await supabase.from("booking_record_assignments").delete().eq("booking_id", bookingId);
  if (!cleanerIds.length) return;
  await supabase.from("booking_record_assignments").insert(cleanerIds.map((cleaner_id) => ({ booking_id: bookingId, cleaner_id, assigned_by: assignedBy })));
}

async function notifyCleaners(supabase: any, cleanerIds: string[], bookingData: any) {
  if (!cleanerIds || cleanerIds.length === 0) return;

  const { data: cleaners, error } = await supabase
    .from("users")
    .select("id, name, email")
    .in("id", cleanerIds);

  if (error) {
    console.error("❌ [EMAIL FAILED] Could not load cleaner email recipients:", error);
    return;
  }
  if (!cleaners?.length) return;

  // Email delivery happens in parallel so multiple cleaners do not make the
  // background job unnecessarily slow.
  await Promise.allSettled(
    cleaners.map(async (cleaner: any) => {
      if (!cleaner.email) {
        console.log(`⚠️ [EMAIL SKIPPED] No email address found for user: ${cleaner.name}`);
        return;
      }

      try {
        await sendAssignmentEmail(
          cleaner.email,
          cleaner.name || "Cleaner",
          {
            full_name: bookingData.full_name,
            service_date: bookingData.service_date,
            service_time: bookingData.service_time,
            full_address: bookingData.full_address,
            cleaning_type: bookingData.cleaning_type,
            area: bookingData.area,
          },
        );
        console.log(`✅ [EMAIL SUCCESS] Assignment email sent to: ${cleaner.name} (${cleaner.email})`);
      } catch (error) {
        console.error(`❌ [EMAIL FAILED] Could not send email to ${cleaner.email}. Error:`, error);
      }
    }),
  );
}

function queueCleanerNotifications(
  supabase: any,
  cleanerIds: string[],
  bookingData: any,
) {
  if (!cleanerIds.length) return;

  // This app is self-hosted under PM2, so do not block the booking API response
  // while SMTP finishes. The promise continues on the Node.js server after the
  // booking response has been returned to the browser.
  void notifyCleaners(supabase, cleanerIds, bookingData).catch((error) => {
    console.error("❌ [EMAIL BACKGROUND JOB FAILED]", error);
  });
}


export async function POST(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, { bucket: "booking-records-post", limit: 60, windowSeconds: 60 });
  if (securityError) return securityError;
  const { allowed, supabase, user, profile } = await getPortalUser();
  if (!allowed || !user) return NextResponse.json({ error: "Portal access required." }, { status: 403 });
  const body = (await request.json()) as BookingPayload;

  if (body.image) {
    if (!body.image.booking_id || !["before", "after"].includes(body.image.image_type) || !body.image.url) {
      return NextResponse.json({ error: "Valid booking image details are required." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("booking_record_images")
      .insert({ ...body.image, uploaded_by: user.id })
      .select("id, booking_id, image_type, url, storage_path, name, width, height, format, uploaded_at")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ image: data });
  }

  if (getRole(profile) === "cleaner") {
    return NextResponse.json({ error: "Cleaners cannot create booking records." }, { status: 403 });
  }

  const payload = cleanBookingPayload(body);
  if (!payload.full_name || !payload.cleaning_type || !payload.area || !payload.service_date || !payload.service_time || !payload.full_address || !payload.email || !payload.phone) {
    return NextResponse.json({ error: "Please fill all required booking fields." }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.service_date)) {
    return NextResponse.json({ error: "Invalid service date." }, { status: 400 });
  }
  if (payload.service_date < todayInBusinessTz()) {
    return NextResponse.json({ error: "Service date cannot be in the past." }, { status: 400 });
  }
  const manpowerError = validateManpowerTime(payload);
  if (manpowerError) return NextResponse.json({ error: manpowerError }, { status: 400 });

  const serviceClient = getServiceClient();
  const writeClient: any = ["admin", "data_entry"].includes(getRole(profile)) && serviceClient
    ? serviceClient
    : supabase;
  const requestedCleanerIds = body.assigned_cleaner_ids || [];
  const cleanerValidationError = await validateCleanerAssignments(writeClient, requestedCleanerIds);
  if (cleanerValidationError) {
    return NextResponse.json({ error: cleanerValidationError }, { status: 400 });
  }

  const { data, error } = await writeClient.from("booking_records").insert({ ...payload, added_by_user: user.id, added_by: profile?.name || user.email || "Portal User" }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  
  await syncAssignments(writeClient, data.id, requestedCleanerIds, user.id);
  
  if (requestedCleanerIds.length > 0) {
    queueCleanerNotifications(writeClient, requestedCleanerIds, data);
  }

  return NextResponse.json({ booking: data });
}

export async function PATCH(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, { bucket: "booking-records-patch", limit: 60, windowSeconds: 60 });
  if (securityError) return securityError;
  const { allowed, supabase, user, profile } = await getPortalUser();
  if (!allowed || !user) return NextResponse.json({ error: "Portal access required." }, { status: 403 });
  const body = (await request.json()) as BookingPayload;
  const role = getRole(profile);
  const serviceClient = getServiceClient();
  const mutationClient: any = ["admin", "data_entry"].includes(role) && serviceClient
    ? serviceClient
    : supabase;

  if (body.image_update) {
    const imageUpdate = body.image_update;
    if (!imageUpdate.id || !imageUpdate.url) {
      return NextResponse.json({ error: "Image id and URL are required." }, { status: 400 });
    }

    const { data: existingImage, error: existingError } = await supabase
      .from("booking_record_images")
      .select("id, storage_path")
      .eq("id", imageUpdate.id)
      .maybeSingle();

    if (existingError) return NextResponse.json({ error: existingError.message }, { status: 400 });
    if (!existingImage) return NextResponse.json({ error: "Booking image not found." }, { status: 404 });

    const { id: _imageId, ...imageFields } = imageUpdate;
    void _imageId;

    const { data: updatedImage, error: updateError } = await supabase
      .from("booking_record_images")
      .update({ ...imageFields, uploaded_by: user.id })
      .eq("id", imageUpdate.id)
      .select("id, booking_id, image_type, url, storage_path, name, width, height, format, uploaded_at")
      .single();

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });

    if (existingImage.storage_path && existingImage.storage_path !== imageUpdate.storage_path) {
      await supabase.storage.from("job-images").remove([existingImage.storage_path]);
    }

    return NextResponse.json({ image: updatedImage });
  }

  if (!body.id) return NextResponse.json({ error: "Booking id is required." }, { status: 400 });

  if (Array.isArray(body.assigned_cleaner_ids) && Object.keys(body).length <= 2) {
    if (!["admin", "data_entry"].includes(role)) return NextResponse.json({ error: "Admin or Data Entry access is required to assign cleaners." }, { status: 403 });

    const cleanerValidationError = await validateCleanerAssignments(mutationClient, body.assigned_cleaner_ids);
    if (cleanerValidationError) {
      return NextResponse.json({ error: cleanerValidationError }, { status: 400 });
    }

    const { data: previousAssignments } = await mutationClient
      .from("booking_record_assignments")
      .select("cleaner_id")
      .eq("booking_id", body.id);

    await syncAssignments(mutationClient, body.id, body.assigned_cleaner_ids, user.id);

    const previousCleanerIds = ((previousAssignments || []) as BookingAssignmentRow[]).map((item) => item.cleaner_id);
    const newlyAssignedCleanerIds = body.assigned_cleaner_ids.filter((id) => !previousCleanerIds.includes(id));
    const { data: bookingData } = await mutationClient.from("booking_records").select("*").eq("id", body.id).single();
    if (bookingData && newlyAssignedCleanerIds.length > 0) {
      queueCleanerNotifications(mutationClient, newlyAssignedCleanerIds, bookingData);
    }

    await writeCrmAudit(mutationClient, {
      entity_type: "booking_records",
      entity_id: body.id,
      action: "assignment_update",
      before: { assigned_cleaner_ids: ((previousAssignments || []) as BookingAssignmentRow[]).map((item) => item.cleaner_id) },
      after: { assigned_cleaner_ids: body.assigned_cleaner_ids },
      actor_id: user.id,
    });

    return NextResponse.json({ ok: true });
  }

  if (role === "cleaner") {
    if (!isStatusOnlyUpdate(body)) {
      return NextResponse.json({ error: "Cleaners can only update booking status." }, { status: 403 });
    }

    const { data: before } = await supabase
      .from("booking_records")
      .select("*")
      .eq("id", body.id)
      .maybeSingle();

    if (!before) return NextResponse.json({ error: "Booking not found." }, { status: 404 });

    const statusUpdate = applyEditorMetadata(
      before as Record<string, unknown>,
      { status: body.status },
      user.id,
      profile?.name || user.email || "Portal User",
    );

    const { data: after, error } = await supabase
      .from("booking_records")
      .update(statusUpdate)
      .eq("id", body.id)
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await writeCrmAudit(supabase, {
      entity_type: "booking_records",
      entity_id: body.id,
      action: "status_update",
      before,
      after,
      actor_id: user.id,
    });

    return NextResponse.json({ ok: true });
  }

  if (!["admin", "data_entry"].includes(role)) {
    return NextResponse.json({ error: "Booking edit access required." }, { status: 403 });
  }

  const { data: existingBooking, error: existingError } = await mutationClient
    .from("booking_records")
    .select("*")
    .eq("id", body.id)
    .maybeSingle();

  if (existingError) return NextResponse.json({ error: existingError.message }, { status: 400 });
  if (!existingBooking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });

  const payload = cleanBookingPayload(body);
  const manpowerError = validateManpowerTime(payload);
  if (manpowerError) return NextResponse.json({ error: manpowerError }, { status: 400 });
  const { added_by: _ignoredAddedBy, ...cleanUpdatePayload } = payload;
  void _ignoredAddedBy;

  const updatePayload = applyEditorMetadata(
    existingBooking as Record<string, unknown>,
    cleanUpdatePayload as Record<string, unknown>,
    user.id,
    profile?.name || user.email || "Portal User",
  );

  const { data: updatedBooking, error } = await mutationClient
    .from("booking_records")
    .update(updatePayload)
    .eq("id", body.id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await writeCrmAudit(mutationClient, {
    entity_type: "booking_records",
    entity_id: body.id,
    action: "update",
    before: existingBooking,
    after: updatedBooking,
    actor_id: user.id,
  });

  // Admin and Data Entry users can assign/reassign cleaners. Assignment changes
  // are written to the same audit log so Admin can see who made the change.
  if (["admin", "data_entry"].includes(role) && Array.isArray(body.assigned_cleaner_ids)) {
    const cleanerValidationError = await validateCleanerAssignments(mutationClient, body.assigned_cleaner_ids);
    if (cleanerValidationError) {
      return NextResponse.json({ error: cleanerValidationError }, { status: 400 });
    }

    const { data: previousAssignments } = await mutationClient
      .from("booking_record_assignments")
      .select("cleaner_id")
      .eq("booking_id", body.id);

    const previousCleanerIds = ((previousAssignments || []) as BookingAssignmentRow[]).map((item) => item.cleaner_id);
    const nextCleanerIds = body.assigned_cleaner_ids;
    const previousKey = [...previousCleanerIds].sort().join("|");
    const nextKey = [...nextCleanerIds].sort().join("|");

    if (previousKey !== nextKey) {
      await syncAssignments(mutationClient, body.id, nextCleanerIds, user.id);

      const newlyAssignedCleanerIds = nextCleanerIds.filter((id) => !previousCleanerIds.includes(id));
      if (newlyAssignedCleanerIds.length > 0 && updatedBooking) {
        queueCleanerNotifications(mutationClient, newlyAssignedCleanerIds, updatedBooking);
      }

      await writeCrmAudit(mutationClient, {
        entity_type: "booking_records",
        entity_id: body.id,
        action: "assignment_update",
        before: { assigned_cleaner_ids: previousCleanerIds },
        after: { assigned_cleaner_ids: nextCleanerIds },
        actor_id: user.id,
      });
    }
  }

  return NextResponse.json({ ok: true, booking: updatedBooking });
}

export async function DELETE(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, { bucket: "booking-records-delete", limit: 60, windowSeconds: 60 });
  if (securityError) return securityError;
  const { allowed, supabase, profile } = await getPortalUser();
  if (!allowed) return NextResponse.json({ error: "Portal access required." }, { status: 403 });
  const params = new URL(request.url).searchParams;
  const imageId = params.get("imageId");
  if (imageId) {
    const { data: image, error: imageLookupError } = await supabase
      .from("booking_record_images")
      .select("id, storage_path")
      .eq("id", imageId)
      .maybeSingle();

    if (imageLookupError) return NextResponse.json({ error: imageLookupError.message }, { status: 400 });
    if (!image) return NextResponse.json({ error: "Booking image not found." }, { status: 404 });

    const { error } = await supabase.from("booking_record_images").delete().eq("id", imageId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    if (image.storage_path) {
      await supabase.storage.from("job-images").remove([image.storage_path]);
    }

    return NextResponse.json({ ok: true });
  }
  if (getRole(profile) !== "admin") return NextResponse.json({ error: "Only admin can delete booking records." }, { status: 403 });
  const id = params.get("id");
  if (!id) return NextResponse.json({ error: "Booking id is required." }, { status: 400 });
  const { error } = await supabase.from("booking_records").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}