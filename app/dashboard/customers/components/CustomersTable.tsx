"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Plus, MoreHorizontal, AlertCircle } from "lucide-react";
import {
  Customer,
  CustomerType,
  getCustomerType,
  formatLastVisit,
  typeStyles,
} from "./types";

function RowMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
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
        <div className="absolute right-0 z-20 mt-1 w-28 bg-white border border-slate-200 rounded-lg shadow-lg py-1">
          {item("Edit", onEdit)}
          <div className="border-t border-slate-100 my-1" />
          {item("Delete", onDelete, true)}
        </div>
      )}
    </div>
  );
}

interface Props {
  customers: Customer[];
  filtered: Customer[];
  loading: boolean;
  error: string;
  search: string;
  onSearchChange: (v: string) => void;
  activeType: string;
  onTypeChange: (t: string) => void;
  overdueOnly: boolean;
  onOverdueToggle: () => void;
  onAddClick: () => void;
  onEdit: (c: Customer) => void;
  onDelete: (c: Customer) => void;
}

const TYPES: string[] = ["All", "Regular", "Occasional", "New"];

export default function CustomersTable({
  customers,
  filtered,
  loading,
  error,
  search,
  onSearchChange,
  activeType,
  onTypeChange,
  overdueOnly,
  onOverdueToggle,
  onAddClick,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg flex flex-col flex-1 min-h-0">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5 px-4 py-3 border-b border-slate-100">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customers…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-slate-50 border border-slate-200 rounded-md text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => onTypeChange(t)}
              className={`text-[11px] px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                activeType === t
                  ? "bg-slate-900 text-white"
                  : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <button
          onClick={onOverdueToggle}
          className={`flex items-center gap-1.5 text-[12px] border px-2.5 py-1.5 rounded-md transition-colors ${
            overdueOnly
              ? "bg-red-600 text-white border-red-600"
              : "text-red-600 border-red-200 bg-red-50 hover:bg-red-100"
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          Overdue credit
        </button>

        <button
          onClick={onAddClick}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium px-3 py-1.5 rounded-md transition-colors ml-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Customer
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto min-h-0">
        {error ? (
          <div className="px-4 py-8 text-center text-[13px] text-red-500">{error}</div>
        ) : loading ? (
          <div className="px-4 py-12 text-center text-[13px] text-slate-400">Loading customers…</div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-12 text-center text-[13px] text-slate-400">
            {customers.length === 0
              ? "No customers yet. Add your first customer to get started."
              : "No customers match your filters."}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {["Customer", "Phone", "Type", "Visits", "Total Spent", "Credit Balance", "Last Visit", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap text-left ${
                        ["Visits", "Total Spent", "Credit Balance"].includes(h) ? "text-right" : ""
                      }`}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((c) => {
                const type: CustomerType = getCustomerType(c.visits);
                return (
                  <tr key={c._id} className="hover:bg-slate-100 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-semibold text-slate-500">
                            {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-slate-800 whitespace-nowrap flex items-center gap-1.5">
                            {c.name}
                            {c.overdueCredit && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">{c.ref}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[12px] text-slate-500">{c.phone || "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${typeStyles[type]}`}>
                        {type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[13px] text-slate-700 tabular-nums">{c.visits}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[12px] font-medium text-slate-800 tabular-nums whitespace-nowrap">
                        UGX {c.totalSpent.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`text-[12px] font-semibold tabular-nums whitespace-nowrap ${
                          c.overdueCredit
                            ? "text-red-600"
                            : c.creditBalance > 0
                            ? "text-amber-600"
                            : "text-slate-400"
                        }`}
                      >
                        {c.creditBalance > 0 ? `UGX ${c.creditBalance.toLocaleString()}` : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[12px] text-slate-400">{formatLastVisit(c.lastVisit)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <RowMenu onEdit={() => onEdit(c)} onDelete={() => onDelete(c)} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-100">
        <p className="text-[12px] text-slate-400">
          {filtered.length}
          {filtered.length !== customers.length ? ` of ${customers.length} ` : " "}
          customer{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
