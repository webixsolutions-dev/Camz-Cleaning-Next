type CustomerClient = {
  from: (table: string) => any;
};

type UserLike = {
  id: string;
  name?: string | null;
  email?: string | null;
  phone_number?: string | null;
  customer_code?: string | null;
};

export async function ensureCrmCustomerForUser(
  supabase: CustomerClient,
  user: UserLike,
  address?: { address_line?: string; city?: string } | null,
) {
  const email = user.email?.trim().toLowerCase();
  if (!email) return { ok: false as const, error: "Customer email is required to link Invoice CRM." };

  const displayName = user.name?.trim() || email.split("@")[0];
  const phone = user.phone_number?.trim() || null;

  const { data: byUser } = await supabase
    .from("crm_customers")
    .select("id, customer_code, user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  let customer = byUser;
  if (!customer) {
    const { data: byEmail } = await supabase
      .from("crm_customers")
      .select("id, customer_code, user_id")
      .ilike("email", email)
      .maybeSingle();
    customer = byEmail;
  }

  if (customer) {
    const { data, error } = await supabase
      .from("crm_customers")
      .update({
        user_id: user.id,
        display_name: displayName,
        email,
        phone,
      })
      .eq("id", customer.id)
      .select("id, customer_code")
      .single();
    if (error) return { ok: false as const, error: error.message };
    await maybeAddBillingAddress(supabase, data.id, address);
    return { ok: true as const, crm_customer_id: data.id, customer_code: data.customer_code };
  }

  const { data, error } = await supabase
    .from("crm_customers")
    .insert({
      display_name: displayName,
      email,
      phone,
      user_id: user.id,
      customer_code: user.customer_code || null,
      is_active: true,
      created_by: user.id,
    })
    .select("id, customer_code")
    .single();

  if (error) return { ok: false as const, error: error.message };
  await maybeAddBillingAddress(supabase, data.id, address);
  return { ok: true as const, crm_customer_id: data.id, customer_code: data.customer_code };
}

async function maybeAddBillingAddress(
  supabase: CustomerClient,
  customerId: string,
  address?: { address_line?: string; city?: string } | null,
) {
  const line1 = address?.address_line?.trim();
  if (!line1) return;
  const { data: existing } = await supabase
    .from("crm_customer_addresses")
    .select("id")
    .eq("customer_id", customerId)
    .eq("is_billing", true)
    .maybeSingle();
  const payload = {
    customer_id: customerId,
    label: "home",
    line1,
    city: address?.city?.trim() || null,
    country: "CA",
    is_billing: true,
    is_service: true,
  };
  if (existing) {
    await supabase.from("crm_customer_addresses").update(payload).eq("id", existing.id);
  } else {
    await supabase.from("crm_customer_addresses").insert(payload);
  }
}
