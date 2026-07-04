"use client";

import { useEffect, useRef, useState } from "react";
import {
  Search,
  Download,
  ShoppingCart,
  MoreHorizontal,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { Sale, SaleType, methodStyles, saleTypeLabels, formatSaleTime } from "./types";

// ─── Pagination helpers ────────────────────────────────────────────────────────

function pageRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3)
    return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

// ─── Row Menu ─────────────────────────────────────────────────────────────────

function RowMenu({
  onView,
  onPrint,
  onDelete,
}: {
  onView: () => void;
  onPrint: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const item = (label: string, action: () => void, danger = false) => (
    <button
      onMouseDown={() => { action(); setOpen(false); }}
      className={`w-full text-left px-3 py-1.5 text-[12px] rounded transition ${
        danger ? "text-red-600 hover:bg-red-50" : "text-slate-700 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-300 transition"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg py-1">
          {item("View Details", onView)}
          {item("Print Receipt", onPrint)}
          <div className="border-t border-slate-100 my-1" />
          {item("Delete", onDelete, true)}
        </div>
      )}
    </div>
  );
}

// ─── SalesTable ───────────────────────────────────────────────────────────────

const COLS = ["Ref", "Customer", "Cashier", "Items", "Payment", "Amount", "Time", ""];

interface Props {
  items: Sale[];
  totalFiltered: number;
  totalAll: number;
  loading: boolean;
  error: string;
  search: string;
  onSearchChange: (v: string) => void;
  methodFilter: string;
  onMethodFilterChange: (v: string) => void;
  cashierFilter: string;
  onCashierFilterChange: (v: string) => void;
  cashiers: string[];
  typeFilter: SaleType | "All Types";
  onTypeFilterChange: (v: SaleType | "All Types") => void;
  todayOnly: boolean;
  onTodayToggle: () => void;
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onPageSelect: (p: number) => void;
  onNew: () => void;
  onView: (s: Sale) => void;
  onPrint: (s: Sale) => void;
  onDelete: (s: Sale) => void;
}

export default function SalesTable({
  items,
  totalFiltered,
  totalAll,
  loading,
  error,
  search,
  onSearchChange,
  methodFilter,
  onMethodFilterChange,
  cashierFilter,
  onCashierFilterChange,
  cashiers,
  typeFilter,
  onTypeFilterChange,
  todayOnly,
  onTodayToggle,
  page,
  totalPages,
  onPrev,
  onNext,
  onPageSelect,
  onNew,
  onView,
  onPrint,
  onDelete,
}: Props) {
  const pages = pageRange(page, totalPages);

  return (
    <div className="bg-white border border-slate-200 rounded-lg flex flex-col flex-1 min-h-0">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5 px-4 py-3 border-b border-slate-100 shrink-0">
        <div className="relative flex-1 min-w-45 max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by customer or ref..."
            className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-slate-50 border border-slate-200 rounded-md text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onTodayToggle}
            className={`flex items-center gap-1.5 text-[12px] border px-2.5 py-1.5 rounded-md transition-colors ${
              todayOnly
                ? "bg-blue-600 text-white border-blue-600"
                : "text-slate-600 border-slate-200 bg-slate-50 hover:bg-white"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Today
          </button>

          <select
            value={methodFilter}
            onChange={(e) => onMethodFilterChange(e.target.value)}
            className="text-[12px] bg-slate-50 border border-slate-200 rounded-md text-slate-600 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option>All Methods</option>
            <option>Cash</option>
            <option>Mobile Money</option>
            <option>Card</option>
            <option>Credit</option>
          </select>

          <select
            value={cashierFilter}
            onChange={(e) => onCashierFilterChange(e.target.value)}
            className="text-[12px] bg-slate-50 border border-slate-200 rounded-md text-slate-600 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option>All Cashiers</option>
            {cashiers.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value as SaleType | "All Types")}
            className="text-[12px] bg-slate-50 border border-slate-200 rounded-md text-slate-600 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="All Types">All Types</option>
            {(Object.keys(saleTypeLabels) as SaleType[]).map((t) => (
              <option key={t} value={t}>
                {saleTypeLabels[t]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 flex-wrap ml-auto">
          <button className="flex items-center gap-1.5 text-[12px] text-slate-600 border border-slate-200 bg-slate-50 hover:bg-white px-2.5 py-1.5 rounded-md transition-colors">
            <Download className="w-3.5 h-3.5 text-slate-400" />
            Export
          </button>

          <button
            onClick={onNew}
            className="flex items-center gap-1.5 text-[12px] font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Sale
          </button>
        </div>
      </div>

      {/* Scrollable table body */}
      <div className="flex-1 overflow-auto min-h-0">
        {error ? (
          <div className="px-4 py-8 text-center text-[13px] text-red-500">{error}</div>
        ) : loading ? (
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
              {Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <div
                        className="h-3 bg-slate-100 rounded animate-pulse"
                        style={{ width: j === 0 ? 56 : j === 5 ? 80 : 64 }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : totalFiltered === 0 ? (
          <div className="px-4 py-12 text-center text-[13px] text-slate-400">
            {totalAll === 0 ? "No sales recorded yet." : "No sales match your filters."}
          </div>
        ) : (
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
              {items.map((sale) => (
                <tr
                  key={sale._id}
                  className="hover:bg-slate-100 transition-colors group"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center shrink-0">
                        <ShoppingCart className="w-3 h-3 text-slate-400" />
                      </div>
                      <span className="text-[12px] font-medium text-slate-700 font-mono">
                        {sale.ref}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[13px] text-slate-800 whitespace-nowrap">
                      {sale.customer}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-slate-500">{sale.cashier}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[13px] text-slate-600 tabular-nums">
                      {sale.items}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded font-medium whitespace-nowrap ${
                        methodStyles[sale.method]
                      }`}
                    >
                      {sale.method}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[13px] font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                      UGX {sale.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-slate-400 whitespace-nowrap">
                      {formatSaleTime(sale.date)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <RowMenu
                        onView={() => onView(sale)}
                        onPrint={() => onPrint(sale)}
                        onDelete={() => onDelete(sale)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer — count + pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 shrink-0">
        <p className="text-[12px] text-slate-400">
          {loading
            ? "Loading..."
            : totalFiltered !== totalAll
              ? `${totalFiltered} of ${totalAll} transaction${totalAll !== 1 ? "s" : ""}`
              : `${totalAll} transaction${totalAll !== 1 ? "s" : ""}`}
        </p>

        {!loading && totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={onPrev}
              disabled={page === 1}
              className="p-1.5 rounded-md text-slate-400 border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {pages.map((p, i) =>
              p === "…" ? (
                <span key={`ellipsis-${i}`} className="px-1 text-[12px] text-slate-300">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageSelect(p as number)}
                  className={`min-w-[28px] px-2 py-1.5 text-[12px] rounded-md border transition-colors ${
                    p === page
                      ? "bg-blue-600 text-white font-medium border-blue-600"
                      : "text-slate-500 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={onNext}
              disabled={page === totalPages}
              className="p-1.5 rounded-md text-slate-400 border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
