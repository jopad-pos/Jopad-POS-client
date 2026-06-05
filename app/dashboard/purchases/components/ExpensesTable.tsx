"use client";

import { useEffect, useRef, useState } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Receipt,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Expense, expenseCategoryColors, EXPENSE_CATEGORIES, formatDate } from "./types";

const PAGE_SIZE = 10;

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
        <div className="absolute right-0 z-20 mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg py-1">
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

// ─── ExpensesTable ────────────────────────────────────────────────────────────

interface Props {
  expenses: Expense[];
  loading: boolean;
  error: string;
  onAddClick: () => void;
  onEdit: (e: Expense) => void;
  onDelete: (e: Expense) => void;
}

export default function ExpensesTable({
  expenses,
  loading,
  error,
  onAddClick,
  onEdit,
  onDelete,
}: Props) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [page, setPage] = useState(1);

  const filtered = expenses.filter((e) => {
    if (categoryFilter !== "All" && e.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        e.ref.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.recorder.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => setPage(1), [search, categoryFilter]);

  const usedCategories = [
    "All",
    ...EXPENSE_CATEGORIES.filter((c) => expenses.some((e) => e.category === c)),
  ];

  const totalFiltered = filtered.reduce((a, e) => a + e.amount, 0);

  return (
    <div className="bg-white border border-slate-200 rounded-lg flex flex-col">
      {/* Section header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-slate-400" />
          <div>
            <h2 className="text-[13px] font-semibold text-slate-900">Expenses</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Operating costs and business expenses
            </p>
          </div>
        </div>
        <button
          onClick={onAddClick}
          className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-[12px] font-medium px-3 py-1.5 rounded-md border border-slate-200 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-slate-400" />
          Add Expense
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center gap-2.5 px-4 py-3 border-b border-slate-100">
        <div className="relative flex-1 min-w-40 max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search expenses…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-slate-50 border border-slate-200 rounded-md text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {usedCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`text-[11px] px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? "bg-slate-900 text-white"
                  : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {cat}
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
            Loading expenses…
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-12 text-center text-[13px] text-slate-400">
            {expenses.length === 0
              ? "No expenses recorded yet."
              : "No expenses match your filters."}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {[
                  { label: "Ref",         right: false },
                  { label: "Category",    right: false },
                  { label: "Description", right: false },
                  { label: "Amount",      right: true  },
                  { label: "Date",        right: false },
                  { label: "Recorded by", right: false },
                  { label: "",            right: false },
                ].map(({ label, right }) => (
                  <th
                    key={label}
                    className={`px-4 py-3 text-[12px] font-semibold text-black uppercase tracking-wider whitespace-nowrap ${
                      right ? "text-right" : "text-left"
                    }`}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pageItems.map((e) => (
                <tr
                  key={e._id}
                  className="hover:bg-slate-100 transition-colors group"
                >
                  <td className="px-4 py-3">
                    <span className="text-[11px] text-slate-400 font-mono">{e.ref}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                        expenseCategoryColors[e.category] ?? "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {e.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[13px] text-slate-700">{e.description}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-[13px] font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                      UGX {e.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-slate-400 whitespace-nowrap">
                      {formatDate(e.date)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-slate-500">{e.recorder}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <RowMenu onEdit={() => onEdit(e)} onDelete={() => onDelete(e)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
        <p className="text-[12px] text-slate-400">
          {filtered.length !== expenses.length
            ? `${filtered.length} of ${expenses.length} entries`
            : `${expenses.length} entr${expenses.length !== 1 ? "ies" : "y"}`}
          {categoryFilter !== "All" || search
            ? ` · UGX ${totalFiltered.toLocaleString()}`
            : ""}
        </p>
        <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
