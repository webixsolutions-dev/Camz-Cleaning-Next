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

type Coordinates = { lat: number; lng: number };

type BookingPayload = {
  serviceId?: string;
  isGuest?: boolean;
  guestName?: string;
  guestEmail?: string;
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
    const pricing = calculatePricing(
      service as Record<string, unknown>,
      config,
      formData,
      pricingType,
      safeNumber(body.hours, 3),
    );

    const jobRecord: Record<string, unknown> = {
      customer_id: body.isGuest ? null : user?.id ?? null,
      is_guest: Boolean(body.isGuest),
      service_id: service.id,
      service_name: service.title,
      service_type: service.service_type,
      date: appointment.toISOString(),
      address,
      billing_type: pricingType.toLowerCase(),
      total_price: pricing.total,
      tax_rate: pricing.taxRate,
      price: `$${pricing.total.toFixed(2)}`,
      status: "pending",
      service_data: formData,
    };

    if (body.isGuest) {
      jobRecord.guest_name = guestName;
      jobRecord.guest_email = guestEmail;
    }

    if (body.coordinates) {
      jobRecord.job_lat = body.coordinates.lat;
      jobRecord.job_lng = body.coordinates.lng;
    }

    if (pricingType === "Hourly") {
      jobRecord.estimated_hours = pricing.hours;
      jobRecord.hourly_rate = safeNumber(service.hourly_rate, 35);
    }

    if (formData.bedrooms !== undefined) {
      jobRecord.bedrooms = Math.max(0, safeNumber(formData.bedrooms));
    }
    if (formData.washrooms !== undefined) {
      jobRecord.washrooms = Math.max(0, safeNumber(formData.washrooms));
    }

    const { data: booking, error: insertError } = await admin
      .from("jobs")
      .insert(jobRecord)
      .select("id")
      .single();

    if (insertError) {
      console.error("Booking API insert failed:", insertError);
      return NextResponse.json(
        { error: "We could not create the booking. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      bookingId: booking.id,
      total: pricing.total,
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
