"use client";

import { useState, useEffect, useRef } from "react";
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
  AlertTriangle,
  ImagePlus,
  Phone,
  Home,
  FileImage,
  X,
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
import type { CleaningPricingConfig, PricingPackage } from "@/lib/pricing/config";
import { calculateStandardCleaningPrice } from "@/lib/pricing/standard";
import { calculateDeepCleaningPrice } from "@/lib/pricing/deep";
import { calculateMoveInOutPrice } from "@/lib/pricing/moveInOut";
import { calculateCarpetPrice, carpetAreaCount } from "@/lib/pricing/carpet";
import { resolveCleaningPricingScope } from "@/lib/pricing/serviceScope";
import {
  calculateServiceAddOns,
  getAddOnQuantityLimit,
  getVisibleAddOns,
  isQuantityControlledAddOn,
} from "@/lib/pricing/addOns";

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
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getCanadianPhoneDigits = (value: string) => {
  let digits = value.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  return digits.slice(0, 10);
};

const formatCanadianPhone = (value: string) => {
  const digits = getCanadianPhoneDigits(value);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};

const isValidCanadianPhone = (value: string) => {
  const digits = getCanadianPhoneDigits(value);
  return /^[2-9]\d{2}[2-9]\d{6}$/.test(digits);
};

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

  if (!CANADIAN_POSTAL_CODE_PATTERN.test(postalCode)) {
    return {
      valid: false,
      message: "Please include a valid Canadian postal code with the service address.",
    };
  }

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
  const [cleaningPricingConfig, setCleaningPricingConfig] =
    useState<CleaningPricingConfig | null>(null);
  const [pricingConfigError, setPricingConfigError] = useState<string | null>(null);
  
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [submittedCustomQuote, setSubmittedCustomQuote] = useState(false);
  const [submittedForReview, setSubmittedForReview] = useState(false);
  
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
  const [guestPhone, setGuestPhone] = useState("");
  const [conditionPhotos, setConditionPhotos] = useState<File[]>([]);
  const [uploadedConditionPhotoPaths, setUploadedConditionPhotoPaths] = useState<string[]>([]);
  const [hasReviewedStepOne, setHasReviewedStepOne] = useState(false);
  const modalScrollRef = useRef<HTMLDivElement | null>(null);

  const totalSteps = 4;
  const cleaningPricingScope = resolveCleaningPricingScope(service);

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

  const scrollToBookingField = (id: string) => {
    requestAnimationFrame(() => {
      const element = document.getElementById(id);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (
        element instanceof HTMLInputElement ||
        element instanceof HTMLSelectElement ||
        element instanceof HTMLTextAreaElement
      ) {
        element.focus({ preventScroll: true });
      }
    });
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
    if (
      step === 1 &&
      cleaningPricingScope &&
      (!cleaningPricingConfig || pricingConfigError)
    ) {
      alert(pricingConfigError || "Please wait for cleaning pricing to load.");
      return;
    }

    if (
      step === 1 &&
      cleaningPricingScope === "carpet" &&
      cleaningPricingConfig
    ) {
      const carpetSelection = {
        standardRooms: formData.carpetStandardRooms,
        largeRooms: formData.carpetLargeRooms,
        hallways: formData.carpetHallways,
        stairFlights: formData.carpetStairFlights,
        smallAreaRugs: formData.carpetSmallAreaRugs,
        heavyStainAreas: formData.carpetHeavyStainAreas,
        petUrineOdor: formData.carpetPetUrineOdor,
      };
      const normalized = calculateCarpetPrice(cleaningPricingConfig, carpetSelection, "standalone").selection;
      if (carpetAreaCount(normalized) === 0 && !normalized.petUrineOdor) {
        alert("Please select at least one carpeted area or treatment.");
        return;
      }
    }

    if (step === 1 && isGuest) {
      if (guestName.trim().length < 2) {
        scrollToBookingField("booking-guest-name");
        alert("Please enter your full name.");
        return;
      }
      const emailValid = EMAIL_PATTERN.test(guestEmail);
      if (!emailValid) {
        scrollToBookingField("booking-guest-email");
        alert("Please enter a valid email address.");
        return;
      }
      if (!isValidCanadianPhone(guestPhone)) {
        scrollToBookingField("booking-guest-phone");
        alert("Please enter a valid Canadian phone number in the format (403) 555-0123.");
        return;
      }
    }

    if (step === 1 && cleaningPricingScope) {
      if (!isGuest) {
        if (String(formData.customerName || "").trim().length < 2) {
          scrollToBookingField("booking-customer-name");
          alert("Please enter the customer name.");
          return;
        }
        if (!EMAIL_PATTERN.test(String(formData.customerEmail || ""))) {
          scrollToBookingField("booking-customer-email");
          alert("Please enter a valid email address.");
          return;
        }
        if (!isValidCanadianPhone(String(formData.customerPhone || ""))) {
          scrollToBookingField("booking-customer-phone");
          alert("Please enter a valid Canadian phone number in the format (403) 555-0123.");
          return;
        }
      }
      if (!formData.propertyType) {
        scrollToBookingField("booking-property-type");
        alert("Please select the property type.");
        return;
      }
      if (!formData.propertyCondition) {
        scrollToBookingField("booking-property-condition");
        alert("Please select the property condition.");
        return;
      }
      if (
        cleaningPricingScope === "move_in_out" &&
        typeof formData.movePropertyEmpty !== "boolean"
      ) {
        scrollToBookingField("booking-move-empty");
        alert("Please confirm whether the property will be empty.");
        return;
      }
      if (requiresConditionPhotos() && conditionPhotos.length === 0) {
        scrollToBookingField("booking-condition-photos");
        alert("Please add at least one condition photo for admin review.");
        return;
      }

      if (!hasReviewedStepOne) {
        const scroller = modalScrollRef.current;
        scroller?.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" });
        alert("Please review the full service options and add-on list before continuing.");
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
    const standardPricingReady =
      !cleaningPricingScope ||
      (!!cleaningPricingConfig && !pricingConfigError);

    const carpetSelectionReady =
      cleaningPricingScope !== "carpet" ||
      !cleaningPricingConfig ||
      (() => {
        const normalized = calculateCarpetPrice(
          cleaningPricingConfig,
          {
            standardRooms: formData.carpetStandardRooms,
            largeRooms: formData.carpetLargeRooms,
            hallways: formData.carpetHallways,
            stairFlights: formData.carpetStairFlights,
            smallAreaRugs: formData.carpetSmallAreaRugs,
            heavyStainAreas: formData.carpetHeavyStainAreas,
            petUrineOdor: formData.carpetPetUrineOdor,
          },
          "standalone",
        ).selection;
        return carpetAreaCount(normalized) > 0 || normalized.petUrineOdor;
      })();

    const authenticatedContactReady =
      isGuest ||
      !cleaningPricingScope ||
      (String(formData.customerName || "").trim().length >= 2 &&
        EMAIL_PATTERN.test(String(formData.customerEmail || "")) &&
        isValidCanadianPhone(String(formData.customerPhone || "")));

    const cleaningDetailsReady =
      !cleaningPricingScope ||
      (authenticatedContactReady &&
        Boolean(formData.propertyType) &&
        Boolean(formData.propertyCondition) &&
        (cleaningPricingScope !== "move_in_out" ||
          typeof formData.movePropertyEmpty === "boolean") &&
        (!requiresConditionPhotos() || conditionPhotos.length > 0));

    if (step === 1 && isGuest) {
      const emailValid = EMAIL_PATTERN.test(guestEmail);
      return (
        guestName.trim().length >= 2 &&
        emailValid &&
        isValidCanadianPhone(guestPhone) &&
        standardPricingReady &&
        carpetSelectionReady &&
        cleaningDetailsReady
      );
    }
    if (step === 1) {
      return standardPricingReady && carpetSelectionReady && cleaningDetailsReady;
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

  const uploadConditionPhotos = async () => {
    if (conditionPhotos.length === 0) return uploadedConditionPhotoPaths;
    if (uploadedConditionPhotoPaths.length === conditionPhotos.length) {
      return uploadedConditionPhotoPaths;
    }

    const payload = new FormData();
    conditionPhotos.forEach((file) => payload.append("photos", file));
    const response = await fetch("/api/booking/condition-photos", {
      method: "POST",
      body: payload,
    });
    const result = (await response.json()) as {
      paths?: string[];
      error?: string;
    };
    if (!response.ok || !Array.isArray(result.paths)) {
      throw new Error(result.error || "We could not upload the condition photos.");
    }
    setUploadedConditionPhotoPaths(result.paths);
    return result.paths;
  };

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
      const conditionPhotoPaths =
        conditionPhotos.length > 0 ? await uploadConditionPhotos() : [];
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
          guestPhone: isGuest ? guestPhone.trim() : undefined,
          bookingDateTime: selectedDateTime.toISOString(),
          address: location.trim(),
          coordinates,
          serviceArea: validatedServiceArea,
          postalCode: validatedPostalCode || undefined,
          pricingType,
          hours,
          formData: {
            ...formData,
            postalCode: validatedPostalCode || undefined,
            serviceArea: validatedServiceArea || undefined,
            conditionPhotoPaths,
            customerName: isGuest
              ? guestName.trim()
              : formData.customerName || user?.user_metadata?.name || user?.user_metadata?.full_name || "",
            customerEmail: isGuest ? guestEmail.trim() : formData.customerEmail || user?.email || "",
            customerPhone: isGuest ? guestPhone.trim() : formData.customerPhone || "",
          },
        }),
      });

      const result = (await response.json()) as {
        ok?: boolean;
        error?: string;
        bookingId?: string;
        customQuoteRequired?: boolean;
        adminReviewRequired?: boolean;
        status?: string;
      };

      if (!response.ok || !result.ok) {
        throw new Error(
          result.error || "We could not create your booking. Please try again.",
        );
      }

      setBookingId(result.bookingId || null);
      setSubmittedCustomQuote(Boolean(result.customQuoteRequired));
      setSubmittedForReview(Boolean(result.adminReviewRequired));
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

  const applyStandardPackage = (pkg: PricingPackage) => {
    setPricingType("Fixed");
    setFormData((prev) => ({
      ...prev,
      standardPackageId: pkg.id,
      bedrooms: Math.max(1, pkg.allowances.bedrooms),
      fullBathrooms: Math.max(1, pkg.allowances.fullBathrooms),
      halfBathrooms: 0,
      kitchens: Math.max(1, pkg.allowances.kitchens),
      livingRooms: Math.max(1, pkg.allowances.livingRooms),
      finishedBasement: 0,
      stairFlights: 0,
      unusualLayout: false,
    }));
  };

  const getCleaningAreaSelection = () => ({
    bedrooms: formData.bedrooms,
    fullBathrooms: formData.fullBathrooms,
    halfBathrooms: formData.halfBathrooms,
    kitchens: formData.kitchens,
    livingRooms: formData.livingRooms,
    finishedBasement: formData.finishedBasement,
    stairFlights: formData.stairFlights,
    unusualLayout: formData.unusualLayout,
  });

  const getStandardPricingResult = () => {
    if (!cleaningPricingConfig || cleaningPricingScope !== "standard") {
      return null;
    }

    return calculateStandardCleaningPrice(cleaningPricingConfig, {
      ...getCleaningAreaSelection(),
      preferredPackageId: formData.standardPackageId,
    });
  };

  const getDeepPricingResult = () => {
    if (!cleaningPricingConfig || cleaningPricingScope !== "deep") {
      return null;
    }
    return calculateDeepCleaningPrice(
      cleaningPricingConfig,
      getCleaningAreaSelection(),
    );
  };

  const getMoveInOutPricingResult = () => {
    if (!cleaningPricingConfig || cleaningPricingScope !== "move_in_out") {
      return null;
    }
    return calculateMoveInOutPrice(
      cleaningPricingConfig,
      getCleaningAreaSelection(),
    );
  };

  const getCarpetPricingInput = () => ({
    standardRooms: formData.carpetStandardRooms,
    largeRooms: formData.carpetLargeRooms,
    hallways: formData.carpetHallways,
    stairFlights: formData.carpetStairFlights,
    smallAreaRugs: formData.carpetSmallAreaRugs,
    heavyStainAreas: formData.carpetHeavyStainAreas,
    petUrineOdor: formData.carpetPetUrineOdor,
  });

  const getStandaloneCarpetPricingResult = () => {
    if (!cleaningPricingConfig || cleaningPricingScope !== "carpet") {
      return null;
    }
    return calculateCarpetPrice(
      cleaningPricingConfig,
      getCarpetPricingInput(),
      "standalone",
    );
  };

  const getCarpetAddonPricingResult = () => {
    if (
      !cleaningPricingConfig ||
      !formData.carpetEnabled ||
      !cleaningPricingScope ||
      cleaningPricingScope === "carpet"
    ) {
      return null;
    }
    return calculateCarpetPrice(
      cleaningPricingConfig,
      getCarpetPricingInput(),
      "addon",
    );
  };

  const getAddOnPricingResult = () => {
    if (!cleaningPricingConfig || !cleaningPricingScope) return null;
    return calculateServiceAddOns(
      cleaningPricingConfig,
      cleaningPricingScope,
      (formData.selectedAddOns || {}) as Record<string, number | boolean>,
    );
  };

  const getPropertyReviewState = () => {
    if (!cleaningPricingConfig || !cleaningPricingScope) {
      return { reviewRequired: false, customQuote: false, reasons: [] as string[] };
    }

    const reasons: string[] = [];
    let customQuote = false;

    if (
      formData.propertyCondition === "heavy" &&
      cleaningPricingConfig.heavyCondition.enabled
    ) {
      reasons.push("Heavy property condition");
      customQuote =
        cleaningPricingConfig.heavyCondition.requiresAdminApproval ||
        !cleaningPricingConfig.heavyCondition.allowInstantBooking;
    }

    if (
      cleaningPricingScope === "move_in_out" &&
      formData.movePropertyEmpty === false
    ) {
      reasons.push("Move-In / Move-Out property is not empty");
      customQuote = true;
    }

    if (formData.unusualLayout === true) {
      reasons.push("Unusual property layout");
    }

    return {
      reviewRequired: reasons.length > 0,
      customQuote,
      reasons,
    };
  };

  const requiresConditionPhotos = () => {
    if (!cleaningPricingConfig || !cleaningPricingScope) return false;
    const heavy = formData.propertyCondition === "heavy";
    const addOnReview = Boolean(getAddOnPricingResult()?.adminReviewRequired);
    return (
      cleaningPricingConfig.heavyCondition.allowPhotoUpload &&
      (heavy || addOnReview)
    );
  };

  const calculatePricing = (): {
    lineItems: { label: string; amount: number }[];
    subtotal: number;
    tax: number;
    total: number;
    taxRate: number;
    taxLabel: string;
    customQuote: boolean;
    customQuoteReason: string | null;
    estimatedTotal: number;
    adminReviewRequired: boolean;
  } => {
    if (!service) {
      return {
        lineItems: [] as { label: string; amount: number }[],
        subtotal: 0,
        tax: 0,
        total: 0,
        taxRate: 0,
        taxLabel: "Tax",
        customQuote: false,
        customQuoteReason: null as string | null,
        estimatedTotal: 0,
        adminReviewRequired: false,
      };
    }

    if (cleaningPricingScope && cleaningPricingConfig) {
      const baseResult =
        cleaningPricingScope === "standard"
          ? getStandardPricingResult()
          : cleaningPricingScope === "deep"
            ? getDeepPricingResult()
            : cleaningPricingScope === "move_in_out"
              ? getMoveInOutPricingResult()
              : getStandaloneCarpetPricingResult();

      if (!baseResult) {
        return {
          lineItems: [] as { label: string; amount: number }[],
          subtotal: 0,
          tax: 0,
          total: 0,
          taxRate: 0,
          taxLabel: "Tax",
          customQuote: false,
          customQuoteReason: pricingConfigError || "Cleaning pricing is loading.",
          estimatedTotal: 0,
          adminReviewRequired: false,
        };
      }

      const baseLineItems = baseResult.lineItems.map((item) => ({
        label:
          item.quantity > 1
            ? `${item.label} (${item.quantity} × $${(item.unitPriceCents / 100).toFixed(2)})`
            : item.label,
        amount: item.amountCents / 100,
      }));

      const carpetAddon = getCarpetAddonPricingResult();
      const carpetLineItems = carpetAddon
        ? carpetAddon.lineItems
            .filter((item) => item.amountCents > 0)
            .map((item) => ({
              label:
                item.quantity > 1
                  ? `Carpet: ${item.label} (${item.quantity} × $${(item.unitPriceCents / 100).toFixed(2)})`
                  : `Carpet: ${item.label}`,
              amount: item.amountCents / 100,
            }))
        : [];

      const addOns = getAddOnPricingResult();
      const addOnLineItems = addOns
        ? addOns.lineItems.map((item) => ({
            label:
              item.quantity > 1
                ? `${item.label} (${item.quantity} × $${(item.unitPriceCents / 100).toFixed(2)})`
                : item.label,
            amount: item.amountCents / 100,
          }))
        : [];
      const propertyReview = getPropertyReviewState();

      const subtotalCents =
        baseResult.subtotalCents +
        (carpetAddon?.subtotalCents || 0) +
        (addOns?.subtotalCents || 0);
      const taxRate = cleaningPricingConfig.tax.enabled
        ? cleaningPricingConfig.tax.rate
        : 0;
      const taxCents = Math.round(subtotalCents * taxRate);
      const customQuote =
        baseResult.customQuote ||
        Boolean(carpetAddon?.customQuote) ||
        Boolean(addOns?.customQuote) ||
        propertyReview.customQuote;
      const customQuoteReason =
        baseResult.customQuoteReason ||
        carpetAddon?.customQuoteReason ||
        addOns?.customQuoteReason ||
        propertyReview.reasons[0] ||
        null;

      return {
        lineItems: [...baseLineItems, ...addOnLineItems, ...carpetLineItems],
        subtotal: subtotalCents / 100,
        tax: taxCents / 100,
        total: customQuote ? 0 : (subtotalCents + taxCents) / 100,
        taxRate,
        taxLabel: cleaningPricingConfig.tax.label,
        customQuote,
        customQuoteReason,
        estimatedTotal: (subtotalCents + taxCents) / 100,
        adminReviewRequired:
          propertyReview.reviewRequired ||
          Boolean(addOns?.adminReviewRequired),
      };
    }

    if (cleaningPricingScope && !cleaningPricingConfig) {
      return {
        lineItems: [] as { label: string; amount: number }[],
        subtotal: 0,
        tax: 0,
        total: 0,
        taxRate: 0,
        taxLabel: "Tax",
        customQuote: false,
        customQuoteReason: pricingConfigError || "Cleaning pricing is loading.",
        estimatedTotal: 0,
        adminReviewRequired: false,
      };
    }

    const lineItems: { label: string; amount: number }[] = [];
    let subtotal = 0;

    switch (service.service_type) {
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

    return {
      lineItems,
      subtotal,
      tax,
      total,
      taxRate,
      taxLabel: "Tax",
      customQuote: false,
      customQuoteReason: null as string | null,
      estimatedTotal: total,
      adminReviewRequired: false,
    };
  };

  const initialCleaningFields = () => ({
    customerName: isGuest ? "" : user?.user_metadata?.name || user?.user_metadata?.full_name || "",
    customerEmail: isGuest ? "" : user?.email || "",
    customerPhone: isGuest
      ? ""
      : formatCanadianPhone(user?.user_metadata?.phone || user?.user_metadata?.phone_number || ""),
    bedrooms: 1,
    fullBathrooms: 1,
    halfBathrooms: 0,
    kitchens: 1,
    livingRooms: 1,
    finishedBasement: 0,
    stairFlights: 0,
    unusualLayout: false,
    propertyType: "house",
    propertyCondition: "regular",
    movePropertyEmpty: null,
    additionalInstructions: "",
    selectedAddOns: {},
    carpetEnabled: false,
    carpetStandardRooms: 0,
    carpetLargeRooms: 0,
    carpetHallways: 0,
    carpetStairFlights: 0,
    carpetSmallAreaRugs: 0,
    carpetHeavyStainAreas: 0,
    carpetPetUrineOdor: false,
    carpetCondition: "regular",
  });

  const initializeFormData = (
    serviceType: string,
    cfg: ServiceConfig,
    serviceTitle = "",
  ) => {
    const scope = resolveCleaningPricingScope({
      service_type: serviceType,
      title: serviceTitle,
    });

    if (scope === "standard") {
      setPricingType("Fixed");
      setFormData({
        ...initialCleaningFields(),
        standardPackageId: "essential_standard",
      });
      return;
    }

    if (scope === "deep" || scope === "move_in_out") {
      setPricingType("Fixed");
      setFormData(initialCleaningFields());
      return;
    }

    if (scope === "carpet") {
      setPricingType("Fixed");
      setFormData({
        customerName: isGuest ? "" : user?.user_metadata?.name || user?.user_metadata?.full_name || "",
        customerEmail: isGuest ? "" : user?.email || "",
        customerPhone: isGuest
          ? ""
          : formatCanadianPhone(user?.user_metadata?.phone || user?.user_metadata?.phone_number || ""),
        propertyType: "house",
        propertyCondition: "regular",
        additionalInstructions: "",
        selectedAddOns: {},
        carpetStandardRooms: 1,
        carpetLargeRooms: 0,
        carpetHallways: 0,
        carpetStairFlights: 0,
        carpetSmallAreaRugs: 0,
        carpetHeavyStainAreas: 0,
        carpetPetUrineOdor: false,
        carpetCondition: "regular",
      });
      return;
    }

    switch (serviceType) {
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
        initializeFormData(service.service_type, cfg, service.title);
      } catch (err) {
        console.error("Error fetching service config:", err);
        setConfig({});
        initializeFormData(service.service_type, {}, service.title);
      } finally {
        setLoadingConfig(false);
      }
    };
    fetchConfig();
  }, [isOpen, service?.id]);

  // Phase 3: all supported cleaning scopes use the same central, admin-editable pricing config.
  useEffect(() => {
    if (!isOpen || !cleaningPricingScope) {
      setCleaningPricingConfig(null);
      setPricingConfigError(null);
      return;
    }

    let cancelled = false;

    const loadPricing = async () => {
      setPricingConfigError(null);
      try {
        const response = await fetch("/api/pricing", { cache: "no-store" });
        const payload = (await response.json()) as {
          config?: CleaningPricingConfig;
          error?: string;
        };

        if (!response.ok || !payload.config) {
          throw new Error(payload.error || "Cleaning pricing is temporarily unavailable.");
        }

        if (!cancelled) {
          setCleaningPricingConfig(payload.config);
        }
      } catch (error) {
        console.error("Unable to load cleaning pricing:", error);
        if (!cancelled) {
          setCleaningPricingConfig(null);
          setPricingConfigError(
            error instanceof Error
              ? error.message
              : "Cleaning pricing is temporarily unavailable.",
          );
        }
      }
    };

    void loadPricing();
    return () => {
      cancelled = true;
    };
  }, [isOpen, cleaningPricingScope]);

  useEffect(() => {
    if (!isOpen) return;
    setHasReviewedStepOne(false);
    requestAnimationFrame(() => {
      modalScrollRef.current?.scrollTo({ top: 0 });
    });
  }, [isOpen, service?.id]);

  useEffect(() => {
    if (!isOpen || step !== 1) return;
    const timer = window.setTimeout(() => {
      const scroller = modalScrollRef.current;
      if (scroller && scroller.scrollHeight <= scroller.clientHeight + 32) {
        setHasReviewedStepOne(true);
      }
    }, 120);
    return () => window.clearTimeout(timer);
  }, [isOpen, step, loadingConfig, cleaningPricingConfig, isGuest]);

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
      setSubmittedCustomQuote(false);
      setCoordinates(null);
      setGuestName("");
      setGuestEmail("");
      setGuestPhone("");
      setConditionPhotos([]);
      setUploadedConditionPhotoPaths([]);
      setLoadingLocation(false);
      setIsValidatingAddress(false);
      setLocationStatus("idle");
      setLocationMessage("");
      setValidatedLocation("");
      setValidatedServiceArea(null);
      setValidatedPostalCode("");
      setCleaningPricingConfig(null);
      setPricingConfigError(null);
      setHasReviewedStepOne(false);
    }
  }, [isOpen]);

  const getCurrentLocation = async () => {
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

    if ("permissions" in navigator) {
      try {
        const permission = await navigator.permissions.query({
          name: "geolocation",
        });

        if (permission.state === "denied") {
          showLocationError(
            "Location access is blocked. Click the lock icon beside the browser address, open Site settings, set Location to Allow, then reload this page.",
          );
          return;
        }
      } catch (error) {
        // Some browsers do not expose geolocation through Permissions API.
        // Calling getCurrentPosition below will still show their native prompt.
        console.debug("Geolocation permission state is unavailable:", error);
      }
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
        const blockedByPolicy = /permissions policy|disabled in this document/i.test(
          error.message,
        );
        const messages: Record<number, string> = {
          1: "Location permission was denied. Allow location access in your browser or type the address manually.",
          2: "Your location is currently unavailable. Please try again or type the address manually.",
          3: "Location detection timed out. Please try again or type the address manually.",
        };
        showLocationError(
          blockedByPolicy
            ? "Location is disabled by this page's Permissions Policy. Open the booking page directly in a browser tab and allow geolocation=(self) in the website/server configuration."
            : messages[error.code] ||
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
  const cleaningSelectClass =
    "h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-bold text-slate-800 shadow-sm outline-none transition-all hover:border-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-100/70";

  const renderCleaningPropertyFields = () => (
    <div className="mb-5 space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-start gap-3">
          <Home size={18} className="mt-0.5 shrink-0 text-blue-600" />
          <div>
            <p className="text-sm font-black text-slate-800">Property Information</p>
            <p className="mt-1 text-[11px] leading-5 text-slate-400">
              Tell us about the property so the correct package, included areas and additional charges can be applied.
            </p>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="ml-1 text-[10px] font-black uppercase text-slate-500">Property Type</label>
            <select
              id="booking-property-type"
              value={formData.propertyType || "house"}
              onChange={(e) => updateField("propertyType", e.target.value)}
              className={cleaningSelectClass}
            >
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="condo">Condo</option>
              <option value="townhouse">Townhouse</option>
              <option value="basement_suite">Basement suite</option>
              <option value="rental_property">Rental property</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="ml-1 text-[10px] font-black uppercase text-slate-500">Property Condition</label>
            <select
              id="booking-property-condition"
              value={formData.propertyCondition || "regular"}
              onChange={(e) => {
                updateField("propertyCondition", e.target.value);
                if (e.target.value !== "heavy") {
                  setUploadedConditionPhotoPaths([]);
                }
              }}
              className={cleaningSelectClass}
            >
              <option value="regular">Regularly maintained</option>
              <option value="moderate">Moderate buildup</option>
              <option value="heavy">Heavy condition</option>
            </select>
          </div>
        </div>

        {cleaningPricingScope === "move_in_out" && (
          <div id="booking-move-empty" className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50 p-3">
            <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-emerald-700">
              Will the property be empty at the time of service?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[true, false].map((value) => (
                <button
                  type="button"
                  key={String(value)}
                  onClick={() => updateField("movePropertyEmpty", value)}
                  className={`rounded-xl border px-3 py-2.5 text-xs font-black transition ${
                    formData.movePropertyEmpty === value
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-emerald-200 bg-white text-emerald-700"
                  }`}
                >
                  {value ? "Yes, empty" : "No, occupied"}
                </button>
              ))}
            </div>
            {formData.movePropertyEmpty === false && (
              <p className="mt-2 text-[11px] leading-5 text-amber-700">
                Move-In / Move-Out base pricing assumes an empty property. An occupied property will be sent for admin review.
              </p>
            )}
          </div>
        )}

        <div className="mb-4">
          <p className="text-sm font-black text-slate-800">Property Size</p>
          <p className="mt-1 text-[11px] leading-5 text-slate-400">
            The calculator applies the correct base tier first, then charges only for areas beyond that tier.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="ml-1 text-[10px] font-black uppercase text-slate-500">Bedrooms</label>
            <select value={formData.bedrooms ?? 1} onChange={(e) => updateField("bedrooms", Number(e.target.value))} className={cleaningSelectClass}>
              {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} Bedroom{n > 1 ? "s" : ""}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="ml-1 text-[10px] font-black uppercase text-slate-500">Full Bathrooms</label>
            <select value={formData.fullBathrooms ?? 1} onChange={(e) => updateField("fullBathrooms", Number(e.target.value))} className={cleaningSelectClass}>
              {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} Full Bathroom{n > 1 ? "s" : ""}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="ml-1 text-[10px] font-black uppercase text-slate-500">Half Bathrooms</label>
            <select value={formData.halfBathrooms ?? 0} onChange={(e) => updateField("halfBathrooms", Number(e.target.value))} className={cleaningSelectClass}>
              {[0, 1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="ml-1 text-[10px] font-black uppercase text-slate-500">Kitchens</label>
            <select value={formData.kitchens ?? 1} onChange={(e) => updateField("kitchens", Number(e.target.value))} className={cleaningSelectClass}>
              {[1, 2, 3].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="ml-1 text-[10px] font-black uppercase text-slate-500">Living / Family Rooms</label>
            <select value={formData.livingRooms ?? 1} onChange={(e) => updateField("livingRooms", Number(e.target.value))} className={cleaningSelectClass}>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="ml-1 text-[10px] font-black uppercase text-slate-500">Finished Basement Living Area</label>
            <select value={formData.finishedBasement ?? 0} onChange={(e) => updateField("finishedBasement", Number(e.target.value))} className={cleaningSelectClass}>
              <option value={0}>No</option>
              <option value={1}>Yes</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="ml-1 text-[10px] font-black uppercase text-slate-500">Flights of Stairs</label>
            <select value={formData.stairFlights ?? 0} onChange={(e) => updateField("stairFlights", Number(e.target.value))} className={cleaningSelectClass}>
              {[0, 1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex min-h-[46px] w-full cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-600">
              <input type="checkbox" checked={formData.unusualLayout === true} onChange={(e) => updateField("unusualLayout", e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-blue-600" />
              Unusual property layout
            </label>
          </div>
        </div>

        <div className="mt-4 space-y-1.5">
          <label className="ml-1 text-[10px] font-black uppercase text-slate-500">Additional Instructions</label>
          <textarea
            value={formData.additionalInstructions || ""}
            onChange={(e) => updateField("additionalInstructions", e.target.value.slice(0, 1500))}
            rows={3}
            placeholder="Access details, areas needing extra attention, pets or other service notes..."
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {(formData.propertyCondition === "heavy" || requiresConditionPhotos()) && (
        <div id="booking-condition-photos" className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-black text-amber-900">Admin review required</p>
              <p className="mt-1 text-xs leading-5 text-amber-700">
                Heavy or condition-dependent work is reviewed before the final price is confirmed. Add clear photos so the team can assess the scope accurately.
              </p>

              {cleaningPricingConfig?.heavyCondition.allowPhotoUpload && (
                <div className="mt-4">
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-amber-300 bg-white px-4 py-3 text-xs font-black text-amber-800 transition hover:bg-amber-50">
                    <ImagePlus size={17} />
                    Add condition photos
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="hidden"
                      onChange={(event) => {
                        const incoming = Array.from(event.target.files || []) as File[];
                        const valid = incoming.filter((file) =>
                          ["image/jpeg", "image/png", "image/webp"].includes(file.type) &&
                          file.size <= 8 * 1024 * 1024,
                        );
                        if (incoming.length !== valid.length) {
                          alert("Only JPG, PNG or WEBP images up to 8 MB each are allowed.");
                        }
                        const next = valid.slice(0, 6);
                        setConditionPhotos(next);
                        setUploadedConditionPhotoPaths([]);
                        event.target.value = "";
                      }}
                    />
                  </label>
                  <p className="mt-2 text-[10px] text-amber-700">Up to 6 photos, maximum 8 MB each.</p>
                  {conditionPhotos.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {conditionPhotos.map((file, index) => (
                        <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-white px-3 py-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <FileImage size={15} className="shrink-0 text-amber-600" />
                            <span className="truncate text-[11px] font-bold text-slate-600">{file.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setConditionPhotos((current) => current.filter((_, itemIndex) => itemIndex !== index));
                              setUploadedConditionPhotoPaths([]);
                            }}
                            className="shrink-0 text-[10px] font-black uppercase text-red-500"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAddOnsConfigurator = () => {
    if (!cleaningPricingConfig || !cleaningPricingScope) return null;
    const visibleAddOns = getVisibleAddOns(cleaningPricingConfig, cleaningPricingScope);
    if (visibleAddOns.length === 0) return null;

    const selected = (formData.selectedAddOns || {}) as Record<string, number | boolean>;
    const setAddOn = (id: string, value: number | boolean) => {
      updateField("selectedAddOns", { ...selected, [id]: value });
      setUploadedConditionPhotoPaths([]);
    };

    return (
      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-4">
          <p className="text-sm font-black text-slate-800">Optional Add-Ons</p>
          <p className="mt-1 text-[11px] leading-5 text-slate-400">
            Only add-ons relevant to this service are shown. Anything already included in the selected service is automatically hidden so it cannot be charged twice.
          </p>
        </div>

        <div className="space-y-3">
          {visibleAddOns.map((addOn) => {
            const quantityControlled = isQuantityControlledAddOn(addOn.id, addOn.priceType);
            const maxQuantity = getAddOnQuantityLimit(addOn.id);
            const quantity = quantityControlled
              ? Math.min(maxQuantity, Math.max(0, Number(selected[addOn.id] || 0)))
              : selected[addOn.id]
                ? 1
                : 0;
            const priceLabel =
              addOn.priceType === "custom_quote"
                ? "Custom quote"
                : `${addOn.priceType === "from" ? "From " : ""}$${((addOn.priceCents || 0) / 100).toFixed(2)}${quantityControlled && addOn.unit ? ` / ${addOn.unit}` : ""}`;

            return (
              <div key={addOn.id} className={`rounded-xl border p-3 transition ${quantity > 0 ? "border-blue-200 bg-blue-50/50" : "border-slate-200 bg-slate-50"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-slate-800">{addOn.name}</p>
                    <p className="mt-1 text-[10px] leading-4 text-slate-500">{addOn.note}</p>
                    {addOn.adminReview && (
                      <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-amber-600">Admin review</p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs font-black text-blue-700">{priceLabel}</span>
                </div>

                {quantityControlled ? (
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-slate-400">Quantity</span>
                      <span className="mt-0.5 block text-[10px] font-semibold text-slate-400">Max {maxQuantity}</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
                      <button
                        type="button"
                        onClick={() => setAddOn(addOn.id, Math.max(0, quantity - 1))}
                        disabled={quantity <= 0}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-35"
                        aria-label={`Decrease ${addOn.name}`}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="min-w-8 text-center text-sm font-black text-slate-800">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setAddOn(addOn.id, Math.min(maxQuantity, quantity + 1))}
                        disabled={quantity >= maxQuantity}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                        aria-label={`Increase ${addOn.name}`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-600">
                    <input
                      type="checkbox"
                      checked={quantity > 0}
                      onChange={(e) => setAddOn(addOn.id, e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600"
                    />
                    Add to this service
                  </label>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCarpetConfigurator = (standalone: boolean) => {
    if (!cleaningPricingConfig?.carpet.enabled) return null;

    const result = standalone
      ? getStandaloneCarpetPricingResult()
      : getCarpetAddonPricingResult();

    if (!standalone && !formData.carpetEnabled) {
      return (
        <button
          type="button"
          onClick={() => updateField("carpetEnabled", true)}
          className="mb-5 flex w-full items-center justify-between rounded-2xl border border-blue-200 bg-blue-50 p-4 text-left transition hover:border-blue-300"
        >
          <div>
            <p className="text-sm font-black text-blue-800">Add Carpet Steam Cleaning</p>
            <p className="mt-1 text-[11px] text-blue-600">Add carpeted rooms, hallways, stairs, rugs or stain treatment to this booking.</p>
          </div>
          <Plus size={18} className="shrink-0 text-blue-700" />
        </button>
      );
    }

    return (
      <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-black text-slate-800">Carpet Steam Cleaning{standalone ? "" : " Add-On"}</p>
            <p className="mt-1 text-[11px] leading-5 text-slate-500">
              {standalone
                ? `Standalone carpet cleaning has a $${(cleaningPricingConfig.carpet.standaloneMinimumCents / 100).toFixed(0)} minimum.`
                : "Carpet add-on pricing is added to the selected cleaning service."}
            </p>
          </div>
          {!standalone && (
            <button type="button" onClick={() => updateField("carpetEnabled", false)} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-black uppercase text-slate-500">Remove</button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            ["carpetStandardRooms", "Standard Carpeted Rooms", 10],
            ["carpetLargeRooms", "Living / Larger Rooms", 6],
            ["carpetHallways", "Hallways", 6],
            ["carpetStairFlights", "Carpeted Stair Flights", 6],
            ["carpetSmallAreaRugs", "Small Area Rugs", 8],
            ["carpetHeavyStainAreas", "Heavy Stain Areas", 10],
          ].map(([key, label, max]) => (
            <div className="space-y-1.5" key={String(key)}>
              <label className="ml-1 text-[10px] font-black uppercase text-slate-500">{String(label)}</label>
              <select value={formData[String(key)] ?? 0} onChange={(e) => updateField(String(key), Number(e.target.value))} className={cleaningSelectClass}>
                {Array.from({ length: Number(max) + 1 }, (_, n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          ))}

          <div className="space-y-1.5">
            <label className="ml-1 text-[10px] font-black uppercase text-slate-500">Approximate Carpet Condition</label>
            <select value={formData.carpetCondition || "regular"} onChange={(e) => updateField("carpetCondition", e.target.value)} className={cleaningSelectClass}>
              <option value="regular">Regular</option>
              <option value="moderate">Moderate buildup</option>
              <option value="heavy">Heavy</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex min-h-[46px] w-full cursor-pointer items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 text-xs font-bold text-amber-800">
              <input type="checkbox" checked={formData.carpetPetUrineOdor === true} onChange={(e) => updateField("carpetPetUrineOdor", e.target.checked)} className="h-4 w-4 rounded border-amber-300" />
              Pet urine / odour treatment
            </label>
          </div>
        </div>

        {result && (
          <div className={`mt-4 rounded-xl border p-3 ${result.customQuote ? "border-amber-200 bg-amber-50" : "border-blue-100 bg-white"}`}>
            {result.customQuote ? (
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div>
                  <p className="text-xs font-black text-amber-800">Custom quote required</p>
                  <p className="mt-1 text-[11px] text-amber-700">{result.customQuoteReason}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Carpet subtotal</span>
                <span className="text-base font-black text-blue-700">${(result.subtotalCents / 100).toFixed(2)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderCleaningEstimate = (
    label: string,
    result:
      | ReturnType<typeof getStandardPricingResult>
      | ReturnType<typeof getDeepPricingResult>
      | ReturnType<typeof getMoveInOutPricingResult>,
  ) => {
    if (!result) return null;
    const combined = calculatePricing();
    return (
      <div className={`rounded-2xl border p-4 ${combined.customQuote ? "border-amber-200 bg-amber-50" : "border-blue-100 bg-blue-50"}`}>
        {combined.customQuote ? (
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-black text-amber-800">Custom quote required</p>
              <p className="mt-1 text-xs leading-5 text-amber-700">{combined.customQuoteReason}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-blue-600">{label}</p>
              <p className="mt-1 text-xs text-slate-500">Applied tier: {result.packageName}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-black text-blue-700">${combined.total.toFixed(2)}</p>
              <p className="text-[10px] font-bold text-slate-400">incl. {combined.taxLabel}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderServiceFields = () => {
    if (!service) return null;

    if (cleaningPricingScope) {
      if (pricingConfigError) {
        return (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-black text-red-700">Cleaning pricing is unavailable</p>
            <p className="mt-1 text-xs leading-5 text-red-600">{pricingConfigError}</p>
          </div>
        );
      }

      if (!cleaningPricingConfig) {
        return (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm font-bold text-slate-500">
            <Loader2 size={16} className="animate-spin" />
            Loading cleaning pricing…
          </div>
        );
      }

      if (cleaningPricingScope === "standard") {
        const standard = cleaningPricingConfig.services.standard;
        const selectablePackages = standard.packages.filter((pkg) => pkg.customerSelectable);
        const livePricing = getStandardPricingResult();

        return (
          <>
            <div className="mb-6">
              <div className="mb-3">
                <label className="ml-1 text-[11px] font-black uppercase tracking-wider text-slate-500">Choose a starting package</label>
                <p className="ml-1 mt-1 text-[11px] text-slate-400">Your price updates automatically as you change the property size.</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {selectablePackages.map((pkg) => {
                  const selected = formData.standardPackageId === pkg.id;
                  const popular = pkg.id === "complete_standard";
                  return (
                    <button type="button" key={pkg.id} onClick={() => applyStandardPackage(pkg)} className={`relative rounded-2xl border-2 p-4 text-left transition-all ${selected ? "border-blue-600 bg-blue-50 shadow-sm" : "border-slate-200 bg-white hover:border-blue-300"}`}>
                      {popular && <span className="absolute -top-2.5 right-3 rounded-full bg-blue-600 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white">Most Popular</span>}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-slate-800">{pkg.name}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">{pkg.description}</p>
                        </div>
                        <p className="shrink-0 text-lg font-black text-blue-600">${(pkg.basePriceCents / 100).toFixed(0)}</p>
                      </div>
                      {selected && <div className="mt-3 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-blue-700"><CheckCircle2 size={13} /> Selected</div>}
                    </button>
                  );
                })}
              </div>
            </div>
            {renderCleaningPropertyFields()}
            {renderAddOnsConfigurator()}
            {renderCarpetConfigurator(false)}
            {renderCleaningEstimate("Live Standard Cleaning Estimate", livePricing)}
          </>
        );
      }

      if (cleaningPricingScope === "deep") {
        const livePricing = getDeepPricingResult();
        return (
          <>
            <div className="mb-5 rounded-2xl border border-purple-100 bg-purple-50 p-4">
              <p className="text-sm font-black text-purple-900">Deep Cleaning — From ${(cleaningPricingConfig.services.deep.startingPriceCents / 100).toFixed(0)}</p>
              <p className="mt-1 text-xs leading-5 text-purple-700">Dedicated Deep Cleaning tiers and room increments are used. The price is not calculated as a universal Standard + upgrade fee.</p>
            </div>
            {renderCleaningPropertyFields()}
            {renderAddOnsConfigurator()}
            {renderCarpetConfigurator(false)}
            {renderCleaningEstimate("Live Deep Cleaning Estimate", livePricing)}
          </>
        );
      }

      if (cleaningPricingScope === "move_in_out") {
        const livePricing = getMoveInOutPricingResult();
        return (
          <>
            <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-sm font-black text-emerald-900">Move-In / Move-Out — From ${(cleaningPricingConfig.services.move_in_out.startingPriceCents / 100).toFixed(0)}</p>
              <p className="mt-1 text-xs leading-5 text-emerald-700">The closest documented base tier is applied first. Properties with 5+ bedrooms require a custom quote.</p>
            </div>
            {renderCleaningPropertyFields()}
            {renderAddOnsConfigurator()}
            {renderCarpetConfigurator(false)}
            {renderCleaningEstimate("Live Move-In / Move-Out Estimate", livePricing)}
          </>
        );
      }

      return (
        <>
          {renderCleaningPropertyFields()}
          {renderCarpetConfigurator(true)}
          {renderAddOnsConfigurator()}
        </>
      );
    }

    switch (service.service_type) {
      case "vehicle": {
        const vehicleTypes = config.rates ? Object.keys(config.rates) : [];
        const selectedVehicle = formData.vehicle_type || vehicleTypes[0] || "";
        const packages = selectedVehicle && config.rates?.[selectedVehicle] ? Object.keys(config.rates[selectedVehicle]) : [];
        return (
          <>
            <div className="mb-6 space-y-2">
              <label className="ml-1 text-[11px] font-black uppercase text-slate-500">Vehicle Type</label>
              <div className="grid grid-cols-3 gap-2">
                {vehicleTypes.map((vt) => (
                  <button type="button" key={vt} onClick={() => { updateField("vehicle_type", vt); const firstPkg = config.rates?.[vt] ? Object.keys(config.rates[vt])[0] : ""; updateField("package", firstPkg); }} className={`rounded-xl border py-2.5 text-[11px] font-bold capitalize transition-all ${formData.vehicle_type === vt ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-100" : "border-slate-200 bg-white text-slate-500 hover:border-blue-300"}`}>{vt}</button>
                ))}
              </div>
            </div>
            <div className="mb-4 space-y-2">
              <label className="ml-1 text-[11px] font-black uppercase text-slate-500">Package</label>
              <div className="grid grid-cols-3 gap-2">
                {packages.map((pkg) => (
                  <button type="button" key={pkg} onClick={() => updateField("package", pkg)} className={`rounded-xl border py-2.5 text-[11px] font-bold capitalize transition-all ${formData.package === pkg ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-100" : "border-slate-200 bg-white text-slate-500 hover:border-blue-300"}`}>
                    <div>{pkg}</div><div className="mt-0.5 text-[10px] opacity-80">${config.rates?.[selectedVehicle]?.[pkg]}</div>
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
              <label className="ml-1 text-[11px] font-black uppercase text-slate-500">Item Type</label>
              <div className="grid grid-cols-2 gap-2">
                {itemTypes.map((item) => (
                  <button type="button" key={item} onClick={() => updateField("item_type", item)} className={`rounded-xl border py-2.5 text-[11px] font-bold capitalize transition-all ${formData.item_type === item ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-100" : "border-slate-200 bg-white text-slate-500 hover:border-blue-300"}`}>
                    <div>{item}</div><div className="mt-0.5 text-[10px] opacity-80">${config.rates?.[item]}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6 space-y-2">
              <label className="ml-1 text-[11px] font-black uppercase text-slate-500">Quantity</label>
              <div className="flex items-center justify-center gap-6">
                <button type="button" onClick={() => updateField("quantity", Math.max(1, (formData.quantity || 1) - 1))} className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-all hover:bg-white hover:text-blue-600"><Minus size={14} /></button>
                <div className="w-12 text-center text-2xl font-black text-slate-800">{formData.quantity || 1}</div>
                <button type="button" onClick={() => updateField("quantity", (formData.quantity || 1) + 1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-all hover:bg-white hover:text-blue-600"><Plus size={14} /></button>
              </div>
            </div>
          </>
        );
      }

      case "commercial":
        return (
          <>
            <div className="mb-6 space-y-2">
              <label className="ml-1 text-[11px] font-black uppercase text-slate-500">Business Type</label>
              <div className="grid grid-cols-3 gap-2">
                {["office", "retail", "clinic"].map((bt) => <button type="button" key={bt} onClick={() => updateField("sub_type", bt)} className={`rounded-xl border py-2.5 text-[11px] font-bold capitalize transition-all ${formData.sub_type === bt ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-100" : "border-slate-200 bg-white text-slate-500 hover:border-blue-300"}`}>{bt}</button>)}
              </div>
            </div>
            <div className="mb-4 space-y-2">
              <label className="ml-1 text-[11px] font-black uppercase text-slate-500">Area (sq ft)</label>
              <input type="number" min={100} value={formData.area ?? 1000} onChange={(e) => updateField("area", Number(e.target.value))} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold outline-none transition-all focus:ring-2 focus:ring-blue-500" />
              <p className="ml-1 text-[10px] text-slate-400">We&apos;ll discuss exact pricing based on requirements</p>
            </div>
          </>
        );

      default:
        return <div className="py-8 text-center text-sm text-slate-400">Service configuration not available. Please contact support.</div>;
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
            {submittedCustomQuote || submittedForReview
              ? "Request Submitted!"
              : "Booking Request Received!"}
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            {submittedCustomQuote || submittedForReview
              ? "Your request has been received for admin review. We will confirm the final scope and price before the booking is finalized."
              : "Your booking request has been received. Our team will confirm it and assign a cleaner shortly."}
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
        className="relative flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-2xl"
      >
        {/* Header Section */}
        <div className="shrink-0 border-b border-slate-100 bg-white px-4 pb-4 pt-5 sm:px-6 sm:pt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting || isValidatingAddress}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:bg-slate-50 hover:text-slate-700 disabled:opacity-40 sm:right-5 sm:top-5"
            aria-label="Close booking form"
          >
            <X size={17} />
          </button>
          <div className="pr-12">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">Booking details</p>
                <p className="mt-1 text-sm font-black text-slate-900 sm:text-base">{service.title}</p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-blue-700">Step {step} of 4</span>
            </div>
            <div className="mt-4 flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? "bg-blue-600" : "bg-slate-100"}`}
                />
              ))}
            </div>
            <div className="mt-2 hidden grid-cols-4 gap-2 text-center text-[9px] font-bold uppercase tracking-wider text-slate-400 sm:grid">
              {["Customize", "Schedule", "Location", "Review"].map((label, index) => (
                <span key={label} className={index + 1 === step ? "text-blue-600" : ""}>{label}</span>
              ))}
            </div>
          </div>
        </div>

        <div
          ref={modalScrollRef}
          onScroll={(event) => {
            if (step !== 1 || hasReviewedStepOne) return;
            const scroller = event.currentTarget;
            const reachedBottom =
              scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight <= 48;
            if (reachedBottom) setHasReviewedStepOne(true);
          }}
          className="flex-1 overflow-y-auto bg-slate-50/60 p-4 sm:p-6"
        >
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <div className="mb-5">
                  <h2 className="text-2xl font-black text-slate-900">Customize your service</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">Choose the property details and options that match this booking.</p>
                </div>
                {cleaningPricingScope && (
                  <div className="mb-5 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50/80 p-4">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    <p className="text-xs leading-5 text-slate-700">
                      <span className="font-black text-slate-900">Package pricing:</span> your selected service has an included plan. Extra rooms and optional add-ons are charged separately only when selected, and the live estimate updates automatically.
                    </p>
                  </div>
                )}
                {isGuest && (
                  <div className="mb-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-[11px] font-black uppercase text-blue-600 tracking-widest">
                      Your Contact Info
                    </p>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase text-slate-500 ml-1">
                        Full Name
                      </label>
                      <input
                        id="booking-guest-name"
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="John Doe"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-bold text-slate-800 shadow-sm outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-100/70"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase text-slate-500 ml-1">
                        Email
                      </label>
                      <input
                        id="booking-guest-email"
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-bold text-slate-800 shadow-sm outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-100/70"
                      />
                      {guestEmail.length > 0 && !EMAIL_PATTERN.test(guestEmail) && (
                        <p className="ml-1 text-[10px] font-bold text-red-500">Enter a valid email address.</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase text-slate-500 ml-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          id="booking-guest-phone"
                          type="tel"
                          inputMode="tel"
                          maxLength={14}
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(formatCanadianPhone(e.target.value))}
                          placeholder="(403) 555-0123"
                          className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm font-bold text-slate-800 shadow-sm outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-100/70"
                        />
                      </div>
                      {guestPhone.length > 0 && !isValidCanadianPhone(guestPhone) && (
                        <p className="ml-1 text-[10px] font-bold text-red-500">Use a valid Canadian number: (403) 555-0123.</p>
                      )}
                    </div>
                  </div>
                )}
                {!isGuest && cleaningPricingScope && (
                  <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="mb-4 text-[11px] font-black uppercase tracking-widest text-blue-600">
                      Customer Contact
                    </p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="ml-1 text-[11px] font-black uppercase text-slate-500">Full Name</label>
                        <input
                          id="booking-customer-name"
                          type="text"
                          value={formData.customerName || ""}
                          onChange={(e) => updateField("customerName", e.target.value)}
                          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-bold text-slate-800 shadow-sm outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-100/70"
                          placeholder="Customer name"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="ml-1 text-[11px] font-black uppercase text-slate-500">Email</label>
                        <input
                          id="booking-customer-email"
                          type="email"
                          value={formData.customerEmail || ""}
                          onChange={(e) => updateField("customerEmail", e.target.value)}
                          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-bold text-slate-800 shadow-sm outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-100/70"
                          placeholder="you@example.com"
                        />
                        {String(formData.customerEmail || "").length > 0 && !EMAIL_PATTERN.test(String(formData.customerEmail || "")) && (
                          <p className="ml-1 text-[10px] font-bold text-red-500">Enter a valid email address.</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <label className="ml-1 text-[11px] font-black uppercase text-slate-500">Phone Number</label>
                        <input
                          id="booking-customer-phone"
                          type="tel"
                          inputMode="tel"
                          maxLength={14}
                          value={formData.customerPhone || ""}
                          onChange={(e) => updateField("customerPhone", formatCanadianPhone(e.target.value))}
                          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-bold text-slate-800 shadow-sm outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-100/70"
                          placeholder="(403) 555-0123"
                        />
                        {String(formData.customerPhone || "").length > 0 && !isValidCanadianPhone(String(formData.customerPhone || "")) && (
                          <p className="ml-1 text-[10px] font-bold text-red-500">Use a valid Canadian number: (403) 555-0123.</p>
                        )}
                      </div>
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
                        onClick={() => void getCurrentLocation()}
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
                  {cleaningPricingScope
                    ? "Transparent package-based pricing"
                    : "Select your preferred billing method"}
                </p>

                {cleaningPricingScope ? (
                  <div className="mb-8 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                    <ClipboardList className="h-5 w-5 shrink-0 text-blue-600" />
                    <div>
                      <p className="text-xs font-black text-slate-800">
                        Fixed cleaning price
                      </p>
                      <p className="mt-1 text-[11px] leading-5 text-slate-500">
                        The central pricing rules apply the correct service tier, additional areas and carpet charges automatically.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
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
                            type="button"
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
                            type="button"
                            onClick={() => setHours((h) => h + 1)}
                            className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-white hover:text-blue-600 transition-all"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {(() => {
                  const {
                    lineItems,
                    subtotal,
                    tax,
                    total,
                    taxRate = 0,
                    taxLabel = "Tax",
                    customQuote,
                    customQuoteReason,
                  } = calculatePricing();
                  return (
                    <div className="space-y-3 px-2">
                      {customQuote ? (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                            <div>
                              <p className="text-sm font-black text-amber-800">
                                Custom quote required
                              </p>
                              <p className="mt-1 text-xs leading-5 text-amber-700">
                                {customQuoteReason ||
                                  "Camz Cleaning will review this property before confirming the final price."}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : lineItems.length === 0 ? (
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
                              <span>
                                {taxLabel} ({(taxRate * 100).toFixed(0)}%)
                              </span>
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
                  Review every section before submitting
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
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-1">
                          Selected Service
                        </p>
                        <p className="text-base font-black text-slate-800">
                          {service.title}
                        </p>
                        {cleaningPricingScope !== "carpet" && (() => {
                          const applied = getStandardPricingResult() || getDeepPricingResult() || getMoveInOutPricingResult();
                          return applied ? (
                            <p className="mt-1 text-xs font-semibold text-slate-500">
                              {applied.packageName}
                            </p>
                          ) : null;
                        })()}
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-[10px] font-black text-blue-700 hover:bg-blue-100"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                        Customer & Property
                      </p>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="rounded-lg border border-blue-100 bg-white px-2.5 py-1.5 text-[10px] font-black text-blue-600 hover:bg-blue-50 hover:text-blue-800"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Customer</p>
                        <p className="mt-1 text-sm font-bold text-slate-800">
                          {isGuest ? guestName : formData.customerName || user?.user_metadata?.name || user?.user_metadata?.full_name || "Not provided"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Property Type</p>
                        <p className="mt-1 text-sm font-bold capitalize text-slate-800">
                          {String(formData.propertyType || "Not provided").replaceAll("_", " ")}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Condition</p>
                        <p className="mt-1 text-sm font-bold capitalize text-slate-800">
                          {String(formData.propertyCondition || "Not provided").replaceAll("_", " ")}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Property Size</p>
                        <p className="mt-1 text-sm font-bold text-slate-800">
                          {cleaningPricingScope === "carpet"
                            ? `${getStandaloneCarpetPricingResult() ? carpetAreaCount(getStandaloneCarpetPricingResult()!.selection) : 0} carpet area(s)`
                            : cleaningPricingScope
                              ? `${Number(formData.bedrooms || 0)} bed, ${Number(formData.fullBathrooms || 0)} full bath${Number(formData.halfBathrooms || 0) ? `, ${Number(formData.halfBathrooms || 0)} half bath` : ""}`
                              : "See service details below"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                        Schedule & Address
                      </p>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="rounded-lg border border-blue-100 bg-white px-2.5 py-1.5 text-[10px] font-black text-blue-600 hover:bg-blue-50 hover:text-blue-800"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-blue-600 shrink-0" />
                        <p className="text-sm font-bold text-slate-800">
                          {date ? date.format("MMM DD, YYYY") : "Not set"} · {time ? time.format("hh:mm A") : "Not set"}
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin size={16} className="mt-0.5 shrink-0 text-blue-600" />
                        <div>
                          <p className="text-sm font-bold text-slate-800 break-words">{location || "Not set"}</p>
                          {validatedPostalCode && (
                            <p className="mt-1 text-[11px] font-semibold text-slate-500">Postal code: {validatedPostalCode}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                        Service Customization
                      </p>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="rounded-lg border border-blue-100 bg-white px-2.5 py-1.5 text-[10px] font-black text-blue-600 hover:bg-blue-50 hover:text-blue-800"
                      >
                        Edit
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {cleaningPricingScope && cleaningPricingScope !== "carpet" && [
                        ["Bedrooms", formData.bedrooms],
                        ["Full bathrooms", formData.fullBathrooms],
                        ["Half bathrooms", formData.halfBathrooms],
                        ["Kitchens", formData.kitchens],
                        ["Living / family rooms", formData.livingRooms],
                        ["Finished basement", formData.finishedBasement],
                        ["Stair flights", formData.stairFlights],
                      ].map(([label, value]) => (
                        <div key={String(label)} className="min-w-0 rounded-xl border border-slate-200 bg-white p-3">
                          <span className="block text-[10px] font-bold uppercase leading-4 tracking-wide text-slate-400">{label}</span>
                          <span className="mt-1 block text-lg font-black leading-none text-slate-800">{Number(value || 0)}</span>
                        </div>
                      ))}
                    </div>

                    {!cleaningPricingScope && (
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {Object.entries(formData)
                          .filter(([key]) => !["customerName", "customerEmail", "customerPhone", "additionalInstructions"].includes(key))
                          .map(([key, value]) => (
                            <div key={key} className="min-w-0 rounded-xl border border-slate-200 bg-white p-3">
                              <span className="block text-[10px] font-bold uppercase leading-4 tracking-wide text-slate-400">{key.replaceAll("_", " ")}</span>
                              <span className="mt-1 block break-words text-sm font-black capitalize text-slate-800">
                                {typeof value === "boolean" ? (value ? "Yes" : "No") : String(value ?? "")}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}

                    {getAddOnPricingResult()?.lineItems.length ? (
                      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                        <p className="mb-2 text-[10px] font-black uppercase text-slate-400">Selected add-ons</p>
                        <div className="space-y-1.5">
                          {getAddOnPricingResult()?.lineItems.map((item) => (
                            <div key={`summary-addon-${item.id}`} className="flex justify-between gap-3 text-xs">
                              <span className="text-slate-600">{item.label}{item.quantity > 1 ? ` × ${item.quantity}` : ""}</span>
                              <span className="font-black text-slate-800">${(item.amountCents / 100).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {getCarpetAddonPricingResult()?.lineItems.some((item) => item.amountCents > 0) && (
                      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                        <p className="mb-2 text-[10px] font-black uppercase text-slate-400">Carpet services</p>
                        <div className="space-y-1.5">
                          {getCarpetAddonPricingResult()?.lineItems.filter((item) => item.amountCents > 0).map((item) => (
                            <div key={`summary-carpet-${item.key}`} className="flex justify-between gap-3 text-xs">
                              <span className="text-slate-600">{item.label}{item.quantity > 1 ? ` × ${item.quantity}` : ""}</span>
                              <span className="font-black text-slate-800">${(item.amountCents / 100).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {formData.additionalInstructions && (
                      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                        <p className="text-[10px] font-black uppercase text-slate-400">Additional instructions</p>
                        <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-slate-600">{formData.additionalInstructions}</p>
                      </div>
                    )}
                    {conditionPhotos.length > 0 && (
                      <p className="mt-3 text-[11px] font-bold text-amber-700">{conditionPhotos.length} condition photo(s) attached for review.</p>
                    )}
                  </div>

                  {(() => {
                    const pricing = calculatePricing();
                    return (
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Price Summary</p>
                          <button
                            type="button"
                            onClick={() => setStep(3)}
                            className="rounded-lg border border-blue-100 bg-white px-2.5 py-1.5 text-[10px] font-black text-blue-600 hover:bg-blue-50 hover:text-blue-800"
                          >
                            Edit
                          </button>
                        </div>

                        <div className="space-y-2">
                          {pricing.lineItems.map((item, index) => (
                            <div key={`${item.label}-${index}`} className="flex justify-between gap-3 text-xs">
                              <span className="text-slate-500">{item.label}</span>
                              <span className="font-bold text-slate-800">${item.amount.toFixed(2)}</span>
                            </div>
                          ))}
                          <div className="flex justify-between gap-3 border-t border-slate-100 pt-2 text-xs">
                            <span className="font-bold text-slate-500">Subtotal</span>
                            <span className="font-black text-slate-800">${pricing.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between gap-3 text-xs">
                            <span className="font-bold text-slate-500">{pricing.taxLabel}{pricing.taxRate > 0 ? ` (${(pricing.taxRate * 100).toFixed(0)}%)` : ""}</span>
                            <span className="font-black text-slate-800">${pricing.tax.toFixed(2)}</span>
                          </div>

                          {pricing.customQuote || pricing.adminReviewRequired ? (
                            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                              <p className="text-xs font-black text-amber-800">
                                {pricing.customQuote ? "Custom quote required" : "Admin review required"}
                              </p>
                              <p className="mt-1 text-[11px] leading-5 text-amber-700">
                                {pricing.customQuoteReason || "Our team will review the details before confirming the booking."}
                              </p>
                              {pricing.estimatedTotal !== undefined && pricing.estimatedTotal > 0 && (
                                <div className="mt-2 flex justify-between border-t border-amber-200 pt-2 text-xs">
                                  <span className="font-bold text-amber-700">Calculated estimate</span>
                                  <span className="font-black text-amber-900">${pricing.estimatedTotal.toFixed(2)}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                              <span className="text-sm font-black uppercase tracking-tight text-slate-800">Final Total</span>
                              <span className="text-xl font-black text-blue-600">${pricing.total.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Important service notes</p>
                    <ul className="mt-2 space-y-1.5 text-[11px] leading-5 text-slate-600">
                      <li>• Final price and scope are shown before confirmation whenever instant booking is available.</li>
                      <li>• Heavy, unusual, or restoration-level work may require admin review or a custom quote.</li>
                      <li>• If review is required, the booking is not treated as confirmed until Camz Cleaning approves it.</li>
                      <li>• Changes or cancellation requests should be made as early as possible before the scheduled service time.</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="sticky bottom-0 z-20 -mx-4 -mb-4 mt-8 flex gap-3 border-t border-slate-200 bg-white/95 px-4 py-4 shadow-[0_-10px_28px_rgba(15,23,42,0.08)] backdrop-blur sm:-mx-6 sm:-mb-6 sm:px-6">
            <button
              onClick={step === 1 ? onClose : prevStep}
              disabled={isSubmitting || isValidatingAddress} // Update back button state too
              className="min-w-[92px] px-4 sm:px-6 py-3 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-black hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === 1 ? "Cancel" : "Back"}
            </button>
            <button
              onClick={step === totalSteps ? handleConfirm : nextStep}
              disabled={
                isSubmitting ||
                isValidatingAddress ||
                loadingLocation ||
                (step !== 1 && !isStepValid())
              }
              className={`flex-1 py-3 rounded-xl text-white text-xs font-black flex items-center justify-center gap-2 shadow-xl shadow-blue-200 transition-all ${
                isSubmitting ||
                isValidatingAddress ||
                loadingLocation ||
                (step !== 1 && !isStepValid())
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
                    ? (calculatePricing().customQuote || calculatePricing().adminReviewRequired
                        ? "Submit Request"
                        : "Submit Booking")
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
