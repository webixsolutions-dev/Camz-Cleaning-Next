"use client";

import { MapPin, Search } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";

export type GoogleAddressSelection = {
  formatted_address: string;
  street_number: string;
  route: string;
  line1: string;
  line2: string;
  unit: string;
  access_detail: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  place_id: string;
  latitude: number | null;
  longitude: number | null;
};

type Suggestion = {
  place_id: string;
  text: string;
  main_text: string;
  secondary_text: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSelect: (address: GoogleAddressSelection) => void;
  disabled?: boolean;
  required?: boolean;
  inputClassName: string;
  inputStyle?: CSSProperties;
  placeholder?: string;
};

function newSessionToken() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function CrmAddressAutocomplete({
  value,
  onChange,
  onSelect,
  disabled = false,
  required = false,
  inputClassName,
  inputStyle,
  placeholder = "Start typing an address",
}: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [typedValue, setTypedValue] = useState(value);
  const sessionToken = useRef(newSessionToken());
  const skipNextLookup = useRef(false);

  useEffect(() => {
    setTypedValue(value);
  }, [value]);

  useEffect(() => {
    if (disabled || skipNextLookup.current) {
      skipNextLookup.current = false;
      return;
    }
    const query = typedValue.trim();
    if (query.length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/admin/crm/address?action=autocomplete&q=${encodeURIComponent(query)}&session_token=${encodeURIComponent(sessionToken.current)}`,
          { cache: "no-store", signal: controller.signal },
        );
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || "Address suggestions unavailable.");
        setSuggestions(payload.suggestions || []);
        setOpen(Boolean(payload.suggestions?.length));
      } catch (err) {
        if (controller.signal.aborted) return;
        setSuggestions([]);
        setOpen(false);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [disabled, typedValue]);

  const choose = async (suggestion: Suggestion) => {
    setLoading(true);
    setOpen(false);
    setSuggestions([]);
    skipNextLookup.current = true;
    setTypedValue(suggestion.text);
    onChange(suggestion.text);
    try {
      const response = await fetch(
        `/api/admin/crm/address?action=details&place_id=${encodeURIComponent(suggestion.place_id)}&session_token=${encodeURIComponent(sessionToken.current)}`,
        { cache: "no-store" },
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.address) throw new Error(payload.error || "Address details unavailable.");
      onSelect(payload.address as GoogleAddressSelection);
    } catch (err) {
    } finally {
      setLoading(false);
      sessionToken.current = newSessionToken();
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          className={inputClassName}
          style={inputStyle}
          value={typedValue}
          disabled={disabled}
          required={required}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          placeholder={placeholder}
          onFocus={() => suggestions.length && setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          onChange={(event) => {
            const next = event.target.value;
            setTypedValue(next);
            onChange(next);
                }}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          {loading ? <span className="block h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-[#4A86F7]" /> : <Search size={15} />}
        </span>
      </div>

      {open ? (
        <div role="listbox" className="absolute z-[80] mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              type="button"
              role="option"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => void choose(suggestion)}
              className="flex w-full items-start gap-3 border-b border-slate-100 px-3 py-3 text-left last:border-0 hover:bg-blue-50"
            >
              <MapPin size={15} className="mt-0.5 shrink-0 text-[#4A86F7]" />
              <span className="min-w-0">
                <span className="block text-[12px] font-semibold text-slate-800">{suggestion.main_text}</span>
                <span className="block truncate text-[11px] text-slate-500">{suggestion.secondary_text}</span>
              </span>
            </button>
          ))}
          <p className="bg-slate-50 px-3 py-2 text-right text-[10px] font-semibold text-slate-400">Powered by Google</p>
        </div>
      ) : null}

    </div>
  );
}
