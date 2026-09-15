import CustomerManagement, { type CustomerRecord } from "@/components/admin/CustomerManagement";
import { createClient } from "@/lib/supabase/server";

export default async function CustomersPage() {
  const supabase = await createClient();
  const [{ data: users }, { data: addresses }] = await Promise.all([
    supabase.from("users").select("id, name, email, phone_number, source, created_at, is_blocked").eq("role", "customer").order("created_at", { ascending: false }),
    supabase.from("addresses").select("user_id, address_line, city, is_default").order("is_default", { ascending: false }),
  ]);
  const addressMap = new Map<string, string>();
  for (const address of addresses || []) if (!addressMap.has(address.user_id)) addressMap.set(address.user_id, [address.address_line, address.city].filter(Boolean).join(", "));
  const customers: CustomerRecord[] = (users || []).map((user) => ({ ...user, name: user.name || "Unnamed customer", email: user.email || "", address: addressMap.get(user.id) || "" }));
  return <CustomerManagement customers={customers} />;
}
