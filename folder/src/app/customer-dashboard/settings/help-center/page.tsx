"use client";
import { useEffect, useState } from "react";
import {
  MessageSquare,
  AlignLeft,
  History,
  Loader2,
  Clock3,
  CheckCircle2,
  Send,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: string;
  category: string;
  created_at: string;
}

const categories = [
  "General",
  "Booking Issue",
  "Payment",
  "Cleaner Complaint",
  "Other",
];

const getStatusStyle = (status: string) => {
  const s = status?.toLowerCase();
  if (s === "open" || s === "pending")
    return "bg-amber-50 text-amber-700";
  if (s === "in_progress" || s === "in progress")
    return "bg-blue-50 text-blue-700";
  if (s === "resolved" || s === "closed")
    return "bg-emerald-50 text-emerald-700";
  return "bg-gray-500/20 text-slate-500";
};

export default function HelpCenterPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("support");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: fetchErr } = await supabase
        .from("help_tickets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchErr) throw fetchErr;
      setTickets((data as Ticket[]) || []);
    } catch (err: any) {
      console.error("Fetch tickets error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "history") fetchTickets();
  }, [activeTab, user]);

  const handleSubmit = async () => {
    if (!user) return;
    if (!subject.trim() || !description.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const supabase = createClient();
      const { error: insertErr } = await supabase.from("help_tickets").insert({
        user_id: user.id,
        subject: subject.trim(),
        description: description.trim(),
        status: "open",
        category: category,
      });

      if (insertErr) throw insertErr;

      setSuccess("Ticket submitted! We'll respond within 24 hours.");
      setSubject("");
      setDescription("");
      setCategory("General");
    } catch (err: any) {
      console.error("Submit ticket error:", err);
      setError(err.message || "Failed to submit ticket");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-900">
      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab("support")}
            className={`relative flex-1 py-4 text-sm md:text-base font-semibold transition ${
              activeTab === "support" ? "text-[#4A86F7]" : "text-slate-500"
            }`}
          >
            Contact Support
            {activeTab === "support" && (
              <span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-[#4A86F7]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`relative flex-1 py-4 text-sm md:text-base font-semibold transition ${
              activeTab === "history" ? "text-[#4A86F7]" : "text-slate-500"
            }`}
          >
            Ticket History
            {activeTab === "history" && (
              <span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-[#4A86F7]" />
            )}
          </button>
        </div>
      </div>

      <div className="px-4 py-7 md:px-6">
        {/* SUPPORT TAB */}
        {activeTab === "support" && (
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-2 text-2xl md:text-3xl font-bold">
              How can we help you?
            </h2>
            <p className="mb-7 text-sm md:text-base leading-7 text-slate-500">
              Submit a ticket and our team will get back to you within 24 hours.
            </p>

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

            <div className="space-y-5">
              {/* Category */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                        category === cat
                          ? "bg-[#4A86F7] text-white"
                          : "border border-slate-200 bg-white text-slate-500 hover:text-[#13263A]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  Subject
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <MessageSquare size={18} className="text-slate-500 shrink-0" />
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief description of your issue"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  Detailed Description
                </label>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 text-slate-500">
                    <AlignLeft size={18} />
                  </div>
                  <textarea
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell us more about the issue..."
                    className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 rounded-lg bg-[#4A86F7] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2563EB] disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} /> Submit Ticket
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === "history" && (
          <div className="mx-auto max-w-2xl">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#4A86F7]" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="flex min-h-[350px] flex-col items-center justify-center text-center">
                <div className="mb-5 text-gray-700">
                  <History size={70} strokeWidth={1.3} />
                </div>
                <h3 className="text-xl font-semibold text-slate-500">
                  No tickets yet.
                </h3>
                <p className="text-slate-500 text-sm mt-2">
                  Submit a support ticket and it will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="rounded-xl border border-slate-200 bg-white p-5"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-base truncate">
                          {ticket.subject}
                        </h4>
                        <span className="text-xs text-slate-500">
                          {ticket.category}
                        </span>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase ${getStatusStyle(ticket.status)}`}
                      >
                        {ticket.status?.replace("_", " ")}
                      </span>
                    </div>

                    <p className="text-slate-500 text-sm line-clamp-2 mb-3">
                      {ticket.description}
                    </p>

                    <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                      <Clock3 size={12} />
                      <span>{formatDate(ticket.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
