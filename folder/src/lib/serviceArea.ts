export const SERVICE_CITIES = [
  "Calgary",
  "Airdrie",
  "Cochrane",
  "Chestermere",
] as const;

export const SERVICE_AREA_LABEL =
  "Calgary, Airdrie, Cochrane and Chestermere, Alberta";

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function isSupportedAddress(address: string) {
  const value = normalize(address);
  if (!value) return false;

  return SERVICE_CITIES.some((city) =>
    value.includes(city.toLowerCase()),
  );
}

export function isSupportedCoordinates(lat: number, lng: number) {
  // Broad Calgary-region box covering the four advertised service cities.
  return lat >= 50.78 && lat <= 51.36 && lng >= -114.58 && lng <= -113.68;
}

// ---> STRICT CODE VALIDATION (No API needed, No Fetch Errors) <---
export async function validateAddressWithAPI(address: string): Promise<boolean> {
  // BookingModal async function call kar raha hai, is liye humne isko async rakha hai
  if (!address || address.trim().length < 3) return false;

  const value = normalize(address);

  // 1. Blacklist: Fake countries/cities block list
  const blacklistedWords = [
    "india", "usa", "dubai", "uk", "australia", "pakistan", 
    "united states", "florida", "texas", "california", "ontario", "toronto"
  ];
  
  const hasBlacklistedWord = blacklistedWords.some((word) =>
    new RegExp(`\\b${word}\\b`).test(value)
  );
  
  if (hasBlacklistedWord) {
    return false; // Agar India/USA waghera likha hai toh seedha reject
  }

  // 2. City Check: In 4 cities mein se koi ek hona lazmi hai
  const hasCity = SERVICE_CITIES.some((city) =>
    value.includes(city.toLowerCase())
  );
  
  if (!hasCity) {
    return false;
  }

  // 3. Province or Postal Code Check
  // Calgary / Alberta ke postal codes hamesha 'T' se shuru hote hain (e.g. T2P 1J9)
  const albertaPostalRegex = /t\d[a-z]\s?\d[a-z]\d/i;
  const hasPostalCode = albertaPostalRegex.test(value);
  
  // Province (AB/Alberta) ya Country (Canada) address mein likha ho
  const hasProvinceOrCountry = /\b(ab|alberta|canada)\b/.test(value);

  // Validation Success: City ho, blacklist na ho, aur (Postal code YA Province) ho
  return hasPostalCode || hasProvinceOrCountry;
}