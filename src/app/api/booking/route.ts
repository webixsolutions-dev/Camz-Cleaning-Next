import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import {
  enforceMutationSecurity,
  readJsonBody,
  securityErrorResponse,
} from "@/lib/security/http";
import {
  isSupportedAddress,
  isSupportedCoordinates,
  SERVICE_AREA_LABEL,
} from "@/lib/serviceArea";
import { validatePricingConfig } from "@/lib/pricing/config";
import { calculateStandardCleaningPrice } from "@/lib/pricing/standard";
import { calculateDeepCleaningPrice } from "@/lib/pricing/deep";
import { calculateMoveInOutPrice } from "@/lib/pricing/moveInOut";
import { PACKAGE_AREA_KEYS } from "@/lib/pricing/packageCompensation";
import { calculateCarpetPrice, carpetAreaCount } from "@/lib/pricing/carpet";
import { resolveCleaningPricingScope } from "@/lib/pricing/serviceScope";
import { calculateServiceAddOns } from "@/lib/pricing/addOns";

type Coordinates = { lat: number; lng: number };

type BookingPayload = {
  serviceId?: string;
  isGuest?: boolean;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  bookingDateTime?: string;
  address?: string;
  coordinates?: Coordinates | null;
  pricingType?: string;
  hours?: number;
  formData?: Record<string, unknown>;
};

type ServiceConfig = {
  base_rate?: number;
  bedroom_rate?: number;
  washroom_rate?: number;
  furnished_fee?: number;
  heavy_condition_fee?: number;
  heavy_multiplier?: number;
  rates?: Record<string, unknown>;
};

const cleanString = (value: unknown, max = 500) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const safeNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const validPhone = (value: string) => value.replace(/\D/g, "").length >= 7;
const PROPERTY_TYPES = new Set([
  "house",
  "apartment",
  "condo",
  "townhouse",
  "basement_suite",
  "rental_property",
  "other",
]);
const PROPERTY_CONDITIONS = new Set(["regular", "moderate", "heavy"]);
const BOOKING_PHOTO_PREFIX = "booking-pending/";
const CANADIAN_POSTAL_CODE_PATTERN =
  /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTVWXYZ][ -]?\d[ABCEGHJ-NPRSTVWXYZ]\d$/i;

function calculatePricing(
  service: Record<string, unknown>,
  config: ServiceConfig,
  formData: Record<string, unknown>,
  pricingType: string,
  requestedHours: number,
) {
  let subtotal = 0;
  const serviceType = String(service.service_type || "");
  const hours = Math.min(24, Math.max(1, Math.round(requestedHours || 1)));

  if (pricingType === "Hourly") {
    const hourlyRate = safeNumber(service.hourly_rate, 35);
    subtotal = hours * hourlyRate;
  } else {
    switch (serviceType) {
      case "residential":
      case "move_in_out": {
        const beds = Math.max(0, safeNumber(formData.bedrooms));
        const washrooms = Math.max(0, safeNumber(formData.washrooms));
        subtotal += safeNumber(config.base_rate);
        subtotal += beds * safeNumber(config.bedroom_rate);
        subtotal += washrooms * safeNumber(config.washroom_rate);

        if (formData.furnished === true) {
          subtotal += safeNumber(config.furnished_fee);
        }
        if (formData.heavy_condition === true) {
          subtotal += safeNumber(config.heavy_condition_fee);
        }
        break;
      }

      case "vehicle": {
        const rates = (config.rates || {}) as Record<
          string,
          Record<string, number>
        >;
        const vehicleType = cleanString(formData.vehicle_type, 50);
        const packageName = cleanString(formData.package, 50);
        subtotal = safeNumber(rates?.[vehicleType]?.[packageName]);
        break;
      }

      case "specialty":
      case "carpet_sofa": {
        const rates = (config.rates || {}) as Record<string, number>;
        const itemType = cleanString(formData.item_type, 80);
        const quantity = Math.min(
          50,
          Math.max(1, safeNumber(formData.quantity, 1)),
        );
        const base = safeNumber(rates[itemType]) * quantity;
        subtotal = base;

        if (formData.heavy === true && safeNumber(config.heavy_multiplier) > 1) {
          subtotal = base * safeNumber(config.heavy_multiplier, 1);
        }
        break;
      }

      case "commercial": {
        // Fixed commercial work can require a manual quote.
        subtotal = safeNumber(config.base_rate);
        break;
      }

      default:
        subtotal = safeNumber(config.base_rate);
    }
  }

  const rawTaxRate = safeNumber(service.tax_rate);
  const taxRate = rawTaxRate > 1 ? rawTaxRate / 100 : rawTaxRate;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    taxRate,
    total: Number(total.toFixed(2)),
    hours,
  };
}

