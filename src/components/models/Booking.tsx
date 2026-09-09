"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Clock,
  Check,
  Minus,
  Plus,
  ClipboardList,
  Loader2,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  LocalizationProvider,
  DatePicker,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

dayjs.extend(utc);
dayjs.extend(timezone);

const CALGARY_TIME_ZONE = "America/Edmonton";

const SERVICE_AREAS = [
  "Calgary",
  "Airdrie",
  "Cochrane",
  "Chestermere",
] as const;

type ServiceArea = (typeof SERVICE_AREAS)[number];

const SERVICE_AREA_LABEL = "Calgary, Airdrie, Cochrane and Chestermere";
const CANADIAN_POSTAL_CODE_PATTERN =
  /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTVWXYZ][ -]?\d[ABCEGHJ-NPRSTVWXYZ]\d$/i;

const SERVICE_AREA_POSTAL_PREFIXES: Record<ServiceArea, RegExp> = {
  Calgary: /^(T1Y|T2[A-Z]|T3[A-Z])$/,
  Airdrie: /^T4[AB]$/,
  Cochrane: /^T4C$/,
  Chestermere: /^T1X$/,
};

type NominatimAddress = {
  house_number?: string;
  road?: string;
  pedestrian?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state?: string;
  "ISO3166-2-lvl4"?: string;
  postcode?: string;
  country?: string;
  country_code?: string;
};

type NominatimResult = {
  lat?: string;
  lon?: string;
  display_name?: string;
  addresstype?: string;
  type?: string;
  address?: NominatimAddress;
};

type AddressValidationResult = {
  valid: boolean;
  message: string;
  formattedAddress?: string;
  coordinates?: { lat: number; lng: number };
  serviceArea?: ServiceArea;
  postalCode?: string;
};

const normalizeText = (value = "") =>
  value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ");

const normalizePostalCode = (value = "") => {
  const compact = value.replace(/\s|-/g, "").toUpperCase();
  return compact.length === 6
    ? `${compact.slice(0, 3)} ${compact.slice(3)}`
    : value.trim().toUpperCase();
};

const getAreaFromText = (value = ""): ServiceArea | null => {
  const normalized = normalizeText(value);
  return (
    SERVICE_AREAS.find((area) =>
      normalized.includes(normalizeText(area)),
    ) ?? null
  );
};

const getAreaFromPostalCode = (postcode = ""): ServiceArea | null => {
  const compact = postcode.replace(/\s|-/g, "").toUpperCase();
  if (!CANADIAN_POSTAL_CODE_PATTERN.test(compact)) return null;

  const prefix = compact.slice(0, 3);
  return (
    SERVICE_AREAS.find((area) =>
      SERVICE_AREA_POSTAL_PREFIXES[area].test(prefix),
    ) ?? null
  );
};

const validateNominatimResult = (
  result: NominatimResult,
): AddressValidationResult => {
  const address = result.address ?? {};
  const countryCode = (address.country_code ?? "").toLowerCase();
  const provinceCode = (address["ISO3166-2-lvl4"] ?? "").toUpperCase();
  const province = normalizeText(address.state);

  if (
    countryCode !== "ca" ||
    (provinceCode !== "CA-AB" && province !== "alberta")
  ) {
    return {
      valid: false,
      message: "Please enter an address in Alberta, Canada.",
    };
  }

  const localityText = [
    address.city,
    address.town,
    address.village,
    address.municipality,
    address.county,
    address.suburb,
    result.display_name,
  ]
    .filter(Boolean)
    .join(" ");

  const localityArea = getAreaFromText(localityText);
  const postalCode = normalizePostalCode(address.postcode);
  const postalArea = getAreaFromPostalCode(postalCode);

  if (!localityArea && !postalArea) {
    return {
      valid: false,
      message: `This address is outside our service area: ${SERVICE_AREA_LABEL}.`,
    };
  }

  if (localityArea && postalArea && localityArea !== postalArea) {
    return {
      valid: false,
      message: "The city and postal code do not match. Please check the address.",
    };
  }

  const hasStreet = Boolean(
    address.road || address.pedestrian || address.house_number,
  );
  if (!hasStreet) {
    return {
      valid: false,
      message: "Please enter a complete street address, not only a city name.",
    };
  }

  const lat = Number(result.lat);
  const lng = Number(result.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return {
      valid: false,
      message: "We could not determine the address coordinates.",
    };
  }

  const serviceArea = localityArea ?? postalArea!;
  return {
    valid: true,
    message: `Great! This address is inside our ${serviceArea} service area.`,
    formattedAddress: result.display_name?.trim(),
    coordinates: { lat, lng },
    serviceArea,
    postalCode: postalCode || undefined,
  };
};

