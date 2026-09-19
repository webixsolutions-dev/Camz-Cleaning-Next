import { randomUUID } from "crypto";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
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
    bucket: "public:booking-condition-photos",
    limit: 12,
    windowSeconds: 15 * 60,
  });
  if (securityError) return securityError;

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return NextResponse.json(
        { error: "Condition photo upload is not configured." },
        { status: 500 },
      );
    }

    const formData = await request.formData();
    const files = formData
      .getAll("photos")
      .filter((value): value is File => value instanceof File);

    if (files.length === 0) {
      return NextResponse.json(
        { error: "Please choose at least one photo." },
        { status: 400 },
      );
    }
    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `You can upload up to ${MAX_FILES} photos.` },
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

    const admin = createAdminClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const uploadGroup = randomUUID();
    const month = new Date().toISOString().slice(0, 7);
    const paths: string[] = [];

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const path = `booking-pending/${month}/${uploadGroup}/${index + 1}-${randomUUID()}.${extensionFor(file)}`;
      const bytes = Buffer.from(await file.arrayBuffer());
      const { error } = await admin.storage.from(BUCKET).upload(path, bytes, {
        contentType: file.type,
        upsert: false,
        cacheControl: "3600",
      });
      if (error) {
        if (paths.length > 0) {
          await admin.storage.from(BUCKET).remove(paths);
        }
        console.error("Condition photo upload failed:", error);
        return NextResponse.json(
          { error: "We could not upload the condition photos. Please try again." },
          { status: 500 },
        );
      }
      paths.push(path);
    }

    return NextResponse.json({ ok: true, paths });
  } catch (error) {
    const securityResponse = securityErrorResponse(error);
    if (securityResponse) return securityResponse;
    console.error("Condition photo API error:", error);
    return NextResponse.json(
      { error: "We could not upload the condition photos. Please try again." },
      { status: 500 },
    );
  }
}
