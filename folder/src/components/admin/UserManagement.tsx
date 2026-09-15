"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Plus,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import CreateUserModal from "@/components/admin/users/CreateUserModal";
import { labelRole } from "@/components/admin/users/userUiHelpers";

export type AdminUserRecord = {
  id: string;
  name: string;
  email: string;
  phone_number: string | null;
  role: string;
  approval_status: string | null;
  source: string | null;
  is_blocked: boolean | null;
  verified: boolean | null;
  is_online: boolean | null;
  is_available: boolean | null;
  is_working: boolean | null;
  created_at: string;
};

const roles = ["cleaner", "data_entry", "customer", "admin"];

export default function UserManagement({
  users = [],
}: {
  users?: AdminUserRecord[];
}) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [success, setSuccess] = useState("");

  const filtered = useMemo(
    () =>
      users.filter((user) => {
        const text = `${user.name} ${user.email} ${
          user.phone_number || ""
        }`.toLowerCase();

        return (
          (!query ||
            text.includes(query.toLowerCase())) &&
          (role === "all" || user.role === role)
        );
      }),
    [users, query, role],
  );

  const counts = roles.map((item) => ({
    role: item,
    total: users.filter(
      (user) => user.role === item,
    ).length,
  }));

  const toggleBlocked = async (
    user: AdminUserRecord,
  ) => {
    const response = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: user.id,
        is_blocked: !user.is_blocked,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      window.alert(
        result.error || "Unable to update user.",
      );
      return;
    }

    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] px-4 py-4 text-slate-900 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1500px]">
        {/* HEADER */}
        <section className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#4A86F7]">
                Management
              </p>

              <h1 className="mt-1 font-bold tracking-tight text-[#13263A]">
                User Management
              </h1>

              <p className="mt-1 text-slate-500">
                Create portal users and review account details without exposing internal IDs.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSuccess("");
                setModalOpen(true);
              }}
              className="inline-flex h-9 w-fit items-center gap-2 rounded-lg bg-[#4A86F7] px-3.5 text-[10px] font-bold text-white shadow-sm transition hover:bg-blue-600"
            >
              <Plus size={14} />
              Create User
            </button>
          </div>
        </section>

        {success && (
          <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[10px] font-semibold text-emerald-700">
            {success}
          </p>
        )}

        {/* STATS */}
        <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {counts.map((item) => (
            <div
              key={item.role}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[8px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
                    {labelRole(item.role)}
                  </p>

                  <div className="mt-1 text-[20px] font-extrabold leading-none text-[#13263A]">
                    {item.total}
                  </div>
                </div>

                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#4A86F7]">
                  {item.role === "cleaner" ? (
                    <UserCheck size={14} />
                  ) : item.role === "admin" ? (
                    <ShieldCheck size={14} />
                  ) : (
                    <Users size={14} />
                  )}
                </span>
              </div>
            </div>
          ))}
        </section>

        {/* FILTERS */}
        <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[minmax(260px,1fr)_190px]">
            <label className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-[#F8FAFD] px-3 transition focus-within:border-blue-300 focus-within:bg-white">
              <Search
                size={14}
                className="text-slate-400"
              />

              <input
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Search users..."
                className="min-w-0 flex-1 bg-transparent text-[10px] text-slate-700 outline-none placeholder:text-slate-400"
              />
            </label>

            <select
              value={role}
              onChange={(event) =>
                setRole(event.target.value)
              }
              className="h-9 rounded-lg border border-slate-200 bg-[#F8FAFD] px-3 text-[10px] font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white"
            >
              <option value="all">All roles</option>

              {roles.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {labelRole(item)}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* USERS */}
        <section className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <h2 className="font-bold text-[#13263A]">
                Users
              </h2>

              <p className="mt-0.5 text-slate-500">
                {filtered.length} visible user
                {filtered.length === 1 ? "" : "s"}
              </p>
            </div>

            <span className="text-[9px] text-slate-400">
              No internal IDs shown
            </span>
          </div>

          {/* DESKTOP */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full table-fixed text-left">
              <thead className="bg-[#F8FAFD]">
                <tr>
                  {[
                    ["User", "w-[22%]"],
                    ["Contact", "w-[20%]"],
                    ["Role", "w-[11%]"],
                    ["Approval", "w-[12%]"],
                    ["Source", "w-[9%]"],
                    ["Activity", "w-[9%]"],
                    ["Joined", "w-[10%]"],
                    ["Actions", "w-[7%]"],
                  ].map(([head, width]) => (
                    <th
                      key={head}
                      className={`border-b border-slate-200 px-2 py-2.5 text-[8px] font-extrabold uppercase tracking-[0.06em] text-slate-400 ${width}`}
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="transition hover:bg-blue-50/40"
                  >
                    <td className="px-2 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-[10px] font-bold text-[#13263A]">
                          {user.name}
                        </p>

                        <p className="mt-0.5 text-[8px] text-slate-400">
                          {user.verified
                            ? "Verified"
                            : "Not verified"}
                        </p>
                      </div>
                    </td>

                    <td className="px-2 py-2.5">
                      <a
                        href={`mailto:${user.email}`}
                        className="block truncate text-[9px] text-slate-700 hover:text-[#4A86F7]"
                      >
                        {user.email}
                      </a>

                      <a
                        href={`tel:${user.phone_number || ""}`}
                        className="mt-0.5 block truncate text-[8px] text-slate-400 hover:text-[#4A86F7]"
                      >
                        {user.phone_number || "-"}
                      </a>
                    </td>

                    <td className="px-2 py-2.5">
                      <RoleBadge role={user.role} />
                    </td>

                    <td className="px-2 py-2.5">
                      <StatusBadge
                        blocked={user.is_blocked}
                        status={user.approval_status}
                      />
                    </td>

                    <td className="px-2 py-2.5 text-[9px] text-slate-600">
                      <span className="block truncate">
                        {user.source || "-"}
                      </span>
                    </td>

                    <td className="px-2 py-2.5 text-[9px] text-slate-600">
                      <span className="block truncate">
                        {activityText(user)}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-2 py-2.5 text-[9px] text-slate-600">
                      {formatDate(user.created_at)}
                    </td>

                    <td className="px-1.5 py-2.5">
                      <button
                        type="button"
                        onClick={() =>
                          toggleBlocked(user)
                        }
                        className={`h-7 whitespace-nowrap rounded-md px-2 text-[7px] font-bold transition ${
                          user.is_blocked
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                        }`}
                      >
                        {user.is_blocked
                          ? "Unblock"
                          : "Block"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE */}
          <div className="divide-y divide-slate-100 lg:hidden">
            {filtered.map((user) => (
              <article
                key={user.id}
                className="p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-[11px] font-bold text-[#13263A]">
                      {user.name}
                    </h2>

                    <p className="mt-1 truncate text-[9px] text-slate-500">
                      {user.email}
                    </p>

                    <p className="mt-0.5 text-[9px] text-slate-400">
                      {user.phone_number || "-"}
                    </p>
                  </div>

                  <RoleBadge role={user.role} />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-[#F8FAFD] p-3">
                  <MobileField
                    label="Status"
                    value={
                      user.is_blocked
                        ? "Blocked"
                        : user.approval_status ||
                          "approved"
                    }
                  />

                  <MobileField
                    label="Joined"
                    value={formatDate(
                      user.created_at,
                    )}
                  />

                  <MobileField
                    label="Source"
                    value={user.source || "-"}
                  />

                  <MobileField
                    label="Activity"
                    value={activityText(user)}
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    toggleBlocked(user)
                  }
                  className={`mt-3 h-8 rounded-lg px-3 text-[9px] font-bold ${
                    user.is_blocked
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {user.is_blocked
                    ? "Unblock User"
                    : "Block User"}
                </button>
              </article>
            ))}
          </div>

          {!filtered.length && (
            <p className="px-5 py-12 text-center text-[10px] text-slate-400">
              No users match these filters.
            </p>
          )}
        </section>
      </div>

      <CreateUserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        allowedRoles={roles}
        onCreated={(message) => {
          setSuccess(message);
          router.refresh();
        }}
      />
    </div>
  );
}

function RoleBadge({
  role,
}: {
  role: string;
}) {
  const tone =
    role === "admin"
      ? "border-violet-100 bg-violet-50 text-violet-700"
      : role === "cleaner"
        ? "border-emerald-100 bg-emerald-50 text-emerald-700"
        : role === "data_entry"
          ? "border-cyan-100 bg-cyan-50 text-cyan-700"
          : "border-blue-100 bg-blue-50 text-blue-700";

  return (
    <span
      className={`inline-flex rounded-md border px-2 py-1 text-[7px] font-extrabold uppercase tracking-[0.03em] ${tone}`}
    >
      {labelRole(role)}
    </span>
  );
}

function StatusBadge({
  blocked,
  status,
}: {
  blocked: boolean | null;
  status: string | null;
}) {
  if (blocked) {
    return (
      <span className="inline-flex rounded-md border border-rose-100 bg-rose-50 px-2 py-1 text-[7px] font-extrabold uppercase text-rose-700">
        Blocked
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-100 bg-emerald-50 px-2 py-1 text-[7px] font-extrabold capitalize text-emerald-700">
      <CheckCircle2 size={10} />
      {status || "approved"}
    </span>
  );
}

function MobileField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-[8px] font-bold uppercase text-slate-400">
        {label}
      </div>

      <div className="mt-0.5 text-[9px] text-slate-700">
        {value}
      </div>
    </div>
  );
}

function activityText(
  user: AdminUserRecord,
) {
  if (user.role !== "cleaner") {
    return user.is_online
      ? "Online"
      : "Offline";
  }

  if (user.is_working) return "Working";
  if (user.is_available) return "Available";

  return user.is_online
    ? "Online"
    : "Offline";
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(
    "en-CA",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
}
