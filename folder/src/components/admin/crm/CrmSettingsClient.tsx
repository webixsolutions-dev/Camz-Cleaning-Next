"use client";

import { FormEvent, useEffect, useState } from "react";
import CrmAddressAutocomplete, { type GoogleAddressSelection } from "./CrmAddressAutocomplete";

type Settings = {
  legal_name: string;
  trade_name: string;
  email: string | null;
  reply_to_email: string | null;
  phone: string | null;
  website: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  tax_number: string | null;
  default_tax_bps: number;
  default_currency: string;
  invoice_number_prefix: string;
  next_invoice_seq: number;
  deposit_percentage: number;
  e_transfer_instructions: string | null;
  invoice_footer_text: string | null;
  default_customer_note: string | null;
  default_due_terms: string | null;
  default_due_days: number;
  timezone: string;
  logo_url: string | null;
};

const fieldClass =
  "min-h-11 w-full max-w-full rounded-xl border border-slate-200 bg-white px-3.5 text-[16px] font-medium text-slate-700 outline-none transition focus:border-[#4A86F7] focus:ring-4 focus:ring-[#4A86F7]/10 sm:text-[14px]";

const TIMEZONES = ["America/Edmonton", "America/Vancouver", "America/Winnipeg", "America/Toronto", "America/Halifax", "UTC"];

