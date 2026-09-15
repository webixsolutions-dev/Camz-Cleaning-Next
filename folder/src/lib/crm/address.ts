export type AddressInput = {
  id?: string;
  label?: string;
  line1?: string;
  line2?: string;
  formatted_address?: string;
  street_number?: string;
  route?: string;
  unit?: string;
  access_detail?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
  place_id?: string;
  latitude?: number | null;
  longitude?: number | null;
  is_billing?: boolean;
  is_service?: boolean;
};

export function normalizeAddress(input: AddressInput) {
  const line1 = input.line1?.trim();
  if (!line1) return null;
  return {
    label: input.label?.trim() || "Billing",
    line1,
    line2: input.line2?.trim() || null,
    formatted_address: input.formatted_address?.trim() || null,
    street_number: input.street_number?.trim() || null,
    route: input.route?.trim() || null,
    unit: input.unit?.trim() || null,
    access_detail: input.access_detail?.trim() || null,
    city: input.city?.trim() || null,
    province: input.province?.trim() || null,
    postal_code: input.postal_code?.trim() || null,
    country: input.country?.trim() || "CA",
    place_id: input.place_id?.trim() || null,
    latitude: Number.isFinite(input.latitude) ? input.latitude : null,
    longitude: Number.isFinite(input.longitude) ? input.longitude : null,
    is_billing: input.is_billing !== false,
    is_service: input.is_service !== false,
  };
}

export function formatAddress(address: {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  province?: string | null;
  postal_code?: string | null;
} | null | undefined) {
  if (!address) return "";
  return [address.line1, address.line2, address.city, address.province, address.postal_code]
    .filter(Boolean)
    .join(", ");
}
