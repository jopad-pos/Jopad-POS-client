"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Plus, MoreHorizontal, Truck } from "lucide-react";
import { Supplier, SupplierStatus, supplierStatusConfig } from "./types";

// ─── Row Menu ─────────────────────────────────────────────────────────────────

function RowMenu({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
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
      onMouseDown={() => {
        action();
        setOpen(false);
      }}
      className={`w-full text-left px-3 py-1.5 text-[12px] rounded transition ${
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-slate-700 hover:bg-slate-50"
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

// ─── SuppliersTable ───────────────────────────────────────────────────────────

interface Props {
  suppliers: Supplier[];
  filtered: Supplier[];
  loading: boolean;
  error: string;
  search: string;
  onSearchChange: (v: string) => void;
  activeStatus: string;
  onStatusChange: (s: string) => void;
  onAddClick: () => void;
  onEdit: (s: Supplier) => void;
  onDelete: (s: Supplier) => void;
}

export default function SuppliersTable({
  suppliers,
  filtered,
  loading,
  error,
  search,
  onSearchChange,
  activeStatus,
  onStatusChange,
  onAddClick,
  onEdit,
  onDelete,
}: Props) {
  const statuses = ["All", "Active", "Inactive"];

  return (
    <div className="bg-white border border-slate-200 rounded-lg flex flex-col flex-1 min-h-0">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5 px-4 py-3 border-b border-slate-100">
        <div className="relative flex-1 min-w-45 max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search suppliers…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-slate-50 border border-slate-200 rounded-md text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => onStatusChange(s)}
              className={`text-[11px] px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                activeStatus === s
                  ? "bg-slate-900 text-white"
                  : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <button
          onClick={onAddClick}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium px-3 py-1.5 rounded-md transition-colors ml-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Supplier
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto min-h-0">
        {error ? (
          <div className="px-4 py-8 text-center text-[13px] text-red-500">{error}</div>
        ) : loading ? (
          <div className="px-4 py-12 text-center text-[13px] text-slate-400">
            Loading suppliers…
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-12 text-center text-[13px] text-slate-400">
            {suppliers.length === 0
              ? "No suppliers yet. Add your first supplier to get started."
              : "No suppliers match your filters."}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {["Supplier", "Contact", "Email", "Categories", "Status", ""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-[12px] font-semibold text-black uppercase tracking-wider whitespace-nowrap text-left"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((s) => {
                const sc = supplierStatusConfig[s.status as SupplierStatus];
                return (
                  <tr key={s._id} className="hover:bg-slate-100 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <Truck className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-slate-800 whitespace-nowrap">
                            {s.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">{s.ref}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {s.contact ? (
                        <p className="text-[12px] text-slate-700">{s.contact}</p>
                      ) : null}
                      {s.phone ? (
                        <p className="text-[11px] text-slate-400">{s.phone}</p>
                      ) : null}
                      {!s.contact && !s.phone && (
                        <span className="text-[12px] text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[12px] text-slate-500">
                        {s.email || <span className="text-slate-300">—</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {s.categories.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {s.categories.map((cat) => (
                            <span
                              key={cat}
                              className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[12px] text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${sc.class}`}>
                          {s.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <RowMenu onEdit={() => onEdit(s)} onDelete={() => onDelete(s)} />
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
          {filtered.length !== suppliers.length ? ` of ${suppliers.length} ` : " "}
          supplier{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
