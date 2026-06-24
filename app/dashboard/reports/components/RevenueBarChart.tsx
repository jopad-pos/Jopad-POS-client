"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from "recharts";
import type { DailyRevenue } from "./types";
import { fmtAmt } from "./types";
import { PRIMARY_BLUE } from "@/lib/colors";

function ChartTooltip({
  active,
  payload,
  label,
  currency,
}: {
  active?: boolean;
  payload?: { value: number; payload: DailyRevenue }[];
  label?: string;
  currency: string;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="text-[13px] font-semibold text-slate-900">
        {fmtAmt(d.revenue, currency)}
      </p>
      <p className="text-[11px] text-slate-400 mt-0.5">
        {d.transactions} transactions
      </p>
    </div>
  );
}

interface RevenueBarChartProps {
  loading: boolean;
  data: DailyRevenue[];
  currency: string;
  periodLabel: string;
}

export function RevenueBarChart({
  loading,
  data,
  currency,
  periodLabel,
}: RevenueBarChartProps) {
  const total = data.reduce((s, d) => s + d.revenue, 0);
  const totalTx = data.reduce((s, d) => s + d.transactions, 0);
  const maxRev = Math.max(...data.map((d) => d.revenue), 1);
  const avgDaily = data.length > 0 ? Math.round(total / data.length) : 0;
  const avgTx =
    totalTx > 0 && data.length > 0 ? Math.round(total / totalTx) : 0;

  // Use shorter labels when there are many days
  const xKey = data.length > 14 ? "date" : "day";
  const displayData =
    data.length > 31
      ? data.filter((_, i) => i % Math.ceil(data.length / 31) === 0)
      : data;

  return (
    <div className="xl:col-span-2 bg-white border border-slate-200 rounded-lg p-5 flex flex-col h-[600px]">
      <div className="flex items-start justify-between mb-4 flex-shrink-0">
        <div>
          <h2 className="text-[13px] font-semibold text-slate-900">
            Daily Revenue — {periodLabel}
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {loading ? "Loading…" : fmtAmt(total, currency) + " total"}
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0" style={{ height: 220 }}>
        {loading ? (
          <div className="h-full bg-slate-50 rounded animate-pulse" />
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[12px] text-slate-400">
            No sales in this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={displayData}
              barCategoryGap="30%"
              margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
            >
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey={xKey}
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis hide domain={[0, maxRev * 1.1]} />
              <Tooltip
                content={<ChartTooltip currency={currency} />}
                cursor={{ fill: "#f8fafc" }}
              />
              <Bar dataKey="revenue" radius={[3, 3, 0, 0]} maxBarSize={48}>
                {displayData.map((d, i) => (
                  <Cell
                    key={i}
                    fill={d.revenue === maxRev ? PRIMARY_BLUE : "#bfdbfe"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-4 flex-shrink-0">
        <div>
          <p className="text-[11px] text-slate-400">Total transactions</p>
          <p className="text-[13px] font-semibold text-slate-800 mt-0.5 tabular-nums">
            {loading ? "—" : totalTx.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-slate-400">Avg daily revenue</p>
          <p className="text-[13px] font-semibold text-slate-800 mt-0.5 tabular-nums">
            {loading ? "—" : fmtAmt(avgDaily, currency)}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-slate-400">Avg transaction value</p>
          <p className="text-[13px] font-semibold text-slate-800 mt-0.5 tabular-nums">
            {loading ? "—" : fmtAmt(avgTx, currency)}
          </p>
        </div>
      </div>
    </div>
  );
}
