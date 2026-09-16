import { NextRequest, NextResponse } from "next/server";
import { calculateAuthoritativeEstimate, loadEstimatorDefinition, type EstimatorMode } from "@/lib/cleaning-estimator";
import { buildCleaningConfirmationPdf, emailCleaningConfirmation, type CleaningConfirmationInput } from "@/lib/custom-cleaning-confirmation";
import { enforceMutationSecurity, readJsonBody, securityErrorResponse } from "@/lib/security/http";
import { createPublicServerClient } from "@/lib/supabase/public-server";

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
  budget?: "fixed" | "extend";
};

const text = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";
const serviceAreaPrefixes: Record<string, RegExp> = {
  Calgary: /^(T1Y|T2[A-Z]|T3[A-Z])$/,
  Airdrie: /^T4[AB]$/,
  Cochrane: /^T4C$/,
  Chestermere: /^T1X$/,
};
const canadianPostalPattern = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTVWXYZ][ -]?\d[ABCEGHJ-NPRSTVWXYZ]\d$/i;

function requestReference(id: string) {
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Edmonton",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date()).replaceAll("-", "");
  return `CCR-${date}-${id.replaceAll("-", "").slice(0, 8).toUpperCase()}`;
}

export async function submitCustomCleaningRequest(request: NextRequest, mode: EstimatorMode) {
  const securityError = await enforceMutationSecurity(request, {
    bucket: `custom-estimator-submit-${mode}`,
    limit: 10,
    windowSeconds: 60,
  });
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
  const budget = body.budget === "fixed" ? "fixed" : "extend";

  if (customerName.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || phone.length < 7 || address.length < 5) {
    return NextResponse.json({ error: "Please provide valid contact and address details." }, { status: 400 });
  }
  if (!checklist.consent?.terms_accepted || !Array.isArray(checklist.selected_tasks) || checklist.selected_tasks.length === 0) {
    return NextResponse.json({ error: "Select at least one task and accept the terms." }, { status: 400 });
  }
  const serviceArea = text(property.service_area, 40);
  const postalCode = text(property.postal_code, 10).toUpperCase();
  const compactPostal = postalCode.replace(/[\s-]/g, "");
  if (
    property.address_verified !== true ||
    !serviceAreaPrefixes[serviceArea] ||
    !canadianPostalPattern.test(postalCode) ||
    !serviceAreaPrefixes[serviceArea].test(compactPostal.slice(0, 3))
  ) {
    return NextResponse.json({ error: "Verify a supported service address before submitting." }, { status: 400 });
  }

  const supabase = createPublicServerClient();
  const { config, tasks } = await loadEstimatorDefinition(supabase);
  if ((mode === "time" && !config.timeModeEnabled) || (mode === "price" && !config.priceModeEnabled)) {
    return NextResponse.json({ error: "This checklist link is temporarily unavailable." }, { status: 400 });
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
      task_id: text(item?.task_id, 80),
      quantity: Number.isFinite(Number(item?.quantity)) && Number(item?.quantity) > 0
        ? Number(item.quantity)
        : undefined,
      condition: ["maintained", "attention", "heavy", "very_heavy"].includes(item?.condition) ? item.condition : undefined,
    })),
  }, config, tasks);

  if (!selectedTasks.length) {
    return NextResponse.json({ error: "The selected tasks are no longer available. Please refresh and try again." }, { status: 400 });
  }

  const id = /^[0-9a-f-]{36}$/i.test(body.id || "") ? body.id! : crypto.randomUUID();
  const reference = requestReference(id);
  const preferredContact = text(body.preferred_contact, 30) || "Email";
  const preferredDate = text(body.preferred_date, 10) || null;
  const ifTimeAllows = text(body.if_time_allows, 2000) || null;
  const additionalNotes = text(body.additional_notes, 4000) || null;
  const savedProperty = {
    ...property,
    estimate,
    submission_reference: reference,
    checklist_link_mode: mode,
  };
  const savedChecklist = {
    ...checklist,
    selected_tasks: selectedTasks,
    submission_reference: reference,
    checklist_link_mode: mode,
  };

  const { error: insertError } = await supabase.from("custom_cleaning_requests").insert({
    id,
    customer_name: customerName,
    email,
    phone,
    address,
    service_types: ["professional_cleaning"],
    property_details: savedProperty,
    checklist: savedChecklist,
    if_time_allows: ifTimeAllows,
    additional_notes: additionalNotes,
    preferred_contact: preferredContact,
    preferred_date: preferredDate,
    status: "new",
  });
  if (insertError) {
    console.error("Custom estimator submission failed", insertError.code, insertError.message);
    return NextResponse.json({ error: "We could not submit your cleaning plan. Please try again." }, { status: 400 });
  }

  const documentInput: CleaningConfirmationInput = {
    reference,
    mode,
    customerName,
    email,
    phone,
    address,
    preferredDate,
    preferredContact,
    ifTimeAllows,
    additionalNotes,
    property: savedProperty,
    carpet: checklist.carpet || {},
    tasks: selectedTasks,
    priorities: Array.isArray(checklist.priority_order) ? checklist.priority_order.map((item: unknown) => text(item, 40)).filter(Boolean) : [],
    estimate,
  };

  let pdfBytes: Uint8Array;
  try {
    pdfBytes = await buildCleaningConfirmationPdf(documentInput);
  } catch (error) {
    console.error("Custom cleaning confirmation PDF failed", error);
    return NextResponse.json({
      ok: true,
      id,
      reference,
      estimate,
      email_sent: false,
      pdf_base64: "",
      pdf_filename: `CAMZ-Cleaning-Plan-${reference}.pdf`,
      warning: "The request was saved, but its confirmation PDF could not be generated.",
    }, { status: 201 });
  }

  const delivery = await emailCleaningConfirmation(documentInput, pdfBytes);
  if (!delivery.ok) console.error("Custom cleaning confirmation email failed", delivery.error);

  return NextResponse.json({
    ok: true,
    id,
    reference,
    estimate,
    email_sent: delivery.ok,
    pdf_base64: Buffer.from(pdfBytes).toString("base64"),
    pdf_filename: `CAMZ-Cleaning-Plan-${reference}.pdf`,
  }, { status: 201 });
}
