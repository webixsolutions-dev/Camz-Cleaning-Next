"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  User,
  CreditCard,
  BadgeDollarSign,
  Check,
  ChevronLeft,
  Loader2,
  Bed,
  Bath,
  ImagePlus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const steps = ["Request", "Review", "Approved", "Confirmed", "Completed"];

const statusToStep: Record<string, number> = {
  pending: 0,
  new_request: 0,
  under_review: 1,
  awaiting_photos: 1,
  custom_quote_required: 1,
  quote_sent: 1,
  approved: 2,
  booking_confirmed: 3,
  accepted: 3,
  assigned: 3,
  in_progress: 3,
  completed: 4,
};

const getStatusStyle = (status: string) => {
  const s = status.toLowerCase();
  if (["pending", "new_request"].includes(s)) return "bg-sky-50 text-sky-700";
  if (["under_review", "awaiting_photos", "custom_quote_required"].includes(s))
    return "bg-amber-50 text-amber-700";
  if (s === "quote_sent") return "bg-violet-50 text-violet-700";
  if (["accepted", "assigned", "in_progress", "booking_confirmed"].includes(s))
    return "bg-blue-50 text-blue-700";
  if (s === "completed" || s === "approved")
    return "bg-emerald-50 text-emerald-700";
  if (s === "cancelled" || s === "canceled")
    return "bg-rose-50 text-rose-700";
  return "bg-gray-500/20 text-slate-500";
};

interface Job {
  id: string;
  service_name: string;
  service_type: string;
  date: string;
  address: string;
  price: string;
  total_price: number | null;
  status: string;
  billing_type: string;
  estimated_hours: number | null;
  hourly_rate: number | null;
  tax_rate: number | null;
  bedrooms: number | null;
  washrooms: number | null;
  service_data: Record<string, any> | null;
  cleaner_id: string | null;
  created_at: string;
}

