"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, RefreshCw } from "lucide-react";

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Overview", subtitle: "Today, Tuesday 13 May 2026" },
  "/dashboard/sales": {
    title: "Sales",
    subtitle: "All transactions and revenue",
  },
  "/dashboard/stock": {
    title: "Stock",
    subtitle: "Inventory levels and product catalogue",
  },
  "/dashboard/purchases": {
    title: "Purchases & Expenses",
    subtitle: "Supplier orders and business expenses",
  },
  "/dashboard/customers": {
    title: "Customers",
    subtitle: "Customer accounts and purchase history",
  },
  "/dashboard/suppliers": {
    title: "Suppliers",
    subtitle: "Supplier directory and order history",
  },
  "/dashboard/reports": {
    title: "Reports",
    subtitle: "Sales, stock and financial summaries",
  },
  "/dashboard/invoices": {
    title: "Invoices",
    subtitle: "Quotes and customer invoices",
  },
  "/dashboard/accounting": {
    title: "Accounting",
    subtitle: "Profit & loss, balance sheet, cash flow",
  },
  "/dashboard/staff": {
    title: "Staff",
    subtitle: "Team accounts and performance",
  },
  "/dashboard/settings": {
    title: "Settings",
    subtitle: "Store configuration and preferences",
  },
};

export default function Topbar() {
  const pathname = usePathname();
  const page = pageMeta[pathname] ?? { title: "Jopad POS", subtitle: "" };

  return (
    <header className="h-[52px] bg-white border-b border-slate-200 flex items-center px-5 gap-4 flex-shrink-0">
      <div className="flex-1 min-w-0">
        <h1 className="text-[13px] font-semibold text-slate-900 leading-none truncate">
          {page.title}
        </h1>
        {page.subtitle && (
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
            {page.subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-8 pr-4 py-1.5 text-[12px] bg-slate-50 border border-slate-200 rounded-md text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white w-44 transition"
          />
        </div>

        <button
          aria-label="Sync status"
          title="Last synced: 2 min ago"
          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        <button
          aria-label="Notifications"
          className="relative p-1.5 rounded-md hover:bg-slate-100 transition-colors"
        >
          <Bell className="w-4 h-4 text-slate-500" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full border-2 border-white" />
        </button>

        <div className="w-px h-5 bg-slate-200" />

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center cursor-pointer">
            <span className="text-white text-[10px] font-semibold">NA</span>
          </div>
        </div>
      </div>
    </header>
  );
}
