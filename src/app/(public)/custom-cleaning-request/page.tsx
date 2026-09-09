"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  LoaderCircle,
  MapPin,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import CommonHeroSection from "@/components/common/CommonHeroSection";
import { createClient } from "@/lib/supabase/client";
import { cleaningAreas, serviceTypes } from "@/data/customCleaning";

type ChecklistState = Record<string, string[]>;

const inputClass =
  "h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#00B7EB] focus:ring-2 focus:ring-[#00B7EB]/20";

const propertySections = [
  { id: "bedrooms", label: "Bedrooms", areaId: "bedrooms", input: "number", defaultValue: "1" },
  { id: "bathrooms", label: "Bathrooms", areaId: "bathrooms", input: "number", defaultValue: "1", step: "0.5" },
  { id: "powder_rooms", label: "Powder room", areaId: "bathrooms", input: "number", defaultValue: "0" },
  { id: "kitchens", label: "Kitchen count", areaId: "kitchen", input: "number", defaultValue: "1" },
  { id: "basement", label: "Basement", areaId: "basement", input: "select", options: ["None", "Finished", "Unfinished"] },
  { id: "garage", label: "Garage", areaId: "garage", input: "select", options: ["None", "Single", "Double", "Other"] },
] as const;

const frequencies = [
  { id: "One-time", label: "One-time", discount: 0, tag: "No commitment" },
  { id: "Weekly", label: "Weekly", discount: 0.12, tag: "Save 12%" },
  { id: "Every 2 weeks", label: "Every 2 weeks", discount: 0.08, tag: "Save 8%" },
  { id: "Every 4 weeks", label: "Every 4 weeks", discount: 0.05, tag: "Save 5%" },
];

const serviceAreas = ["Calgary", "Airdrie", "Cochrane", "Chestermere"] as const;
type ServiceArea = (typeof serviceAreas)[number];

const serviceAreaPostalPrefixes: Record<ServiceArea, RegExp> = {
  Calgary: /^(T1Y|T2[A-Z]|T3[A-Z])$/,
  Airdrie: /^T4[AB]$/,
  Cochrane: /^T4C$/,
  Chestermere: /^T1X$/,
};

const canadianPostalCodePattern =
  /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTVWXYZ][ -]?\d[ABCEGHJ-NPRSTVWXYZ]\d$/i;

