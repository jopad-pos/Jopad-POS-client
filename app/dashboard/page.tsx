import {
  ShoppingCart,
  TrendingUp,
  Users,
  Package,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  FileDown,
  BoxSelect,
  Receipt,
} from "lucide-react";
import Link from "next/link";

const todayStats = [
  {
    label: "Revenue Today",
    value: "UGX 482,500",
    delta: "+12% vs yesterday",
    up: true,
    icon: TrendingUp,
  },
  {
    label: "Transactions",
    value: "34",
    delta: "31 customers served",
    up: null,
    icon: ShoppingCart,
  },
  {
    label: "Items Sold",
    value: "127",
    delta: "Avg 3.7 per sale",
    up: null,
    icon: Package,
  },
  {
    label: "Credit Sales",
    value: "UGX 78,000",
    delta: "2 accounts",
    up: null,
    icon: Receipt,
  },
];

const recentSales = [
  {
    ref: "T-034",
    customer: "Walk-in Customer",
    items: 4,
    amount: "UGX 45,000",
    time: "10:32 AM",
    cashier: "Diana A.",
  },
  {
    ref: "T-033",
    customer: "Kasozi James",
    items: 2,
    amount: "UGX 12,500",
    time: "10:15 AM",
    cashier: "Brian O.",
  },
  {
    ref: "T-032",
    customer: "Nakato Sarah",
    items: 7,
    amount: "UGX 78,000",
    time: "09:58 AM",
    cashier: "Diana A.",
  },
  {
    ref: "T-031",
    customer: "Walk-in Customer",
    items: 1,
    amount: "UGX 6,000",
    time: "09:45 AM",
    cashier: "Diana A.",
  },
  {
    ref: "T-030",
    customer: "Mugisha Robert",
    items: 3,
    amount: "UGX 31,500",
    time: "09:30 AM",
    cashier: "Brian O.",
  },
  {
    ref: "T-029",
    customer: "Akello Grace",
    items: 5,
    amount: "UGX 54,000",
    time: "09:14 AM",
    cashier: "Ruth N.",
  },
];

const lowStockItems = [
  { name: "Bread (Brown)", category: "Groceries", qty: 4, min: 20 },
  { name: "Cooking Oil 5L", category: "Groceries", qty: 2, min: 10 },
  { name: "Maize Flour 2kg", category: "Groceries", qty: 3, min: 12 },
  { name: "Sugar 2kg", category: "Groceries", qty: 8, min: 15 },
  { name: "Airtime MTN 1k", category: "Airtime", qty: 14, min: 25 },
];

const topProducts = [
  { name: "Mineral Water 500ml", sold: 28, revenue: "UGX 42,000" },
  { name: "Bread (Brown)", sold: 18, revenue: "UGX 63,000" },
  { name: "Coca-Cola 500ml", sold: 15, revenue: "UGX 30,000" },
  { name: "Cooking Oil 1L", sold: 12, revenue: "UGX 72,000" },
  { name: "Sugar 1kg", sold: 9, revenue: "UGX 56,250" },
];

const weeklyRevenue = [
  { day: "Wed", value: 320000 },
  { day: "Thu", value: 445000 },
  { day: "Fri", value: 610000 },
  { day: "Sat", value: 740000 },
  { day: "Sun", value: 295000 },
  { day: "Mon", value: 380000 },
  { day: "Tue", value: 482500 },
];

const maxRevenue = Math.max(...weeklyRevenue.map((d) => d.value));

function formatUGX(n: number) {
  return "UGX " + n.toLocaleString();
}

