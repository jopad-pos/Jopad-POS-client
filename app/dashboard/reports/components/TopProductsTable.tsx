"use client";

import { useState } from "react";
import type { TopProduct } from "./types";
import { fmtAmt } from "./types";

const PAGE_SIZE = 10;

interface TopProductsTableProps {
  loading: boolean;
  data: TopProduct[];
  currency: string;
}

export function TopProductsTable({
  loading,
  data,
  currency,
}: TopProductsTableProps) {
  const [page, setPage] = useState(1);

  const totalRevenue = data.reduce((s, p) => s + p.revenue, 0);
  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const rows = data.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const COLS = [
    "#",
    "Product",
    "Units Sold",
    "Revenue",
    "Est. Margin",
    "Share",
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-lg flex flex-col h-[600px]">
      <div className="px-4 py-3.5 border-b border-slate-100 flex-shrink-0">
        <h2 className="text-[13px] font-semibold text-slate-900">
          Top Products
        </h2>
        <p className="text-[11px] text-slate-400 mt-0.5">
          By revenue generated
        </p>
      </div>

      <div className="overflow-auto flex-1">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              {COLS.map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap text-left"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {COLS.map((c) => (
                    <td key={c} className="px-4 py-3">
                      <div className="h-3 bg-slate-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={COLS.length}
                  className="px-4 py-0 text-center text-[12px] text-slate-400 h-[280px]"
                >
                  No product sales in this period
                </td>
              </tr>
            ) : (
              rows.map((p, i) => {
                const globalIndex = (safePage - 1) * PAGE_SIZE + i;
                const share =
                  totalRevenue > 0
                    ? Math.round((p.revenue / totalRevenue) * 100)
                    : 0;
                return (
                  <tr
                    key={p.name}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-4 py-3 text-left">
                      <span className="text-[12px] text-slate-400 tabular-nums">
                        {globalIndex + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-left">
                      <span className="text-[13px] font-medium text-slate-800">
                        {p.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-left">
                      <span className="text-[13px] text-slate-700 tabular-nums">
                        {p.qty.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-left">
                      <span className="text-[13px] font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                        {fmtAmt(p.revenue, currency)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-left">
                      <span className="text-[12px] text-emerald-600 tabular-nums">
                        {p.margin}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-left">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[60px]">
                          <div
                            className="h-full bg-blue-400 rounded-full"
                            style={{ width: `${share}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-slate-400 tabular-nums w-8">
                          {share}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!loading && totalPages > 1 && (
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
          <span className="text-[11px] text-slate-400">
            {data.length} products · page {safePage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="text-[11px] px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="text-[11px] px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
