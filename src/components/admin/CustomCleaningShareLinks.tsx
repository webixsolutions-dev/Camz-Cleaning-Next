"use client";

import { Check, ClipboardCopy, Clock3, DollarSign } from "lucide-react";
import { useState } from "react";

const links = [
  {
    id: "checklist-only",
    label: "Checklist without price",
    description: "Shows the selected scope and estimated time only.",
    path: "/custom-cleaning-request/checklist-only",
    icon: Clock3,
  },
  {
    id: "checklist-with-price",
    label: "Checklist with price",
    description: "Shows time, price estimate, carpet amount, and GST.",
    path: "/custom-cleaning-request/checklist-with-price",
    icon: DollarSign,
  },
] as const;

export default function CustomCleaningShareLinks() {
  const [copied, setCopied] = useState("");

  const copy = async (id: string, path: string) => {
    const url = `${window.location.origin}${path}`;
    await navigator.clipboard.writeText(url);
    setCopied(id);
    window.setTimeout(() => setCopied((current) => current === id ? "" : current), 1800);
  };

  return (
    <section className="mt-4 rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
      <div>
        <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#4A86F7]">Customer links</p>
        <h2 className="mt-1 text-sm font-bold text-[#13263A]">Choose which checklist link to send</h2>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {links.map((item) => {
          const Icon = item.icon;
          const isCopied = copied === item.id;
          return (
            <div key={item.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-[#F8FAFD] p-4 sm:flex-row sm:items-center">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#4A86F7]"><Icon size={18} /></span>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-bold text-[#13263A]">{item.label}</p>
                <p className="mt-1 text-[10px] text-slate-500">{item.description}</p>
                <p className="mt-1 truncate text-[9px] text-slate-400">{item.path}</p>
              </div>
              <button type="button" onClick={() => void copy(item.id, item.path)} className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#13263A] px-4 text-[10px] font-bold text-white hover:bg-[#1B354D]">
                {isCopied ? <Check size={14} /> : <ClipboardCopy size={14} />}
                {isCopied ? "Copied" : "Copy link"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