export default function BookingDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [cleanerName, setCleanerName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewPhotos, setReviewPhotos] = useState<File[]>([]);
  const [uploadingReviewPhotos, setUploadingReviewPhotos] = useState(false);
  const [reviewPhotoError, setReviewPhotoError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user || !id) return;

    const fetchJob = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data, error: fetchErr } = await supabase
          .from("jobs")
          .select("*")
          .eq("id", id)
          .eq("customer_id", user.id)
          .maybeSingle();

        if (fetchErr) throw fetchErr;

        if (!data) {
          setError("Booking not found");
          return;
        }

        setJob(data as Job);

        // Fetch cleaner name if assigned
        if (data.cleaner_id) {
          const { data: cleanerData } = await supabase
            .from("users")
            .select("name")
            .eq("id", data.cleaner_id)
            .maybeSingle();

          if (cleanerData?.name) setCleanerName(cleanerData.name);
        }
      } catch (err: any) {
        console.error("Error fetching booking:", err);
        setError(err.message || "Failed to load booking");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [user, id]);

  const uploadRequestedPhotos = async () => {
    if (!job || reviewPhotos.length === 0) return;
    setUploadingReviewPhotos(true);
    setReviewPhotoError("");
    try {
      const payload = new FormData();
      payload.append("bookingId", job.id);
      reviewPhotos.forEach((file) => payload.append("photos", file));
      const response = await fetch("/api/booking/review-photos", {
        method: "POST",
        body: payload,
      });
      const result = (await response.json()) as {
        error?: string;
        paths?: string[];
        status?: string;
      };
      if (!response.ok) throw new Error(result.error || "Unable to upload photos.");
      setJob((current) =>
        current
          ? {
              ...current,
              status: result.status || "under_review",
              service_data: {
                ...(current.service_data || {}),
                additionalPhotosRequested: false,
                additionalPhotosSubmittedAt: new Date().toISOString(),
                conditionPhotoPaths: [
                  ...((current.service_data?.conditionPhotoPaths as string[] | undefined) || []),
                  ...(result.paths || []),
                ],
              },
            }
          : current,
      );
      setReviewPhotos([]);
    } catch (err) {
      setReviewPhotoError(err instanceof Error ? err.message : "Unable to upload photos.");
    } finally {
      setUploadingReviewPhotos(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] text-slate-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#4A86F7]" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] text-slate-900 px-4 py-4 sm:px-5 lg:px-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center">
          <h2 className="text-2xl font-bold mb-4">
            {error || "Booking not found"}
          </h2>
          <Link
            href="/customer-dashboard/bookings"
            className="text-[#4A86F7] font-semibold"
          >
            ← Back to Bookings
          </Link>
        </div>
      </div>
    );
  }

  const dateObj = new Date(job.date);
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const currentStep = statusToStep[job.status.toLowerCase()] ?? 0;
  const serviceData = job.service_data || {};
  const adminQuote = serviceData.adminQuote && typeof serviceData.adminQuote === "object"
    ? serviceData.adminQuote
    : null;
  const taxRate = Number(adminQuote?.taxRate ?? job.tax_rate ?? 0);
  const normalizedTaxRate = taxRate > 1 ? taxRate / 100 : taxRate;
  const calculatedEstimate = Number(serviceData.calculatedTotal || 0);
  const totalPrice = Number(adminQuote?.total ?? job.total_price ?? calculatedEstimate ?? 0);
  const subtotal = Number(
    adminQuote?.subtotal ??
      serviceData.calculatedSubtotal ??
      (normalizedTaxRate > 0 ? totalPrice / (1 + normalizedTaxRate) : totalPrice),
  );
  const taxAmount = Number(
    adminQuote?.tax ?? serviceData.calculatedTax ?? Math.max(0, totalPrice - subtotal),
  );
  const quoteItems = Array.isArray(adminQuote?.items) ? adminQuote.items : [];
  const hasFinalQuote = Boolean(adminQuote && Number(adminQuote.total) >= 0);
  const requiresReview = ["under_review", "awaiting_photos", "custom_quote_required", "quote_sent"].includes(job.status.toLowerCase());

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-900 px-4 py-4 sm:px-5 lg:px-6">
      {/* Back Button */}
      <Link
        href="/customer-dashboard/bookings"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-[#13263A] transition mb-6 text-sm"
      >
        <ChevronLeft size={18} />
        Back to Bookings
      </Link>

      {/* Booking Card */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-5 md:p-8 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-8">
          <div>
            <p className="text-slate-500 mb-3 text-sm">
              #{job.id.slice(0, 8).toUpperCase()}
            </p>
            <h1 className="text-2xl md:text-4xl font-bold text-[#4A86F7] leading-tight">
              {job.service_name}
            </h1>
          </div>

          <div
            className={`rounded-full px-5 py-2 text-sm font-bold w-fit uppercase ${getStatusStyle(job.status)}`}
          >
            {job.status.replace("_", " ")}
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-slate-500 text-sm md:text-base">
              <Calendar size={18} />
              <span>Date & Time:</span>
            </div>
            <span className="font-semibold text-sm md:text-base">
              {formattedDate} - {formattedTime}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-slate-500 text-sm md:text-base">
              <MapPin size={18} />
              <span>Location:</span>
            </div>
            <span className="font-semibold text-sm md:text-base break-words text-right max-w-[60%]">
              {job.address}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-slate-500 text-sm md:text-base">
              <User size={18} />
              <span>Cleaner:</span>
            </div>
            <span className="font-semibold text-sm md:text-base">
              {cleanerName || "Finding cleaner..."}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-slate-500 text-sm md:text-base">
              <CreditCard size={18} />
              <span>Billing:</span>
            </div>
            <span className="font-semibold text-sm md:text-base capitalize">
              {job.billing_type}-Rate Billing
              {job.estimated_hours ? ` (${job.estimated_hours} hrs)` : ""}
            </span>
          </div>

          {(job.bedrooms || job.washrooms) && (
            <div className="flex gap-6 pt-2">
              {job.bedrooms && (
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Bed size={18} />
                  <span>
                    {job.bedrooms} Bedroom{job.bedrooms > 1 ? "s" : ""}
                  </span>
                </div>
              )}
              {job.washrooms && (
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Bath size={18} />
                  <span>
                    {job.washrooms} Washroom{job.washrooms > 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-slate-500 text-sm md:text-base">
              <BadgeDollarSign size={18} />
              <span>Price:</span>
            </div>
            <span className="text-right text-2xl md:text-3xl font-bold text-[#4A86F7]">
              {requiresReview && !hasFinalQuote ? "Under review" : `CAD $${totalPrice.toFixed(2)}`}
              {requiresReview && !hasFinalQuote && calculatedEstimate > 0 && (
                <span className="mt-1 block text-xs font-semibold text-slate-400">
                  Estimate: CAD ${calculatedEstimate.toFixed(2)}
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {adminQuote && (
        <div className="mb-6 rounded-[28px] border border-violet-200 bg-violet-50/40 p-5 md:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-violet-600">Camz Cleaning Quote</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">Custom Quote Details</h3>
              {adminQuote.note && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{adminQuote.note}</p>}
            </div>
            <div className="rounded-xl bg-white px-4 py-3 text-right shadow-sm">
              <div className="text-xs font-semibold text-slate-400">Quote Total</div>
              <div className="mt-1 text-2xl font-bold text-violet-700">CAD ${Number(adminQuote.total || 0).toFixed(2)}</div>
            </div>
          </div>

          {quoteItems.length > 0 && (
            <div className="mt-5 overflow-hidden rounded-2xl border border-violet-100 bg-white">
              {quoteItems.map((item: any, index: number) => (
                <div key={String(item.id || index)} className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 last:border-b-0">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{item.label}</div>
                    <div className="mt-0.5 text-xs text-slate-400">{Number(item.quantity || 1)} × CAD ${Number(item.unitPrice || 0).toFixed(2)}</div>
                  </div>
                  <div className="text-sm font-bold text-slate-800">CAD ${Number(item.amount ?? Number(item.quantity || 1) * Number(item.unitPrice || 0)).toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {serviceData.additionalPhotosRequested && (
        <div className="mb-6 rounded-[24px] border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <ImagePlus className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
            <div className="flex-1">
              <strong className="text-sm text-amber-900">Additional photos requested</strong>
              <p className="mt-1 text-sm leading-6 text-amber-800">
                Camz Cleaning needs more property-condition photos before the quote or booking can be finalized.
              </p>
              <label className="mt-4 block rounded-xl border border-dashed border-amber-300 bg-white p-4 text-center cursor-pointer hover:bg-amber-50/40">
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(event) => setReviewPhotos(Array.from(event.target.files || []).slice(0, 6))}
                />
                <span className="text-sm font-semibold text-amber-800">
                  {reviewPhotos.length ? `${reviewPhotos.length} photo(s) selected` : "Choose JPG, PNG or WEBP photos"}
                </span>
                <span className="mt-1 block text-xs text-slate-400">Up to 6 photos, 8 MB each</span>
              </label>
              {reviewPhotoError && <p className="mt-2 text-xs font-semibold text-rose-600">{reviewPhotoError}</p>}
              <button
                type="button"
                disabled={!reviewPhotos.length || uploadingReviewPhotos}
                onClick={uploadRequestedPhotos}
                className="mt-3 inline-flex h-10 items-center justify-center rounded-xl bg-amber-700 px-5 text-sm font-bold text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploadingReviewPhotos ? "Uploading..." : "Submit Photos for Review"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-5 md:p-8 mb-6">
        <h3 className="text-2xl md:text-3xl font-bold mb-8">Job Progress</h3>

        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex items-start justify-between min-w-[650px] gap-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex flex-col items-center flex-1 relative"
              >
                {index !== steps.length - 1 && (
                  <div
                    className={`absolute top-6 left-[60%] w-full h-[2px] ${
                      index < currentStep ? "bg-[#4A86F7]" : "bg-slate-100"
                    }`}
                  />
                )}

                <div
                  className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center border-2 ${
                    index <= currentStep
                      ? "bg-[#4A86F7] border-[#4A86F7]"
                      : "bg-slate-50 border-slate-300"
                  }`}
                >
                  {index <= currentStep ? (
                    <Check size={22} />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-white/30" />
                  )}
                </div>

                <p
                  className={`mt-4 text-sm text-center leading-5 ${
                    index <= currentStep
                      ? "text-[#4A86F7] font-semibold"
                      : "text-slate-500"
                  }`}
                >
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Billing Summary */}
      <div className="rounded-[28px] border border-green-500/20 bg-white p-5 md:p-8">
        <h3 className="text-2xl md:text-3xl font-bold mb-8 text-emerald-700">
          Billing Summary
        </h3>

        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500 text-sm md:text-base">
              {hasFinalQuote ? "Quote Subtotal" : requiresReview ? "Calculated Subtotal" : "Service Price"}
            </span>
            <span className="text-xl md:text-2xl font-bold">
              CAD ${subtotal.toFixed(2)}
            </span>
          </div>

          {taxAmount > 0 && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500 text-sm md:text-base">
                Tax ({(normalizedTaxRate * 100).toFixed(0)}%)
              </span>
              <span className="text-xl md:text-2xl font-bold">
                CAD ${taxAmount.toFixed(2)}
              </span>
            </div>
          )}

          <div className="border-t border-slate-200 pt-6 flex items-center justify-between gap-4">
            <span className="text-2xl md:text-3xl font-bold">Total</span>
            <span className="text-right text-3xl md:text-5xl font-bold text-emerald-700">
              {requiresReview && !hasFinalQuote ? "Pending" : `CAD $${totalPrice.toFixed(2)}`}
              {requiresReview && !hasFinalQuote && calculatedEstimate > 0 && (
                <span className="mt-1 block text-xs font-semibold text-slate-400">Calculated estimate CAD ${calculatedEstimate.toFixed(2)}</span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
