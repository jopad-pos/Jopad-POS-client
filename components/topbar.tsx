"use client";

import { usePathname } from "next/navigation";
import {
  Bell,
  LogOut,
  ChevronDown,
  MapPin,
  Check,
  Menu,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBranch } from "@/contexts/BranchContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { apiRequest } from "@/lib/api";
import { useRef, useState, useEffect } from "react";

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Overview", subtitle: "" }, // subtitle: today's date, set at render
  "/dashboard/sales": {
    title: "Sales",
    subtitle: "All transactions and revenue",
  },
  "/dashboard/stock": {
    title: "Stock",
    subtitle: "Inventory levels and product catalogue",
  },
  "/dashboard/services": {
    title: "Services",
    subtitle: "Service catalogue and pricing",
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
  "/dashboard/quotations": {
    title: "Quotations",
    subtitle: "Customer quotes and estimates",
  },
  "/dashboard/labels": {
    title: "Labels & Barcodes",
    subtitle: "Generate product labels and barcodes",
  },
  "/dashboard/hotel": {
    title: "Hotel",
    subtitle: "Rooms, check-ins and stays",
  },
  "/dashboard/restaurant": {
    title: "Restaurant",
    subtitle: "Tables, menu, orders and reservations",
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
  "/dashboard/announcements": {
    title: "Announcements",
    subtitle: "Updates from the Jopad POS team",
  },
  "/dashboard/activity-log": {
    title: "Activity Log",
    subtitle: "Trace of staff and account changes",
  },
};

interface AnnouncementItem {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function NotificationBell() {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Only the business owner or a staff Manager can view announcements
  const canView = profile?.role === "client" || profile?.staffRole === "Manager";

  useEffect(() => {
    if (!canView) return;
    let cancelled = false;

    async function loadCount() {
      try {
        const data = await apiRequest<{ count: number }>(
          "/api/announcements/unread-count",
        );
        if (!cancelled) setUnreadCount(data.count);
      } catch {
        // ignore — non-critical badge
      }
    }

    loadCount();
    const interval = setInterval(loadCount, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [canView]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (!next) return;
    setLoading(true);
    try {
      const data = await apiRequest<{ items: AnnouncementItem[] }>(
        "/api/announcements?limit=20",
      );
      setItems(data.items ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function markRead(id: string) {
    setItems((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await apiRequest(`/api/announcements/${id}/read`, { method: "PATCH" });
    } catch {
      // ignore
    }
  }

  async function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await apiRequest("/api/announcements/read-all", { method: "PATCH" });
    } catch {
      // ignore
    }
  }

  if (!canView) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={toggleOpen}
        aria-label="Notifications"
        className="relative p-1.5 rounded-md hover:bg-slate-100 transition-colors"
      >
        <Bell className="w-4 h-4 text-slate-500" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full border-2 border-white" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 w-80 max-h-96 flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
            <p className="text-[12px] font-semibold text-slate-900">
              Notifications
            </p>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] text-blue-600 hover:text-blue-700 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="overflow-y-auto flex-1">
            {loading && (
              <p className="px-3 py-6 text-center text-[12px] text-slate-400">
                Loading...
              </p>
            )}
            {!loading && items.length === 0 && (
              <p className="px-3 py-6 text-center text-[12px] text-slate-400">
                No notifications yet
              </p>
            )}
            {!loading &&
              items.map((n) => (
                <button
                  key={n._id}
                  onClick={() => !n.read && markRead(n._id)}
                  className={`w-full text-left px-3 py-2.5 border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                    n.read ? "" : "bg-blue-50/40"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-medium text-slate-900 truncate">
                        {n.title}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

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
  // Multi-branch is plan-gated — hide the switcher when the plan lacks it
  if (profile?.planFeatures && !profile.planFeatures.includes("branches")) return null;
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
  let page = pageMeta[pathname] ?? { title: "Jopad POS", subtitle: "" };
  if (pathname === "/dashboard") {
    const today = new Date().toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    page = { ...page, subtitle: `Today, ${today}` };
  }
  const { user, logout } = useAuth();
  const { toggle } = useSidebar();
  const initials = user ? getInitials(user.email) : "…";

  return (
    <header className="h-[52px] bg-white border-b border-slate-200 flex items-center px-3 sm:px-5 gap-2 sm:gap-4 flex-shrink-0">
      <button
        onClick={toggle}
        aria-label="Open menu"
        className="lg:hidden p-1.5 -ml-1 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
      >
        <Menu className="w-5 h-5" />
      </button>

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

        <NotificationBell />

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
