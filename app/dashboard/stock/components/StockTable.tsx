"use client";

import { useEffect, useRef, useState } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  AlertTriangle,
  Download,
  X,
  ChevronDown,
  ShoppingCart,
  Clock,
} from "lucide-react";
import { ApiError } from "@/lib/api";
import { Product, statusConfig, exportCSV, CategoryRef } from "./types";
import { Paginator, usePagination } from "../../components/Paginator";

const PAGE_SIZE = 15;

// ─── Row Menu ─────────────────────────────────────────────────────────────────

function RowMenu({
  onEdit,
  onAdjust,
  onHistory,
  onPrintLabel,
  onDelete,
}: {
  onEdit: () => void;
  onAdjust: () => void;
  onHistory: () => void;
  onPrintLabel: () => void;
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
          {item("Adjust Stock", onAdjust)}
          {item("View History", onHistory)}
          {item("Print Label", onPrintLabel)}
          <div className="border-t border-slate-100 my-1" />
          {item("Delete", onDelete, true)}
        </div>
      )}
    </div>
  );
}

// ─── StockTable ───────────────────────────────────────────────────────────────

interface Props {
  products: Product[];
  filtered: Product[];
  categories: string[];
  loading: boolean;
  error: string;
  search: string;
  onSearchChange: (v: string) => void;
  activeCategory: string;
  onCategoryChange: (c: string) => void;
  lowStockOnly: boolean;
  onLowStockToggle: () => void;
  onAddClick: () => void;
  onAddCategory: (name: string) => Promise<CategoryRef>;
  onEdit: (p: Product) => void;
  onAdjust: (p: Product) => void;
  onHistory: (p: Product) => void;
  onDelete: (p: Product) => void;
  onPurchaseOrder: (p: Product) => void;
  onPrintLabel: (p: Product) => void;
  pendingOrderProductIds: Set<string>;
}

export default function StockTable({
  products,
  filtered,
  categories,
  loading,
  error,
  search,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  lowStockOnly,
  onLowStockToggle,
  onAddClick,
  onAddCategory,
  onEdit,
  onAdjust,
  onHistory,
  onDelete,
  onPurchaseOrder,
  onPrintLabel,
  pendingOrderProductIds,
}: Props) {
  const { page, setPage, totalPages, paged } = usePagination(filtered, PAGE_SIZE);
  const [addCatMode, setAddCatMode] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [addCatLoading, setAddCatLoading] = useState(false);
  const [addCatError, setAddCatError] = useState("");

  const handleAddCat = async () => {
    if (!newCatName.trim()) return;
    setAddCatLoading(true);
    setAddCatError("");
    try {
      await onAddCategory(newCatName.trim());
      setNewCatName("");
      setAddCatMode(false);
    } catch (err) {
      setAddCatError(
        err instanceof ApiError ? err.message : "Failed to add category"
      );
    } finally {
      setAddCatLoading(false);
    }
  };

  const cancelAddCat = () => {
    setAddCatMode(false);
    setNewCatName("");
    setAddCatError("");
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg flex flex-col flex-1 min-h-0">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5 px-4 py-3 border-b border-slate-100">
        <div className="relative flex-1 min-w-45 max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-slate-50 border border-slate-200 rounded-md text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>

        {/* Category dropdown + add */}
        <div className="flex items-center gap-1.5">
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

          {!addCatMode ? (
            <button
              onClick={() => setAddCatMode(true)}
              title="Add category"
              className="p-1.5 rounded-md border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          ) : (
            <>
              <input
                autoFocus
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddCat();
                  if (e.key === "Escape") cancelAddCat();
                }}
                placeholder="Category name"
                className="text-[12px] px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition w-36"
              />
              <button
                onClick={handleAddCat}
                disabled={addCatLoading || !newCatName.trim()}
                className="text-[12px] px-2.5 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition"
              >
                {addCatLoading ? "…" : "Add"}
              </button>
              <button
                onClick={cancelAddCat}
                className="p-1.5 rounded-md border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {addCatError && (
                <span className="text-[11px] text-red-500">{addCatError}</span>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={onLowStockToggle}
            className={`flex items-center gap-1.5 text-[12px] px-2.5 py-1.5 rounded-md border transition-colors ${
              lowStockOnly
                ? "bg-amber-100 text-amber-700 border-amber-300"
                : "text-amber-700 border-amber-200 bg-amber-50 hover:bg-amber-100"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Low stock only
          </button>
          <button
            onClick={onAddClick}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium px-3 py-1.5 rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Product
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
            Loading products…
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-12 text-center text-[13px] text-slate-400">
            {products.length === 0
              ? "No products yet. Add your first product to get started."
              : "No products match your filters."}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {[
                  "Product",
                  "SKU",
                  "Category",
                  "Qty",
                  "Min Qty",
                  "Buy Price",
                  "Sell Price",
                  "Status",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-[12px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap text-left"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paged.map((p) => {
                const s = statusConfig[p.status];
                return (
                  <tr
                    key={p._id}
                    className="hover:bg-slate-100 transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <p className="text-[13px] font-medium text-slate-800 whitespace-nowrap">
                        {p.name}
                      </p>
                      {p.description && (
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-45">
                          {p.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {p.sku || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[12px] text-slate-500">
                        {p.category || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[13px] font-semibold tabular-nums ${
                          p.status === "Out"
                            ? "text-slate-400"
                            : p.status === "Critical"
                              ? "text-red-600"
                              : p.status === "Low"
                                ? "text-amber-600"
                                : "text-slate-800"
                        }`}
                      >
                        {p.qty}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[12px] text-slate-400 tabular-nums">
                        {p.minQty}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[12px] text-slate-500 tabular-nums whitespace-nowrap">
                        {p.buyPrice.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[12px] font-medium text-slate-700 tabular-nums whitespace-nowrap">
                        {p.sellPrice.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded font-medium ${s.class}`}
                        >
                          {s.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 justify-end">
                        {(p.status === "Low" || p.status === "Critical" || p.status === "Out") && (
                          pendingOrderProductIds.has(p._id) ? (
                            <span
                              title="A purchase order for this item is pending"
                              className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md bg-slate-100 text-slate-500 border border-slate-200 whitespace-nowrap"
                            >
                              <Clock className="w-3 h-3" />
                              Order Placed
                            </span>
                          ) : (
                            <button
                              onClick={() => onPurchaseOrder(p)}
                              title="Create purchase order"
                              className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition whitespace-nowrap"
                            >
                              <ShoppingCart className="w-3 h-3" />
                              Order
                            </button>
                          )
                        )}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <RowMenu
                            onEdit={() => onEdit(p)}
                            onAdjust={() => onAdjust(p)}
                            onHistory={() => onHistory(p)}
                            onPrintLabel={() => onPrintLabel(p)}
                            onDelete={() => onDelete(p)}
                          />
                        </div>
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
      <Paginator
        page={page}
        totalPages={totalPages}
        total={filtered.length}
        setPage={setPage}
      />
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
        <p className="text-[12px] text-slate-400">
          {filtered.length}
          {filtered.length !== products.length
            ? ` of ${products.length} `
            : " "}
          product{filtered.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => exportCSV(filtered)}
          disabled={filtered.length === 0}
          className="flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-700 disabled:opacity-40 transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Export stock list
        </button>
      </div>
    </div>
  );
}