export default function CrmSettingsClient({ isAdmin }: { isAdmin: boolean }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [gstPercent, setGstPercent] = useState("5");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/admin/crm/settings", { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Failed to load settings");
        const data = payload.settings as Settings;
        setSettings({
          ...data,
          deposit_percentage: data.deposit_percentage ?? 25,
          default_due_days: data.default_due_days ?? 14,
          timezone: data.timezone || "America/Edmonton",
        });
        setGstPercent(String(((data.default_tax_bps || 0) / 100).toFixed(2)).replace(/\.00$/, ""));
      } catch (err) {
        console.error("CRM settings load failed:", err);
        setError(err instanceof Error ? err.message : "Unable to load settings");
      }
    };
    void load();
  }, []);

  const update = (key: keyof Settings, value: string | number | null) => {
    setSettings((current) => (current ? { ...current, [key]: value } : current));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!settings || !isAdmin) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/crm/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...settings,
          display_name: settings.trade_name,
          default_gst_percent: gstPercent,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Save failed");
      setSettings(payload.settings);
      setMessage("Company settings saved.");
    } catch (err) {
      console.error("CRM settings save failed:", err);
      setError(err instanceof Error ? err.message : "Unable to save settings");
    } finally {
      setSaving(false);
    }
  };

  const uploadLogo = async (file: File | undefined) => {
    if (!file || !isAdmin) return;
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/crm/settings/logo", { method: "POST", body });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Logo upload failed");
      setSettings(payload.settings);
      setMessage("Logo uploaded.");
    } catch (err) {
      console.error("CRM logo upload failed:", err);
      setError(err instanceof Error ? err.message : "Unable to upload logo");
    } finally {
      setUploading(false);
    }
  };

  if (!settings) {
    return <p className="p-4 text-[15px] text-slate-500 sm:p-6">{error || "Loading settings..."}</p>;
  }

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-3xl min-w-0 overflow-x-hidden p-4 sm:p-6">
      <h1 className="text-slate-900">Company settings</h1>
      <p className="mt-1 mb-5 text-[15px] leading-6 text-slate-500">
        Invoice letterhead, numbering, tax, and defaults. Only admins can change these.
      </p>
      {error ? <p className="mb-3 rounded-xl bg-rose-50 px-3 py-2 text-[14px] text-rose-700">{error}</p> : null}
      {message ? <p className="mb-3 rounded-xl bg-emerald-50 px-3 py-2 text-[14px] text-emerald-700">{message}</p> : null}

      <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <h2 className="mb-3 text-slate-900">Brand</h2>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            {settings.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.logo_url} alt="Company logo" className="h-full w-full object-contain" />
            ) : (
              <span className="text-[12px] text-slate-400">Logo</span>
            )}
          </div>
          <label className="min-w-0 flex-1 text-[13px] font-semibold text-slate-500">
            Logo
            <input
              className="mt-1 block w-full min-w-0 text-[14px] file:mr-3 file:min-h-11 file:rounded-xl file:border-0 file:bg-[#4A86F7] file:px-4 file:text-[13px] file:font-bold file:text-white"
              type="file"
              accept="image/*"
              disabled={!isAdmin || uploading}
              onChange={(event) => void uploadLogo(event.target.files?.[0])}
            />
          </label>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-[13px] font-semibold text-slate-500">
            Display name
            <input className={`${fieldClass} mt-1`} value={settings.trade_name} disabled={!isAdmin} onChange={(event) => update("trade_name", event.target.value)} />
          </label>
          <label className="text-[13px] font-semibold text-slate-500">
            Legal name
            <input className={`${fieldClass} mt-1`} value={settings.legal_name} disabled={!isAdmin} onChange={(event) => update("legal_name", event.target.value)} />
          </label>
        </div>
      </section>

      <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <h2 className="mb-3 text-slate-900">Contact and address</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-[13px] font-semibold text-slate-500 sm:col-span-2">
            Address
            <CrmAddressAutocomplete
              value={settings.address_line1 || ""}
              disabled={!isAdmin}
              inputClassName={`${fieldClass} mt-1 pr-10`}
              placeholder="Start typing the company address"
              onChange={(value) => update("address_line1", value)}
              onSelect={(address: GoogleAddressSelection) => {
                setSettings((current) => current ? {
                  ...current,
                  address_line1: address.line1,
                  address_line2: address.unit || current.address_line2,
                  city: address.city,
                  province: address.province,
                  postal_code: address.postal_code,
                } : current);
              }}
            />
          </label>
          <label className="text-[13px] font-semibold text-slate-500 sm:col-span-2">
            Address line 2
            <input className={`${fieldClass} mt-1`} value={settings.address_line2 || ""} disabled={!isAdmin} onChange={(event) => update("address_line2", event.target.value)} />
          </label>
          <input className={fieldClass} placeholder="City" value={settings.city || ""} disabled={!isAdmin} onChange={(event) => update("city", event.target.value)} />
          <input className={fieldClass} placeholder="Province" value={settings.province || ""} disabled={!isAdmin} onChange={(event) => update("province", event.target.value)} />
          <input className={fieldClass} placeholder="Postal code" value={settings.postal_code || ""} disabled={!isAdmin} onChange={(event) => update("postal_code", event.target.value)} />
          <input className={fieldClass} placeholder="Phone" value={settings.phone || ""} disabled={!isAdmin} onChange={(event) => update("phone", event.target.value)} />
          <input className={fieldClass} type="email" placeholder="Email" value={settings.email || ""} disabled={!isAdmin} onChange={(event) => update("email", event.target.value)} />
          <input className={fieldClass} type="email" placeholder="Reply-to email" value={settings.reply_to_email || ""} disabled={!isAdmin} onChange={(event) => update("reply_to_email", event.target.value)} />
          <input className={`${fieldClass} sm:col-span-2`} placeholder="Website" value={settings.website || ""} disabled={!isAdmin} onChange={(event) => update("website", event.target.value)} />
        </div>
      </section>

      <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <h2 className="mb-3 text-slate-900">Tax, money, and numbering</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-[13px] font-semibold text-slate-500">
            GST number
            <input className={`${fieldClass} mt-1`} value={settings.tax_number || ""} disabled={!isAdmin} onChange={(event) => update("tax_number", event.target.value)} />
          </label>
          <label className="text-[13px] font-semibold text-slate-500">
            Default GST rate (%)
            <input className={`${fieldClass} mt-1`} inputMode="decimal" value={gstPercent} disabled={!isAdmin} onChange={(event) => setGstPercent(event.target.value)} />
          </label>
          <label className="text-[13px] font-semibold text-slate-500">
            Currency
            <select className={`${fieldClass} mt-1`} value={settings.default_currency} disabled={!isAdmin} onChange={(event) => update("default_currency", event.target.value)}>
              <option value="CAD">CAD</option>
              <option value="USD">USD</option>
            </select>
          </label>
          <label className="text-[13px] font-semibold text-slate-500">
            Timezone
            <select className={`${fieldClass} mt-1`} value={settings.timezone} disabled={!isAdmin} onChange={(event) => update("timezone", event.target.value)}>
              {TIMEZONES.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[13px] font-semibold text-slate-500">
            Invoice prefix
            <input className={`${fieldClass} mt-1`} value={settings.invoice_number_prefix} disabled={!isAdmin} onChange={(event) => update("invoice_number_prefix", event.target.value)} placeholder="CAMZ-" />
          </label>
          <label className="text-[13px] font-semibold text-slate-500">
            Next invoice number
            <input
              className={`${fieldClass} mt-1`}
              type="number"
              min={settings.next_invoice_seq}
              value={settings.next_invoice_seq}
              disabled={!isAdmin}
              onChange={(event) => update("next_invoice_seq", Number(event.target.value || settings.next_invoice_seq))}
            />
          </label>
          <label className="text-[13px] font-semibold text-slate-500">
            Deposit %
            <input className={`${fieldClass} mt-1`} type="number" min={0} max={100} value={settings.deposit_percentage} disabled={!isAdmin} onChange={(event) => update("deposit_percentage", Number(event.target.value || 0))} />
          </label>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-slate-500">
          Numbers are locked in Postgres when an invoice is issued. You can raise the next number, not lower it, so a voided invoice never recycles its number.
        </p>
      </section>

      <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <h2 className="mb-3 text-slate-900">Invoice defaults</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-[13px] font-semibold text-slate-500">
            Default due days
            <input className={`${fieldClass} mt-1`} type="number" min={0} max={365} value={settings.default_due_days} disabled={!isAdmin} onChange={(event) => update("default_due_days", Number(event.target.value || 0))} />
          </label>
          <label className="text-[13px] font-semibold text-slate-500">
            Default due terms
            <input className={`${fieldClass} mt-1`} value={settings.default_due_terms || ""} disabled={!isAdmin} onChange={(event) => update("default_due_terms", event.target.value)} placeholder="Net 14" />
          </label>
          <label className="text-[13px] font-semibold text-slate-500 sm:col-span-2">
            Default customer note
            <textarea className={`${fieldClass} mt-1 min-h-24 py-2`} value={settings.default_customer_note || ""} disabled={!isAdmin} onChange={(event) => update("default_customer_note", event.target.value)} />
          </label>
          <label className="text-[13px] font-semibold text-slate-500 sm:col-span-2">
            E-transfer instructions
            <textarea className={`${fieldClass} mt-1 min-h-24 py-2`} value={settings.e_transfer_instructions || ""} disabled={!isAdmin} onChange={(event) => update("e_transfer_instructions", event.target.value)} />
          </label>
          <label className="text-[13px] font-semibold text-slate-500 sm:col-span-2">
            Invoice footer text
            <textarea className={`${fieldClass} mt-1 min-h-24 py-2`} value={settings.invoice_footer_text || ""} disabled={!isAdmin} onChange={(event) => update("invoice_footer_text", event.target.value)} />
          </label>
        </div>
      </section>

      <button
        type="submit"
        disabled={!isAdmin || saving}
        className="min-h-12 w-full rounded-xl bg-[#4A86F7] px-4 text-[15px] font-bold text-white disabled:opacity-50 sm:w-auto"
      >
        {saving ? "Saving..." : "Save settings"}
      </button>
    </form>
  );
}
