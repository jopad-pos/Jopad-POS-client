"use client";

import { AlertTriangle, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { type DashboardData } from "./types";
import { usePagination, Paginator } from "./Paginator";

interface LowStockProps {
  loading: boolean;
  lowStock: DashboardData["lowStock"];
}

export function LowStock({ loading, lowStock }: LowStockProps) {
  const { page, setPage, totalPages, paged } = usePagination(lowStock, 5);

  return (
    <div className="bg-white border border-slate-200 rounded-lg flex flex-col h-[500px]">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <h2 className="text-[13px] font-semibold text-slate-900">Low Stock</h2>
        </div>
        <Link
          href="/dashboard/stock"
          className="text-[11px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5"
        >
          View all <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-4 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 bg-slate-100 rounded w-32" />
                <div className="h-1.5 bg-slate-100 rounded-full" />
                <div className="h-2.5 bg-slate-100 rounded w-20" />
              </div>
            ))}
          </div>
        ) : paged.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[12px] text-slate-400">
            All stock levels are healthy
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {paged.map((item) => {
              const pct = Math.round((item.qty / item.minQty) * 100);
              const isCritical = item.qty <= Math.ceil(item.minQty * 0.3);
              return (
                <div key={item._id} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[12px] font-medium text-slate-800 truncate pr-2">
                      {item.name}
                    </p>
                    <span
                      className={`text-[11px] font-semibold flex-shrink-0 tabular-nums ${
                        isCritical ? "text-red-600" : "text-amber-600"
                      }`}
                    >
                      {item.qty} left
                    </span>
                  </div>
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isCritical ? "bg-red-400" : "bg-amber-400"}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Min: {item.minQty} · {item.category || "Uncategorised"}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Paginator
        page={page}
        totalPages={totalPages}
        total={lowStock.length}
        setPage={setPage}
      />
    </div>
  );
}
