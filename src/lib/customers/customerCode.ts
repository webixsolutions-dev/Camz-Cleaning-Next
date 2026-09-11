export function normalizeCustomerCode(value: unknown) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits || digits.length > 4) return null;
  return digits.padStart(4, "0");
}

export function isCustomerCode(value: unknown) {
  return normalizeCustomerCode(value) !== null && String(value ?? "").replace(/\D/g, "").length > 0;
}
