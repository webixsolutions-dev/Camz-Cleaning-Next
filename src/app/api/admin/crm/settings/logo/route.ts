import { getCrmActor } from "@/lib/crm/staff";
import { enforceMutationSecurity } from "@/lib/security/http";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, { bucket: "crm-settings-logo", limit: 10, windowSeconds: 60 });
  if (securityError) return securityError;
  const { actor, supabase, error, status } = await getCrmActor();
  if (!actor) return NextResponse.json({ error }, { status });
  if (!actor.isAdmin) return NextResponse.json({ error: "Only an admin can update the company logo." }, { status: 403 });

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size < 1) {
      return NextResponse.json({ error: "Choose a logo image to upload." }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Logo must be an image file." }, { status: 400 });
    }
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json({ error: "Logo must be 4MB or smaller." }, { status: 400 });
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!serviceKey || !url) {
      return NextResponse.json({ error: "Storage is not configured." }, { status: 500 });
    }
    const admin = createAdminClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    await admin.storage.createBucket("crm-assets", { public: true }).catch(() => undefined);

    const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `logo/company-logo-${Date.now()}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await admin.storage.from("crm-assets").upload(path, bytes, {
      contentType: file.type,
      upsert: true,
    });
    if (uploadError) {
      console.error("CRM logo upload failed:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 400 });
    }

    const publicUrl = admin.storage.from("crm-assets").getPublicUrl(path).data.publicUrl;
    const { data: asset, error: assetError } = await supabase
      .from("crm_invoice_assets")
      .insert({
        kind: "logo",
        invoice_id: null,
        storage_path: path,
        public_url: publicUrl,
        created_by: actor.userId,
      })
      .select("id")
      .single();
    if (assetError) {
      console.error("CRM logo asset insert failed:", assetError);
      return NextResponse.json({ error: assetError.message }, { status: 400 });
    }

    const { data: settings, error: updateError } = await supabase
      .from("crm_company_settings")
      .update({ logo_asset_id: asset.id, logo_url: publicUrl })
      .eq("id", 1)
      .select("*")
      .single();
    if (updateError && /column|schema cache/i.test(updateError.message)) {
      const fallback = await supabase
        .from("crm_company_settings")
        .update({ logo_asset_id: asset.id })
        .eq("id", 1)
        .select("*")
        .single();
      if (fallback.error) {
        console.error("CRM logo settings update failed:", fallback.error);
        return NextResponse.json({ error: fallback.error.message }, { status: 400 });
      }
      return NextResponse.json({ settings: { ...fallback.data, logo_url: publicUrl }, logo_url: publicUrl });
    }
    if (updateError) {
      console.error("CRM logo settings update failed:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ settings, logo_url: publicUrl });
  } catch (err) {
    console.error("CRM logo POST failed:", err);
    return NextResponse.json({ error: "Unable to upload logo." }, { status: 500 });
  }
}
