"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupportedAddress, SERVICE_AREA_LABEL } from "@/lib/serviceArea";

const services = [
  { value: "residential", label: "Residential Cleaning" },
  { value: "commercial", label: "Commercial Cleaning" },
  { value: "vehicle", label: "Vehicle Cleaning" },
  { value: "seasonal_property", label: "Seasonal Property Service" },
];

export default function ContactQuoteForm() {
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const address = String(form.get("address") || "").trim();
    const service = String(form.get("service") || "").trim();
    const notes = String(form.get("notes") || "").trim();

    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setMessage("Please enter a valid name and email address.");
      return;
    }

    if (!phone || !service) {
      setStatus("error");
      setMessage("Please provide your phone number and select a service.");
      return;
    }

    if (!isSupportedAddress(address)) {
      setStatus("error");
      setMessage(`Please enter an address within ${SERVICE_AREA_LABEL}.`);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from("custom_cleaning_requests").insert({
      customer_name: name,
      email,
      phone,
      address,
      service_types: [service],
      property_details: {},
      checklist: {},
      additional_notes: notes || null,
      preferred_contact: "email",
      preferred_date: null,
      status: "new",
    });

    if (error) {
      console.error("Quote request failed:", error);
      setStatus("error");
      setMessage(
        "We could not submit your request. Please try again or call 587-837-1977.",
      );
      return;
    }

    formElement.reset();
    setStatus("success");
    setMessage(
      "Your request has been submitted successfully. Our team will contact you after reviewing the details.",
    );
  };

  return (
    <section className="bg-white px-6 py-16 md:px-12 lg:px-24">
      <div className="container-custom mx-auto grid gap-10 rounded-[2rem] border border-slate-100 bg-[#F7FBFD] p-6 shadow-sm md:p-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <span className="inline-block rounded-full bg-[#00CFE8] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white">
            Request a Quote
          </span>
          <h2 className="mt-5 text-3xl font-extrabold text-[#0B4E9B] md:text-4xl">
            Tell Us What You Need
          </h2>
          <p className="mt-4 max-w-lg leading-7 text-slate-600">
            Submit your details without leaving or refreshing the page. We will
            show a confirmation as soon as your request is received.
          </p>
          <p className="mt-4 text-sm font-semibold text-[#0B4E9B]">
            Service area: {SERVICE_AREA_LABEL}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <input
            name="name"
            required
            placeholder="Full name"
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#00B7EB]"
          />
          <input
            name="email"
            type="email"
            required
            placeholder="Email address"
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#00B7EB]"
          />
          <input
            name="phone"
            required
            placeholder="Phone number"
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#00B7EB]"
          />
          <select
            name="service"
            required
            defaultValue=""
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#00B7EB]"
          >
            <option value="" disabled>
              Select service
            </option>
            {services.map((service) => (
              <option key={service.value} value={service.value}>
                {service.label}
              </option>
            ))}
          </select>
          <input
            name="address"
            required
            placeholder="Service address"
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#00B7EB] sm:col-span-2"
          />
          <textarea
            name="notes"
            rows={4}
            placeholder="Tell us about the space or cleaning required"
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#00B7EB] sm:col-span-2"
          />

          {message && (
            <div
              className={`flex items-start gap-3 rounded-xl border p-4 text-sm sm:col-span-2 ${
                status === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
              role="status"
            >
              {status === "success" && (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              )}
              <span>{message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={status === "submitting"}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B4E9B] px-7 py-3.5 font-bold text-white transition hover:bg-[#00B7EB] disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2 sm:w-fit"
          >
            {status === "submitting" ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Request a Quote
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
