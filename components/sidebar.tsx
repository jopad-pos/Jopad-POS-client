"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  ArrowDownToLine,
  ArrowLeftRight,
  ConciergeBell,
  Users,
  Truck,
  UserCog,
  BarChart3,
  FileText,
  ClipboardList,
  BookOpen,
  GitBranch,
  Tag,
  BedDouble,
  UtensilsCrossed,
  Settings,
  LogOut,
  // ChevronDown,
  Lock,
  X,
  Megaphone,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import {
  DEFAULT_STAFF_PERMISSIONS,
  PLAN_GATED_FEATURES,
  type FeatureKey,
  type StaffRole,
} from "@/lib/permissions";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  featureKey?: FeatureKey;
  ownerOnly?: boolean;
  ownerOrManagerOnly?: boolean;
};

const navGroups: { group: string; items: NavItem[] }[] = [
  {
    group: "",
    items: [{ label: "Overview", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    group: "Store",
    items: [
      {
        label: "Sales",
        href: "/dashboard/sales",
        icon: ShoppingCart,
        featureKey: "sales",
      },
      {
        label: "Stock",
        href: "/dashboard/stock",
        icon: Package,
        featureKey: "stock",
      },
      {
        label: "Services",
        href: "/dashboard/services",
        icon: ConciergeBell,
        featureKey: "services",
      },
      {
        label: "Purchases & Expenses",
        href: "/dashboard/purchases",
        icon: ArrowDownToLine,
        featureKey: "purchases",
      },
      {
        label: "Stock Transfers",
        href: "/dashboard/stock-transfers",
        icon: ArrowLeftRight,
        badge: "Enterprise",
        featureKey: "transfers",
      },
    ],
  },
  {
    group: "People",
    items: [
      {
        label: "Customers",
        href: "/dashboard/customers",
        icon: Users,
        featureKey: "customers",
      },
      {
        label: "Suppliers",
        href: "/dashboard/suppliers",
        icon: Truck,
        featureKey: "suppliers",
      },
      {
        label: "Staff",
        href: "/dashboard/staff",
        icon: UserCog,
        featureKey: "staff",
      },
      {
        label: "Branches",
        href: "/dashboard/branches",
        icon: GitBranch,
        badge: "Enterprise",
        featureKey: "branches",
        ownerOnly: true,
      },
    ],
  },
  {
    group: "Insights",
    items: [
      {
        label: "Reports",
        href: "/dashboard/reports",
        icon: BarChart3,
        featureKey: "reports",
      },
    ],
  },
  {
    group: "Hospitality",
    items: [
      {
        label: "Hotel",
        href: "/dashboard/hotel",
        icon: BedDouble,
        badge: "Enterprise",
        featureKey: "hotel",
      },
    ],
  },
  {
    group: "Restaurant",
    items: [
      {
        label: "Restaurant",
        href: "/dashboard/restaurant",
        icon: UtensilsCrossed,
        badge: "Enterprise",
        featureKey: "restaurant",
      },
    ],
  },
  {
    group: "Plus",
    items: [
      {
        label: "Invoices",
        href: "/dashboard/invoices",
        icon: FileText,
        badge: "Plus",
        featureKey: "invoices",
      },
      {
        label: "Quotations",
        href: "/dashboard/quotations",
        icon: ClipboardList,
        badge: "Plus",
        featureKey: "quotations",
      },
      {
        label: "Accounting",
        href: "/dashboard/accounting",
        icon: BookOpen,
        badge: "Plus",
        featureKey: "accounting",
      },
      {
        label: "Labels & Barcodes",
        href: "/dashboard/labels",
        icon: Tag,
        badge: "Plus",
        featureKey: "labels",
      },
    ],
  },
];

const bottomItems: NavItem[] = [
  {
    label: "Announcements",
    href: "/dashboard/announcements",
    icon: Megaphone,
    ownerOrManagerOnly: true,
  },
  {
    label: "Activity Log",
    href: "/dashboard/activity-log",
    icon: ShieldAlert,
    ownerOnly: true,
  },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function Sidebar() {
  const pathname = usePathname();
  const { profile, logout } = useAuth();
  const { isOpen, close } = useSidebar();

  // Close the mobile drawer whenever the route changes
  useEffect(() => {
    close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const isActive = (href: string) => pathname === href;

  const businessName = profile?.businessName ?? "—";
  const locationText = profile?.location ?? "";
  const planText = profile?.plan ? `${profile.plan} Plan` : "";
  const subtitle = [locationText, planText].filter(Boolean).join(" · ");

  const userName = profile?.name ?? "—";
  const userRole =
    profile?.role === "client" ? "Owner" : (profile?.staffRole ?? "Staff");
  const initials = profile?.name ? getInitials(profile.name) : "—";

  const isOwner = profile?.role === "client";
  const isOwnerOrManager = isOwner || profile?.staffRole === "Manager";

  /** Returns true when the current plan does not include this feature. */
  function isPlanLocked(featureKey?: FeatureKey): boolean {
    if (!featureKey) return false;
    if (!(featureKey in PLAN_GATED_FEATURES)) return false;
    const planFeatures = profile?.planFeatures;
    if (!planFeatures) return false;
    return !planFeatures.includes(featureKey);
  }

  /** Returns true when the user's role grants access (staff permissions). */
  function hasRoleAccess(featureKey?: FeatureKey): boolean {
    if (!featureKey) return true;
    if (isOwner) return true;
    const staffRole = profile?.staffRole as StaffRole | undefined;
    if (!staffRole) return false;
    const allowed =
      profile?.staffPermissions?.[staffRole] ??
      DEFAULT_STAFF_PERMISSIONS[staffRole] ??
      [];
    return allowed.includes(featureKey);
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <aside
        className={`w-55 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 bottom-0 z-50 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Business header */}
        <div className="px-4 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between gap-2.5 mb-2.5">
            <Image
              src="/logos/jopad-pos-logo.png"
              alt="Jopad POS"
              width={140}
              height={140}
              className="shrink-0"
            />
            <button
              onClick={close}
              aria-label="Close menu"
              className="lg:hidden p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <button className="w-full flex items-center justify-between bg-slate-50 hover:bg-slate-100 rounded-md px-3 py-2 transition-colors group">
            <div className="flex items-center gap-2 min-w-0">
              {profile?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.logoUrl}
                  alt={businessName}
                  className="w-7 h-7 rounded-md object-cover shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-md bg-slate-200 text-slate-500 text-[11px] font-semibold flex items-center justify-center shrink-0">
                  {businessName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-left min-w-0">
                <p className="text-slate-900 text-[12px] font-semibold truncate leading-none">
                  {businessName}
                </p>
                {subtitle && (
                  <p className="text-slate-500 text-[10px] mt-0.5 truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            {/* <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0 ml-1 transition-colors" /> */}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
          {navGroups.map((group) => {
            // Hide owner-only items from staff, and items the staff role can't access;
            // plan-locked items are shown but dimmed
            const visibleItems = group.items.filter(
              (item) =>
                (!item.ownerOnly || isOwner) && hasRoleAccess(item.featureKey),
            );
            if (visibleItems.length === 0) return null;
            return (
              <div key={group.group || "main"}>
                {group.group && (
                  <p className="text-slate-400 text-[9px] uppercase tracking-widest font-bold px-3 mb-1.5">
                    {group.group}
                  </p>
                )}
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const active = isActive(item.href);
                    const locked = isPlanLocked(item.featureKey);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[12px] font-medium transition-colors ${
                          locked
                            ? "text-slate-400 hover:text-slate-500 hover:bg-slate-50"
                            : active
                              ? "bg-blue-50 text-blue-700"
                              : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <item.icon
                          className={`w-4 h-4 shrink-0 ${active && !locked ? "text-blue-600" : ""}`}
                        />
                        <span className="flex-1 truncate">{item.label}</span>
                        {locked ? (
                          <Lock className="w-3 h-3 text-slate-300 shrink-0" />
                        ) : item.badge ? (
                          <span className="text-[9px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide shrink-0">
                            {item.badge}
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Bottom nav */}
        <div className="px-3 pb-3 border-t border-slate-200 pt-3 space-y-0.5">
          {bottomItems
            .filter(
              (item) =>
                (!item.ownerOrManagerOnly || isOwnerOrManager) &&
                (!item.ownerOnly || isOwner),
            )
            .map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[12px] font-medium transition-colors ${
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <item.icon
                    className={`w-4 h-4 shrink-0 ${active ? "text-blue-600" : ""}`}
                  />
                  {item.label}
                </Link>
              );
            })}

          {/* User */}
          <div className="flex items-center gap-2.5 px-3 py-2 mt-2 rounded-md group hover:bg-slate-100 cursor-pointer transition-colors">
            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
              <span className="text-slate-700 text-[10px] font-semibold">
                {initials}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-900 text-[11px] font-medium truncate leading-none">
                {userName}
              </p>
              <p className="text-slate-500 text-[10px] truncate mt-0.5">
                {userRole}
              </p>
            </div>
            <button onClick={logout} title="Sign out" aria-label="Sign out">
              <LogOut className="w-3 h-3 text-slate-400 group-hover:text-slate-600 shrink-0 transition-colors" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
