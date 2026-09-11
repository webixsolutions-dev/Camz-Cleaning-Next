import { DATA_ENTRY_EMAIL, DATA_ENTRY_NAME, DATA_ENTRY_PASSWORD } from "@/lib/auth/dataEntryCredentials";
import { enforceMutationSecurity } from "@/lib/security/http";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function getServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || !process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  return createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function findAuthUser(
  admin: ReturnType<typeof createAdminClient>,
  email: string,
) {
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;
  return data.users.find((user) => user.email?.toLowerCase() === email) || null;
}

export async function POST(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, {
    bucket: "ensure-data-entry",
    limit: 20,
    windowSeconds: 60,
  });
  if (securityError) return securityError;

  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase();
    const password = body.password || "";

    if (email !== DATA_ENTRY_EMAIL || password !== DATA_ENTRY_PASSWORD) {
      return NextResponse.json({ ok: false });
    }

    const admin = getServiceClient();
    if (!admin) {
      return NextResponse.json({ error: "Server auth is not configured." }, { status: 503 });
    }

    let authUser = await findAuthUser(admin, DATA_ENTRY_EMAIL);

    if (!authUser) {
      const created = await admin.auth.admin.createUser({
        email: DATA_ENTRY_EMAIL,
        password: DATA_ENTRY_PASSWORD,
        email_confirm: true,
        user_metadata: { name: DATA_ENTRY_NAME, role: "data_entry" },
        app_metadata: { role: "data_entry" },
      });
      if (created.error || !created.data.user) {
        console.error("Data entry auth create failed:", created.error);
        return NextResponse.json({ error: created.error?.message || "Unable to create data entry login." }, { status: 400 });
      }
      authUser = created.data.user;
    } else {
      const updated = await admin.auth.admin.updateUserById(authUser.id, {
        password: DATA_ENTRY_PASSWORD,
        email_confirm: true,
        user_metadata: { name: DATA_ENTRY_NAME, role: "data_entry" },
        app_metadata: { role: "data_entry" },
      });
      if (updated.error) {
        console.error("Data entry auth update failed:", updated.error);
        return NextResponse.json({ error: updated.error.message }, { status: 400 });
      }
    }

  const { error: profileError } = await admin.from("users").upsert(
      {
        id: authUser.id,
        name: DATA_ENTRY_NAME,
        email: DATA_ENTRY_EMAIL,
        role: "data_entry",
        phone_number: "0000000000",
        approval_status: "approved",
        is_blocked: false,
        source: "Web",
      },
      { onConflict: "id" },
    );

    if (profileError) {
      console.error("Data entry profile upsert failed:", profileError);
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Ensure data entry failed:", error);
    return NextResponse.json({ error: "Unable to prepare data entry login." }, { status: 500 });
  }
}
