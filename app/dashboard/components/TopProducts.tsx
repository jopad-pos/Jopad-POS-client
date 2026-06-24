"use client";

import { type DashboardData, formatAmount } from "./types";
import { usePagination, Paginator } from "./Paginator";

interface TopProductsProps {
  loading: boolean;
  topProducts: DashboardData["topProducts"];
  currency: string;
}

export function TopProducts({ loading, topProducts, currency }: TopProductsProps) {
  const { page, setPage, totalPages, paged } = usePagination(topProducts, 5);

  return (
    <div className="bg-white border border-slate-200 rounded-lg flex flex-col h-[500px]">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 flex-shrink-0">
        <h2 className="text-[13px] font-semibold text-slate-900">Top Products Today</h2>
        <span className="text-[11px] text-slate-400">{topProducts.length} products</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-3 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-3 bg-slate-100 rounded w-4" />
                <div className="flex-1 h-3 bg-slate-100 rounded" />
                <div className="h-3 bg-slate-100 rounded w-16" />
              </div>
            ))}
          </div>
        ) : paged.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[12px] text-slate-400">
            No sales recorded today
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {paged.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3 px-4 py-3">
                <span className="text-[11px] text-slate-400 w-4 tabular-nums flex-shrink-0">
                  {(page - 1) * 5 + i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-slate-800 truncate">{p.name}</p>
                  <p className="text-[10px] text-slate-400">{p.sold} units sold</p>
                </div>
                <span className="text-[11px] font-semibold text-slate-700 tabular-nums flex-shrink-0">
                  {formatAmount(p.revenue, currency)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Paginator
        page={page}
        totalPages={totalPages}
        total={topProducts.length}
        setPage={setPage}
      />
    </div>
  );
}
