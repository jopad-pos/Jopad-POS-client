"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  ArrowDownToLine,
  Users,
  Truck,
  BarChart3,
  FileText,
  BookOpen,
  UserCog,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  locked?: boolean;
};

const navGroups: { group: string; items: NavItem[] }[] = [
  {
    group: "",
    items: [{ label: "Overview", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    group: "Store",
    items: [
      { label: "Sales", href: "/dashboard/sales", icon: ShoppingCart },
      { label: "Stock", href: "/dashboard/stock", icon: Package },
      {
        label: "Purchases & Expenses",
        href: "/dashboard/purchases",
        icon: ArrowDownToLine,
      },
    ],
  },
  {
    group: "People",
    items: [
      { label: "Customers", href: "/dashboard/customers", icon: Users },
      { label: "Suppliers", href: "/dashboard/suppliers", icon: Truck },
    ],
  },
  {
    group: "Insights",
    items: [{ label: "Reports", href: "/dashboard/reports", icon: BarChart3 }],
  },
  {
    group: "Plus",
    items: [
      {
        label: "Invoices",
        href: "/dashboard/invoices",
        icon: FileText,
        badge: "Plus",
      },
      {
        label: "Accounting",
        href: "/dashboard/accounting",
        icon: BookOpen,
        badge: "Plus",
      },
    ],
  },
];

const bottomItems: NavItem[] = [
  { label: "Staff", href: "/dashboard/staff", icon: UserCog },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <aside className="w-[220px] bg-[#0c1117] flex flex-col h-screen fixed left-0 top-0 bottom-0 z-40">
      {/* Business header */}
      <div className="px-4 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-[10px]">JP</span>
          </div>
          <span className="text-slate-400 text-[11px] font-medium">
            Jopad POS
          </span>
        </div>
        <button className="w-full flex items-center justify-between bg-white/[0.04] hover:bg-white/[0.07] rounded-md px-3 py-2 transition-colors group">
          <div className="text-left min-w-0">
            <p className="text-white text-[12px] font-semibold truncate leading-none">
              Ntunda Supermarket
            </p>
            <p className="text-slate-500 text-[10px] mt-0.5">
              Kampala · Plus Plan
            </p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 flex-shrink-0 ml-1 transition-colors" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
        {navGroups.map((group) => (
          <div key={group.group || "main"}>
            {group.group && (
              <p className="text-slate-600 text-[9px] uppercase tracking-widest font-bold px-3 mb-1.5">
                {group.group}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[12px] font-medium transition-colors ${
                      active
                        ? "bg-slate-800 text-white"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                    }`}
                  >
                    <item.icon
                      className={`w-4 h-4 flex-shrink-0 ${active ? "text-blue-400" : ""}`}
                    />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] bg-blue-900/60 text-blue-300 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide flex-shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="px-3 pb-3 border-t border-white/[0.06] pt-3 space-y-0.5">
        {bottomItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[12px] font-medium transition-colors ${
                active
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
              }`}
            >
              <item.icon
                className={`w-4 h-4 flex-shrink-0 ${active ? "text-blue-400" : ""}`}
              />
              {item.label}
            </Link>
          );
        })}

        {/* User */}
        <div className="flex items-center gap-2.5 px-3 py-2 mt-2 rounded-md group hover:bg-white/[0.04] cursor-pointer transition-colors">
          <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[10px] font-semibold">NA</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-[11px] font-medium truncate leading-none">
              Namukasa Aisha
            </p>
            <p className="text-slate-500 text-[10px] truncate mt-0.5">
              Manager
            </p>
          </div>
          <LogOut className="w-3 h-3 text-slate-600 group-hover:text-slate-400 flex-shrink-0 transition-colors" />
        </div>
      </div>
    </aside>
  );
}
