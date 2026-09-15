"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Star,
  ArrowRight,
  Loader2,
  UserCheck,
  Mail,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";

interface Cleaner {
  id: string;
  name: string;
  email: string;
}

interface FavoriteCleaner {
  id: string;
  customer_id: string;
  cleaner_id: string;
  cleaner?: Cleaner;
}

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteCleaner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/customer-dashboard/favorites");
    }
  }, [authLoading, user, router]);

  // Fetch favorite cleaners from Supabase
  useEffect(() => {
    if (!user) return;

    const fetchFavorites = async () => {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();

        // First get favorite_cleaners (without ordering by created_at)
        const { data: favData, error: favError } = await supabase
          .from("favorite_cleaners")
          .select("*")
          .eq("customer_id", user.id);

        if (favError) {
          console.error("Favorite cleaners error:", favError);
          throw favError;
        }

        // If no favorites, show empty state
        if (!favData || favData.length === 0) {
          setFavorites([]);
          setLoading(false);
          return;
        }

        // Then get cleaner details for each favorite
        const cleanerIds = favData.map((fav) => fav.cleaner_id);

        const { data: cleanersData, error: cleanersError } = await supabase
          .from("users")
          .select("id, name, email")
          .in("id", cleanerIds);

        if (cleanersError) {
          console.error("Cleaners data error:", cleanersError);
          throw cleanersError;
        }

        // Combine the data
        const combined = favData.map((fav) => ({
          ...fav,
          cleaner: cleanersData?.find((c) => c.id === fav.cleaner_id),
        }));

        setFavorites(combined);
      } catch (err: any) {
        console.error("Error fetching favorite cleaners:", err);
        // Don't show error for empty favorites
        if (err.message && !err.message.includes("created_at")) {
          setError(err.message || "Failed to load favorite cleaners");
        }
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  // Remove from favorites
  const handleRemoveFavorite = async (favoriteId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this cleaner from favorites?",
    );
    if (!confirmed) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("favorite_cleaners")
        .delete()
        .eq("id", favoriteId);

      if (error) throw error;

      // Update local state
      setFavorites((prev) => prev.filter((fav) => fav.id !== favoriteId));
    } catch (err: any) {
      console.error("Error removing favorite:", err);
      alert("Failed to remove favorite. Please try again.");
    }
  };

  // Get cleaner's initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "C";
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
          <p className="text-slate-500 text-sm">Loading favorite cleaners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-900 px-4 py-4 sm:px-5 lg:px-6">
      {/* Heading */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-700">
          <Heart size={28} fill="currentColor" />
        </div>

        <div>
          <h1 className="text-4xl md:text-5xl font-bold">Favorite Cleaners</h1>

          <p className="text-slate-500 mt-2">
            {favorites.length > 0
              ? `${favorites.length} favorite cleaner${favorites.length === 1 ? "" : "s"}`
              : "Your trusted cleaning professionals."}
          </p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center mb-6">
          <p className="text-rose-700 font-bold mb-2">
            Failed to load favorite cleaners
          </p>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!error && favorites.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6 text-slate-500">
            <Heart size={40} />
          </div>

          <h3 className="text-3xl font-bold mb-4">No Favorite Cleaners Yet</h3>

          <p className="text-slate-500 mb-8 max-w-lg mx-auto">
            After a cleaner completes your booking, you can add them to your
            favorites for quick rebooking.
          </p>

          <Link
            href="/customer-dashboard/booking"
            className="inline-flex items-center justify-center rounded-lg bg-[#4A86F7] px-6 py-3 font-bold text-white transition hover:bg-[#2563EB]"
          >
            Book a Service
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5">
          {favorites.map((favorite) => {
            const cleaner = favorite.cleaner;
            if (!cleaner) return null;

            return (
              <div
                key={favorite.id}
                className="overflow-hidden rounded-[20px] border border-slate-200 bg-white hover:border-[#4A86F7]/30 transition-all duration-300"
              >
                <div className="p-5">
                  {/* Top - Avatar & Heart */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    {/* Avatar */}
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-[#4A86F7] flex items-center justify-center text-white font-bold text-lg">
                        {getInitials(cleaner.name)}
                      </div>

                      <div>
                        <h3 className="text-lg font-bold leading-tight">
                          {cleaner.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Professional Cleaner
                        </p>
                      </div>
                    </div>

                    {/* Heart - Remove from favorites */}
                    <button
                      onClick={() => handleRemoveFavorite(favorite.id)}
                      className="text-rose-700 hover:scale-110 transition flex-shrink-0"
                      title="Remove from favorites"
                    >
                      <Heart size={20} fill="currentColor" />
                    </button>
                  </div>

                  {/* Verified Badge */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#4A86F7]/10 px-3 py-1 text-[10px] font-semibold text-[#4A86F7]">
                      <Star size={11} fill="currentColor" />
                      VERIFIED
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-5">
                    {cleaner.email && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Mail size={14} className="text-[#4A86F7]" />
                        <span className="truncate">{cleaner.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <Link
                    href="/customer-dashboard/booking"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#4A86F7] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2563EB]"
                  >
                    <UserCheck size={16} />
                    Book with {cleaner.name.split(" ")[0]}
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
