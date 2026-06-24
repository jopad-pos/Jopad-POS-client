"use client";

import { ShoppingCart, TrendingUp, Package, Receipt } from "lucide-react";
import { type DashboardData, formatAmount } from "./types";

function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 animate-pulse">
      <div className="h-3 bg-slate-100 rounded w-24 mb-3" />
      <div className="h-5 bg-slate-100 rounded w-32 mb-2" />
      <div className="h-2.5 bg-slate-100 rounded w-20" />
    </div>
  );
}

interface StatCardsProps {
  loading: boolean;
  today: DashboardData["today"] | undefined;
  delta: DashboardData["delta"] | undefined;
  currency: string;
}

export function StatCards({ loading, today, delta, currency }: StatCardsProps) {
  const cards = [
    {
      label: "Revenue Today",
      value: today ? formatAmount(today.revenue, currency) : "—",
      delta:
        delta?.revenueVsYesterday != null
          ? `${delta.revenueVsYesterday >= 0 ? "+" : ""}${delta.revenueVsYesterday.toFixed(1)}% vs yesterday`
          : "No sales yesterday",
      up: delta?.revenueVsYesterday != null && delta.revenueVsYesterday > 0,
      icon: TrendingUp,
    },
    {
      label: "Transactions",
      value: today ? String(today.transactions) : "—",
      delta: today
        ? `${today.transactions} sale${today.transactions !== 1 ? "s" : ""} recorded`
        : "—",
      up: null,
      icon: ShoppingCart,
    },
    {
      label: "Items Sold",
      value: today ? String(today.itemsSold) : "—",
      delta:
        today && today.transactions > 0
          ? `Avg ${(today.itemsSold / today.transactions).toFixed(1)} per sale`
          : "No transactions yet",
      up: null,
      icon: Package,
    },
    {
      label: "Credit Sales",
      value: today ? formatAmount(today.creditTotal, currency) : "—",
      delta: today
        ? `${today.creditCount} account${today.creditCount !== 1 ? "s" : ""}`
        : "—",
      up: null,
      icon: Receipt,
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {loading
        ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        : cards.map((s) => (
            <div key={s.label} className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2.5">
                <p className="text-[11px] font-medium text-slate-500">{s.label}</p>
                <div className="w-7 h-7 rounded-md bg-slate-50 flex items-center justify-center">
                  <s.icon className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
              <p className="text-lg font-semibold text-slate-900 tabular-nums leading-none">
                {s.value}
              </p>
              <p className={`text-[11px] mt-1.5 ${s.up ? "text-emerald-600" : "text-slate-400"}`}>
                {s.up && <span className="inline-block mr-0.5">↑</span>}
                {s.delta}
              </p>
            </div>
          ))}
    </div>
  );
}
