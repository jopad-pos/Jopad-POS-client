"use client";

import { useEffect, useRef, useState } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Download,
  ChevronDown,
} from "lucide-react";
import { Service, exportCSV } from "./types";
import { Paginator, usePagination } from "../../components/Paginator";

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
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
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

// ─── ServicesTable ────────────────────────────────────────────────────────────

const PAGE_SIZE = 15;

interface Props {
  services: Service[];
  filtered: Service[];
  categories: string[];
  loading: boolean;
  error: string;
  search: string;
  onSearchChange: (v: string) => void;
  activeCategory: string;
  onCategoryChange: (c: string) => void;
  onAddClick: () => void;
  onEdit: (s: Service) => void;
  onDelete: (s: Service) => void;
}

export default function ServicesTable({
  services,
  filtered,
  categories,
  loading,
  error,
  search,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  onAddClick,
  onEdit,
  onDelete,
}: Props) {
  const { page, setPage, totalPages, paged } = usePagination(filtered, PAGE_SIZE);

  return (
    <div className="bg-white border border-slate-200 rounded-lg flex flex-col flex-1 min-h-0">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5 px-4 py-3 border-b border-slate-100">
        <div className="relative flex-1 min-w-45 max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search services…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-slate-50 border border-slate-200 rounded-md text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>

        <div className="relative">
          <select
            value={activeCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="appearance-none text-[12px] pl-2.5 pr-7 py-1.5 rounded-md border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition cursor-pointer"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={onAddClick}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium px-3 py-1.5 rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Service
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto min-h-0">
        {error ? (
          <div className="px-4 py-8 text-center text-[13px] text-red-500">
            {error}
          </div>
        ) : loading ? (
          <div className="px-4 py-12 text-center text-[13px] text-slate-400">
            Loading services…
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-12 text-center text-[13px] text-slate-400">
            {services.length === 0
              ? "No services yet. Add the first service you offer to get started."
              : "No services match your filters."}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {["Service", "Category", "Duration", "Price", ""].map((h) => (
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
              {paged.map((s) => (
                <tr
                  key={s._id}
                  className="hover:bg-slate-100 transition-colors group"
                >
                  <td className="px-4 py-3">
                    <p className="text-[13px] font-medium text-slate-800 whitespace-nowrap">
                      {s.name}
                    </p>
                    {s.description && (
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-45">
                        {s.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-slate-500">
                      {s.category || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-slate-500 whitespace-nowrap">
                      {s.duration || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] font-medium text-slate-700 tabular-nums whitespace-nowrap">
                      {s.price.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <RowMenu
                        onEdit={() => onEdit(s)}
                        onDelete={() => onDelete(s)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <Paginator
        page={page}
        totalPages={totalPages}
        total={filtered.length}
        setPage={setPage}
      />
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
        <p className="text-[12px] text-slate-400">
          {filtered.length}
          {filtered.length !== services.length
            ? ` of ${services.length} `
            : " "}
          service{filtered.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => exportCSV(filtered)}
          disabled={filtered.length === 0}
          className="flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-700 disabled:opacity-40 transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Export services list
        </button>
      </div>
    </div>
  );
}