export async function POST(request: NextRequest) {
  const mutationError = await enforceMutationSecurity(request, {
    bucket: "public:booking",
    limit: 10,
    windowSeconds: 15 * 60,
  });
  if (mutationError) return mutationError;

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json(
        { error: "Booking service is not configured." },
        { status: 500 },
      );
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "Server booking credentials are not configured." },
        { status: 500 },
      );
    }

    const body = await readJsonBody<BookingPayload>(request, 32 * 1024);
    const serviceId = cleanString(body.serviceId, 100);
    const address = cleanString(body.address, 300);
    const guestName = cleanString(body.guestName, 120);
    const guestEmail = cleanString(body.guestEmail, 180).toLowerCase();
    const guestPhone = cleanString(body.guestPhone, 60);
    const pricingType = body.pricingType === "Hourly" ? "Hourly" : "Fixed";
    const formData =
      body.formData && typeof body.formData === "object"
        ? body.formData
        : {};

    if (!serviceId) {
      return NextResponse.json(
        { error: "Please select a valid service." },
        { status: 400 },
      );
    }

    if (!body.bookingDateTime) {
      return NextResponse.json(
        { error: "Please choose an appointment date and time." },
        { status: 400 },
      );
    }

    const appointment = new Date(body.bookingDateTime);
    if (
      Number.isNaN(appointment.getTime()) ||
      appointment.getTime() <= Date.now() + 15 * 60 * 1000
    ) {
      return NextResponse.json(
        { error: "Please choose a future appointment time." },
        { status: 400 },
      );
    }

    if (!isSupportedAddress(address)) {
      return NextResponse.json(
        {
          error: `Please enter an address within our service area: ${SERVICE_AREA_LABEL}.`,
        },
        { status: 400 },
      );
    }

    if (
      body.coordinates &&
      (!Number.isFinite(body.coordinates.lat) ||
        !Number.isFinite(body.coordinates.lng) ||
        !isSupportedCoordinates(body.coordinates.lat, body.coordinates.lng))
    ) {
      return NextResponse.json(
        {
          error: `The selected location is outside our service area: ${SERVICE_AREA_LABEL}.`,
        },
        { status: 400 },
      );
    }

    if (body.isGuest) {
      if (guestName.length < 2) {
        return NextResponse.json(
          { error: "Please enter your name." },
          { status: 400 },
        );
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
        return NextResponse.json(
          { error: "Please enter a valid email address." },
          { status: 400 },
        );
      }
      if (!validPhone(guestPhone)) {
        return NextResponse.json(
          { error: "Please enter a valid phone number." },
          { status: 400 },
        );
      }
    }

    const sessionClient = await createServerClient();
    const {
      data: { user },
    } = await sessionClient.auth.getUser();

    if (!body.isGuest && !user) {
      return NextResponse.json(
        { error: "Please log in before booking." },
        { status: 401 },
      );
    }

    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    const { data: service, error: serviceError } = await admin
      .from("services")
      .select("*")
      .eq("id", serviceId)
      .eq("is_active", true)
      .maybeSingle();

    if (serviceError || !service) {
      return NextResponse.json(
        { error: "The selected service is no longer available." },
        { status: 400 },
      );
    }

    const { data: configRow } = await admin
      .from("service_configs")
      .select("config_json")
      .eq("service_id", serviceId)
      .maybeSingle();

    const config = (configRow?.config_json || {}) as ServiceConfig;
    let effectivePricingType = pricingType;
    let customQuoteRequired = false;
    let persistedServiceData: Record<string, unknown> = { ...formData };
    let pricing: {
      subtotal: number;
      tax: number;
      taxRate: number;
      total: number;
      hours: number;
    };

    const cleaningPricingScope = resolveCleaningPricingScope({
      service_type: service.service_type,
      title: service.title,
    });

    if (cleaningPricingScope) {
      effectivePricingType = "Fixed";

      const { data: pricingRow, error: pricingError } = await admin
        .from("cleaning_pricing_config")
        .select("config,version")
        .eq("id", "default")
        .maybeSingle();

      if (pricingError || !pricingRow) {
        console.error("Cleaning pricing config unavailable:", pricingError);
        return NextResponse.json(
          { error: "Cleaning pricing is temporarily unavailable." },
          { status: 503 },
        );
      }

      const validation = validatePricingConfig(pricingRow.config);
      if (!validation.ok) {
        console.error("Invalid cleaning pricing config:", validation.error);
        return NextResponse.json(
          { error: "Cleaning pricing is temporarily unavailable." },
          { status: 503 },
        );
      }

      const customerName = body.isGuest
        ? guestName
        : cleanString(formData.customerName, 120);
      const customerEmail = body.isGuest
        ? guestEmail
        : cleanString(formData.customerEmail, 180).toLowerCase();
      const customerPhone = body.isGuest
        ? guestPhone
        : cleanString(formData.customerPhone, 60);
      const propertyType = cleanString(formData.propertyType, 40);
      const propertyCondition = cleanString(formData.propertyCondition, 40);
      const postalCode = cleanString(formData.postalCode, 12).toUpperCase();
      const additionalInstructions = cleanString(formData.additionalInstructions, 1500);
      const conditionPhotoPaths = Array.isArray(formData.conditionPhotoPaths)
        ? formData.conditionPhotoPaths
            .map((value) => cleanString(value, 500))
            .filter((value) => value.startsWith(BOOKING_PHOTO_PREFIX))
            .slice(0, 6)
        : [];

      if (customerName.length < 2) {
        return NextResponse.json({ error: "Please enter the customer name." }, { status: 400 });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
        return NextResponse.json({ error: "Please enter a valid customer email." }, { status: 400 });
      }
      if (!validPhone(customerPhone)) {
        return NextResponse.json({ error: "Please enter a valid customer phone number." }, { status: 400 });
      }
      if (!PROPERTY_TYPES.has(propertyType)) {
        return NextResponse.json({ error: "Please select a valid property type." }, { status: 400 });
      }
      if (!PROPERTY_CONDITIONS.has(propertyCondition)) {
        return NextResponse.json({ error: "Please select a valid property condition." }, { status: 400 });
      }
      if (!CANADIAN_POSTAL_CODE_PATTERN.test(postalCode)) {
        return NextResponse.json({ error: "Please provide a valid Canadian postal code." }, { status: 400 });
      }
      if (
        cleaningPricingScope === "move_in_out" &&
        typeof formData.movePropertyEmpty !== "boolean"
      ) {
        return NextResponse.json(
          { error: "Please confirm whether the Move-In / Move-Out property will be empty." },
          { status: 400 },
        );
      }

      // Cleaning packages are always customizable. The selected package
      // remains the price floor. Individual counters may be 0, but at least
      // one cleaning area must remain selected.
      const bookingMode = "package" as const;
      const areaInput = {
        bedrooms: safeNumber(formData.bedrooms, 0),
        fullBathrooms: safeNumber(formData.fullBathrooms, 0),
        halfBathrooms: safeNumber(formData.halfBathrooms, 0),
        kitchens: safeNumber(formData.kitchens, 0),
        livingRooms: safeNumber(formData.livingRooms, 0),
        finishedBasement: safeNumber(formData.finishedBasement, 0),
        stairFlights: safeNumber(formData.stairFlights, 0),
        unusualLayout: formData.unusualLayout === true,
      };

      if (
        cleaningPricingScope !== "carpet" &&
        !PACKAGE_AREA_KEYS.some((key) => Number(areaInput[key] || 0) > 0)
      ) {
        return NextResponse.json(
          { error: "Please select at least one room or area before continuing." },
          { status: 400 },
        );
      }

      const carpetInput = {
        standardRooms: safeNumber(formData.carpetStandardRooms, 0),
        largeRooms: safeNumber(formData.carpetLargeRooms, 0),
        hallways: safeNumber(formData.carpetHallways, 0),
        stairFlights: safeNumber(formData.carpetStairFlights, 0),
        smallAreaRugs: safeNumber(formData.carpetSmallAreaRugs, 0),
        heavyStainAreas: safeNumber(formData.carpetHeavyStainAreas, 0),
        petUrineOdor: formData.carpetPetUrineOdor === true,
      };

      let baseSubtotalCents = 0;
      let baseCustomQuote = false;
      let baseCustomQuoteReason: string | null = null;
      let packageId: string | null = null;
      let packageName: string | null = null;
      let pricingBreakdown: Array<{
        key: string;
        label: string;
        quantity: number;
        unitPrice: number;
        amount: number;
      }> = [];

      if (cleaningPricingScope === "standard") {
        const result = calculateStandardCleaningPrice(validation.config, {
          ...areaInput,
          preferredPackageId:
            cleanString(formData.standardPackageId, 80) ||
            cleanString(formData.pricingPackageId, 80),
        });
        baseSubtotalCents = result.subtotalCents;
        baseCustomQuote = result.customQuote;
        baseCustomQuoteReason = result.customQuoteReason;
        packageId = result.packageId;
        packageName = result.packageName;
        pricingBreakdown = result.lineItems.map((item) => ({
          key: item.key,
          label: item.label,
          quantity: item.quantity,
          unitPrice: item.unitPriceCents / 100,
          amount: item.amountCents / 100,
        }));
      } else if (cleaningPricingScope === "deep") {
        const result = calculateDeepCleaningPrice(validation.config, {
          ...areaInput,
          preferredPackageId: cleanString(formData.pricingPackageId, 80),
        });
        baseSubtotalCents = result.subtotalCents;
        baseCustomQuote = result.customQuote;
        baseCustomQuoteReason = result.customQuoteReason;
        packageId = result.packageId;
        packageName = result.packageName;
        pricingBreakdown = result.lineItems.map((item) => ({
          key: item.key,
          label: item.label,
          quantity: item.quantity,
          unitPrice: item.unitPriceCents / 100,
          amount: item.amountCents / 100,
        }));
      } else if (cleaningPricingScope === "move_in_out") {
        const result = calculateMoveInOutPrice(validation.config, {
          ...areaInput,
          preferredPackageId: cleanString(formData.pricingPackageId, 80),
        });
        baseSubtotalCents = result.subtotalCents;
        baseCustomQuote = result.customQuote;
        baseCustomQuoteReason = result.customQuoteReason;
        packageId = result.packageId;
        packageName = result.packageName;
        pricingBreakdown = result.lineItems.map((item) => ({
          key: item.key,
          label: item.label,
          quantity: item.quantity,
          unitPrice: item.unitPriceCents / 100,
          amount: item.amountCents / 100,
        }));
      } else {
        const result = calculateCarpetPrice(
          validation.config,
          carpetInput,
          "standalone",
        );
        if (carpetAreaCount(result.selection) === 0 && !result.selection.petUrineOdor) {
          return NextResponse.json(
            { error: "Please select at least one carpeted area or treatment." },
            { status: 400 },
          );
        }
        baseSubtotalCents = result.subtotalCents;
        baseCustomQuote = result.customQuote;
        baseCustomQuoteReason = result.customQuoteReason;
        pricingBreakdown = result.lineItems.map((item) => ({
          key: `carpet_${item.key}`,
          label: item.label,
          quantity: item.quantity,
          unitPrice: item.unitPriceCents / 100,
          amount: item.amountCents / 100,
        }));
      }

      let carpetAddonSubtotalCents = 0;
      let carpetAddonCustomQuote = false;
      let carpetAddonReason: string | null = null;

      if (cleaningPricingScope !== "carpet" && formData.carpetEnabled === true) {
        const carpetAddon = calculateCarpetPrice(
          validation.config,
          carpetInput,
          "addon",
        );
        carpetAddonSubtotalCents = carpetAddon.subtotalCents;
        carpetAddonCustomQuote = carpetAddon.customQuote;
        carpetAddonReason = carpetAddon.customQuoteReason;
        pricingBreakdown.push(
          ...carpetAddon.lineItems
            .filter((item) => item.amountCents > 0)
            .map((item) => ({
              key: `carpet_${item.key}`,
              label: `Carpet: ${item.label}`,
              quantity: item.quantity,
              unitPrice: item.unitPriceCents / 100,
              amount: item.amountCents / 100,
            })),
        );
      }

      const addOnSelection =
        formData.selectedAddOns && typeof formData.selectedAddOns === "object"
          ? (formData.selectedAddOns as Record<string, number | boolean | string>)
          : {};
      const addOns = calculateServiceAddOns(
        validation.config,
        cleaningPricingScope,
        addOnSelection,
        {
          bookingMode,
          selectedAreas: areaInput,
          respectSelectedAreas: true,
        },
      );
      pricingBreakdown.push(
        ...addOns.lineItems.map((item) => ({
          key: `addon_${item.id}`,
          label: item.label,
          quantity: item.quantity,
          unitPrice: item.unitPriceCents / 100,
          amount: item.amountCents / 100,
        })),
      );

      const reviewReasons: string[] = [...addOns.adminReviewReasons];
      let propertyReviewCustomQuote = false;

      if (
        propertyCondition === "heavy" &&
        validation.config.heavyCondition.enabled
      ) {
        reviewReasons.push("Heavy property condition");
        propertyReviewCustomQuote =
          validation.config.heavyCondition.requiresAdminApproval ||
          !validation.config.heavyCondition.allowInstantBooking;
      }

      if (
        cleaningPricingScope === "move_in_out" &&
        formData.movePropertyEmpty === false
      ) {
        reviewReasons.push("Move-In / Move-Out property is not empty");
        propertyReviewCustomQuote = true;
      }

      if (areaInput.unusualLayout) {
        reviewReasons.push("Unusual property layout");
      }

      const adminReviewRequired =
        reviewReasons.length > 0 ||
        baseCustomQuote ||
        carpetAddonCustomQuote ||
        addOns.customQuote;
      const photoReviewRequired =
        validation.config.heavyCondition.allowPhotoUpload &&
        (propertyCondition === "heavy" || addOns.adminReviewRequired);

      if (photoReviewRequired && conditionPhotoPaths.length === 0) {
        return NextResponse.json(
          { error: "Please attach at least one condition photo for admin review." },
          { status: 400 },
        );
      }

      const subtotalCents =
        baseSubtotalCents +
        carpetAddonSubtotalCents +
        addOns.subtotalCents;
      const taxRate = validation.config.tax.enabled
        ? validation.config.tax.rate
        : 0;
      const taxCents = Math.round(subtotalCents * taxRate);
      customQuoteRequired =
        baseCustomQuote ||
        carpetAddonCustomQuote ||
        addOns.customQuote ||
        propertyReviewCustomQuote;
      const customQuoteReason =
        baseCustomQuoteReason ||
        carpetAddonReason ||
        addOns.customQuoteReason ||
        reviewReasons[0] ||
        null;

      pricing = {
        subtotal: subtotalCents / 100,
        tax: taxCents / 100,
        taxRate,
        total: customQuoteRequired ? 0 : (subtotalCents + taxCents) / 100,
        hours: 0,
      };

      const sanitizedSelectedAddOns = Object.fromEntries(
        addOns.lineItems.map((item) => [item.id, item.quantity]),
      );

      persistedServiceData = {
        ...formData,
        customerName,
        customerEmail,
        customerPhone,
        propertyType,
        propertyCondition,
        postalCode,
        additionalInstructions,
        conditionPhotoPaths,
        selectedAddOns: sanitizedSelectedAddOns,
        pricingScope: cleaningPricingScope,
        bookingMode,
        packageCustomized: cleaningPricingScope !== "carpet",
        ...(packageId ? { pricingPackageId: packageId } : {}),
        ...(packageName ? { pricingPackageName: packageName } : {}),
        ...(cleaningPricingScope === "standard" && packageId
          ? { standardPackageId: packageId }
          : {}),
        ...(cleaningPricingScope === "standard" && packageName
          ? { standardPackageName: packageName }
          : {}),
        customQuoteRequired,
        customQuoteReason,
        adminReviewRequired,
        adminReviewReasons: Array.from(new Set(reviewReasons)),
        adminNotificationRequired:
          adminReviewRequired && validation.config.heavyCondition.notifyAdmin,
        photoReviewRequired,
        pricingVersion: pricingRow.version,
        pricingBreakdown,
        calculatedSubtotal: subtotalCents / 100,
        calculatedTax: taxCents / 100,
        calculatedTotal: (subtotalCents + taxCents) / 100,
      };
    } else {
      pricing = calculatePricing(
        service as Record<string, unknown>,
        config,
        formData,
        pricingType,
        safeNumber(body.hours, 3),
      );
    }

    const adminReviewRequired = Boolean(
      (persistedServiceData as Record<string, unknown>).adminReviewRequired,
    );
    const initialStatus = customQuoteRequired
      ? "custom_quote_required"
      : adminReviewRequired
        ? "under_review"
        : "new_request";

    const jobRecord: Record<string, unknown> = {
      customer_id: body.isGuest ? null : user?.id ?? null,
      is_guest: Boolean(body.isGuest),
      service_id: service.id,
      service_name: service.title,
      service_type: service.service_type,
      date: appointment.toISOString(),
      address,
      billing_type: effectivePricingType.toLowerCase(),
      total_price: pricing.total,
      tax_rate: pricing.taxRate,
      price: customQuoteRequired ? "Custom quote required" : `$${pricing.total.toFixed(2)}`,
      status: initialStatus,
      service_data: {
        ...persistedServiceData,
        bookingWorkflowStatus: initialStatus,
      },
    };

    if (body.isGuest) {
      jobRecord.guest_name = guestName;
      jobRecord.guest_email = guestEmail;
    }

    if (body.coordinates) {
      jobRecord.job_lat = body.coordinates.lat;
      jobRecord.job_lng = body.coordinates.lng;
    }

    if (effectivePricingType === "Hourly") {
      jobRecord.estimated_hours = pricing.hours;
      jobRecord.hourly_rate = safeNumber(service.hourly_rate, 35);
    }

    if (formData.bedrooms !== undefined) {
      jobRecord.bedrooms = Math.max(0, safeNumber(formData.bedrooms));
    }
    if (formData.washrooms !== undefined) {
      jobRecord.washrooms = Math.max(0, safeNumber(formData.washrooms));
    } else if (formData.fullBathrooms !== undefined) {
      jobRecord.washrooms = Math.max(0, safeNumber(formData.fullBathrooms));
    }

    let { data: booking, error: insertError } = await admin
      .from("jobs")
      .insert(jobRecord)
      .select("id")
      .single();

    // Backward-compatible fallback for deployments where the Phase 5 job_status
    // enum migration has not been applied yet.  Keep the richer workflow state
    // in service_data and use the legacy pending enum so a customer is never
    // blocked from submitting a booking.
    if (insertError?.code === "22P02" && String(insertError.message || "").includes("job_status")) {
      const fallbackRecord = {
        ...jobRecord,
        status: "pending",
        service_data: {
          ...(jobRecord.service_data as Record<string, unknown>),
          bookingWorkflowStatus: initialStatus,
          databaseStatusFallback: "pending",
        },
      };
      const retry = await admin
        .from("jobs")
        .insert(fallbackRecord)
        .select("id")
        .single();
      booking = retry.data;
      insertError = retry.error;
    }

    if (insertError || !booking) {
      console.error("Booking API insert failed:", insertError ?? "Booking row was not returned after insert.");
      return NextResponse.json(
        { error: "We could not create the booking. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      bookingId: booking.id,
      total: pricing.total,
      customQuoteRequired,
      adminReviewRequired,
      status: initialStatus,
    });
  } catch (error) {
    const securityError = securityErrorResponse(error);
    if (securityError) return securityError;

    console.error("Booking API error:", error);
    return NextResponse.json(
      { error: "Something went wrong while creating the booking." },
      { status: 500 },
    );
  }
}
