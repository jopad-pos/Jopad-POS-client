"use client";

import { useEffect, useRef, useState } from "react";
import { Search, MoreHorizontal } from "lucide-react";
import { Paginator, usePagination } from "../../components/Paginator";
import type { Order } from "./types";
import { ORDER_STATUS_STYLES, PAYMENT_METHOD_STYLES, formatDateTime, formatMoney, orderTotal } from "./types";

const FILTERS: { key: string; label: string }[] = [
  { key: "All", label: "All" },
  { key: "closed", label: "Closed" },
  { key: "cancelled", label: "Cancelled" },
];

function RowMenu({ onView }: { onView: () => void }) {
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
          <button
            onMouseDown={() => {
              onView();
              setOpen(false);
            }}
            className="w-full text-left px-3 py-1.5 text-[12px] rounded text-slate-700 hover:bg-slate-50 transition"
          >
            View details
          </button>
        </div>
      )}
    </div>
  );
}

interface Props {
  orders: Order[];
  loading: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  onView: (order: Order) => void;
}

export default function HistoryTable({
  orders,
  loading,
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onView,
}: Props) {
  const filtered = orders.filter((o) => {
    if (statusFilter !== "All" && o.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return o.ref.toLowerCase().includes(q) || o.tableLabel.toLowerCase().includes(q);
    }
    return true;
  });

  const { page, setPage, totalPages, paged } = usePagination(filtered, 10);

  return (
    <div className="bg-white border border-slate-200 rounded-lg flex flex-col flex-1 min-h-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-800">Transaction History</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 rounded-md p-0.5">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => onStatusChange(f.key)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                  statusFilter === f.key
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search ref, table…"
              className="w-full sm:w-56 pl-8 pr-3 py-1.5 text-[12px] border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-slate-50 z-10">
            <tr className="text-[10px] uppercase tracking-wider text-slate-400">
              <th className="text-left font-semibold px-4 py-2.5">Ref</th>
              <th className="text-left font-semibold px-4 py-2.5">Table</th>
              <th className="text-left font-semibold px-4 py-2.5">Party</th>
              <th className="text-left font-semibold px-4 py-2.5">Payment</th>
              <th className="text-left font-semibold px-4 py-2.5">Closed</th>
              <th className="text-left font-semibold px-4 py-2.5">Total</th>
              <th className="text-left font-semibold px-4 py-2.5">Status</th>
              <th className="text-left font-semibold px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center text-sm text-slate-400 py-10">
                  Loading history…
                </td>
              </tr>
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-sm text-slate-400 py-10">
                  No past transactions found.
                </td>
              </tr>
            ) : (
              paged.map((o) => (
                <tr key={o._id} className="hover:bg-slate-50 text-[12px]">
                  <td className="px-4 py-2.5 text-slate-500 font-mono">{o.ref}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-800">{o.tableLabel}</td>
                  <td className="px-4 py-2.5 text-slate-600">{o.partySize}</td>
                  <td className="px-4 py-2.5">
                    {o.paymentMethod ? (
                      <span
                        className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded ${PAYMENT_METHOD_STYLES[o.paymentMethod]}`}
                      >
                        {o.paymentMethod}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">{formatDateTime(o.closedAt)}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-700 tabular-nums">
                    {formatMoney(orderTotal(o))}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded border capitalize ${
                        o.status === "cancelled" ? ORDER_STATUS_STYLES.cancelled : ORDER_STATUS_STYLES.closed
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <RowMenu onView={() => onView(o)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Paginator page={page} totalPages={totalPages} total={filtered.length} setPage={setPage} />
    </div>
  );
}
