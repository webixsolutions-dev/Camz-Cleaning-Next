import { randomUUID } from "crypto";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  enforceMutationSecurity,
  securityErrorResponse,
} from "@/lib/security/http";

const BUCKET = "booking-condition-photos";
const MAX_FILES = 6;
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function extensionFor(file: File) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

export async function POST(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, {
    bucket: "customer:booking-review-photos",
    limit: 12,
    windowSeconds: 15 * 60,
  });
  if (securityError) return securityError;

  try {
    const session = await createClient();
    const {
      data: { user },
    } = await session.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in first." }, { status: 401 });
    }

    const formData = await request.formData();
    const bookingId = String(formData.get("bookingId") || "").trim();
    const files = formData
      .getAll("photos")
      .filter((value): value is File => value instanceof File);

    if (!bookingId) {
      return NextResponse.json({ error: "Booking id is required." }, { status: 400 });
    }
    if (!files.length || files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Choose between 1 and ${MAX_FILES} photos.` },
        { status: 400 },
      );
    }

    for (const file of files) {
      if (!ALLOWED_TYPES.has(file.type)) {
        return NextResponse.json(
          { error: "Only JPG, PNG and WEBP images are allowed." },
          { status: 400 },
        );
      }
      if (file.size <= 0 || file.size > MAX_FILE_BYTES) {
        return NextResponse.json(
          { error: "Each photo must be 8 MB or smaller." },
          { status: 400 },
        );
      }
    }

    const { data: job, error: jobError } = await session
      .from("jobs")
      .select("id, customer_id, service_data")
      .eq("id", bookingId)
      .eq("customer_id", user.id)
      .maybeSingle();
    if (jobError || !job) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return NextResponse.json({ error: "Photo upload is not configured." }, { status: 500 });
    }

    const admin = createAdminClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const paths: string[] = [];
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const path = `booking-review/${bookingId}/${Date.now()}-${index + 1}-${randomUUID()}.${extensionFor(file)}`;
      const bytes = Buffer.from(await file.arrayBuffer());
      const { error } = await admin.storage.from(BUCKET).upload(path, bytes, {
        contentType: file.type,
        upsert: false,
        cacheControl: "3600",
      });
      if (error) {
        if (paths.length) await admin.storage.from(BUCKET).remove(paths);
        return NextResponse.json(
          { error: "We could not upload the photos. Please try again." },
          { status: 500 },
        );
      }
      paths.push(path);
    }

    const serviceData =
      job.service_data && typeof job.service_data === "object"
        ? { ...(job.service_data as Record<string, unknown>) }
        : {};
    const currentPaths = Array.isArray(serviceData.conditionPhotoPaths)
      ? (serviceData.conditionPhotoPaths as string[])
      : [];
    serviceData.conditionPhotoPaths = [...currentPaths, ...paths].slice(0, 20);
    serviceData.additionalPhotosRequested = false;
    serviceData.additionalPhotosSubmittedAt = new Date().toISOString();

    const { error: updateError } = await admin
      .from("jobs")
      .update({ service_data: serviceData, status: "under_review" })
      .eq("id", bookingId)
      .eq("customer_id", user.id);
    if (updateError) {
      await admin.storage.from(BUCKET).remove(paths);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, paths, status: "under_review" });
  } catch (error) {
    const securityResponse = securityErrorResponse(error);
    if (securityResponse) return securityResponse;
    console.error("Booking review photo upload failed:", error);
    return NextResponse.json(
      { error: "We could not upload the requested photos." },
      { status: 500 },
    );
  }
}
