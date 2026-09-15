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
      .select("id, customer_id, cleaner_id, service_name, service_type, date, address, price, final_price, total_price, status, created_at, payment_method, billing_type, booking_type")
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
    const customer = job.customer_id ? usersById.get(job.customer_id) : null;
    const cleaner = job.cleaner_id ? usersById.get(job.cleaner_id) : null;
    return {
      ...job,
      customer_name: customer?.name || "Guest customer",
      customer_phone: customer?.phone_number || "",
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