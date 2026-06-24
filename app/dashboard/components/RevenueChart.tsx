"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { type DashboardData, formatAmount } from "./types"
import { PRIMARY_BLUE } from "@/lib/colors";

function ChartTooltip({
  active,
  payload,
  label,
  currency,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  currency: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="text-[13px] font-semibold text-slate-900">
        {formatAmount(payload[0].value, currency)}
      </p>
    </div>
  );
}

interface RevenueChartProps {
  loading: boolean;
  weeklyRevenue: DashboardData["weeklyRevenue"];
  weekTotal: number;
  delta: DashboardData["delta"] | undefined;
  currency: string;
}

export function RevenueChart({
  loading,
  weeklyRevenue,
  weekTotal,
  delta,
  currency,
}: RevenueChartProps) {
  return (
    <div className="xl:col-span-2 bg-white border border-slate-200 rounded-lg flex flex-col h-[500px]">
      <div className="flex items-start justify-between px-5 pt-4 pb-3 flex-shrink-0">
        <div>
          <h2 className="text-[13px] font-semibold text-slate-900">
            Revenue — Last 7 Days
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {loading ? "Loading…" : formatAmount(weekTotal, currency) + " this week"}
          </p>
        </div>
        {!loading && delta?.revenueVsYesterday != null && (
          <span
            className={`text-[11px] font-medium px-2 py-1 rounded ${
              delta.revenueVsYesterday >= 0
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {delta.revenueVsYesterday >= 0 ? "↑" : "↓"}{" "}
            {Math.abs(delta.revenueVsYesterday).toFixed(1)}% today
          </span>
        )}
      </div>

      <div className="flex-1 px-2 pb-4 min-h-0">
        {loading ? (
          <div className="h-full bg-slate-50 rounded animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklyRevenue}
              barCategoryGap="35%"
              margin={{ top: 4, right: 8, left: 8, bottom: 0 }}
            >
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                content={<ChartTooltip currency={currency} />}
                cursor={{ fill: "#f1f5f9" }}
              />
              <Bar dataKey="revenue" radius={[3, 3, 0, 0]}>
                {weeklyRevenue.map((_, i, arr) => (
                  <Cell
                    key={i}
                    fill={i === arr.length - 1 ? PRIMARY_BLUE : "#e2e8f0"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
