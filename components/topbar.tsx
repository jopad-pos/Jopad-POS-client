"use client";

import { usePathname } from "next/navigation";
import {
  Bell,
  Search,
  RefreshCw,
  LogOut,
  ChevronDown,
  MapPin,
  Check,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBranch } from "@/contexts/BranchContext";
import { useRef, useState, useEffect } from "react";

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
  "/dashboard/branches": {
    title: "Branches",
    subtitle: "Manage your locations",
  },
  "/dashboard/settings": {
    title: "Settings",
    subtitle: "Store configuration and preferences",
  },
};

function getInitials(email: string): string {
  const parts = email
    .split("@")[0]
    .split(/[\s._-]/)
    .filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

function BranchSelector() {
  const { branches, selectedBranchId, selectedBranch, setSelectedBranchId } =
    useBranch();
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Only business owners can switch branches
  if (profile?.role !== "client") return null;
  // Don't render if client only has one branch (or none yet)
  if (branches.length <= 1) return null;

  const label = selectedBranch ? selectedBranch.name : "All Branches";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
      >
        <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
        <span className="max-w-[120px] truncate">{label}</span>
        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 min-w-[180px] py-1">
          <button
            onClick={() => {
              setSelectedBranchId(null);
              setOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2 text-[12px] text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span>All Branches</span>
            {selectedBranchId === null && (
              <Check className="w-3 h-3 text-blue-600" />
            )}
          </button>
          <div className="h-px bg-slate-100 my-1" />
          {branches
            .filter((b) => b.isActive)
            .map((b) => (
              <button
                key={b._id}
                onClick={() => {
                  setSelectedBranchId(b._id);
                  setOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-[12px] text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <div className="text-left min-w-0">
                  <p className="font-medium truncate">{b.name}</p>
                  {b.location && (
                    <p className="text-[10px] text-slate-400 truncate">
                      {b.location}
                    </p>
                  )}
                </div>
                {selectedBranchId === b._id && (
                  <Check className="w-3 h-3 text-blue-600 ml-2 shrink-0" />
                )}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

export default function Topbar() {
  const pathname = usePathname();
  const page = pageMeta[pathname] ?? { title: "Jopad POS", subtitle: "" };
  const { user, logout } = useAuth();
  const initials = user ? getInitials(user.email) : "…";

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
        <BranchSelector />

        {/* <div className="relative hidden md:block">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-8 pr-4 py-1.5 text-[12px] bg-slate-50 border border-slate-200 rounded-md text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white w-44 transition"
          />
        </div> */}

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
          <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center">
            <span className="text-white text-[10px] font-semibold">
              {initials}
            </span>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            aria-label="Sign out"
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
