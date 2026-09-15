import { NextRequest, NextResponse } from "next/server";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import { enforceMutationSecurity, readJsonBody, securityErrorResponse } from "@/lib/security/http";
import { calculateAuthoritativeEstimate, loadEstimatorDefinition } from "@/lib/cleaning-estimator";

type Submission = {
  id?: string;
  customer_name?: unknown;
  email?: unknown;
  phone?: unknown;
  address?: unknown;
  property_details?: Record<string, any>;
  checklist?: Record<string, any>;
  if_time_allows?: unknown;
  additional_notes?: unknown;
  preferred_contact?: unknown;
  preferred_date?: unknown;
  mode?: "time" | "price";
  budget?: "fixed" | "extend";
};

const text = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";

export async function GET() {
  const supabase = createPublicServerClient();
  const definition = await loadEstimatorDefinition(supabase);
  return NextResponse.json(definition, { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } });
}

export async function POST(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, { bucket: "custom-estimator-submit", limit: 10, windowSeconds: 60 });
  if (securityError) return securityError;

  let body: Submission;
  try {
    body = await readJsonBody<Submission>(request, 128 * 1024);
  } catch (error) {
    return securityErrorResponse(error) || NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const customerName = text(body.customer_name, 120);
  const email = text(body.email, 254).toLowerCase();
  const phone = text(body.phone, 40);
  const address = text(body.address, 300);
  const property = body.property_details || {};
  const checklist = body.checklist || {};
  const mode = body.mode === "time" ? "time" : "price";
  const budget = body.budget === "fixed" ? "fixed" : "extend";

  if (customerName.length < 2 || !email.includes("@") || phone.length < 7 || address.length < 5) {
    return NextResponse.json({ error: "Please provide valid contact and address details." }, { status: 400 });
  }
  if (!checklist.consent?.terms_accepted || !Array.isArray(checklist.selected_tasks) || checklist.selected_tasks.length === 0) {
    return NextResponse.json({ error: "Select at least one task and accept the terms." }, { status: 400 });
  }

  const supabase = createPublicServerClient();
  const { config, tasks } = await loadEstimatorDefinition(supabase);
  if ((mode === "time" && !config.timeModeEnabled) || (mode === "price" && !config.priceModeEnabled)) {
    return NextResponse.json({ error: "That estimator mode is temporarily unavailable. Please refresh the page." }, { status: 400 });
  }
  const { estimate, selectedTasks } = calculateAuthoritativeEstimate({
    mode,
    budget,
    property: {
      bedrooms: Number(property.bedrooms) || 0,
      fullBaths: Number(property.fullBaths) || 0,
      halfBaths: Number(property.halfBaths) || 0,
      size: text(property.size, 30),
      basement: text(property.basement, 30),
      condition: ["maintained", "attention", "heavy", "very_heavy"].includes(property.condition) ? property.condition : "maintained",
      cleaners: Number(property.cleaners) || 1,
      clutter: text(property.clutter, 30),
      excessiveClutter: property.excessiveClutter === true,
      delicateWalls: property.delicateWalls === true,
      unusualScope: property.unusualScope === true,
    },
    carpet: {
      enabled: checklist.carpet?.enabled === true,
      rooms: Number(checklist.carpet?.rooms) || 0,
      largeRooms: Number(checklist.carpet?.largeRooms) || 0,
      halls: Number(checklist.carpet?.halls) || 0,
      stairs: Number(checklist.carpet?.stairs) || 0,
      closets: Number(checklist.carpet?.closets) || 0,
      heavySoil: checklist.carpet?.heavySoil === true,
      petTreatment: checklist.carpet?.petTreatment === true,
    },
    selected: checklist.selected_tasks.map((item: any) => ({
      task_id: text(item?.task_id, 80), quantity: Number(item?.quantity) || 1,
      condition: ["maintained", "attention", "heavy", "very_heavy"].includes(item?.condition) ? item.condition : undefined,
    })),
  }, config, tasks);

  if (!selectedTasks.length) {
    return NextResponse.json({ error: "The selected tasks are no longer available. Please refresh and try again." }, { status: 400 });
  }

  const requestId: string = /^[0-9a-f-]{36}$/i.test(body.id || "") ? body.id! : crypto.randomUUID();
  const payload = {
    id: requestId,
    customer_name: customerName,
    email,
    phone,
    address,
    service_types: ["professional_cleaning"],
    property_details: { ...property, estimate },
    checklist: { ...checklist, selected_tasks: selectedTasks },
    if_time_allows: text(body.if_time_allows, 2000) || null,
    additional_notes: text(body.additional_notes, 4000) || null,
    preferred_contact: text(body.preferred_contact, 30) || "Email",
    preferred_date: text(body.preferred_date, 10) || null,
    status: "new",
  };
  const { error } = await supabase.from("custom_cleaning_requests").insert(payload);
  if (error) {
    console.error("Custom estimator submission failed", error.code);
    return NextResponse.json({ error: "We could not submit your cleaning plan. Please try again." }, { status: 400 });
  }
  return NextResponse.json({ ok: true, id: requestId, reference: requestId.slice(0, 8).toUpperCase(), estimate }, { status: 201 });
}
