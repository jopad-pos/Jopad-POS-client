"use client";

import { ShoppingCart, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { type DashboardData, formatAmount, formatTime } from "./types";
import { usePagination, Paginator } from "./Paginator";

interface RecentSalesProps {
  loading: boolean;
  recentSales: DashboardData["recentSales"];
  currency: string;
}

export function RecentSales({ loading, recentSales, currency }: RecentSalesProps) {
  const { page, setPage, totalPages, paged } = usePagination(recentSales, 8);

  return (
    <div className="xl:col-span-2 bg-white border border-slate-200 rounded-lg flex flex-col h-[500px]">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 flex-shrink-0">
        <div>
          <h2 className="text-[13px] font-semibold text-slate-900">Recent Transactions</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {loading ? "Loading…" : `${recentSales.length} most recent`}
          </p>
        </div>
        <Link
          href="/dashboard/sales"
          className="text-[11px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5"
        >
          All sales <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-4 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 bg-slate-100 rounded flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-slate-100 rounded w-32" />
                  <div className="h-2.5 bg-slate-100 rounded w-20" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 bg-slate-100 rounded w-20" />
                  <div className="h-2.5 bg-slate-100 rounded w-12" />
                </div>
              </div>
            ))}
          </div>
        ) : paged.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[12px] text-slate-400">
            No transactions yet
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {paged.map((sale) => (
              <div
                key={sale._id}
                className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/70 transition-colors"
              >
                <div className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <ShoppingCart className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-slate-800 truncate">
                    {sale.customer || "Walk-in Customer"}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {sale.items} item{sale.items !== 1 ? "s" : ""} · {sale.cashier || "—"} ·{" "}
                    <span className="capitalize">{sale.method}</span>
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[12px] font-semibold text-slate-900 tabular-nums">
                    {formatAmount(sale.amount, currency)}
                  </p>
                  <p className="text-[10px] text-slate-400">{formatTime(sale.date)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Paginator
        page={page}
        totalPages={totalPages}
        total={recentSales.length}
        setPage={setPage}
      />
    </div>
  );
}
