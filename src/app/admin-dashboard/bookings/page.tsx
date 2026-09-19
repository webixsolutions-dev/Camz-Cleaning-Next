import BookingsManagement, { type BookingRecord, type CleanerOption } from "@/components/admin/BookingsManagement";
import { createClient } from "@/lib/supabase/server";

type UserRow = {
  id: string;
  name: string | null;
  email: string | null;
  phone_number: string | null;
  role: string | null;
  approval_status: string | null;
  verified: boolean | null;
  is_online: boolean | null;
  is_available: boolean | null;
  is_working: boolean | null;
  last_available_at: string | null;
  average_rating: string | number | null;
  total_reviews: number | null;
  jobs_completed: number | null;
};

export default async function AdminBookingsPage() {
  const supabase = await createClient();
  const [{ data: jobs }, { data: users }, { data: addresses }] = await Promise.all([
    supabase
      .from("jobs")
      .select("id, customer_id, cleaner_id, service_name, service_type, date, address, price, final_price, total_price, tax_rate, status, created_at, payment_method, billing_type, booking_type, service_data, guest_name, guest_email")
      .order("date", { ascending: true }) // ✅ Yahan change kiya hai: Booking Date ke hisaab se seedhi tarteeb
      .limit(200),
    supabase
      .from("users")
      .select("id, name, email, phone_number, role, approval_status, verified, is_online, is_available, is_working, last_available_at, average_rating, total_reviews, jobs_completed")
      .in("role", ["customer", "cleaner"]),
    supabase.from("addresses").select("user_id, address_line, city, is_default").order("is_default", { ascending: false }),
  ]);

  const usersById = new Map<string, UserRow>();
  for (const user of (users || []) as UserRow[]) usersById.set(user.id, user);

  const addressMap = new Map<string, string>();
  for (const address of addresses || []) {
    if (!addressMap.has(address.user_id)) addressMap.set(address.user_id, [address.address_line, address.city].filter(Boolean).join(", "));
  }

  const bookings: BookingRecord[] = (jobs || []).map((job) => {
    // Keep this mapping explicit so the admin page remains compatible even when
    // the generated Supabase TypeScript types lag behind newly added DB columns.
    const row = job as Record<string, any>;
    const customerId = row.customer_id ? String(row.customer_id) : null;
    const cleanerId = row.cleaner_id ? String(row.cleaner_id) : null;
    const customer = customerId ? usersById.get(customerId) : null;
    const cleaner = cleanerId ? usersById.get(cleanerId) : null;
    const serviceData = (row.service_data ?? null) as Record<string, any> | null;

    return {
      id: String(row.id),
      customer_id: customerId,
      cleaner_id: cleanerId,
      service_name: row.service_name ?? null,
      service_type: row.service_type ?? null,
      date: row.date ?? null,
      address: row.address ?? null,
      price: row.price ?? null,
      final_price: row.final_price ?? null,
      total_price: row.total_price ?? null,
      tax_rate: row.tax_rate ?? null,
      status: row.status ?? null,
      created_at: row.created_at ? String(row.created_at) : "",
      payment_method: row.payment_method ?? null,
      billing_type: row.billing_type ?? null,
      booking_type: row.booking_type ?? null,
      service_data: serviceData,
      customer_name:
        customer?.name || row.guest_name || serviceData?.customerName || "Guest customer",
      customer_email:
        customer?.email || row.guest_email || serviceData?.customerEmail || "",
      customer_phone:
        customer?.phone_number || serviceData?.customerPhone || "",
      cleaner_name: cleaner?.name || "",
    };
  });

  const cleaners: CleanerOption[] = ((users || []) as UserRow[])
    .filter((user) => user.role?.toLowerCase() === "cleaner")
    .map((cleaner) => ({
      id: cleaner.id,
      name: cleaner.name || "Cleaner",
      email: cleaner.email || "",
      phone_number: cleaner.phone_number,
      approval_status: cleaner.approval_status,
      verified: cleaner.verified,
      is_online: cleaner.is_online,
      is_available: cleaner.is_available,
      is_working: cleaner.is_working,
      last_available_at: cleaner.last_available_at,
      average_rating: cleaner.average_rating,
      total_reviews: cleaner.total_reviews,
      jobs_completed: cleaner.jobs_completed,
      address: addressMap.get(cleaner.id) || "",
    }));

  return <BookingsManagement bookings={bookings} cleaners={cleaners} />;
}