const searchServiceAddress = async (
  query: string,
): Promise<AddressValidationResult> => {
  const cleanQuery = query.trim();
  if (cleanQuery.length < 6) {
    return {
      valid: false,
      message: "Please enter your complete service address.",
    };
  }

  const params = new URLSearchParams({
    type: "search",
    q: /canada/i.test(cleanQuery)
      ? cleanQuery
      : `${cleanQuery}, Alberta, Canada`,
  });

  const response = await fetch(`/api/geocode?${params.toString()}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error("Address lookup is temporarily unavailable.");
  }

  const results = (await response.json()) as NominatimResult[];
  for (const result of results) {
    const validation = validateNominatimResult(result);
    if (validation.valid) return validation;
  }

  return {
    valid: false,
    message:
      results.length === 0
        ? "We could not find this address. Include the street number, street name, city and postal code."
        : `This address is not inside ${SERVICE_AREA_LABEL}.`,
  };
};

const reverseGeocodeServiceAddress = async (
  lat: number,
  lng: number,
): Promise<AddressValidationResult> => {
  const params = new URLSearchParams({
    type: "reverse",
    lat: String(lat),
    lng: String(lng),
  });

  const response = await fetch(`/api/geocode?${params.toString()}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error("Location lookup is temporarily unavailable.");
  }

  return validateNominatimResult(
    (await response.json()) as NominatimResult,
  );
};

// --- Types ---
interface Service {
  id: string;
  category_id: string;
  title: string;
  description: string;
  price: string;
  pricing_type: string;
  service_type: string;
  is_active: boolean;
  has_addons: boolean;
  tax_rate: number;
  base_rate?: number;
  bedroom_rate?: number;
  washroom_rate?: number;
  hourly_rate?: number;
  sqft_rate?: number;
  vehicle_sedan_rate?: number;
  vehicle_suv_rate?: number;
  fridge_price?: number;
  oven_price?: number;
  window_price?: number;
}

interface ServiceConfig {
  base_rate?: number;
  bedroom_rate?: number;
  washroom_rate?: number;
  furnished_fee?: number;
  heavy_condition_fee?: number;
  heavy_multiplier?: number;
  rates?: Record<string, any>;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  isGuest?: boolean;
}

