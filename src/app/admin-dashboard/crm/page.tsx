import Link from "next/link";
import { BarChart3, Building2, ReceiptText, Scale, Users } from "lucide-react";

const cards = [
  {
    href: "/admin-dashboard/crm/customers",
    title: "Customers",
    copy: "Billing contacts for invoices, separate from app users.",
    icon: Users,
  },
  {
    href: "/admin-dashboard/crm/invoices",
    title: "Invoices",
    copy: "Create drafts, issue unique numbers, send, and collect payment.",
    icon: ReceiptText,
  },
  {
    href: "/admin-dashboard/crm/reports",
    title: "Reports",
    copy: "Issued count, collected cash, and open balances.",
    icon: BarChart3,
  },
  {
    href: "/admin-dashboard/crm/reconciliation",
    title: "Reconciliation",
    copy: "Match received CRM payments to an expected period total.",
    icon: Scale,
  },
  {
    href: "/admin-dashboard/crm/settings",
    title: "Company settings",
    copy: "Legal name, tax, and invoice number prefix. Admin can edit.",
    icon: Building2,
  },
];

export default function InvoiceCrmPage() {
  return (
    <div className="p-6">
      <h1 className="text-slate-900">Invoice CRM</h1>
      <p className="mt-1 mb-6 max-w-2xl text-slate-500">
        Separate from bookings, jobs, and the existing payments table. Cleaners cannot access this module. Data entry can create and issue invoices; only admins can void.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-sm">
              <Icon className="text-[#4A86F7]" size={22} />
              <h2 className="mt-3 text-slate-900">{card.title}</h2>
              <p className="mt-1 text-slate-500">{card.copy}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