export default function OverviewPage() {
  return (
    <div className="p-5 space-y-5">
      {/* Quick actions */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium px-3 py-2 rounded-lg transition-colors">
          <Plus className="w-3.5 h-3.5" />
          New Sale
        </button>
        <button className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-[12px] font-medium px-3 py-2 rounded-lg border border-slate-200 transition-colors">
          <BoxSelect className="w-3.5 h-3.5 text-slate-400" />
          Add Product
        </button>
        <button className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-[12px] font-medium px-3 py-2 rounded-lg border border-slate-200 transition-colors">
          <FileDown className="w-3.5 h-3.5 text-slate-400" />
          Export Today
        </button>

        {/* Low stock alert pill */}
        <div className="ml-auto flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-[12px] font-medium px-3 py-1.5 rounded-lg">
          <AlertTriangle className="w-3.5 h-3.5" />5 items low on stock
          <Link
            href="/dashboard/stock"
            className="underline underline-offset-2 text-amber-600 hover:text-amber-800"
          >
            View
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {todayStats.map((s) => (
          <div
            key={s.label}
            className="bg-white border border-slate-200 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-2.5">
              <p className="text-[11px] font-medium text-slate-500">
                {s.label}
              </p>
              <div className="w-7 h-7 rounded-md bg-slate-50 flex items-center justify-center">
                <s.icon className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
            <p className="text-lg font-semibold text-slate-900 tabular-nums leading-none">
              {s.value}
            </p>
            <p
              className={`text-[11px] mt-1.5 ${s.up ? "text-emerald-600" : "text-slate-400"}`}
            >
              {s.up && <span className="inline-block mr-0.5">↑</span>}
              {s.delta}
            </p>
          </div>
        ))}
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Weekly revenue chart */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-[13px] font-semibold text-slate-900">
                Revenue — Last 7 Days
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Compared by day
              </p>
            </div>
            <span className="text-[11px] bg-emerald-50 text-emerald-700 font-medium px-2 py-1 rounded">
              ↑ 8.2% this week
            </span>
          </div>

          <div className="flex items-end gap-2.5 h-32">
            {weeklyRevenue.map((item) => {
              const pct = (item.value / maxRevenue) * 100;
              const isToday = item.day === "Tue";
              return (
                <div
                  key={item.day}
                  className="flex flex-col items-center gap-1.5 flex-1"
                >
                  <span className="text-[10px] text-slate-500 tabular-nums">
                    {(item.value / 1000).toFixed(0)}k
                  </span>
                  <div
                    className="w-full flex items-end"
                    style={{ height: "80px" }}
                  >
                    <div
                      className={`w-full rounded-t-sm ${isToday ? "bg-blue-600" : "bg-slate-200"}`}
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <span
                    className={`text-[10px] ${isToday ? "text-blue-600 font-semibold" : "text-slate-400"}`}
                  >
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top products */}
        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
            <h2 className="text-[13px] font-semibold text-slate-900">
              Top Products Today
            </h2>
          </div>
          <div className="divide-y divide-slate-50">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3 px-4 py-3">
                <span className="text-[11px] text-slate-400 w-4 tabular-nums flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-slate-800 truncate">
                    {p.name}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {p.sold} units sold
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-slate-700 tabular-nums flex-shrink-0">
                  {p.revenue}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Recent sales */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
            <div>
              <h2 className="text-[13px] font-semibold text-slate-900">
                Recent Transactions
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Today, {recentSales.length} shown
              </p>
            </div>
            <Link
              href="/dashboard/sales"
              className="text-[11px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5"
            >
              All sales <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentSales.map((sale) => (
              <div
                key={sale.ref}
                className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/70 transition-colors"
              >
                <div className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <ShoppingCart className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-slate-800 truncate">
                    {sale.customer}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {sale.items} item{sale.items !== 1 ? "s" : ""} ·{" "}
                    {sale.cashier}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[12px] font-semibold text-slate-900 tabular-nums">
                    {sale.amount}
                  </p>
                  <p className="text-[10px] text-slate-400">{sale.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock alerts */}
        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <h2 className="text-[13px] font-semibold text-slate-900">
                Low Stock
              </h2>
            </div>
            <Link
              href="/dashboard/stock"
              className="text-[11px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5"
            >
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {lowStockItems.map((item) => {
              const pct = Math.round((item.qty / item.min) * 100);
              return (
                <div key={item.name} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[12px] font-medium text-slate-800 truncate pr-2">
                      {item.name}
                    </p>
                    <span className="text-[11px] font-semibold text-amber-600 flex-shrink-0 tabular-nums">
                      {item.qty} left
                    </span>
                  </div>
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Min: {item.min} · {item.category}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
