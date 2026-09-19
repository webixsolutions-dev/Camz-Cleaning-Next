"use client";

import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, BadgeDollarSign, Plus, RefreshCcw, Save, Trash2 } from "lucide-react";
import {
  AddOnPricing,
  CleaningPricingConfig,
  DEFAULT_CLEANING_PRICING_CONFIG,
  PRICING_AREA_LABELS,
  PRICING_SCOPE_LABELS,
  PricingAreaKey,
  PricingScope,
  PricingServiceKey,
} from "@/lib/pricing/config";

type LoadState = "loading" | "ready" | "saving" | "error";

const SERVICE_KEYS: PricingServiceKey[] = ["standard", "deep", "move_in_out"];
const AREA_KEYS = Object.keys(PRICING_AREA_LABELS) as PricingAreaKey[];
const SCOPE_KEYS = Object.keys(PRICING_SCOPE_LABELS) as PricingScope[];

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const dollars = (cents: number | null | undefined) => ((Number(cents) || 0) / 100).toFixed(2);
const cents = (value: string) => Math.max(0, Math.round((Number(value) || 0) * 100));

export default function PricingSettingsClient() {
  const [config, setConfig] = useState<CleaningPricingConfig | null>(null);
  const [version, setVersion] = useState(1);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [message, setMessage] = useState("Loading pricing settings…");

  const load = useCallback(async () => {
    setState("loading");
    setMessage("Loading pricing settings…");
    try {
      const response = await fetch("/api/admin/pricing-settings", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to load pricing settings.");
      setConfig(body.config);
      setVersion(Number(body.version) || 1);
      setUpdatedAt(body.updatedAt || null);
      setState("ready");
      setMessage("Pricing settings are loaded from the database.");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Unable to load pricing settings.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const update = (mutator: (draft: CleaningPricingConfig) => void) => {
    setConfig(current => {
      if (!current) return current;
      const next = clone(current);
      mutator(next);
      return next;
    });
    if (state !== "saving") setMessage("Unsaved changes.");
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!config || state === "saving") return;
    setState("saving");
    setMessage("Saving pricing settings…");
    try {
      const response = await fetch("/api/admin/pricing-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config, version }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to save pricing settings.");
      setConfig(body.config);
      setVersion(Number(body.version) || version + 1);
      setUpdatedAt(body.updatedAt || null);
      setState("ready");
      setMessage("Pricing settings saved successfully.");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Unable to save pricing settings.");
    }
  };

  const resetDefaults = () => {
    if (!window.confirm("Reset the form to the Phase 1 master pricing defaults? You still need to click Save to persist them.")) return;
    setConfig(clone(DEFAULT_CLEANING_PRICING_CONFIG));
    setState("ready");
    setMessage("Master defaults loaded. Click Save to persist them.");
  };

  const lastUpdated = useMemo(() => {
    if (!updatedAt) return "Not available";
    const parsed = new Date(updatedAt);
    return Number.isNaN(parsed.getTime()) ? updatedAt : parsed.toLocaleString();
  }, [updatedAt]);

  if (!config) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className={state === "error" ? "text-red-500" : "text-[#4A86F7]"} size={22} />
            <div>
              <h2 className="font-bold text-[#13263A]">Pricing Settings</h2>
              <p className="mt-1 text-sm text-slate-500">{message}</p>
            </div>
          </div>
          {state === "error" && (
            <button type="button" onClick={() => void load()} className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-[#0B4E9B] px-4 text-sm font-bold text-white">
              <RefreshCcw size={16} /> Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={save} className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px] space-y-6">
        <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#4A86F7]"><BadgeDollarSign size={20} /><span className="text-xs font-extrabold uppercase tracking-[0.18em]">Phase 1</span></div>
            <h1 className="mt-2 text-2xl font-extrabold text-[#13263A] sm:text-3xl">Cleaning Pricing Configuration</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">Database-driven master pricing for packages, room allowances, additional-area charges, add-ons, carpet pricing, tax, inclusion rules and review/custom-quote controls.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={resetDefaults} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"><RefreshCcw size={15} /> Load master defaults</button>
            <button type="submit" disabled={state === "saving"} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0B4E9B] px-5 text-sm font-bold text-white disabled:opacity-50"><Save size={16} />{state === "saving" ? "Saving…" : "Save settings"}</button>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card title="Tax & Currency">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <ReadOnlyField label="Currency" value={config.currency} />
              <TextInput label="Tax label" value={config.tax.label} onChange={value => update(draft => { draft.tax.label = value; })} />
              <NumberInput label="Tax rate (%)" value={(config.tax.rate * 100).toString()} step="0.01" onChange={value => update(draft => { draft.tax.rate = Math.max(0, Number(value) || 0) / 100; })} />
              <Toggle label="Apply tax" checked={config.tax.enabled} onChange={value => update(draft => { draft.tax.enabled = value; })} />
            </div>
          </Card>

          <Card title="Custom Quote Rules">
            <div className="space-y-3">
              <NumberInput label="Bedroom threshold" value={String(config.customQuote.bedroomThreshold)} min="1" step="1" onChange={value => update(draft => { draft.customQuote.bedroomThreshold = Math.max(1, Math.trunc(Number(value) || 1)); })} />
              <Toggle label="Custom quotes enabled" checked={config.customQuote.enabled} onChange={value => update(draft => { draft.customQuote.enabled = value; })} />
              <Toggle label="Unusual layouts require review" checked={config.customQuote.unusualLayoutRequiresReview} onChange={value => update(draft => { draft.customQuote.unusualLayoutRequiresReview = value; })} />
              <Toggle label="Unsafe / complex jobs require review" checked={config.customQuote.unsafeOrComplexRequiresReview} onChange={value => update(draft => { draft.customQuote.unsafeOrComplexRequiresReview = value; })} />
              <Toggle label="Pet urine / odour requires quote" checked={config.customQuote.petUrineOdorRequiresQuote} onChange={value => update(draft => { draft.customQuote.petUrineOdorRequiresQuote = value; })} />
            </div>
          </Card>

          <Card title="Heavy Condition Review">
            <div className="space-y-3">
              <Toggle label="Heavy-condition flow enabled" checked={config.heavyCondition.enabled} onChange={value => update(draft => { draft.heavyCondition.enabled = value; })} />
              <Toggle label="Show review notice" checked={config.heavyCondition.showReviewNotice} onChange={value => update(draft => { draft.heavyCondition.showReviewNotice = value; })} />
              <Toggle label="Allow photo upload" checked={config.heavyCondition.allowPhotoUpload} onChange={value => update(draft => { draft.heavyCondition.allowPhotoUpload = value; })} />
              <Toggle label="Notify admin" checked={config.heavyCondition.notifyAdmin} onChange={value => update(draft => { draft.heavyCondition.notifyAdmin = value; })} />
              <Toggle label="Require admin approval" checked={config.heavyCondition.requiresAdminApproval} onChange={value => update(draft => { draft.heavyCondition.requiresAdminApproval = value; })} />
              <Toggle label="Allow instant booking" checked={config.heavyCondition.allowInstantBooking} onChange={value => update(draft => { draft.heavyCondition.allowInstantBooking = value; })} />
            </div>
          </Card>
        </section>

        {SERVICE_KEYS.map(serviceKey => {
          const service = config.services[serviceKey];
          return (
            <section key={serviceKey} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#4A86F7]">Service Pricing</p><h2 className="mt-1 text-xl font-extrabold text-[#13263A]">{service.name}</h2></div>
                <div className="flex flex-wrap items-end gap-4">
                  <MoneyInput label="Starting price" centsValue={service.startingPriceCents} onChange={value => update(draft => { draft.services[serviceKey].startingPriceCents = value; })} />
                  <Toggle label="Active" checked={service.enabled} onChange={value => update(draft => { draft.services[serviceKey].enabled = value; })} />
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-sm font-extrabold text-[#13263A]">Base packages & room allowances</h3>
                <p className="mt-1 text-xs text-slate-500">Base package prices and included room counts used by the future calculator.</p>
                <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
                  <table className="min-w-[1250px] w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">Package</th><th className="p-3">Base price</th>{AREA_KEYS.map(key => <th key={key} className="p-3">{PRICING_AREA_LABELS[key]}</th>)}<th className="p-3">Customer selectable</th></tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      {service.packages.map((pkg, packageIndex) => (
                        <tr key={pkg.id}>
                          <td className="p-3 align-top"><input value={pkg.name} onChange={event => update(draft => { draft.services[serviceKey].packages[packageIndex].name = event.target.value; })} className="h-9 w-64 rounded-lg border border-slate-200 px-3 font-semibold" /><textarea value={pkg.description} onChange={event => update(draft => { draft.services[serviceKey].packages[packageIndex].description = event.target.value; })} rows={2} className="mt-1 w-64 rounded-lg border border-slate-200 p-2 text-[11px] text-slate-600" /></td>
                          <td className="p-3 align-top"><MoneyInput centsValue={pkg.basePriceCents} onChange={value => update(draft => { draft.services[serviceKey].packages[packageIndex].basePriceCents = value; })} /></td>
                          {AREA_KEYS.map(areaKey => <td key={areaKey} className="p-3 align-top"><CompactNumber value={pkg.allowances[areaKey]} onChange={value => update(draft => { draft.services[serviceKey].packages[packageIndex].allowances[areaKey] = value; })} /></td>)}
                          <td className="p-3 align-top"><input type="checkbox" className="h-4 w-4 accent-[#0B4E9B]" checked={pkg.customerSelectable} onChange={event => update(draft => { draft.services[serviceKey].packages[packageIndex].customerSelectable = event.target.checked; })} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 grid gap-5 xl:grid-cols-[2fr_1fr]">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#13263A]">Additional area charges</h3>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {AREA_KEYS.map(areaKey => <MoneyInput key={areaKey} label={PRICING_AREA_LABELS[areaKey]} centsValue={service.additionalCharges[areaKey]} onChange={value => update(draft => { draft.services[serviceKey].additionalCharges[areaKey] = value; })} />)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#13263A]">Included item keys</h3>
                    <p className="mt-1 text-xs text-slate-500">One key per line. These flags prevent duplicate add-on charges.</p>
                    <textarea rows={8} value={service.includedItems.join("\n")} onChange={event => update(draft => { draft.services[serviceKey].includedItems = event.target.value.split("\n").map(item => item.trim()).filter(Boolean); })} className="mt-3 w-full rounded-xl border border-slate-200 p-3 font-mono text-xs" />
                  </div>
                </div>
              </div>
            </section>
          );
        })}

        <Card title="Carpet Steam Cleaning Pricing" description="Standalone minimum and add-on carpet rates are stored separately from general cleaning packages.">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MoneyInput label="Standalone minimum" centsValue={config.carpet.standaloneMinimumCents} onChange={value => update(draft => { draft.carpet.standaloneMinimumCents = value; })} />
            <MoneyInput label="First standard room" centsValue={config.carpet.firstStandardRoomCents} onChange={value => update(draft => { draft.carpet.firstStandardRoomCents = value; })} />
            <MoneyInput label="Each additional room" centsValue={config.carpet.additionalStandardRoomCents} onChange={value => update(draft => { draft.carpet.additionalStandardRoomCents = value; })} />
            <MoneyInput label="Living / larger room" centsValue={config.carpet.largeRoomCents} onChange={value => update(draft => { draft.carpet.largeRoomCents = value; })} />
            <MoneyInput label="Hallway" centsValue={config.carpet.hallwayCents} onChange={value => update(draft => { draft.carpet.hallwayCents = value; })} />
            <MoneyInput label="Carpeted stairs / flight" centsValue={config.carpet.stairFlightCents} onChange={value => update(draft => { draft.carpet.stairFlightCents = value; })} />
            <MoneyInput label="Small area rug" centsValue={config.carpet.smallAreaRugCents} onChange={value => update(draft => { draft.carpet.smallAreaRugCents = value; })} />
            <MoneyInput label="Heavy stain / area" centsValue={config.carpet.heavyStainAreaCents} onChange={value => update(draft => { draft.carpet.heavyStainAreaCents = value; })} />
          </div>
          <div className="mt-4 flex flex-wrap gap-5"><Toggle label="Carpet pricing enabled" checked={config.carpet.enabled} onChange={value => update(draft => { draft.carpet.enabled = value; })} /><Toggle label="Pet urine / odour = custom quote" checked={config.carpet.petUrineOdorCustomQuote} onChange={value => update(draft => { draft.carpet.petUrineOdorCustomQuote = value; })} /></div>
        </Card>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="font-extrabold text-[#13263A]">Optional Add-ons & Inclusion Rules</h2><p className="mt-1 text-xs text-slate-500">Configure price, unit, service visibility and which services already include the task.</p></div>
            <button type="button" onClick={() => addNewAddOn(update)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-bold text-[#0B4E9B]"><Plus size={14} /> Add add-on</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[1450px] w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">Add-on</th><th className="p-3">Price type</th><th className="p-3">Price</th><th className="p-3">Unit</th><th className="p-3">Available for</th><th className="p-3">Included / hide for</th><th className="p-3">Admin review</th><th className="p-3">Active</th><th className="p-3">Note</th><th className="p-3"></th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {config.addOns.map((addOn, index) => (
                  <tr key={addOn.id}>
                    <td className="p-3 align-top"><input value={addOn.name} onChange={event => update(draft => { draft.addOns[index].name = event.target.value; })} className="h-9 w-52 rounded-lg border border-slate-200 px-3 font-semibold" /><p className="mt-1 font-mono text-[10px] text-slate-400">{addOn.id}</p></td>
                    <td className="p-3 align-top"><select value={addOn.priceType} onChange={event => update(draft => { draft.addOns[index].priceType = event.target.value as AddOnPricing["priceType"]; if (event.target.value === "custom_quote") draft.addOns[index].priceCents = null; })} className="h-9 rounded-lg border border-slate-200 px-2">{["fixed", "from", "per_unit", "custom_quote"].map(type => <option key={type} value={type}>{type.replaceAll("_", " ")}</option>)}</select></td>
                    <td className="p-3 align-top">{addOn.priceType === "custom_quote" ? <span className="inline-flex h-9 items-center text-slate-500">Custom quote</span> : <MoneyInput centsValue={addOn.priceCents || 0} onChange={value => update(draft => { draft.addOns[index].priceCents = value; })} />}</td>
                    <td className="p-3 align-top"><input value={addOn.unit || ""} onChange={event => update(draft => { draft.addOns[index].unit = event.target.value || null; })} placeholder="e.g. room" className="h-9 w-28 rounded-lg border border-slate-200 px-2" /></td>
                    <td className="p-3 align-top"><ScopeChecks values={addOn.availableFor} onChange={values => update(draft => { draft.addOns[index].availableFor = values; draft.addOns[index].includedFor = draft.addOns[index].includedFor.filter(scope => !values.includes(scope)); })} /></td>
                    <td className="p-3 align-top"><ScopeChecks values={addOn.includedFor} onChange={values => update(draft => { draft.addOns[index].includedFor = values; draft.addOns[index].availableFor = draft.addOns[index].availableFor.filter(scope => !values.includes(scope)); })} /></td>
                    <td className="p-3 align-top"><input type="checkbox" className="h-4 w-4 accent-[#0B4E9B]" checked={addOn.adminReview} onChange={event => update(draft => { draft.addOns[index].adminReview = event.target.checked; })} /></td>
                    <td className="p-3 align-top"><input type="checkbox" className="h-4 w-4 accent-[#0B4E9B]" checked={addOn.active} onChange={event => update(draft => { draft.addOns[index].active = event.target.checked; })} /></td>
                    <td className="p-3 align-top"><textarea rows={2} value={addOn.note} onChange={event => update(draft => { draft.addOns[index].note = event.target.value; })} className="w-56 rounded-lg border border-slate-200 p-2" /></td>
                    <td className="p-3 align-top"><button type="button" aria-label={`Delete ${addOn.name}`} onClick={() => update(draft => { draft.addOns.splice(index, 1); })} className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50"><Trash2 size={15} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center">
          <div className="min-w-0"><p className={`text-sm font-semibold ${state === "error" ? "text-red-600" : state === "saving" ? "text-blue-600" : "text-emerald-700"}`}>{message}</p><p className="mt-1 text-[11px] text-slate-400">Version {version} · Last updated {lastUpdated}</p></div>
          <button type="submit" disabled={state === "saving"} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0B4E9B] px-5 text-sm font-bold text-white disabled:opacity-50 sm:ml-auto"><Save size={16} />{state === "saving" ? "Saving…" : "Save all pricing"}</button>
        </div>
      </div>
    </form>
  );
}

function addNewAddOn(update: (mutator: (draft: CleaningPricingConfig) => void) => void) {
  const stamp = Date.now();
  const item: AddOnPricing = { id: `custom_addon_${stamp}`, name: "New add-on", priceType: "fixed", priceCents: 0, unit: null, availableFor: ["standard"], includedFor: [], active: true, adminReview: false, note: "" };
  update(draft => { draft.addOns.push(item); });
}

function Card({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-extrabold text-[#13263A]">{title}</h2>{description && <p className="mt-1 text-xs text-slate-500">{description}</p>}<div className="mt-4">{children}</div></section>;
}

function MoneyInput({ label, centsValue, onChange }: { label?: string; centsValue: number; onChange: (value: number) => void }) {
  return <label className="block min-w-[110px] text-[11px] font-semibold text-slate-600">{label && <span>{label}</span>}<div className={label ? "mt-1.5 flex h-9 items-center rounded-lg border border-slate-200 bg-white" : "flex h-9 items-center rounded-lg border border-slate-200 bg-white"}><span className="pl-3 text-slate-400">$</span><input type="number" min="0" step="0.01" value={dollars(centsValue)} onChange={event => onChange(cents(event.target.value))} className="h-full w-full min-w-0 bg-transparent px-2 outline-none" /></div></label>;
}

function NumberInput({ label, value, min = "0", step = "1", onChange }: { label: string; value: string; min?: string; step?: string; onChange: (value: string) => void }) {
  return <label className="block text-[11px] font-semibold text-slate-600">{label}<input type="number" min={min} step={step} value={value} onChange={event => onChange(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-blue-300" /></label>;
}

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block text-[11px] font-semibold text-slate-600">{label}<input value={value} onChange={event => onChange(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-blue-300" /></label>;
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return <label className="block text-[11px] font-semibold text-slate-600">{label}<div className="mt-1.5 flex h-10 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-500">{value}</div></label>;
}

function CompactNumber({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return <input type="number" min="0" step="1" value={value} onChange={event => onChange(Math.max(0, Math.trunc(Number(event.target.value) || 0)))} className="h-9 w-20 rounded-lg border border-slate-200 px-2" />;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex items-center gap-2 text-xs font-semibold text-slate-700"><input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} className="h-4 w-4 accent-[#0B4E9B]" />{label}</label>;
}

function ScopeChecks({ values, onChange }: { values: PricingScope[]; onChange: (values: PricingScope[]) => void }) {
  const toggle = (scope: PricingScope, checked: boolean) => onChange(checked ? Array.from(new Set([...values, scope])) : values.filter(value => value !== scope));
  return <div className="grid grid-cols-2 gap-x-3 gap-y-2">{SCOPE_KEYS.map(scope => <label key={scope} className="flex items-center gap-1.5 whitespace-nowrap text-[10px] font-semibold text-slate-600"><input type="checkbox" checked={values.includes(scope)} onChange={event => toggle(scope, event.target.checked)} className="h-3.5 w-3.5 accent-[#0B4E9B]" />{PRICING_SCOPE_LABELS[scope]}</label>)}</div>;
}
