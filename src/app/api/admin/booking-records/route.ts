import { enforceMutationSecurity } from "@/lib/security/http";
import { NextRequest, NextResponse, after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendAssignmentEmail } from "@/lib/email"; 
import { revalidatePath } from "next/cache";

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

function validateManpowerTime(payload: ReturnType<typeof cleanBookingPayload>) {
  if (!payload.use_manpower_time) return null;
  if (!payload.manpower_min_hours || !payload.manpower_max_hours) return "Please enter both minimum and maximum manpower hours.";
  if (payload.manpower_max_hours < payload.manpower_min_hours) return "Maximum manpower hours must be greater than or equal to minimum hours.";
  return null;
}

// ✅ Improved syncAssignments with error handling
async function syncAssignments(
  supabase: Awaited<ReturnType<typeof createClient>>,
  bookingId: string,
  cleanerIds: string[],
  assignedBy: string
) {
  const { error: deleteError } = await supabase
    .from("booking_record_assignments")
    .delete()
    .eq("booking_id", bookingId);

  if (deleteError) {
    console.error("❌ [ASSIGNMENT DELETE FAILED]", deleteError);
    throw new Error(`Failed to clear assignments: ${deleteError.message}`);
  }

  if (!cleanerIds.length) return;

  const { error: insertError } = await supabase
    .from("booking_record_assignments")
    .insert(cleanerIds.map((cleaner_id) => ({
      booking_id: bookingId,
      cleaner_id,
      assigned_by: assignedBy,
    })));

  if (insertError) {
    console.error("❌ [ASSIGNMENT INSERT FAILED]", insertError);
    throw new Error(`Failed to save assignments: ${insertError.message}`);
  }

  console.log(`✅ [ASSIGNMENT] ${cleanerIds.length} cleaner(s) saved for booking ${bookingId}`);
}

async function notifyCleaners(
  supabase: Awaited<ReturnType<typeof createClient>>,
  cleanerIds: string[],
  bookingData: any
) {
  if (!cleanerIds || cleanerIds.length === 0) return;

  const { data: cleaners } = await supabase
    .from("users")
    .select("id, name, email")
    .in("id", cleanerIds);

  if (!cleaners) return;

  for (const cleaner of cleaners) {
    if (cleaner.email) {
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
          }
        );
        console.log(`✅ [EMAIL SUCCESS] Assignment email sent to: ${cleaner.name} (${cleaner.email})`);
      } catch (error) {
        console.error(`❌ [EMAIL FAILED] Could not send email to ${cleaner.email}. Error:`, error);
      }
    } else {
      console.log(`⚠️ [EMAIL SKIPPED] No email address found for user: ${cleaner.name}`);
    }
  }
}

