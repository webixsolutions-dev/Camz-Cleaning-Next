"use client";

import type { ReactNode } from "react";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Car,
  Check,
  ChefHat,
  ChevronDown,
  Droplets,
  Home,
  Plus,
  RefreshCw,
  Sparkles,
  Tag,
  Trash2,
  Wind,
  Wrench,
  X,
} from "lucide-react";

export type CategoryRecord = {
  id: string;
  name: string;
  icon_str: string | null;
  color_hex: string | null;
  created_at: string;
  type: string | null;
};

export type ServiceRecord = {
  id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  price: string | number | null;
  icon_str: string | null;
  pricing_type: string | null;
  hourly_rate: string | number | null;
  service_type: string | null;
  bedroom_rate: string | number | null;
  washroom_rate: string | number | null;
  sqft_rate: string | number | null;
  vehicle_sedan_rate: string | number | null;
  vehicle_suv_rate: string | number | null;
  fridge_price: string | number | null;
  oven_price: string | number | null;
  window_price: string | number | null;
  is_active: boolean | null;
  has_addons: boolean | null;
  tax_rate: string | number | null;
};

type CategoryForm = {
  name: string;
  icon_str: string;
  color_hex: string;
};

type AddonDraft = {
  name: string;
  price: string;
};

type FieldDraft = {
  label: string;
  unit_price: string;
  type: string;
};

type ServiceForm = {
  title: string;
  description: string;
  pricing_type: string;
  price: string;
  hourly_rate: string;
  tax_rate: string;
  service_type: string;
  icon_str: string;
  bedroom_rate: string;
  washroom_rate: string;
  sqft_rate: string;
  vehicle_sedan_rate: string;
  vehicle_suv_rate: string;
  fridge_price: string;
  oven_price: string;
  window_price: string;
};

const iconOptions = [
  { value: "sparkles", icon: Sparkles },
  { value: "home", icon: Home },
  { value: "droplets", icon: Droplets },
  { value: "chef-hat", icon: ChefHat },
  { value: "car", icon: Car },
  { value: "wind", icon: Wind },
  { value: "building", icon: Building2 },
  { value: "wrench", icon: Wrench },
];

const colors = [
  "FF3B82F6",
  "FF8B5CF6",
  "FFF59E0B",
  "FF10B981",
  "FFEF4444",
];

const emptyCategory: CategoryForm = {
  name: "",
  icon_str: "sparkles",
  color_hex: colors[0],
};

const emptyService: ServiceForm = {
  title: "",
  description: "",
  pricing_type: "fixed",
  price: "",
  hourly_rate: "",
  tax_rate: "",
  service_type: "",
  icon_str: "sparkles",
  bedroom_rate: "",
  washroom_rate: "",
  sqft_rate: "",
  vehicle_sedan_rate: "",
  vehicle_suv_rate: "",
  fridge_price: "",
  oven_price: "",
  window_price: "",
};

function normalizeColor(color: string | null) {
  const value = (color || colors[0]).replace("#", "");
  return `#${value.length === 8 ? value.slice(2) : value}`;
}

function IconFor({
  name,
  size = 20,
}: {
  name: string | null;
  size?: number;
}) {
  const match = iconOptions.find((item) => item.value === name);
  const Icon = match?.icon || Sparkles;

  return <Icon size={size} />;
}

function pricingLabel(service: ServiceRecord) {
  const pricing = (service.pricing_type || "fixed").toLowerCase();

  if (pricing === "both") return "Fixed + Hourly";
  if (pricing === "hourly") return "Hourly";

  return "Fixed";
}

function money(value: string | number | null) {
  const numeric = Number(value || 0);

  return Number.isFinite(numeric)
    ? `CAD $${numeric.toFixed(2)}`
    : `CAD $${value || 0}`;
}

