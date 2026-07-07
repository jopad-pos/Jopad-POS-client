"use client";

import { useEffect, useRef, useState } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  ArrowDownToLine,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Purchase, PurchaseStatus, purchaseStatusConfig, formatDate } from "./types";

const PAGE_SIZE = 10;

// ─── Row Menu ─────────────────────────────────────────────────────────────────

function RowMenu({
  onView,
  onReceive,
  receiveLabel = "Receive Stock",
  onEdit,
  onDelete,
}: {
  onView: () => void;
  onReceive?: () => void;
  receiveLabel?: string;
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
        <div className="absolute right-0 z-20 mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg py-1">
          {item("View Details", onView)}
          {onReceive && item(receiveLabel, onReceive)}
          {item("Edit", onEdit)}
          <div className="border-t border-slate-100 my-1" />
          {item("Delete", onDelete, true)}
        </div>
      )}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center gap-1">
      <span className="text-[11px] text-slate-400 mr-1">
        {page} / {totalPages}
      </span>
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── PurchasesTable ───────────────────────────────────────────────────────────

interface Props {
  purchases: Purchase[];
  loading: boolean;
  error: string;
  onAddClick: () => void;
  onView: (p: Purchase) => void;
  onReceive: (p: Purchase) => void;
  onEdit: (p: Purchase) => void;
  onDelete: (p: Purchase) => void;
}

export default function PurchasesTable({
  purchases,
  loading,
  error,
  onAddClick,
  onView,
  onReceive,
  onEdit,
  onDelete,
}: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PurchaseStatus | "All">("All");
  const [page, setPage] = useState(1);

  const filtered = purchases.filter((p) => {
    if (statusFilter !== "All" && p.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.ref.toLowerCase().includes(q) ||
        p.supplier.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => setPage(1), [search, statusFilter]);

  const statuses: (PurchaseStatus | "All")[] = ["All", "Received", "Pending", "Partial"];

  return (
    <div className="bg-white border border-slate-200 rounded-lg flex flex-col">
      {/* Section header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ArrowDownToLine className="w-4 h-4 text-slate-400" />
          <div>
            <h2 className="text-[13px] font-semibold text-slate-900">Purchase Orders</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Stock bought from suppliers</p>
          </div>
        </div>
        <button
          onClick={onAddClick}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium px-3 py-1.5 rounded-md transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New Purchase
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center gap-2.5 px-4 py-3 border-b border-slate-100">
        <div className="relative flex-1 min-w-40 max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search orders…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-slate-50 border border-slate-200 rounded-md text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-[11px] px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                statusFilter === s
                  ? "bg-slate-900 text-white"
                  : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto h-105">
        {error ? (
          <div className="px-4 py-8 text-center text-[13px] text-red-500">{error}</div>
        ) : loading ? (
          <div className="px-4 py-12 text-center text-[13px] text-slate-400">
            Loading purchases…
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-12 text-center text-[13px] text-slate-400">
            {purchases.length === 0
              ? "No purchase orders yet. Record your first purchase to get started."
              : "No orders match your filters."}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {["Order Ref", "Supplier", "Description", "Items", "Amount", "Status", "Date", ""].map((label) => (
                  <th
                    key={label}
                    className="px-4 py-3 text-[12px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap text-left"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pageItems.map((p) => {
                const s = purchaseStatusConfig[p.status];
                return (
                  <tr
                    key={p._id}
                    className="hover:bg-slate-100 transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <span className="text-[12px] font-medium text-slate-700 font-mono">
                        {p.ref}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[13px] text-slate-800 whitespace-nowrap">
                        {p.supplier}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[12px] text-slate-500 max-w-60 block truncate">
                        {p.description}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[12px] text-slate-600 tabular-nums">
                        {p.items}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[13px] font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                        UGX {p.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${s.class}`}>
                          {p.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[12px] text-slate-400 whitespace-nowrap">
                        {formatDate(p.date)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <RowMenu
                          onView={() => onView(p)}
                          onReceive={p.status !== "Received" ? () => onReceive(p) : undefined}
                          receiveLabel={p.status === "Partial" ? "Receive Remaining" : "Receive Stock"}
                          onEdit={() => onEdit(p)}
                          onDelete={() => onDelete(p)}
                        />
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
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
        <p className="text-[12px] text-slate-400">
          {filtered.length !== purchases.length
            ? `${filtered.length} of ${purchases.length} orders`
            : `${purchases.length} order${purchases.length !== 1 ? "s" : ""}`}
        </p>
        <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
