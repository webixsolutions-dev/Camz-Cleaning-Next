import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthProvider } from "@/context/AuthContext";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { createClient } from "@/lib/supabase/server";

import "./customer.css";

export const metadata: Metadata = {
  title: "Customer Dashboard | Camz Cleaning",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defense-in-depth: never render dashboard HTML until the server has
  // validated the Supabase session and confirmed a customer profile.
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?redirect=/customer-dashboard");
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role, is_blocked")
    .eq("id", user.id)
    .maybeSingle();

  const role = String(profile?.role ?? "").toLowerCase();

  if (profileError || !profile || profile.is_blocked === true || role !== "customer") {
    redirect("/login?error=forbidden");
  }

  return (
    <AuthProvider>
      <div className="customer-dashboard-scope min-h-screen bg-[#F4F7FB]">
        <DashboardSidebar />

        <div className="lg:ml-[236px]">
          <DashboardHeader />

          <main className="min-h-[calc(100vh-68px)] bg-[#F4F7FB]">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
