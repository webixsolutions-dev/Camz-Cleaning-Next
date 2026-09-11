import { enforceMutationSecurity } from "@/lib/security/http";
import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { ensureCrmCustomerForUser } from "@/lib/customers/syncCrmCustomer";

function getServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || !process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  return createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, {
    bucket: "auth-register",
    limit: 10,
    windowSeconds: 60,
  });
  if (securityError) return securityError;

  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      name?: string;
      phone_number?: string;
    };
    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password || "";
    const phone = body.phone_number?.trim();
    if (!name || !email || !password || !phone) {
      return NextResponse.json({ error: "Name, email, phone, and password are required." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const admin = getServiceClient();
    if (!admin) {
      return NextResponse.json({ error: "Server auth is not configured." }, { status: 503 });
    }

    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, phone_number: phone, role: "customer" },
      app_metadata: { role: "customer" },
    });
    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message || "Unable to create account." }, { status: 400 });
    }

    const { data: profile, error: profileError } = await admin
      .from("users")
      .upsert(
        {
          id: authData.user.id,
          name,
          email,
          role: "customer",
          phone_number: phone,
          approval_status: "pending",
          is_blocked: false,
          source: "Web",
          verified: false,
        },
        { onConflict: "id" },
      )
      .select("id, customer_code, name, email, phone_number")
      .single();

    if (profileError) {
      console.error("Register profile failed:", profileError);
      return NextResponse.json(
        { error: profileError.message || "Account created, but the customer ID could not be assigned. Run the customer_code SQL migration." },
        { status: 400 },
      );
    }

    const linked = await ensureCrmCustomerForUser(admin, profile);
    if (!linked.ok) {
      console.error("Register CRM link failed:", linked.error);
    }

    return NextResponse.json({
      ok: true,
      customer_code: profile?.customer_code || (linked.ok ? linked.customer_code : null),
      crm_customer_id: linked.ok ? linked.crm_customer_id : null,
    });
  } catch (err) {
    console.error("Register failed:", err);
    return NextResponse.json({ error: "Unable to create account." }, { status: 500 });
  }
}