// ✅ Background email helper — response ke baad chalega, request block nahi karega
function sendAssignmentEmailsInBackground(
  supabase: Awaited<ReturnType<typeof createClient>>,
  cleanerIds: string[],
  bookingData: any
) {
  if (!cleanerIds || cleanerIds.length === 0) return;
  after(async () => {
    try {
      await notifyCleaners(supabase, cleanerIds, bookingData);
    } catch (err) {
      console.error("❌ [BACKGROUND EMAIL ERROR]", err);
    }
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

  const { data, error } = await supabase
    .from("booking_records")
    .insert({ ...payload, added_by_user: user.id, added_by: profile?.name || user.email || "Portal User" })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  try {
    await syncAssignments(supabase, data.id, body.assigned_cleaner_ids || [], user.id);
  } catch (err) {
    console.error("❌ Assignment failed on POST:", err);
    // booking create ho gayi hai, assignment fail — warn karo lekin error na do
  }

  // ✅ Email background mein bhejo — response block nahi hoga
  if (body.assigned_cleaner_ids && body.assigned_cleaner_ids.length > 0) {
    sendAssignmentEmailsInBackground(supabase, body.assigned_cleaner_ids, data);
  }

  revalidatePath("/admin-dashboard/booking-records");
  revalidatePath("/admin/booking-records");

  return NextResponse.json({ booking: data });
}

export async function PATCH(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, { bucket: "booking-records-patch", limit: 60, windowSeconds: 60 });
  if (securityError) return securityError;
  const { allowed, supabase, user, profile } = await getPortalUser();
  if (!allowed || !user) return NextResponse.json({ error: "Portal access required." }, { status: 403 });
  const body = (await request.json()) as BookingPayload;
  const role = getRole(profile);

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

  // === Assignment-only update ===
  if (Array.isArray(body.assigned_cleaner_ids) && Object.keys(body).length <= 2) {
    if (role !== "admin" && role !== "data_entry") {
      return NextResponse.json({ error: "Only admin and data entry can assign cleaners." }, { status: 403 });
    }

    try {
      await syncAssignments(supabase, body.id, body.assigned_cleaner_ids, user.id);
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Failed to save assignments" },
        { status: 500 }
      );
    }

    const { data: bookingData } = await supabase.from("booking_records").select("*").eq("id", body.id).single();

    // ✅ Background email
    if (bookingData && body.assigned_cleaner_ids.length > 0) {
      sendAssignmentEmailsInBackground(supabase, body.assigned_cleaner_ids, bookingData);
    }

    revalidatePath("/admin-dashboard/booking-records");
    revalidatePath("/admin/booking-records");

    return NextResponse.json({ ok: true });
  }

  // === Cleaner status-only update ===
  if (role === "cleaner") {
    if (!isStatusOnlyUpdate(body)) {
      return NextResponse.json({ error: "Cleaners can only update booking status." }, { status: 403 });
    }
    const { error } = await supabase.from("booking_records").update({ status: body.status }).eq("id", body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    revalidatePath("/admin-dashboard/booking-records");
    revalidatePath("/admin/booking-records");

    return NextResponse.json({ ok: true });
  }

  // === Full edit (admin + data_entry) ===
  if (role !== "admin" && role !== "data_entry") {
    return NextResponse.json({ error: "Only admin and data entry can edit booking records." }, { status: 403 });
  }

  const payload = cleanBookingPayload(body);
  const manpowerError = validateManpowerTime(payload);
  if (manpowerError) return NextResponse.json({ error: manpowerError }, { status: 400 });
  const { added_by: _ignoredAddedBy, ...updatePayload } = payload;
  void _ignoredAddedBy;

  const trackingPayload = {
    ...updatePayload,
    last_edited_by: user.id,
    last_edited_by_name: profile?.name || user.email || "Unknown user",
    last_edited_by_role: role,
    last_edited_at: new Date().toISOString(),
    edited_by_data_entry: role === "data_entry",
  };

  const { data: updatedBooking, error } = await supabase
    .from("booking_records")
    .update(trackingPayload)
    .eq("id", body.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Assignment sync (agar cleaner IDs bheji gayi hain)
  if (Array.isArray(body.assigned_cleaner_ids)) {
    if (role !== "admin" && role !== "data_entry") {
      return NextResponse.json({ error: "Only admin and data entry can assign cleaners." }, { status: 403 });
    }

    try {
      await syncAssignments(supabase, body.id, body.assigned_cleaner_ids, user.id);
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Failed to save assignments" },
        { status: 500 }
      );
    }

    // ✅ Background email — response block nahi hoga
    if (body.assigned_cleaner_ids.length > 0 && updatedBooking) {
      sendAssignmentEmailsInBackground(supabase, body.assigned_cleaner_ids, updatedBooking);
    }
  }

  revalidatePath("/admin-dashboard/booking-records");
  revalidatePath("/admin/booking-records");

  return NextResponse.json({ ok: true });
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

  revalidatePath("/admin-dashboard/booking-records");
  revalidatePath("/admin/booking-records");

  return NextResponse.json({ ok: true });
}
