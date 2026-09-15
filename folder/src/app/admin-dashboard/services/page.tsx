import ServicesManagement, { type CategoryRecord, type ServiceRecord } from "@/components/admin/ServicesManagement";
import { createClient } from "@/lib/supabase/server";

export default async function AdminServicesPage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: services }] = await Promise.all([
    supabase.from("categories").select("id, name, icon_str, color_hex, created_at, type").order("created_at", { ascending: true }),
    supabase
      .from("services")
      .select("id, category_id, title, description, price, icon_str, pricing_type, hourly_rate, service_type, bedroom_rate, washroom_rate, sqft_rate, vehicle_sedan_rate, vehicle_suv_rate, fridge_price, oven_price, window_price, is_active, has_addons, tax_rate")
      .order("created_at", { ascending: false }),
  ]);

  return <ServicesManagement categories={(categories || []) as CategoryRecord[]} services={(services || []) as ServiceRecord[]} />;
}