export default function CustomCleaningRequestPage() {
  // PROGRESSIVE FORM STATE
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [expandedProperty, setExpandedProperty] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<ChecklistState>({});
  const [areaNotes, setAreaNotes] = useState<Record<string, string>>({});
  const [areaPhotos, setAreaPhotos] = useState<Record<string, File[]>>({});
  
  const [condition, setCondition] = useState<"Light" | "Average" | "Heavy">("Average");
  const [frequency, setFrequency] = useState<string>("One-time");
  const [serviceArea, setServiceArea] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [locationError, setLocationError] = useState("");
  
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const selectedTaskCount = useMemo(
    () => Object.values(checklist).reduce((total, tasks) => total + tasks.length, 0),
    [checklist],
  );

  // PRICING, DISCOUNTS & MANUAL REVIEW LOGIC
  const basePrice = 129;
  const addOnPrice = selectedTaskCount * 15;
  const subTotal = basePrice + addOnPrice;
  
  const currentFreq = frequencies.find(f => f.id === frequency);
  const discountPercent = currentFreq ? currentFreq.discount : 0;
  const discountAmount = subTotal * discountPercent;
  const estimatedPrice = subTotal - discountAmount;
  
  const needsManualReview = condition === "Heavy" || selectedTaskCount > 15;

  const toggleService = (serviceId: string) => {
    setSelectedServices((current) =>
      current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId],
    );
  };

  const toggleTask = (sectionId: string, task: string) => {
    setChecklist((current) => {
      const sectionTasks = current[sectionId] || [];
      return {
        ...current,
        [sectionId]: sectionTasks.includes(task)
          ? sectionTasks.filter((item) => item !== task)
          : [...sectionTasks, task],
      };
    });
  };

  // STEP NAVIGATION LOGIC
  const nextStep = () => {
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
      window.scrollTo({ top: 400, behavior: "smooth" });
    }
  };
  const prevStep = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
      window.scrollTo({ top: 400, behavior: "smooth" });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Sirf aakhri step par form submit hoga
    if (step !== totalSteps) return;

    const form = new FormData(event.currentTarget);
    const compactPostalCode = postalCode.replace(/\s|-/g, "").toUpperCase();
    const normalizedPostalCode = compactPostalCode.length === 6
      ? `${compactPostalCode.slice(0, 3)} ${compactPostalCode.slice(3)}`
      : postalCode.trim().toUpperCase();
    const isSupportedArea = serviceAreas.some((area) => area === serviceArea);

    if (!isSupportedArea) {
      setLocationError("Please select one of our supported service areas.");
      return;
    }

    if (!canadianPostalCodePattern.test(normalizedPostalCode)) {
      setLocationError("Enter a valid Alberta postal code, for example T2P 1J9.");
      return;
    }

    const postalPrefix = compactPostalCode.slice(0, 3);
    const matchesSelectedArea = serviceAreaPostalPrefixes[serviceArea as ServiceArea].test(postalPrefix);
    if (!matchesSelectedArea) {
      setLocationError(`This postal code does not match ${serviceArea}. Please check your city and postal code.`);
      return;
    }

    setLocationError("");
    setStatus("submitting");
    setErrorMessage("");
    const supabase = createClient();
    const requestId = crypto.randomUUID();
    const photoPaths: Record<string, string[]> = {};

    for (const [areaId, files] of Object.entries(areaPhotos)) {
      photoPaths[areaId] = [];
      for (const file of files) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const path = `${requestId}/${areaId}/${crypto.randomUUID()}-${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from("custom-cleaning-photos")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (uploadError) {
          setStatus("error");
          setErrorMessage("We could not attach your photos. Please check the file size and try again.");
          return;
        }
        photoPaths[areaId].push(path);
      }
    }

    const checklistDetails = Object.fromEntries(
      propertySections.map((section) => [
        section.id,
        {
          tasks: checklist[section.id] || [],
          notes: areaNotes[section.id] || "",
          photo_paths: photoPaths[section.id] || [],
        },
      ]),
    );

    const payload = {
      id: requestId,
      customer_name: form.get("customer_name"),
      email: form.get("email"),
      phone: form.get("phone"),
      address: form.get("address"),
      service_types: selectedServices,
      property_details: {
        bedrooms: form.get("bedrooms"),
        bathrooms: form.get("bathrooms"),
        powder_rooms: form.get("powder_rooms"),
        kitchens: form.get("kitchens"),
        basement: form.get("basement"),
        garage: form.get("garage"),
        parking: form.get("parking"),
        condition: condition, 
        frequency: frequency, 
        service_area: serviceArea,
        postal_code: normalizedPostalCode,
        province: "Alberta",
        country: "Canada",
        sub_total: needsManualReview ? null : subTotal,
        discount_amount: needsManualReview ? null : discountAmount,
        estimated_price: needsManualReview ? "Manual Quote" : estimatedPrice,
        requires_manual_quote: needsManualReview,
      },
      checklist: checklistDetails,
      if_time_allows: form.get("if_time_allows"),
      additional_notes: form.get("additional_notes"),
      preferred_contact: form.get("preferred_contact"),
      preferred_date: form.get("preferred_date") || null,
      status: "new",
    };

    const { error } = await supabase.from("custom_cleaning_requests").insert(payload);
    if (error) {
      setStatus("error");
      setErrorMessage("We could not submit your request. Please try again.");
      return;
    }
    setStatus("success");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (status === "success") {
    return (
      <main className="flex min-h-[70vh] items-center bg-[#F4F8FC] px-4 py-20">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 size={34} />
          </div>
          <p className="mb-3 text-sm font-bold uppercase text-[#4276B2]">Request received</p>
          <h2 className="text-3xl font-bold text-[#0B4E9B] sm:text-4xl">Thank you. We will be in touch.</h2>
          <p className="mx-auto mt-4 max-w-md text-slate-600">
            {needsManualReview 
              ? "Our team will review your checklist and property condition to send you a confirmed manual quote."
              : "Your booking request has been successfully submitted."}
          </p>
          <button type="button" onClick={() => window.location.reload()} className="mt-8 rounded-md bg-[#0B4E9B] px-6 py-3 font-semibold text-white hover:bg-[#00A8D4]">Start another request</button>
        </div>
      </main>
    );
  }

  return (
    <>
      <div className="min-w-0 max-w-full overflow-hidden [&_h1]:!mx-auto [&_h1]:!w-full [&_h1]:!max-w-[16ch] [&_h1]:!translate-x-0 [&_h1]:!whitespace-normal [&_h1]:!break-words [&_h1]:!px-4 [&_h1]:!text-center [&_h1]:!text-[clamp(1.5rem,6vw,2rem)] [&_h1]:!leading-[1.15] [&_h1_*]:!max-w-full [&_h1_*]:!whitespace-normal [&_h1_*]:!break-words [&_h1_*]:!text-[inherit] sm:[&_h1]:!text-5xl lg:[&_h1]:!text-6xl">
        <CommonHeroSection backgroundImage="/p4.webp" title="Build Your Cleaning Checklist" />
      </div>
      
      {/* PROGRESS BAR */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0B4E9B] text-sm font-bold text-white">
            {step}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold uppercase tracking-wide text-[#0B4E9B]">
              Step {step} of {totalSteps} <span aria-hidden="true">·</span> {["Services", "Property", "Schedule", "Details"][step - 1]}
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-[#00B7EB] transition-all" style={{ width: `${(step / totalSteps) * 100}%` }} />
            </div>
          </div>
        </div>
        <div className="mx-auto hidden max-w-6xl items-center justify-between px-4 py-3 text-sm font-semibold sm:flex">
           <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#0B4E9B]' : 'text-slate-400'}`}>
              <div className="h-6 w-6 rounded-full bg-[#0B4E9B] text-white flex items-center justify-center text-xs">1</div> Services
           </div>
           <div className="h-px bg-slate-200 flex-1 mx-4"></div>
           <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#0B4E9B]' : 'text-slate-400'}`}>
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-[#0B4E9B] text-white' : 'bg-slate-200 text-slate-500'}`}>2</div> Property
           </div>
           <div className="h-px bg-slate-200 flex-1 mx-4"></div>
           <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#0B4E9B]' : 'text-slate-400'}`}>
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-[#0B4E9B] text-white' : 'bg-slate-200 text-slate-500'}`}>3</div> Schedule
           </div>
           <div className="h-px bg-slate-200 flex-1 mx-4"></div>
           <div className={`flex items-center gap-2 ${step >= 4 ? 'text-[#0B4E9B]' : 'text-slate-400'}`}>
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${step >= 4 ? 'bg-[#0B4E9B] text-white' : 'bg-slate-200 text-slate-500'}`}>4</div> Details
           </div>
        </div>
      </div>

      <main className="max-w-full overflow-x-hidden bg-[#F4F8FC] pb-24 pt-4 sm:pb-20 sm:pt-6">
        <form onSubmit={handleSubmit} className="min-w-0 max-w-full">
          
          {/* STEP 1: SERVICE TYPES */}
          {step === 1 && (
            <section className="mx-3 min-w-0 max-w-4xl overflow-hidden rounded-lg border border-slate-200 bg-white px-4 py-7 shadow-sm sm:mx-auto sm:rounded-xl sm:px-6 sm:py-12 lg:px-8">
              <p className="text-sm font-bold uppercase text-[#4276B2]">Step 1 of {totalSteps}</p>
              <h2
                className="mt-2 block w-full max-w-full font-bold text-[#0B4E9B] sm:text-3xl"
                style={{
                  fontSize: "clamp(1.35rem, 6vw, 3rem)",
                  lineHeight: 1.2,
                  whiteSpace: "normal",
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                }}
              >
                <span className="block sm:inline">Choose your</span>{" "}
                <span className="block sm:inline">service</span>
              </h2>
              <div className="mt-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:grid-cols-3 sm:gap-4">
                {serviceTypes.map((service) => {
                  const selected = selectedServices.includes(service.id);
                  return (
                    <button
                      key={service.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleService(service.id)}
                      className={`relative flex min-h-20 flex-col items-center justify-center rounded-xl border-2 p-3 text-center text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-[#00B7EB] sm:min-h-24 sm:p-4 sm:text-base ${
                        selected
                          ? "border-[#0B4E9B] bg-[#0B4E9B] text-white shadow-md"
                          : "border-slate-200 bg-white text-slate-800 hover:border-[#00B7EB]"
                      }`}
                    >
                      {service.name}
                      {selected && <Check className="absolute right-3 top-3 text-white" size={18} />}
                    </button>
                  );
                })}
              </div>
              <div className="mt-8 flex justify-end sm:mt-10">
                 <button 
                    type="button" 
                    onClick={nextStep} 
                    disabled={selectedServices.length === 0}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#00B7EB] px-8 font-bold text-white transition hover:bg-[#00A8D4] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                 >
                    Continue <ArrowRight size={18} />
                 </button>
              </div>
            </section>
          )}

          {/* STEP 2, 3, 4 with STICKY SIDEBAR */}
          {step > 1 && (
            <section className="px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
              <div className="mx-auto grid min-w-0 max-w-6xl grid-cols-[minmax(0,1fr)] gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
                
                {/* LEFT CONTENT (Changes based on step) */}
                <div className="min-w-0 space-y-6">
                  
                  {/* STEP 2: PROPERTY & CHECKLIST */}
                  {step === 2 && (
                    <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8">
                      <p className="text-sm font-bold uppercase text-[#4276B2]">Step 2 of {totalSteps}</p>
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end mb-6">
                        <div>
                          <h2 className="mt-2 max-w-full break-words text-xl font-bold leading-tight text-[#0B4E9B] min-[400px]:text-2xl sm:text-3xl">Property information</h2>
                          <p className="mt-2 text-slate-600">Tap a room to enter its details and select tasks.</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-[#0B4E9B]">
                          <ClipboardCheck size={19} /> {selectedTaskCount} tasks selected
                        </div>
                      </div>

                      <div className="space-y-3">
                        {propertySections.map((section) => {
                          const expanded = expandedProperty === section.id;
                          const area = cleaningAreas.find((item) => item.id === section.areaId);
                          const selected = checklist[section.id]?.length || 0;
                          return (
                            <div key={section.id} className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                              <div className="flex flex-col items-stretch gap-3 p-4 sm:flex-row sm:items-center">
                                <button
                                  type="button"
                                  aria-expanded={expanded}
                                  onClick={() => setExpandedProperty(expanded ? null : section.id)}
                                  className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
                                >
                                  <span>
                                    <span className="block font-bold text-slate-900">{section.label}</span>
                                    <span className="mt-1 block text-xs text-slate-500">{selected ? `${selected} tasks selected` : "Tap to choose cleaning tasks"}</span>
                                  </span>
                                  <ChevronDown className={`shrink-0 text-[#4276B2] transition-transform ${expanded ? "rotate-180" : ""}`} size={22} />
                                </button>
                                <div className="w-full shrink-0 sm:w-32">
                                  {section.input === "number" ? (
                                    <input
                                      aria-label={`${section.label} count`}
                                      name={section.id}
                                      type="number"
                                      min="0"
                                      step={"step" in section ? section.step : "1"}
                                      defaultValue={section.defaultValue}
                                      className={inputClass}
                                    />
                                  ) : (
                                    <select aria-label={section.label} name={section.id} defaultValue="" className={inputClass}>
                                      <option value="" disabled>Select</option>
                                      {section.options.map((option) => <option key={option} value={option.toLowerCase()}>{option}</option>)}
                                    </select>
                                  )}
                                </div>
                              </div>
                              {expanded && area && (
                                <div className="border-t border-slate-200 bg-slate-50 px-4 py-5 sm:px-6">
                                  <h3 className="text-base font-bold text-slate-900">{section.label}</h3>
                                  <div className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                                    {area.tasks.map((task) => {
                                      const checked = checklist[section.id]?.includes(task) || false;
                                      return (
                                        <label key={task} className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-slate-800">
                                          <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => toggleTask(section.id, task)}
                                            className="mt-1 h-5 w-5 shrink-0 accent-[#0B4E9B]"
                                          />
                                          <span>{task}</span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* STEP 3: FREQUENCY & CONDITION */}
                  {step === 3 && (
                    <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8">
                      <p className="text-sm font-bold uppercase text-[#4276B2]">Step 3 of {totalSteps}</p>
                      <h2 className="mb-8 mt-2 max-w-full break-words text-xl font-bold leading-tight text-[#0B4E9B] min-[400px]:text-2xl sm:text-3xl">Customize your schedule</h2>
                      
                      <div className="grid md:grid-cols-2 gap-8">
                        <div>
                          <h3 className="text-base font-bold text-slate-900 mb-3">Property condition</h3>
                          <div className="flex flex-col gap-3">
                            {(["Light", "Average", "Heavy"] as const).map((cond) => (
                              <button
                                key={cond}
                                type="button"
                                onClick={() => setCondition(cond)}
                                className={`rounded-lg border p-3 text-left text-sm font-semibold transition flex items-center justify-between ${
                                  condition === cond
                                    ? "border-[#0B4E9B] bg-blue-50 text-[#0B4E9B] ring-1 ring-[#0B4E9B]"
                                    : "border-slate-200 bg-white text-slate-600 hover:border-[#00B7EB]"
                                }`}
                              >
                                {cond}
                                {condition === cond && <CheckCircle2 size={18} />}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-slate-900 mb-3">How often would you like cleaning?</h3>
                          <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
                            {frequencies.map((freq) => (
                              <button
                                key={freq.id}
                                type="button"
                                onClick={() => setFrequency(freq.id)}
                                className={`flex flex-col items-center justify-center rounded-lg border p-3 text-center transition ${
                                  frequency === freq.id
                                    ? "border-[#0B4E9B] bg-blue-50 text-[#0B4E9B] ring-1 ring-[#0B4E9B]"
                                    : "border-slate-200 bg-white text-slate-600 hover:border-[#00B7EB]"
                                }`}
                              >
                                <span className="text-sm font-bold">{freq.label}</span>
                                <span className={`mt-1 text-xs font-semibold ${frequency === freq.id ? "text-[#0B4E9B]" : "text-emerald-600"}`}>
                                  {freq.tag}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 border-t border-slate-200 pt-6">
                        <label htmlFor="if_time_allows" className="mb-2 block text-sm font-bold text-slate-800">If time allows <span className="font-normal text-slate-500">(optional)</span></label>
                        <textarea id="if_time_allows" name="if_time_allows" rows={3} className="w-full rounded-md border border-slate-300 bg-white p-3 text-sm outline-none focus:border-[#00B7EB] focus:ring-2 focus:ring-[#00B7EB]/20" placeholder="What else would you like us to do if there is time?" />
                      </div>
                    </div>
                  )}

                  {/* STEP 4: CONTACT & SUBMIT */}
                  {step === 4 && (
                    <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8">
                      <p className="text-sm font-bold uppercase text-[#4276B2]">Step 4 of {totalSteps}</p>
                      <h2 className="mb-8 mt-2 max-w-full break-words text-xl font-bold leading-tight text-[#0B4E9B] min-[400px]:text-2xl sm:text-3xl">Access &amp; Details</h2>
                      
                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="Full name" name="customer_name" autoComplete="name" required />
                        <Field label="Email address" name="email" type="email" inputMode="email" autoComplete="email" required />
                        <Field label="Phone number" name="phone" type="tel" inputMode="tel" autoComplete="tel" required />
                        <Field label="Property address" name="address" autoComplete="street-address" required />

                        <div>
                          <label htmlFor="service_area" className="mb-2 block text-sm font-semibold text-slate-800">
                            Service area <span className="text-red-600">*</span>
                          </label>
                          <select
                            id="service_area"
                            name="service_area"
                            value={serviceArea}
                            required
                            aria-invalid={Boolean(locationError)}
                            onChange={(event) => {
                              setServiceArea(event.target.value);
                              setLocationError("");
                            }}
                            className={inputClass}
                          >
                            <option value="" disabled>Select your city</option>
                            {serviceAreas.map((area) => <option key={area} value={area}>{area}, AB</option>)}
                          </select>
                        </div>

                        <div>
                          <label htmlFor="postal_code" className="mb-2 block text-sm font-semibold text-slate-800">
                            Postal code <span className="text-red-600">*</span>
                          </label>
                          <input
                            id="postal_code"
                            name="postal_code"
                            value={postalCode}
                            required
                            maxLength={7}
                            inputMode="text"
                            autoComplete="postal-code"
                            aria-invalid={Boolean(locationError)}
                            aria-describedby="location-help"
                            placeholder="T2P 1J9"
                            onChange={(event) => {
                              setPostalCode(event.target.value.toUpperCase());
                              setLocationError("");
                            }}
                            className={inputClass}
                          />
                        </div>

                        <div id="location-help" className={`sm:col-span-2 rounded-lg border p-3 text-sm ${locationError ? "border-red-200 bg-red-50 text-red-700" : "border-blue-100 bg-blue-50 text-[#0B4E9B]"}`} role={locationError ? "alert" : undefined}>
                          <div className="flex items-start gap-2">
                            <MapPin size={18} className="mt-0.5 shrink-0" />
                            <span>{locationError || "We currently serve Calgary, Airdrie, Cochrane and Chestermere, Alberta."}</span>
                          </div>
                        </div>
                        
                        <SelectField 
                          label="Preferred contact" 
                          name="preferred_contact" 
                          options={["Phone", "Email", "Text message"]} 
                          required 
                        />
                        
                        <SelectField 
                          label="Parking for cleaning team" 
                          name="parking" 
                          options={["Free street parking", "Visitor parking", "Paid parking", "No parking nearby"]} 
                          required 
                        />
                        <Field label="Preferred service date" name="preferred_date" type="date" />
                        
                        <div className="sm:col-span-2 border-t border-slate-200 pt-5 mt-2">
                          <label htmlFor="additional_notes" className="mb-2 block text-sm font-semibold text-slate-800">Special instructions <span className="font-normal text-slate-500">(optional)</span></label>
                          <textarea id="additional_notes" name="additional_notes" rows={3} className="w-full rounded-md border border-slate-300 p-3 text-sm outline-none focus:border-[#00B7EB] focus:ring-2 focus:ring-[#00B7EB]/20" placeholder="Access details, gate code, or allergies..." />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* BOTTOM NAVIGATION BUTTONS FOR DESKTOP */}
                  <div className="mt-4 flex justify-between">
                    <button 
                      type="button" 
                      onClick={prevStep}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-6 font-bold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
                    >
                      <ArrowLeft size={18} /> Back
                    </button>
                  </div>

                </div>
                
                {/* RIGHT SIDEBAR: STICKY QUOTE & BILLING */}
                <aside className="h-fit min-w-0 overflow-hidden rounded-xl bg-[#0B4E9B] p-5 text-white shadow-lg sm:p-6 lg:sticky lg:top-24">
                  <h3 className="text-xl font-bold border-b border-white/20 pb-4 mb-4">Request summary</h3>
                  
                  {needsManualReview ? (
                    <div className="mb-6 rounded-lg bg-amber-50 p-4 border border-amber-100 text-slate-900">
                      <div className="flex items-start gap-2 text-amber-800">
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        <div>
                          <p className="font-bold text-sm mb-1">Manual review needed</p>
                          <p className="text-xs text-amber-700">
                            Heavy condition or high task count. We will review your scope and send a confirmed price.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6 space-y-3 text-sm">
                      <SummaryRow label="Base cleaning" value={`$${basePrice.toFixed(2)}`} />
                      <SummaryRow label={`Selected tasks (${selectedTaskCount})`} value={`+$${addOnPrice.toFixed(2)}`} />
                      
                      <div className="border-t border-white/20 pt-3">
                        <SummaryRow label="Subtotal" value={`$${subTotal.toFixed(2)}`} />
                      </div>
                      
                      {discountAmount > 0 && (
                        <div className="text-emerald-300">
                          <SummaryRow label={`${frequency} discount`} value={`-$${discountAmount.toFixed(2)}`} />
                        </div>
                      )}
                      
                      <div className="mt-4 rounded-lg bg-white/10 p-4 border border-white/20">
                        <p className="text-sm text-blue-100 mb-1">Estimated total</p>
                        <p className="text-3xl font-extrabold text-white">${estimatedPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  )}

                  {status === "error" && <p role="alert" className="mt-4 bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p>}
                  
                  {/* DYNAMIC SIDEBAR BUTTON (Progressive) */}
                  {step < totalSteps ? (
                    <button 
                      type="button" 
                      onClick={nextStep}
                      className="mt-2 flex h-13 w-full items-center justify-center gap-2 rounded-md bg-[#00B7EB] px-5 font-bold text-white transition hover:bg-[#00A8D4]"
                    >
                      Continue <ArrowRight size={18} />
                    </button>
                  ) : (
                    <button 
                      type="submit" 
                      disabled={status === "submitting" || selectedTaskCount === 0} 
                      className="mt-2 flex h-13 w-full items-center justify-center gap-2 rounded-md bg-[#00B7EB] px-5 font-bold text-white transition hover:bg-[#00A8D4] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {status === "submitting" ? (
                        <><LoaderCircle className="animate-spin" size={19} /> Submitting...</>
                      ) : (
                        needsManualReview ? "Request Confirmed Quote" : `Confirm Booking`
                      )}
                    </button>
                  )}
                  
                  {selectedTaskCount === 0 && step === totalSteps && <p className="mt-2 text-center text-xs text-blue-100">Select at least one cleaning task.</p>}
                  
                </aside>
              </div>
            </section>
          )}
        </form>
      </main>
    </>
  );
}

function Field({ label, name, ...props }: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <div><label htmlFor={name} className="mb-2 block text-sm font-semibold text-slate-800">{label}{props.required && <span className="text-red-600"> *</span>}</label><input id={name} name={name} className={inputClass} {...props} /></div>;
}

function SelectField({ label, name, options, required = false }: { label: string; name: string; options: string[]; required?: boolean }) {
  return <div><label htmlFor={name} className="mb-2 block text-sm font-semibold text-slate-800">{label}{required && <span className="text-red-600"> *</span>}</label><select id={name} name={name} required={required} defaultValue="" className={inputClass}><option value="" disabled>Select an option</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></div>;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between"><span className="text-blue-100">{label}</span><span className="font-bold">{value}</span></div>;
}