const BookingModal = ({
  isOpen,
  onClose,
  service,
  isGuest = false,
}: BookingModalProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<ServiceConfig>({});
  const [loadingConfig, setLoadingConfig] = useState(false);
  
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  
  // Coordinates from geolocation
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [pricingType, setPricingType] = useState("Fixed");
  const [hours, setHours] = useState(3);
  const [date, setDate] = useState<Dayjs | null>(null);
  const [time, setTime] = useState<Dayjs | null>(null);
  const [location, setLocation] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "valid" | "error"
  >("idle");
  const [locationMessage, setLocationMessage] = useState("");
  const [validatedLocation, setValidatedLocation] = useState("");
  const [validatedServiceArea, setValidatedServiceArea] =
    useState<ServiceArea | null>(null);
  const [validatedPostalCode, setValidatedPostalCode] = useState("");
  
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestEmailConfirm, setGuestEmailConfirm] = useState("");

  const totalSteps = 4;

  const getCalgaryNow = () => dayjs().tz(CALGARY_TIME_ZONE);

  const getSelectedDateTime = () => {
    if (!date || !time) return null;

    const calgaryDateTime = `${date.format("YYYY-MM-DD")}T${time.format("HH:mm")}:00`;
    return dayjs.tz(calgaryDateTime, CALGARY_TIME_ZONE);
  };

  const isValidSchedule = () => {
    const selected = getSelectedDateTime();
    return !!selected && selected.isAfter(getCalgaryNow().add(15, "minute"));
  };

  const applyValidLocation = (result: AddressValidationResult) => {
    const formattedAddress = result.formattedAddress?.trim() || location.trim();
    setLocation(formattedAddress);
    setCoordinates(result.coordinates ?? null);
    setValidatedLocation(formattedAddress);
    setValidatedServiceArea(result.serviceArea ?? null);
    setValidatedPostalCode(result.postalCode ?? "");
    setLocationStatus("valid");
    setLocationMessage(result.message);
    setSubmitError(null);
  };

  const showLocationError = (message: string) => {
    setCoordinates(null);
    setValidatedLocation("");
    setValidatedServiceArea(null);
    setValidatedPostalCode("");
    setLocationStatus("error");
    setLocationMessage(message);
  };

  const validateEnteredLocation = async () => {
    const cleanLocation = location.trim();

    if (
      locationStatus === "valid" &&
      validatedLocation === cleanLocation &&
      coordinates
    ) {
      return true;
    }

    setIsValidatingAddress(true);
    setLocationStatus("idle");
    setLocationMessage("");

    try {
      const result = await searchServiceAddress(cleanLocation);
      if (!result.valid) {
        showLocationError(result.message);
        return false;
      }

      applyValidLocation(result);
      return true;
    } catch (error) {
      console.error("Address validation failed:", error);
      showLocationError(
        error instanceof Error
          ? error.message
          : "We could not verify this address. Please try again.",
      );
      return false;
    } finally {
      setIsValidatingAddress(false);
    }
  };

  const nextStep = async () => {
    if (step === 1 && isGuest) {
      if (guestName.trim().length < 2) {
        alert("Please enter your name");
        return;
      }
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail);
      if (!emailValid) {
        alert("Please enter a valid email");
        return;
      }
      if (guestEmail !== guestEmailConfirm) {
        alert("Emails do not match");
        return;
      }
    }
    if (step === 2) {
      if (!date) {
        alert("Please select a date");
        return;
      }
      if (!time) {
        alert("Please select a time");
        return;
      }
      if (!isValidSchedule()) {
        alert("Please choose a future date and time.");
        return;
      }
      const isAddressValid = await validateEnteredLocation();
      if (!isAddressValid) {
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const isStepValid = () => {
    if (step === 1 && isGuest) {
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail);
      return (
        guestName.trim().length >= 2 &&
        emailValid &&
        guestEmail === guestEmailConfirm
      );
    }
    if (step === 2) {
      return (
        !!date &&
        !!time &&
        isValidSchedule() &&
        location.trim().length > 5
      );
    }
    return true;
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleConfirm = async () => {
    if (!isGuest && !user) {
      setSubmitError("Please log in to book a service");
      return;
    }

    const selectedDateTime = getSelectedDateTime();

    if (!service || !selectedDateTime) {
      setSubmitError("Missing required booking information");
      return;
    }

    if (!isValidSchedule()) {
      setSubmitError("Please choose a future appointment time.");
      return;
    }

    const isAddressValid = await validateEnteredLocation();
    if (!isAddressValid) {
      setSubmitError("Please verify the service address before booking.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/booking/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: service.id,
          isGuest,
          guestName: isGuest ? guestName.trim() : undefined,
          guestEmail: isGuest ? guestEmail.trim() : undefined,
          bookingDateTime: selectedDateTime.toISOString(),
          address: location.trim(),
          coordinates,
          serviceArea: validatedServiceArea,
          postalCode: validatedPostalCode || undefined,
          pricingType,
          hours,
          formData,
        }),
      });

      const result = (await response.json()) as {
        ok?: boolean;
        error?: string;
        bookingId?: string;
      };

      if (!response.ok || !result.ok) {
        throw new Error(
          result.error || "We could not create your booking. Please try again.",
        );
      }

      setBookingId(result.bookingId || null);
      setSubmitSuccess(true);
    } catch (err) {
      console.error("Booking submission failed:", err);
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const calculatePricing = () => {
    if (!service) return { lineItems: [], subtotal: 0, tax: 0, total: 0 };

    const lineItems: { label: string; amount: number }[] = [];
    let subtotal = 0;

    switch (service.service_type) {
      case "residential":
      case "move_in_out": {
        const baseRate = config.base_rate || 0;
        const bedroomRate = config.bedroom_rate || 0;
        const washroomRate = config.washroom_rate || 0;
        const beds = Number(formData.bedrooms) || 0;
        const washes = Number(formData.washrooms) || 0;

        if (baseRate > 0) {
          lineItems.push({ label: "Base Service", amount: baseRate });
          subtotal += baseRate;
        }

        if (beds > 0 && bedroomRate > 0) {
          const amt = beds * bedroomRate;
          lineItems.push({
            label: `Bedrooms (${beds} × $${bedroomRate})`,
            amount: amt,
          });
          subtotal += amt;
        }

        if (washes > 0 && washroomRate > 0) {
          const amt = washes * washroomRate;
          lineItems.push({
            label: `Washrooms (${washes} × $${washroomRate})`,
            amount: amt,
          });
          subtotal += amt;
        }

        if (formData.furnished && config.furnished_fee) {
          lineItems.push({
            label: "Furnished surcharge",
            amount: config.furnished_fee,
          });
          subtotal += config.furnished_fee;
        }

        if (formData.heavy_condition && config.heavy_condition_fee) {
          lineItems.push({
            label: "Heavy condition fee",
            amount: config.heavy_condition_fee,
          });
          subtotal += config.heavy_condition_fee;
        }
        break;
      }

      case "vehicle": {
        const rates =
          (config.rates as Record<string, Record<string, number>>) || {};
        const vt = formData.vehicle_type;
        const pkg = formData.package;
        const price = rates[vt]?.[pkg];
        if (price) {
          lineItems.push({
            label: `${vt.toUpperCase()} - ${pkg} package`,
            amount: price,
          });
          subtotal += price;
        }
        break;
      }

      case "specialty":
      case "carpet_sofa": {
        const rates = (config.rates as Record<string, number>) || {};
        const item = formData.item_type;
        const qty = Number(formData.quantity) || 1;
        const unitPrice = rates[item] || 0;
        const itemTotal = unitPrice * qty;

        if (itemTotal > 0) {
          lineItems.push({
            label: `${item} (${qty} × $${unitPrice})`,
            amount: itemTotal,
          });
          subtotal += itemTotal;
        }

        if (formData.heavy && config.heavy_multiplier) {
          const extra = itemTotal * (config.heavy_multiplier - 1);
          lineItems.push({
            label: `Heavy condition (×${config.heavy_multiplier})`,
            amount: extra,
          });
          subtotal += extra;
        }
        break;
      }

      case "commercial": {
        if (pricingType === "Hourly" && service.hourly_rate) {
          const amt = hours * Number(service.hourly_rate);
          lineItems.push({
            label: `${hours} hrs × $${service.hourly_rate}/hr`,
            amount: amt,
          });
          subtotal += amt;
        }
        break;
      }
    }

    if (pricingType === "Hourly" && service.service_type !== "commercial") {
      const rate = Number(service.hourly_rate) || 35;
      const hourlyTotal = hours * rate;
      lineItems.length = 0;
      lineItems.push({
        label: `${hours} hrs × $${rate.toFixed(0)}/hr`,
        amount: hourlyTotal,
      });
      subtotal = hourlyTotal;
    }

    const rawTaxRate = Number(service.tax_rate) || 0;
    const taxRate = rawTaxRate > 1 ? rawTaxRate / 100 : rawTaxRate;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    return { lineItems, subtotal, tax, total, taxRate };
  };

  const initializeFormData = (serviceType: string, cfg: ServiceConfig) => {
    switch (serviceType) {
      case "residential":
        setFormData({ bedrooms: 1, washrooms: 1 });
        break;
      case "move_in_out":
        setFormData({
          bedrooms: 1,
          washrooms: 1,
          furnished: false,
          heavy_condition: false,
        });
        break;
      case "vehicle": {
        const firstVehicle = cfg.rates ? Object.keys(cfg.rates)[0] : "";
        const firstPackage =
          firstVehicle && cfg.rates?.[firstVehicle]
            ? Object.keys(cfg.rates[firstVehicle])[0]
            : "";
        setFormData({ vehicle_type: firstVehicle, package: firstPackage });
        break;
      }
      case "specialty":
      case "carpet_sofa": {
        const firstItem = cfg.rates ? Object.keys(cfg.rates)[0] : "";
        setFormData({ item_type: firstItem, quantity: 1, heavy: false });
        break;
      }
      case "commercial":
        setFormData({ sub_type: "office", area: 1000 });
        break;
      default:
        setFormData({});
    }
  };

  // Fetch service config
  useEffect(() => {
    if (!isOpen || !service?.id) return;
    const fetchConfig = async () => {
      setLoadingConfig(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("service_configs")
          .select("config_json")
          .eq("service_id", service.id)
          .maybeSingle();
        const cfg: ServiceConfig = data?.config_json || {};
        setConfig(cfg);
        initializeFormData(service.service_type, cfg);
      } catch (err) {
        console.error("Error fetching service config:", err);
        setConfig({});
        initializeFormData(service.service_type, {});
      } finally {
        setLoadingConfig(false);
      }
    };
    fetchConfig();
  }, [isOpen, service?.id]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setFormData({});
      setDate(null);
      setTime(null);
      setLocation("");
      setHours(3);
      setPricingType("Fixed");
      setIsSubmitting(false);
      setSubmitSuccess(false);
      setSubmitError(null);
      setBookingId(null);
      setCoordinates(null);
      setGuestName("");
      setGuestEmail("");
      setGuestEmailConfirm("");
      setLoadingLocation(false);
      setIsValidatingAddress(false);
      setLocationStatus("idle");
      setLocationMessage("");
      setValidatedLocation("");
      setValidatedServiceArea(null);
      setValidatedPostalCode("");
    }
  }, [isOpen]);

  const getCurrentLocation = () => {
    if (!window.isSecureContext) {
      showLocationError(
        "Current location requires HTTPS. Open the live HTTPS website or type the address manually.",
      );
      return;
    }

    if (!navigator.geolocation) {
      showLocationError(
        "This browser does not support current location. Please type the address manually.",
      );
      return;
    }

    setLoadingLocation(true);
    setSubmitError(null);
    setLocationStatus("idle");
    setLocationMessage("Waiting for location permission...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const result = await reverseGeocodeServiceAddress(
            latitude,
            longitude,
          );

          if (!result.valid) {
            showLocationError(result.message);
            return;
          }

          applyValidLocation({
            ...result,
            coordinates: { lat: latitude, lng: longitude },
          });
        } catch (error) {
          console.error("Reverse geocoding failed:", error);
          showLocationError(
            error instanceof Error
              ? error.message
              : "We could not verify this location. Please type your service address.",
          );
        } finally {
          setLoadingLocation(false);
        }
      },
      (error) => {
        console.warn("Geolocation error:", error.message);
        setLoadingLocation(false);
        const messages: Record<number, string> = {
          1: "Location permission was denied. Allow location access in your browser or type the address manually.",
          2: "Your location is currently unavailable. Please try again or type the address manually.",
          3: "Location detection timed out. Please try again or type the address manually.",
        };
        showLocationError(
          messages[error.code] ||
            "We could not read your location. Please type the address manually.",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60_000,
      },
    );
  };

  // --- Dynamic Step 1 Fields ---
  const renderServiceFields = () => {
    if (!service) return null;
    switch (service.service_type) {
      case "residential":
      case "move_in_out":
        return (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-slate-500 ml-1">
                  Bedrooms
                </label>
                <select
                  value={formData.bedrooms ?? 1}
                  onChange={(e) =>
                    updateField("bedrooms", Number(e.target.value))
                  }
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n} Bedroom{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-slate-500 ml-1">
                  Washrooms
                </label>
                <select
                  value={formData.washrooms ?? 1}
                  onChange={(e) =>
                    updateField("washrooms", Number(e.target.value))
                  }
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} Washroom{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {config.furnished_fee !== undefined && (
              <div className="mb-6 space-y-2">
                <label className="text-[11px] font-black uppercase text-slate-500 ml-1">
                  Property Status
                </label>
                <div className="flex gap-2">
                  {[
                    { key: false, label: "Empty" },
                    {
                      key: true,
                      label: `Furnished (+$${config.furnished_fee})`,
                    },
                  ].map((opt) => (
                    <button
                      key={String(opt.key)}
                      onClick={() => updateField("furnished", opt.key)}
                      className={`flex-1 py-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${formData.furnished === opt.key ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100" : "bg-white text-slate-500 border-slate-200 hover:border-blue-300"}`}
                    >
                      {formData.furnished === opt.key && <Check size={14} />}{" "}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {config.heavy_condition_fee !== undefined && (
              <div className="mb-4 space-y-2">
                <label className="text-[11px] font-black uppercase text-slate-500 ml-1">
                  Property Condition
                </label>
                <div className="flex gap-2">
                  {[
                    { key: false, label: "Normal" },
                    {
                      key: true,
                      label: `Heavy (+$${config.heavy_condition_fee})`,
                    },
                  ].map((opt) => (
                    <button
                      key={String(opt.key)}
                      onClick={() => updateField("heavy_condition", opt.key)}
                      className={`flex-1 py-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${formData.heavy_condition === opt.key ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100" : "bg-white text-slate-500 border-slate-200 hover:border-blue-300"}`}
                    >
                      {formData.heavy_condition === opt.key && (
                        <Check size={14} />
                      )}{" "}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        );

      case "vehicle": {
        const vehicleTypes = config.rates ? Object.keys(config.rates) : [];
        const selectedVehicle = formData.vehicle_type || vehicleTypes[0] || "";
        const packages =
          selectedVehicle && config.rates?.[selectedVehicle]
            ? Object.keys(config.rates[selectedVehicle])
            : [];
        return (
          <>
            <div className="mb-6 space-y-2">
              <label className="text-[11px] font-black uppercase text-slate-500 ml-1">
                Vehicle Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {vehicleTypes.map((vt) => (
                  <button
                    key={vt}
                    onClick={() => {
                      updateField("vehicle_type", vt);
                      const firstPkg = config.rates?.[vt]
                        ? Object.keys(config.rates[vt])[0]
                        : "";
                      updateField("package", firstPkg);
                    }}
                    className={`py-2.5 rounded-xl border text-[11px] font-bold transition-all capitalize ${formData.vehicle_type === vt ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100" : "bg-white text-slate-500 border-slate-200 hover:border-blue-300"}`}
                  >
                    {vt}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4 space-y-2">
              <label className="text-[11px] font-black uppercase text-slate-500 ml-1">
                Package
              </label>
              <div className="grid grid-cols-3 gap-2">
                {packages.map((pkg) => (
                  <button
                    key={pkg}
                    onClick={() => updateField("package", pkg)}
                    className={`py-2.5 rounded-xl border text-[11px] font-bold transition-all capitalize ${formData.package === pkg ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100" : "bg-white text-slate-500 border-slate-200 hover:border-blue-300"}`}
                  >
                    <div>{pkg}</div>
                    <div className="text-[10px] mt-0.5 opacity-80">
                      ${config.rates?.[selectedVehicle]?.[pkg]}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        );
      }

      case "specialty":
      case "carpet_sofa": {
        const itemTypes = config.rates ? Object.keys(config.rates) : [];
        return (
          <>
            <div className="mb-6 space-y-2">
              <label className="text-[11px] font-black uppercase text-slate-500 ml-1">
                Item Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {itemTypes.map((item) => (
                  <button
                    key={item}
                    onClick={() => updateField("item_type", item)}
                    className={`py-2.5 rounded-xl border text-[11px] font-bold transition-all capitalize ${formData.item_type === item ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100" : "bg-white text-slate-500 border-slate-200 hover:border-blue-300"}`}
                  >
                    <div>{item}</div>
                    <div className="text-[10px] mt-0.5 opacity-80">
                      ${config.rates?.[item]}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6 space-y-2">
              <label className="text-[11px] font-black uppercase text-slate-500 ml-1">
                Quantity
              </label>
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() =>
                    updateField(
                      "quantity",
                      Math.max(1, (formData.quantity || 1) - 1),
                    )
                  }
                  className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-white hover:text-blue-600 transition-all"
                >
                  <Minus size={14} />
                </button>
                <div className="text-2xl font-black text-slate-800 w-12 text-center">
                  {formData.quantity || 1}
                </div>
                <button
                  onClick={() =>
                    updateField("quantity", (formData.quantity || 1) + 1)
                  }
                  className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-white hover:text-blue-600 transition-all"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
            {config.heavy_multiplier !== undefined && (
              <div className="mb-4 space-y-2">
                <label className="text-[11px] font-black uppercase text-slate-500 ml-1">
                  Condition
                </label>
                <div className="flex gap-2">
                  {[
                    { key: false, label: "Light" },
                    { key: true, label: `Heavy (×${config.heavy_multiplier})` },
                  ].map((opt) => (
                    <button
                      key={String(opt.key)}
                      onClick={() => updateField("heavy", opt.key)}
                      className={`flex-1 py-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${formData.heavy === opt.key ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100" : "bg-white text-slate-500 border-slate-200 hover:border-blue-300"}`}
                    >
                      {formData.heavy === opt.key && <Check size={14} />}{" "}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        );
      }

      case "commercial":
        return (
          <>
            <div className="mb-6 space-y-2">
              <label className="text-[11px] font-black uppercase text-slate-500 ml-1">
                Business Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["office", "retail", "clinic"].map((bt) => (
                  <button
                    key={bt}
                    onClick={() => updateField("sub_type", bt)}
                    className={`py-2.5 rounded-xl border text-[11px] font-bold transition-all capitalize ${formData.sub_type === bt ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100" : "bg-white text-slate-500 border-slate-200 hover:border-blue-300"}`}
                  >
                    {bt}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4 space-y-2">
              <label className="text-[11px] font-black uppercase text-slate-500 ml-1">
                Area (sq ft)
              </label>
              <input
                type="number"
                min={100}
                value={formData.area ?? 1000}
                onChange={(e) => updateField("area", Number(e.target.value))}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              <p className="text-[10px] text-slate-400 ml-1">
                We&apos;ll discuss exact pricing based on requirements
              </p>
            </div>
          </>
        );

      default:
        return (
          <div className="text-center py-8 text-slate-400 text-sm">
            Service configuration not available. Please contact support.
          </div>
        );
    }
  };

  if (!isOpen || !service) return null;

  // SUCCESS STATE — show success screen instead of form
  if (submitSuccess) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </motion.div>

          <h2 className="text-2xl font-black text-slate-800 mb-2">
            Booking Confirmed!
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Your booking has been received. Our team will assign a cleaner and
            contact you shortly.
          </p>

          {bookingId && (
            <div className="bg-slate-50 rounded-2xl p-4 mb-6">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
                Booking ID
              </p>
              <p className="text-sm font-bold text-slate-700 font-mono">
                {bookingId.slice(0, 8).toUpperCase()}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {isGuest ? (
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-blue-600 text-white text-xs font-black hover:bg-blue-700 transition-all"
              >
                Done
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    onClose();
                    window.location.href = "/customer-dashboard/bookings";
                  }}
                  className="w-full py-3 rounded-xl bg-blue-600 text-white text-xs font-black hover:bg-blue-700 transition-all"
                >
                  View My Bookings
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-black hover:bg-slate-50 transition-all"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden relative border border-slate-100 max-h-[90vh] overflow-y-auto"
      >
        {/* Header Section */}
        <div className="px-8 pt-8">
          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? "bg-blue-600" : "bg-slate-100"}`}
              />
            ))}
          </div>
          <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-slate-400">
            <span>Step {step} of 4</span>
            <span className="text-blue-600">{service.title}</span>
          </div>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <h2 className="text-2xl font-black text-slate-800 mb-6">
                  {service.title} Details
                </h2>
                {isGuest && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl space-y-4">
                    <p className="text-[11px] font-black uppercase text-blue-600 tracking-widest">
                      Your Contact Info
                    </p>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase text-slate-500 ml-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase text-slate-500 ml-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase text-slate-500 ml-1">
                        Confirm Email
                      </label>
                      <input
                        type="email"
                        value={guestEmailConfirm}
                        onChange={(e) => setGuestEmailConfirm(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                      {guestEmailConfirm.length > 0 &&
                        guestEmail !== guestEmailConfirm && (
                          <p className="text-[10px] text-red-500 ml-1 font-bold">
                            Emails do not match
                          </p>
                        )}
                    </div>
                  </div>
                )}
                {loadingConfig ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  renderServiceFields()
                )}
              </motion.div>
            )}

            {step === 2 && (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <motion.div
                  key="step2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <h2 className="text-2xl font-black text-slate-800 mb-6">
                    Schedule Appointment
                  </h2>

                  <div className="space-y-5">
                    {/* DATE PICKER */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-2 uppercase">
                        Select Date
                      </label>

                      <DatePicker
                        value={date}
                        minDate={getCalgaryNow().startOf("day")}
                        onChange={(newValue) => setDate(newValue)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            className:
                              "bg-slate-50 rounded-xl border border-slate-200",
                          },
                        }}
                      />
                    </div>

                    {/* TIME PICKER */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-2 uppercase">
                        Select Time
                      </label>

                      <TimePicker
                        value={time}
                        minTime={
                          date?.format("YYYY-MM-DD") ===
                          getCalgaryNow().format("YYYY-MM-DD")
                            ? getCalgaryNow().add(15, "minute")
                            : undefined
                        }
                        onChange={(newValue) => setTime(newValue)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            className:
                              "bg-slate-50 rounded-xl border border-slate-200",
                          },
                        }}
                      />
                    </div>

                    <p className="rounded-xl bg-blue-50 px-4 py-3 text-xs font-semibold leading-5 text-[#0B4E9B]">
                      Appointment times are interpreted in Calgary local time (Mountain Time).
                    </p>

                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                      <h4 className="text-[11px] font-bold text-blue-600 mb-3 flex items-center gap-2 uppercase">
                        📍 Work Location
                      </h4>

                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={loadingLocation || isValidatingAddress}
                        className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loadingLocation ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Getting current location...
                          </>
                        ) : (
                          <>
                            <MapPin size={16} />
                            Choose My Current Location
                          </>
                        )}
                      </button>

                      <div className="relative">
                        <input
                          value={location}
                          onChange={(e) => {
                            setLocation(e.target.value);
                            setCoordinates(null);
                            setValidatedLocation("");
                            setValidatedServiceArea(null);
                            setValidatedPostalCode("");
                            setLocationStatus("idle");
                            setLocationMessage("");
                          }}
                          autoComplete="street-address"
                          aria-describedby="service-location-message"
                          aria-invalid={locationStatus === "error"}
                          placeholder="Street, city and postal code"
                          className={`w-full rounded-xl border bg-white p-3 pr-10 text-sm outline-none transition focus:ring-2 ${
                            locationStatus === "valid"
                              ? "border-emerald-400 focus:ring-emerald-200"
                              : locationStatus === "error"
                                ? "border-red-400 focus:ring-red-200"
                                : "border-slate-200 focus:ring-blue-500"
                          }`}
                        />
                        {locationStatus === "valid" && (
                          <CheckCircle2
                            size={18}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600"
                          />
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={validateEnteredLocation}
                        disabled={
                          location.trim().length < 6 ||
                          loadingLocation ||
                          isValidatingAddress
                        }
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                      >
                        {isValidatingAddress ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Checking address...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={16} />
                            Check Service Availability
                          </>
                        )}
                      </button>

                      {locationMessage && (
                        <div
                          id="service-location-message"
                          role={locationStatus === "error" ? "alert" : "status"}
                          className={`mt-3 flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold leading-5 ${
                            locationStatus === "valid"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : locationStatus === "error"
                                ? "border-red-200 bg-red-50 text-red-700"
                                : "border-blue-100 bg-blue-50 text-blue-700"
                          }`}
                        >
                          {locationStatus === "valid" ? (
                            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                          ) : locationStatus === "error" ? (
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                          ) : (
                            <Loader2 size={16} className="mt-0.5 shrink-0 animate-spin" />
                          )}
                          <span>{locationMessage}</span>
                        </div>
                      )}

                      <p className="mt-2 text-[11px] leading-5 text-slate-500">
                        Online booking is available in {SERVICE_AREA_LABEL}.
                        Addresses outside this service area cannot be submitted.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </LocalizationProvider>
            )}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h2 className="text-xl font-black text-slate-800 mb-1">
                  Pricing Plan
                </h2>
                <p className="text-[11px] font-bold text-slate-400 mb-6 uppercase tracking-wider">
                  Select your preferred billing method
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div
                    onClick={() => setPricingType("Fixed")}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all text-center ${pricingType === "Fixed" ? "border-blue-600 bg-blue-50/30" : "border-slate-100 bg-slate-50 text-slate-400"}`}
                  >
                    <ClipboardList
                      className={`mx-auto mb-2 ${pricingType === "Fixed" ? "text-blue-600" : "text-slate-300"}`}
                      size={20}
                    />
                    <div className="text-xs font-black">Fixed Price</div>
                  </div>
                  <div
                    onClick={() => setPricingType("Hourly")}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all text-center ${pricingType === "Hourly" ? "border-blue-600 bg-blue-600 text-white shadow-xl shadow-blue-100" : "border-slate-100 bg-slate-50 text-slate-400"}`}
                  >
                    <Clock
                      className={`mx-auto mb-2 ${pricingType === "Hourly" ? "text-white" : "text-slate-300"}`}
                      size={20}
                    />
                    <div className="text-xs font-black">Hourly Price</div>
                  </div>
                </div>

                {pricingType === "Hourly" && (
                  <div className="text-center mb-8 bg-slate-50 py-6 rounded-2xl">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Estimated Duration
                    </span>
                    <div className="flex items-center justify-center gap-6 mt-4">
                      <button
                        onClick={() => setHours((h) => Math.max(1, h - 1))}
                        className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-white hover:text-blue-600 transition-all"
                      >
                        <Minus size={14} />
                      </button>
                      <div className="text-2xl font-black text-slate-800 w-12">
                        {hours}
                        <span className="text-[10px] ml-1">hrs</span>
                      </div>
                      <button
                        onClick={() => setHours((h) => h + 1)}
                        className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-white hover:text-blue-600 transition-all"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {(() => {
                  const {
                    lineItems,
                    subtotal,
                    tax,
                    total,
                    taxRate = 0,
                  } = calculatePricing();
                  return (
                    <div className="space-y-3 px-2">
                      {lineItems.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-sm font-bold text-slate-400">
                            Pricing will be confirmed after consultation
                          </p>
                        </div>
                      ) : (
                        <>
                          {lineItems.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between text-[11px] font-bold text-slate-400"
                            >
                              <span>{item.label}</span>
                              <span className="text-slate-800">
                                ${item.amount.toFixed(2)}
                              </span>
                            </div>
                          ))}
                          <div className="flex justify-between text-[11px] font-bold text-slate-400 pt-2 border-t border-slate-100">
                            <span>Subtotal</span>
                            <span className="text-slate-800">
                              ${subtotal.toFixed(2)}
                            </span>
                          </div>
                          {taxRate > 0 && (
                            <div className="flex justify-between text-[11px] font-bold text-slate-400">
                              <span>Tax ({(taxRate * 100).toFixed(0)}%)</span>
                              <span className="text-slate-800">
                                ${tax.toFixed(2)}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                            <span className="text-sm font-black text-slate-800 uppercase tracking-tighter">
                              Total Amount
                            </span>
                            <span className="text-xl font-black text-blue-600">
                              ${total.toFixed(2)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })()}
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h2 className="text-2xl font-black text-slate-800 mb-1">
                  Review Your Booking
                </h2>
                <p className="text-[11px] font-bold text-slate-400 mb-6 uppercase tracking-wider">
                  Please verify details before confirming
                </p>

                {submitError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-black text-red-700 mb-1">
                        Booking Failed
                      </p>
                      <p className="text-xs text-red-600">{submitError}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                    <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-1">
                      Service
                    </p>
                    <p className="text-base font-black text-slate-800">
                      {service.title}
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                      Schedule
                    </p>

                    <div className="flex items-center gap-3">
                      <Calendar size={16} className="text-blue-600 shrink-0" />
                      <div className="flex-1">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">
                          Date
                        </p>
                        <p className="text-sm font-bold text-slate-800">
                          {date ? date.format("MMM DD, YYYY") : "Not set"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock size={16} className="text-blue-600 shrink-0" />
                      <div className="flex-1">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">
                          Time
                        </p>
                        <p className="text-sm font-bold text-slate-800">
                          {time ? time.format("hh:mm A") : "Not set"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin
                        size={16}
                        className="text-blue-600 shrink-0 mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">
                          Location
                        </p>
                        <p className="text-sm font-bold text-slate-800 break-words">
                          {location || "Not set"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {Object.keys(formData).length > 0 && (
                    <div className="bg-slate-50 rounded-2xl p-4">
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3">
                        Service Details
                      </p>
                      <div className="space-y-2">
                        {Object.entries(formData).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between items-center"
                          >
                            <span className="text-xs text-slate-500 capitalize">
                              {key.replace(/_/g, " ")}
                            </span>
                            <span className="text-sm font-bold text-slate-800 capitalize">
                              {typeof value === "boolean"
                                ? value
                                  ? "Yes"
                                  : "No"
                                : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(() => {
                    const { total } = calculatePricing();
                    return (
                      <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3">
                          Pricing
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500">
                            Billing Type
                          </span>
                          <span className="text-sm font-bold text-slate-800">
                            {pricingType}
                          </span>
                        </div>
                        {pricingType === "Hourly" && (
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-500">
                              Estimated Hours
                            </span>
                            <span className="text-sm font-bold text-slate-800">
                              {hours} hrs
                            </span>
                          </div>
                        )}
                        {total > 0 && (
                          <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                            <span className="text-xs font-black uppercase text-slate-700 tracking-wider">
                              Total Amount
                            </span>
                            <span className="text-xl font-black text-blue-600">
                              ${total.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-3 mt-10">
            <button
              onClick={step === 1 ? onClose : prevStep}
              disabled={isSubmitting || isValidatingAddress} // Update back button state too
              className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-black hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === 1 ? "Cancel" : "Back"}
            </button>
            <button
              onClick={step === totalSteps ? handleConfirm : nextStep}
              disabled={
                !isStepValid() ||
                isSubmitting ||
                isValidatingAddress ||
                loadingLocation
              }
              className={`flex-1 py-3 rounded-xl text-white text-xs font-black flex items-center justify-center gap-2 shadow-xl shadow-blue-200 transition-all ${
                !isStepValid() ||
                isSubmitting ||
                isValidatingAddress ||
                loadingLocation
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSubmitting || isValidatingAddress ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {step === 4
                    ? "Confirm Booking"
                    : step === 3
                      ? "Review"
                      : "Continue"}{" "}
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingModal;
