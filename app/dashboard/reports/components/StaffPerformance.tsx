"use client";

import type { StaffMember } from "./types";
import { fmtAmt } from "./types";

interface StaffPerformanceProps {
  loading: boolean;
  data: StaffMember[];
  currency: string;
}

export function StaffPerformance({
  loading,
  data,
  currency,
}: StaffPerformanceProps) {
  const topRevenue =
    data.length > 0 ? Math.max(...data.map((s) => s.revenue)) : 1;

  return (
    <div className="bg-white border border-slate-200 rounded-lg h-[600px] flex flex-col">
      <div className="px-4 py-3.5 border-b border-slate-100">
        <h2 className="text-[13px] font-semibold text-slate-900">
          Staff Performance
        </h2>
        <p className="text-[11px] text-slate-400 mt-0.5">
          By revenue generated
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="divide-y divide-slate-50">
            {[1, 2, 3].map((i) => (
              <div key={i} className="px-4 py-3.5">
                <div className="h-3 bg-slate-100 rounded animate-pulse w-1/2 mb-2" />
                <div className="h-1.5 bg-slate-100 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[12px] text-slate-400">
            No staff data in this period
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {data.map((s, i) => {
              const pct = Math.round((s.revenue / topRevenue) * 100);
              return (
                <div key={s.name} className="px-4 py-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[11px] text-slate-400 w-3">
                        {i + 1}
                      </span>
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-[9px] font-semibold text-slate-600">
                          {s.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[12px] font-medium text-slate-800 truncate max-w-[120px]">
                        {s.name}
                      </p>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-700 tabular-nums">
                      {s.sales} sales
                    </p>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 tabular-nums">
                    {fmtAmt(s.revenue, currency)} revenue · avg{" "}
                    {fmtAmt(s.avgSale, currency)}/sale
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
