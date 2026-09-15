"use client";

import {
  FormEvent,
  useState,
} from "react";
import {
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
  UserCheck,
  X,
} from "lucide-react";
import { labelRole } from "@/components/admin/users/userUiHelpers";

type UserForm = {
  name: string;
  email: string;
  password: string;
  phone_number: string;
  role: string;
  source: string;
  approval_status: string;
  is_available: boolean;
  offering_fixed: boolean;
  offering_hourly: boolean;
  hourly_rate: string;
};

const emptyForm: UserForm = {
  name: "",
  email: "",
  password: "",
  phone_number: "",
  role: "cleaner",
  source: "Web",
  approval_status: "approved",
  is_available: false,
  offering_fixed: true,
  offering_hourly: false,
  hourly_rate: "0",
};

type CreateUserModalProps = {
  open: boolean;
  onClose: () => void;
  allowedRoles: string[];
  onCreated: (message: string) => void;
};

export default function CreateUserModal({
  open,
  onClose,
  allowedRoles,
  onCreated,
}: CreateUserModalProps) {
  const [form, setForm] =
    useState<UserForm>(emptyForm);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const closeModal = () => {
    setError("");
    onClose();
  };

  const submit = async (
    event: FormEvent,
  ) => {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        "/api/admin/users",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(form),
        },
      );

      const result =
        await response.json();

      if (!response.ok) {
        setError(
          result.error ||
            "Unable to create user.",
        );
        return;
      }

      const message = `${labelRole(
        form.role,
      )} user created successfully.`;

      setForm(emptyForm);
      onCreated(message);
      closeModal();
    } catch {
      setError(
        "Unable to create user.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/40 sm:items-center sm:p-5"
      onMouseDown={(event) =>
        event.target ===
          event.currentTarget &&
        closeModal()
      }
    >
      <div className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-2xl sm:rounded-xl">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#4A86F7]">
              User Management
            </p>

            <h2 className="mt-1 font-bold text-[#13263A]">
              Create User
            </h2>
          </div>

          <button
            type="button"
            onClick={closeModal}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
          >
            <X size={14} />
          </button>
        </div>

        {error && (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-[10px] font-medium text-red-700">
            {error}
          </p>
        )}

        <form
          onSubmit={submit}
          className="mt-4 space-y-4"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <ModalField
              label="Full Name"
              icon={User}
              value={form.name}
              onChange={(value) =>
                setForm({
                  ...form,
                  name: value,
                })
              }
              required
            />

            <ModalField
              label="Email"
              icon={Mail}
              type="email"
              value={form.email}
              onChange={(value) =>
                setForm({
                  ...form,
                  email: value,
                })
              }
              required
            />

            <ModalField
              label="Phone Number"
              icon={Phone}
              value={form.phone_number}
              onChange={(value) =>
                setForm({
                  ...form,
                  phone_number: value,
                })
              }
              required
            />

            <ModalField
              label="Password"
              icon={Lock}
              type="password"
              value={form.password}
              onChange={(value) =>
                setForm({
                  ...form,
                  password: value,
                })
              }
              required
            />

            <label className="block">
              <span className="mb-1.5 block text-[9px] font-bold text-slate-600">
                Role
              </span>

              <select
                value={form.role}
                onChange={(event) =>
                  setForm({
                    ...form,
                    role: event.target.value,
                  })
                }
                className="h-10 w-full rounded-lg border border-slate-200 bg-[#F8FAFD] px-3 text-[10px] font-medium text-slate-700 outline-none focus:border-blue-300 focus:bg-white"
              >
                {allowedRoles.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {labelRole(item)}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[9px] font-bold text-slate-600">
                Approval Status
              </span>

              <select
                value={
                  form.approval_status
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    approval_status:
                      event.target.value,
                  })
                }
                className="h-10 w-full rounded-lg border border-slate-200 bg-[#F8FAFD] px-3 text-[10px] font-medium text-slate-700 outline-none focus:border-blue-300 focus:bg-white"
              >
                <option value="approved">
                  Approved
                </option>
                <option value="pending">
                  Pending
                </option>
                <option value="rejected">
                  Rejected
                </option>
              </select>
            </label>
          </div>

          {form.role === "cleaner" && (
            <div className="rounded-xl border border-slate-200 bg-[#F8FAFD] p-3">
              <h3 className="text-[11px] font-bold text-[#13263A]">
                Cleaner Settings
              </h3>

              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <Toggle
                  label="Available"
                  checked={
                    form.is_available
                  }
                  onChange={(value) =>
                    setForm({
                      ...form,
                      is_available:
                        value,
                    })
                  }
                />

                <Toggle
                  label="Fixed Jobs"
                  checked={
                    form.offering_fixed
                  }
                  onChange={(value) =>
                    setForm({
                      ...form,
                      offering_fixed:
                        value,
                    })
                  }
                />

                <Toggle
                  label="Hourly Jobs"
                  checked={
                    form.offering_hourly
                  }
                  onChange={(value) =>
                    setForm({
                      ...form,
                      offering_hourly:
                        value,
                    })
                  }
                />
              </div>

              <div className="mt-3">
                <ModalField
                  label="Hourly Rate"
                  icon={ShieldCheck}
                  type="number"
                  value={form.hourly_rate}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      hourly_rate: value,
                    })
                  }
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-[10px] font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              disabled={saving}
              className="h-9 rounded-lg bg-[#4A86F7] px-4 text-[10px] font-bold text-white transition hover:bg-blue-600 disabled:opacity-50"
            >
              {saving
                ? "Creating..."
                : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ModalField({
  label,
  icon: Icon,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  icon: typeof UserCheck;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[9px] font-bold text-slate-600">
        {label}
      </span>

      <div className="relative">
        <Icon
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={14}
        />

        <input
          required={required}
          type={type}
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
          className="h-10 w-full rounded-lg border border-slate-200 bg-[#F8FAFD] pl-9 pr-3 text-[10px] text-slate-700 outline-none focus:border-blue-300 focus:bg-white"
        />
      </div>
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (
    value: boolean,
  ) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-2.5 text-[9px] font-semibold text-slate-700">
      <span>{label}</span>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(
            event.target.checked,
          )
        }
        className="h-4 w-4"
      />
    </label>
  );
}
