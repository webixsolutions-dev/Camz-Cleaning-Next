import CustomerBookingClient from "@/components/dashboard/CustomerBookingClient";
import type { Category, Service } from "@/components/booking/BookingClient";
import { createPublicServerClient } from "@/lib/supabase/public-server";

type PageProps = {
  searchParams: Promise<{
    category?: string | string[];
    service?: string | string[];
  }>;
};

export default async function CustomerBookingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = createPublicServerClient();

  const [categoryResult, serviceResult] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, icon_str, color_hex, type")
      .order("created_at", { ascending: true }),
    supabase
      .from("services")
      .select(
        "id, category_id, title, description, price, icon_str, pricing_type, service_type, is_active, has_addons, tax_rate",
      )
      .eq("is_active", true)
      .order("created_at", { ascending: true }),
  ]);

  if (categoryResult.error) throw categoryResult.error;
  if (serviceResult.error) throw serviceResult.error;

  const category = Array.isArray(params.category)
    ? params.category[0]
    : params.category;
  const service = Array.isArray(params.service)
    ? params.service[0]
    : params.service;

  return (
    <CustomerBookingClient
      categories={(categoryResult.data ?? []) as Category[]}
      services={(serviceResult.data ?? []) as Service[]}
      initialCategoryId={category}
      initialServiceId={service}
    />
  );
}
