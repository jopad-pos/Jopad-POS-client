"use client";

import type { DamagedGoods } from "./types";
import { fmtAmt } from "./types";

interface DamagedGoodsSummaryProps {
  loading: boolean;
  data: DamagedGoods | undefined;
  currency: string;
}

export function DamagedGoodsSummary({ loading, data, currency }: DamagedGoodsSummaryProps) {
  const totalQty = data?.totalQty ?? 0;
  const totalValue = data?.totalValue ?? 0;
  const byReason = data?.byReason ?? [];
  const topValue = byReason.length > 0 ? Math.max(...byReason.map((r) => r.value)) : 1;

  return (
    <div className="bg-white border border-slate-200 rounded-lg flex flex-col">
      <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-[13px] font-semibold text-slate-900">Damaged Goods</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Stock written off in this period</p>
        </div>
        <div className="text-right">
          <p className="text-[15px] font-semibold text-red-600 tabular-nums leading-none">
            {loading ? "—" : fmtAmt(totalValue, currency)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {loading ? "" : `${totalQty.toLocaleString()} units lost`}
          </p>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-3 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        ) : byReason.length === 0 ? (
          <div className="py-6 text-center text-[12px] text-slate-400">
            No damaged goods reported in this period
          </div>
        ) : (
          <div className="space-y-3">
            {byReason.map((r) => {
              const pct = Math.round((r.value / topValue) * 100);
              return (
                <div key={r.reason}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] text-slate-700">{r.reason}</span>
                    <span className="text-[11px] text-slate-500 tabular-nums">
                      {fmtAmt(r.value, currency)} · {r.qty.toLocaleString()} units
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-400 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
