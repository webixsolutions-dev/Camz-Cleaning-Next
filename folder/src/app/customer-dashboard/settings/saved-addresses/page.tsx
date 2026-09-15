"use client";
import { useEffect, useState } from "react";
import {
  Home,
  Briefcase,
  MapPin,
  Navigation,
  Loader2,
  Trash2,
  Star,
  Plus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const labelOptions = [
  { id: "home", label: "Home", icon: Home },
  { id: "work", label: "Work", icon: Briefcase },
  { id: "other", label: "Other", icon: MapPin },
];

interface Address {
  id: string;
  user_id: string;
  label: string;
  address_line: string;
  city: string;
  is_default: boolean;
}

export default function SavedAddressesPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchAddresses = async () => {
    if (!user) return;
    try {
      const supabase = createClient();
      const { data, error: fetchErr } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false });

      if (fetchErr) throw fetchErr;
      setAddresses((data as Address[]) || []);
    } catch (err: any) {
      console.error("Fetch addresses error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    if (!addressLine.trim() || !city.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const supabase = createClient();
      const isFirst = addresses.length === 0;

      const { error: insertErr } = await supabase.from("addresses").insert({
        user_id: user.id,
        label: activeTab,
        address_line: addressLine.trim(),
        city: city.trim(),
        is_default: isFirst,
      });

      if (insertErr) throw insertErr;

      setSuccess("Address saved!");
      setAddressLine("");
      setCity("");
      setShowForm(false);
      await fetchAddresses();
    } catch (err: any) {
      console.error("Save address error:", err);
      setError(err.message || "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this address?")) return;

    try {
      const supabase = createClient();
      const { error: delErr } = await supabase
        .from("addresses")
        .delete()
        .eq("id", id);

      if (delErr) throw delErr;
      await fetchAddresses();
    } catch (err: any) {
      console.error("Delete error:", err);
    }
  };

  const handleSetDefault = async (id: string) => {
    if (!user) return;

    try {
      const supabase = createClient();

      // Remove default from all
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);

      // Set new default
      await supabase
        .from("addresses")
        .update({ is_default: true })
        .eq("id", id);

      await fetchAddresses();
    } catch (err: any) {
      console.error("Set default error:", err);
    }
  };

  const getLabelIcon = (label: string) => {
    const opt = labelOptions.find((o) => o.id === label);
    const Icon = opt?.icon || MapPin;
    return <Icon size={18} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] text-slate-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#4A86F7]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-900 px-4 py-4 sm:px-5 lg:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Saved Addresses</h1>
            <p className="text-slate-500 text-sm mt-1">
              {addresses.length} address{addresses.length !== 1 ? "es" : ""}{" "}
              saved
            </p>
          </div>

          <button
            onClick={() => {
              setShowForm(!showForm);
              setSuccess(null);
              setError(null);
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              showForm
                ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                : "bg-[#4A86F7] text-white hover:bg-[#2563EB]"
            }`}
          >
            {showForm ? (
              <>✕ Close</>
            ) : (
              <>
                <Plus size={18} /> Add New
              </>
            )}
          </button>
        </div>

        {/* Feedback */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
            {success}
          </div>
        )}

        {/* Add Form */}
        {showForm && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 mb-6">
            <h3 className="text-lg font-bold mb-5">Add New Address</h3>

            {/* Label Tabs */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {labelOptions.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      activeTab === tab.id
                        ? "bg-[#4A86F7] text-white"
                        : "border border-slate-200 bg-slate-50 text-[#4A86F7]"
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Fields */}
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  Address Line
                </label>
                <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
                  <MapPin size={18} className="text-slate-500 shrink-0" />
                  <input
                    type="text"
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    placeholder="Enter your address"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  City
                </label>
                <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
                  <Navigation size={18} className="text-slate-500 shrink-0" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#4A86F7] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2563EB] disabled:opacity-50"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {saving ? "Saving..." : "Save Address"}
              </button>
            </div>
          </div>
        )}

        {/* Saved Addresses List */}
        {addresses.length === 0 && !showForm ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <MapPin size={40} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Addresses Yet</h3>
            <p className="text-slate-500 text-sm">
              Add your first address to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="rounded-xl border border-slate-200 bg-white p-5 flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-[#4A86F7] shrink-0">
                  {getLabelIcon(addr.label)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold capitalize">
                      {addr.label}
                    </span>
                    {addr.is_default && (
                      <span className="text-[10px] bg-[#4A86F7]/20 text-[#4A86F7] px-2 py-0.5 rounded-full font-semibold">
                        DEFAULT
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 text-sm truncate">
                    {addr.address_line}
                  </p>
                  <p className="text-slate-500 text-xs">{addr.city}</p>
                </div>

                <div className="flex gap-2 shrink-0">
                  {!addr.is_default && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="p-2 rounded-lg hover:bg-slate-50 text-slate-500 hover:text-yellow-400 transition"
                      title="Set as default"
                    >
                      <Star size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="p-2 rounded-lg hover:bg-slate-50 text-slate-500 hover:text-rose-700 transition"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
