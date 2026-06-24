"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import type { ReportSummary } from "./types";
import { fmtAmt } from "./types";

interface SummaryCardsProps {
  loading: boolean;
  summary: ReportSummary | undefined;
  currency: string;
}

export function SummaryCards({ loading, summary, currency }: SummaryCardsProps) {
  const revenue = summary?.revenue ?? 0;
  const prevRevenue = summary?.prevRevenue ?? 0;
  const transactions = summary?.transactions ?? 0;
  const grossProfit = summary?.grossProfit ?? 0;
  const bestDay = summary?.bestDay ?? null;

  const delta =
    prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : null;

  const cards = [
    {
      label: "Total Revenue",
      value: loading ? "—" : fmtAmt(revenue, currency),
      sub:
        delta != null ? (
          <span
            className={`flex items-center gap-1 ${delta >= 0 ? "text-emerald-600" : "text-red-500"}`}
          >
            {delta >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(delta).toFixed(1)}% vs prev period
          </span>
        ) : (
          <span className="text-slate-400">No prior data</span>
        ),
    },
    {
      label: "Transactions",
      value: loading ? "—" : transactions.toLocaleString(),
      sub: (
        <span className="text-slate-400">
          Avg {currency}{" "}
          {transactions > 0
            ? Math.round(revenue / transactions).toLocaleString()
            : 0}
          /sale
        </span>
      ),
    },
    {
      label: "Gross Profit",
      value: loading ? "—" : fmtAmt(grossProfit, currency),
      sub: (
        <span className="text-slate-400">
          {revenue > 0 ? Math.round((grossProfit / revenue) * 100) : 0}% margin
        </span>
      ),
    },
    {
      label: "Best Day",
      value: loading ? "—" : bestDay?.day ?? "—",
      sub: bestDay ? (
        <span className="text-emerald-600 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          {fmtAmt(bestDay.revenue, currency)}
        </span>
      ) : (
        <span className="text-slate-400">No sales yet</span>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-white border border-slate-200 rounded-lg px-4 py-3.5"
        >
          <p className="text-[11px] font-medium text-slate-500">{c.label}</p>
          <p
            className={`text-base font-semibold mt-1 tabular-nums leading-none ${
              loading ? "text-slate-300" : "text-slate-900"
            }`}
          >
            {c.value}
          </p>
          <p className="text-[11px] mt-1.5">{c.sub}</p>
        </div>
      ))}
    </div>
  );
}
