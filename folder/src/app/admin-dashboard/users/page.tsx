import UserManagement, { type AdminUserRecord } from "@/components/admin/UserManagement";
import { createClient } from "@/lib/supabase/server";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select("id, name, email, phone_number, role, approval_status, source, is_blocked, verified, is_online, is_available, is_working, created_at")
    .order("created_at", { ascending: false });

  const users: AdminUserRecord[] = (data || []).map((user) => ({
    id: user.id,
    name: user.name || "Unnamed user",
    email: user.email || "",
    phone_number: user.phone_number,
    role: user.role || "customer",
    approval_status: user.approval_status,
    source: user.source,
    is_blocked: user.is_blocked,
    verified: user.verified,
    is_online: user.is_online,
    is_available: user.is_available,
    is_working: user.is_working,
    created_at: user.created_at,
  }));

  return <UserManagement users={users} />;
}