export default function ServicesManagement({
  categories = [],
  services = [],
}: {
  categories?: CategoryRecord[];
  services?: ServiceRecord[];
}) {
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState(
    categories[0]?.id || "",
  );

  const [categoryModal, setCategoryModal] = useState(false);
  const [serviceModal, setServiceModal] = useState(false);

  const [categoryForm, setCategoryForm] =
    useState<CategoryForm>(emptyCategory);

  const [serviceForm, setServiceForm] =
    useState<ServiceForm>(emptyService);

  const [addons, setAddons] = useState<AddonDraft[]>([]);
  const [addonDraft, setAddonDraft] = useState<AddonDraft>({
    name: "",
    price: "",
  });

  const [fields, setFields] = useState<FieldDraft[]>([]);
  const [fieldDraft, setFieldDraft] = useState<FieldDraft>({
    label: "",
    unit_price: "",
    type: "counter",
  });

  const [openService, setOpenService] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const activeCategory =
    categories.find(
      (category) => category.id === selectedCategory,
    ) || categories[0];

  const visibleServices = useMemo(
    () =>
      services.filter(
        (service) =>
          service.category_id === activeCategory?.id,
      ),
    [services, activeCategory?.id],
  );

  const activeServices = services.filter(
    (service) => service.is_active !== false,
  ).length;

  const resetService = () => {
    setServiceForm({
      ...emptyService,
      icon_str: activeCategory?.icon_str || "sparkles",
      service_type:
        activeCategory?.name?.toLowerCase() || "",
    });

    setAddons([]);
    setFields([]);
    setAddonDraft({ name: "", price: "" });
    setFieldDraft({
      label: "",
      unit_price: "",
      type: "counter",
    });

    setError("");
    setServiceModal(true);
  };

  const postAction = async (
    body: Record<string, unknown>,
  ) => {
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/admin/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Unable to save.");
        return null;
      }

      router.refresh();

      return result as { id?: string };
    } catch {
      setError("Unable to save.");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const createCategory = async (
    event: FormEvent,
  ) => {
    event.preventDefault();

    const result = await postAction({
      resource: "category",
      ...categoryForm,
    });

    if (result?.id) {
      setSelectedCategory(result.id);
      setCategoryModal(false);
      setCategoryForm(emptyCategory);
    }
  };

  const createService = async (
    event: FormEvent,
  ) => {
    event.preventDefault();

    if (!activeCategory) return;

    const result = await postAction({
      resource: "service",
      category_id: activeCategory.id,
      ...serviceForm,
      has_addons: addons.length > 0,
      addons,
      custom_fields: fields,
    });

    if (result) {
      setServiceModal(false);
    }
  };

  const remove = async (
    resource: "category" | "service",
    id: string,
    label: string,
  ) => {
    if (!window.confirm(`Delete ${label}?`)) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `/api/admin/services?resource=${resource}&id=${id}`,
        {
          method: "DELETE",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        window.alert(
          result.error || "Unable to delete.",
        );
        return;
      }

      if (
        resource === "category" &&
        selectedCategory === id
      ) {
        setSelectedCategory("");
      }

      router.refresh();
    } catch {
      window.alert("Unable to delete.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] px-4 py-4 text-slate-900 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1500px]">
        {/* PAGE HEADER */}
        <section className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#4A86F7]">
                Management
              </p>

              <h1 className="mt-1 font-bold tracking-tight text-[#13263A]">
                Services Management
              </h1>

              <p className="mt-1 text-slate-500">
                Manage service categories, pricing and service configuration.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                aria-label="Refresh services"
                onClick={() => router.refresh()}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#4A86F7]"
              >
                <RefreshCw size={14} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setCategoryModal(true);
                }}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3.5 text-[10px] font-bold text-[#4A86F7] transition hover:bg-blue-100"
              >
                <Plus size={14} />
                Add Category
              </button>

              <button
                type="button"
                disabled={!activeCategory}
                onClick={resetService}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#4A86F7] px-3.5 text-[10px] font-bold text-white shadow-sm transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus size={14} />
                Add Service
              </button>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Categories"
            value={categories.length}
          />
          <StatCard
            label="Total Services"
            value={services.length}
          />
          <StatCard
            label="Active Services"
            value={activeServices}
          />
          <StatCard
            label="Selected Category"
            value={visibleServices.length}
            sub={activeCategory?.name || "None"}
          />
        </section>

        {/* CATEGORIES */}
        <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-[#13263A]">
                Platform Categories
              </h2>

              <p className="mt-0.5 text-slate-500">
                Select a category to view its services.
              </p>
            </div>

            {activeCategory && (
              <span className="inline-flex w-fit rounded-lg bg-slate-100 px-2.5 py-1 text-[9px] font-bold text-slate-600">
                {activeCategory.name}
              </span>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-5">
            {categories.map((category) => {
              const active =
                activeCategory?.id === category.id;

              const color = normalizeColor(
                category.color_hex,
              );

              return (
                <article
                  key={category.id}
                  className="relative"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedCategory(category.id)
                    }
                    className={`flex min-h-[94px] w-full flex-col justify-between rounded-xl border p-3 text-left transition ${
                      active
                        ? "border-blue-300 bg-blue-50 shadow-sm"
                        : "border-slate-200 bg-[#F8FAFD] hover:border-blue-200 hover:bg-blue-50/40"
                    }`}
                  >
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm"
                      style={{ color }}
                    >
                      <IconFor
                        name={category.icon_str}
                        size={16}
                      />
                    </span>

                    <span className="mt-3 block pr-7 text-[11px] font-bold text-[#13263A]">
                      {category.name}
                    </span>
                  </button>

                  <button
                    type="button"
                    aria-label={`Delete ${category.name}`}
                    onClick={() =>
                      remove(
                        "category",
                        category.id,
                        category.name,
                      )
                    }
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                  >
                    <Trash2 size={12} />
                  </button>
                </article>
              );
            })}

            {!categories.length && (
              <p className="col-span-full rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-[10px] text-slate-400">
                No categories yet.
              </p>
            )}
          </div>
        </section>

        {/* SERVICES */}
        <section className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-[#13263A]">
                Category Services
              </h2>

              <p className="mt-0.5 text-slate-500">
                {activeCategory
                  ? `${visibleServices.length} service${
                      visibleServices.length === 1
                        ? ""
                        : "s"
                    } in ${activeCategory.name}`
                  : "Select a category"}
              </p>
            </div>

            <button
              type="button"
              disabled={!activeCategory}
              onClick={resetService}
              className="inline-flex h-8 w-fit items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-[9px] font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              <Plus size={12} />
              Service
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {visibleServices.map((service) => {
              const opened =
                openService === service.id;

              return (
                <article
                  key={service.id}
                  className="bg-white"
                >
                  <div className="flex items-center gap-3 px-4 py-3">
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                        service.is_active === false
                          ? "bg-rose-500"
                          : "bg-emerald-500"
                      }`}
                    />

                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#4A86F7]">
                      <IconFor
                        name={service.icon_str}
                        size={15}
                      />
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setOpenService(
                          opened ? "" : service.id,
                        )
                      }
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-[11px] font-bold text-[#13263A]">
                          {service.title}
                        </h3>

                        <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[7px] font-extrabold uppercase text-blue-700">
                          {pricingLabel(service)}
                        </span>

                        {service.has_addons && (
                          <span className="rounded-md bg-violet-50 px-2 py-0.5 text-[7px] font-extrabold uppercase text-violet-700">
                            Add-ons
                          </span>
                        )}
                      </div>

                      <p className="mt-1 truncate text-[9px] text-slate-500">
                        {service.description ||
                          "No description provided"}
                      </p>
                    </button>

                    <div className="hidden text-right sm:block">
                      <div className="text-[8px] font-bold uppercase text-slate-400">
                        Price
                      </div>

                      <div className="mt-0.5 text-[10px] font-extrabold text-[#13263A]">
                        {money(service.price)}
                      </div>
                    </div>

                    <button
                      type="button"
                      aria-label={`Delete ${service.title}`}
                      onClick={() =>
                        remove(
                          "service",
                          service.id,
                          service.title,
                        )
                      }
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                    >
                      <Trash2 size={12} />
                    </button>

                    <button
                      type="button"
                      aria-label="Toggle service details"
                      onClick={() =>
                        setOpenService(
                          opened ? "" : service.id,
                        )
                      }
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500"
                    >
                      <ChevronDown
                        className={`transition ${
                          opened ? "rotate-180" : ""
                        }`}
                        size={14}
                      />
                    </button>
                  </div>

                  {opened && (
                    <div className="grid gap-3 border-t border-slate-100 bg-[#F8FAFD] px-4 py-3 sm:grid-cols-2 xl:grid-cols-3">
                      <ServiceDetail
                        label="Description"
                        value={
                          service.description || "-"
                        }
                      />

                      <ServiceDetail
                        label="Fixed Price"
                        value={money(service.price)}
                      />

                      <ServiceDetail
                        label="Tax Rate"
                        value={`${service.tax_rate || 0}%`}
                      />

                      <ServiceDetail
                        label="Service Type"
                        value={
                          service.service_type || "-"
                        }
                      />

                      <ServiceDetail
                        label="Hourly Rate"
                        value={
                          service.hourly_rate
                            ? money(service.hourly_rate)
                            : "-"
                        }
                      />

                      <ServiceDetail
                        label="Bedroom / Washroom"
                        value={`${service.bedroom_rate || 0} / ${
                          service.washroom_rate || 0
                        }`}
                      />
                    </div>
                  )}
                </article>
              );
            })}

            {!visibleServices.length && (
              <p className="px-4 py-12 text-center text-[10px] text-slate-400">
                No services in this category yet.
              </p>
            )}
          </div>
        </section>
      </div>

      {/* CATEGORY MODAL */}
      {categoryModal && (
        <Modal
          title="New Category"
          onClose={() => setCategoryModal(false)}
        >
          <form
            onSubmit={createCategory}
            className="space-y-4"
          >
            {error && <ErrorBox error={error} />}

            <Input
              label="Category Name"
              value={categoryForm.name}
              onChange={(value) =>
                setCategoryForm({
                  ...categoryForm,
                  name: value,
                })
              }
              placeholder="e.g., Deep Cleaning"
              required
            />

            <div>
              <label className="mb-2 block text-[9px] font-bold text-slate-600">
                Platform Icon
              </label>

              <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                {iconOptions.map((item) => {
                  const Icon = item.icon;
                  const active =
                    categoryForm.icon_str === item.value;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() =>
                        setCategoryForm({
                          ...categoryForm,
                          icon_str: item.value,
                        })
                      }
                      className={`flex h-10 items-center justify-center rounded-lg border transition ${
                        active
                          ? "border-[#4A86F7] bg-blue-50 text-[#4A86F7]"
                          : "border-slate-200 bg-[#F8FAFD] text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <Icon size={15} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[9px] font-bold text-slate-600">
                Branding Color
              </label>

              <div className="flex flex-wrap gap-2">
                {colors.map((color) => {
                  const active =
                    categoryForm.color_hex === color;

                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        setCategoryForm({
                          ...categoryForm,
                          color_hex: color,
                        })
                      }
                      className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${
                        active
                          ? "border-slate-700"
                          : "border-transparent"
                      }`}
                      style={{
                        background:
                          normalizeColor(color),
                      }}
                    >
                      {active && (
                        <Check
                          size={14}
                          className="text-white"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <ModalActions
              saving={saving}
              submitLabel="Create Category"
              onCancel={() =>
                setCategoryModal(false)
              }
            />
          </form>
        </Modal>
      )}

      {/* SERVICE MODAL */}
      {serviceModal && (
        <Modal
          title="Add Service"
          onClose={() => setServiceModal(false)}
        >
          <form
            onSubmit={createService}
            className="space-y-4"
          >
            {error && <ErrorBox error={error} />}

            <Input
              label="Service Title"
              value={serviceForm.title}
              onChange={(value) =>
                setServiceForm({
                  ...serviceForm,
                  title: value,
                })
              }
              placeholder="e.g. Full House Cleaning"
              required
            />

            <Textarea
              label="Description"
              value={serviceForm.description}
              onChange={(value) =>
                setServiceForm({
                  ...serviceForm,
                  description: value,
                })
              }
              placeholder="What does this include?"
            />

            <div>
              <label className="mb-2 block text-[9px] font-bold text-slate-600">
                Pricing Type
              </label>

              <div className="grid grid-cols-3 gap-2">
                {["fixed", "hourly", "both"].map(
                  (item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() =>
                        setServiceForm({
                          ...serviceForm,
                          pricing_type: item,
                        })
                      }
                      className={`flex h-10 items-center justify-center gap-1.5 rounded-lg border text-[9px] font-bold capitalize transition ${
                        serviceForm.pricing_type ===
                        item
                          ? "border-[#4A86F7] bg-[#4A86F7] text-white"
                          : "border-slate-200 bg-[#F8FAFD] text-slate-600"
                      }`}
                    >
                      <Tag size={12} />
                      {item}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Fixed Price (CAD)"
                type="number"
                value={serviceForm.price}
                onChange={(value) =>
                  setServiceForm({
                    ...serviceForm,
                    price: value,
                  })
                }
                placeholder="0.00"
              />

              <Input
                label="Hourly Rate (CAD)"
                type="number"
                value={serviceForm.hourly_rate}
                onChange={(value) =>
                  setServiceForm({
                    ...serviceForm,
                    hourly_rate: value,
                  })
                }
                placeholder="0.00"
              />

              <Input
                label="Tax Rate (%)"
                type="number"
                value={serviceForm.tax_rate}
                onChange={(value) =>
                  setServiceForm({
                    ...serviceForm,
                    tax_rate: value,
                  })
                }
                placeholder="e.g. 13"
              />

              <Input
                label="Service Type"
                value={serviceForm.service_type}
                onChange={(value) =>
                  setServiceForm({
                    ...serviceForm,
                    service_type: value,
                  })
                }
                placeholder="residential"
              />
            </div>

            <Panel title="Service Add-ons">
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_110px_38px]">
                <input
                  value={addonDraft.name}
                  onChange={(event) =>
                    setAddonDraft({
                      ...addonDraft,
                      name: event.target.value,
                    })
                  }
                  placeholder="Add-on Name"
                  className={compactFieldClass}
                />

                <input
                  value={addonDraft.price}
                  onChange={(event) =>
                    setAddonDraft({
                      ...addonDraft,
                      price: event.target.value,
                    })
                  }
                  placeholder="Price"
                  type="number"
                  className={compactFieldClass}
                />

                <button
                  type="button"
                  onClick={() => {
                    if (addonDraft.name.trim()) {
                      setAddons([
                        ...addons,
                        addonDraft,
                      ]);
                      setAddonDraft({
                        name: "",
                        price: "",
                      });
                    }
                  }}
                  className="flex h-9 items-center justify-center rounded-lg bg-[#4A86F7] text-white"
                >
                  <Plus size={14} />
                </button>
              </div>

              {!!addons.length && (
                <p className="mt-2 text-[9px] text-slate-500">
                  {addons.length} add-on
                  {addons.length === 1 ? "" : "s"} added.
                </p>
              )}
            </Panel>

            <Panel title="Custom Service Fields">
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_110px_110px]">
                <input
                  value={fieldDraft.label}
                  onChange={(event) =>
                    setFieldDraft({
                      ...fieldDraft,
                      label: event.target.value,
                    })
                  }
                  placeholder="Field Label"
                  className={compactFieldClass}
                />

                <input
                  value={fieldDraft.unit_price}
                  onChange={(event) =>
                    setFieldDraft({
                      ...fieldDraft,
                      unit_price:
                        event.target.value,
                    })
                  }
                  placeholder="Unit Price"
                  type="number"
                  className={compactFieldClass}
                />

                <select
                  value={fieldDraft.type}
                  onChange={(event) =>
                    setFieldDraft({
                      ...fieldDraft,
                      type: event.target.value,
                    })
                  }
                  className={compactFieldClass}
                >
                  <option value="counter">
                    Counter
                  </option>
                  <option value="toggle">
                    Toggle
                  </option>
                  <option value="text">Text</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (fieldDraft.label.trim()) {
                    setFields([
                      ...fields,
                      fieldDraft,
                    ]);
                    setFieldDraft({
                      label: "",
                      unit_price: "",
                      type: "counter",
                    });
                  }
                }}
                className="mt-2 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-[#4A86F7] text-[9px] font-bold text-white"
              >
                <Plus size={13} />
                Add Field
              </button>

              {!!fields.length && (
                <p className="mt-2 text-[9px] text-slate-500">
                  {fields.length} custom field
                  {fields.length === 1 ? "" : "s"} added.
                </p>
              )}
            </Panel>

            <Panel title="Pricing Rules & Config">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Bedroom Rate"
                  type="number"
                  value={serviceForm.bedroom_rate}
                  onChange={(value) =>
                    setServiceForm({
                      ...serviceForm,
                      bedroom_rate: value,
                    })
                  }
                  placeholder="30.0"
                />

                <Input
                  label="Washroom Rate"
                  type="number"
                  value={serviceForm.washroom_rate}
                  onChange={(value) =>
                    setServiceForm({
                      ...serviceForm,
                      washroom_rate: value,
                    })
                  }
                  placeholder="20.0"
                />

                <Input
                  label="Sqft Rate"
                  type="number"
                  value={serviceForm.sqft_rate}
                  onChange={(value) =>
                    setServiceForm({
                      ...serviceForm,
                      sqft_rate: value,
                    })
                  }
                  placeholder="0.5"
                />

                <Input
                  label="Sedan Rate"
                  type="number"
                  value={
                    serviceForm.vehicle_sedan_rate
                  }
                  onChange={(value) =>
                    setServiceForm({
                      ...serviceForm,
                      vehicle_sedan_rate: value,
                    })
                  }
                  placeholder="80.0"
                />

                <Input
                  label="SUV Rate"
                  type="number"
                  value={serviceForm.vehicle_suv_rate}
                  onChange={(value) =>
                    setServiceForm({
                      ...serviceForm,
                      vehicle_suv_rate: value,
                    })
                  }
                  placeholder="120.0"
                />

                <Input
                  label="Fridge Price"
                  type="number"
                  value={serviceForm.fridge_price}
                  onChange={(value) =>
                    setServiceForm({
                      ...serviceForm,
                      fridge_price: value,
                    })
                  }
                  placeholder="25.0"
                />

                <Input
                  label="Oven Price"
                  type="number"
                  value={serviceForm.oven_price}
                  onChange={(value) =>
                    setServiceForm({
                      ...serviceForm,
                      oven_price: value,
                    })
                  }
                  placeholder="25.0"
                />

                <Input
                  label="Window Price"
                  type="number"
                  value={serviceForm.window_price}
                  onChange={(value) =>
                    setServiceForm({
                      ...serviceForm,
                      window_price: value,
                    })
                  }
                  placeholder="30.0"
                />
              </div>
            </Panel>

            <ModalActions
              saving={saving}
              submitLabel="Add Service"
              onCancel={() =>
                setServiceModal(false)
              }
            />
          </form>
        </Modal>
      )}
    </div>
  );
}

const compactFieldClass =
  "h-9 min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-[10px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-300";

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="text-[8px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
        {label}
      </div>

      <div className="mt-1 text-[20px] font-extrabold leading-none text-[#13263A]">
        {value}
      </div>

      {sub && (
        <div className="mt-1.5 truncate text-[9px] text-slate-500">
          {sub}
        </div>
      )}
    </div>
  );
}

function ServiceDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="text-[8px] font-extrabold uppercase tracking-[0.05em] text-slate-400">
        {label}
      </div>

      <div className="mt-1 text-[9px] font-semibold leading-4 text-slate-700">
        {value}
      </div>
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4"
      onMouseDown={(event) =>
        event.target === event.currentTarget &&
        onClose()
      }
    >
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-2xl"
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div>
            <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#4A86F7]">
              Services
            </p>

            <h2 className="mt-1 font-bold text-[#13263A]">
              {title}
            </h2>
          </div>

          <button
            type="button"
            aria-label={`Close ${title}`}
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
          >
            <X size={14} />
          </button>
        </div>

        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[9px] font-bold text-slate-600">
        {label}
      </span>

      <input
        required={required}
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-slate-200 bg-[#F8FAFD] px-3 text-[10px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-300 focus:bg-white"
      />
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[9px] font-bold text-slate-600">
        {label}
      </span>

      <textarea
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        rows={3}
        className="w-full resize-none rounded-lg border border-slate-200 bg-[#F8FAFD] px-3 py-2.5 text-[10px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-300 focus:bg-white"
      />
    </label>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2 text-[11px] font-bold text-[#13263A]">
        {title}
      </h3>

      <div className="rounded-xl border border-slate-200 bg-[#F8FAFD] p-3">
        {children}
      </div>
    </section>
  );
}

function ModalActions({
  saving,
  submitLabel,
  onCancel,
}: {
  saving: boolean;
  submitLabel: string;
  onCancel: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
      <button
        type="button"
        onClick={onCancel}
        className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-[10px] font-bold text-slate-600 hover:bg-slate-50"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={saving}
        className="h-9 rounded-lg bg-[#4A86F7] px-4 text-[10px] font-bold text-white hover:bg-blue-600 disabled:opacity-50"
      >
        {saving
          ? "Saving..."
          : submitLabel}
      </button>
    </div>
  );
}

function ErrorBox({
  error,
}: {
  error: string;
}) {
  return (
    <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-[10px] font-medium text-red-700">
      {error}
    </p>
  );
}
