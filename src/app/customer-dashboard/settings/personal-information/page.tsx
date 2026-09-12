"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Phone, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";

export default function PersonalInformationPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(
        "/login?redirect=/customer-dashboard/settings/personal-information",
      );
    }
  }, [authLoading, user, router]);

  // Load user data
  useEffect(() => {
    if (!user) return;

    const loadUserData = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("users")
          .select("name, phone_number")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        if (data) {
          setName(data.name || "");
          setPhone(data.phone_number || "");
        }
      } catch (err: any) {
        console.error("Error loading user data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  // Save changes
  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("users")
        .update({
          name: name.trim(),
          phone_number: phone.trim(),
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Error saving user data:", err);
      setError(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] text-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#4A86F7] mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading your information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-900 px-4 py-4 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-2xl">
        {/* Avatar */}
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-full border-[4px] border-slate-200 bg-white text-5xl font-bold text-[#4A86F7] shadow-lg">
            {getInitials(name)}
          </div>

          <h2 className="mt-4 text-3xl font-bold">{name || "User"}</h2>

          <p className="mt-1 text-sm text-slate-500">Customer Account</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3">
            <CheckCircle2 className="text-emerald-700" size={20} />
            <p className="text-sm text-emerald-700 font-medium">
              Changes saved successfully!
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="space-y-5 rounded-[28px] border border-slate-200 bg-white p-5 md:p-6">
          {/* Full Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">
              Full Name
            </label>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <User size={18} className="text-slate-500" />

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">
              Phone Number
            </label>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Phone size={18} className="text-slate-500" />

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">
              Email Address
            </label>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3">
              <Mail size={18} className="text-slate-500" />

              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full bg-transparent text-sm text-slate-500 outline-none"
              />
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Email address cannot be changed.
            </p>
          </div>

          {/* Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#4A86F7] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
