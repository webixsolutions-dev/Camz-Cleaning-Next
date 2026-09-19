import BookingClient, { type Service } from "@/components/booking/BookingClient";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "Cleaning Prices & Online Booking | Camz Cleaning",
  description:
    "Choose Standard, Deep, Move-In/Move-Out or Carpet cleaning, customize your property and see the updated subtotal and tax before confirming.",
  path: "/booking/",
});

// Service rows come from Supabase. Keep this request-time so booking remains in sync
// with the active services configured by the admin dashboard.
export const dynamic = "force-dynamic";

export default async function BookingPage() {
  const supabase = createPublicServerClient();

  const { data, error } = await supabase
    .from("services")
    .select(
      "id, category_id, title, description, price, icon_str, pricing_type, service_type, is_active, has_addons, tax_rate",
    )
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return <BookingClient services={(data ?? []) as Service[]} />;
}
