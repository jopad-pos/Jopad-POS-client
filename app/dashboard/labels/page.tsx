"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Printer,
  CheckSquare,
  Square,
  Loader2,
  Wand2,
  ChevronDown,
  X,
  Tag,
} from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import PlanGate from "@/components/PlanGate";
import { useBranchQuery } from "@/contexts/BranchContext";
import { Product } from "../stock/components/types";
import { LabelSize, printLabels } from "./printLabels";

const SIZE_LABELS: Record<LabelSize, string> = {
  small: "Small (50×25mm)",
  medium: "Medium (70×40mm)",
  large: "Large (100×60mm)",
};

interface PrintSettings {
  size: LabelSize;
  copies: number;
  showName: boolean;
  showPrice: boolean;
  showSku: boolean;
}

export default function LabelsPage() {
  const { profile } = useAuth();
  const branchQuery = useBranchQuery();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [missingOnly, setMissingOnly] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [printing, setPrinting] = useState(false);

  const [settings, setSettings] = useState<PrintSettings>({
    size: "medium",
    copies: 1,
    showName: true,
    showPrice: true,
    showSku: true,
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      apiRequest<{ items: Product[] }>(`/api/products?limit=2000${branchQuery}`),
      apiRequest<string[]>("/api/categories"),
    ])
      .then(([productsRes, catsRes]) => {
        if (cancelled) return;
        setProducts(productsRes.items);
        setCategories(catsRes);
        setError("");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Failed to load products");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [branchQuery]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter !== "All" && p.category !== categoryFilter) return false;
      if (missingOnly && p.barcode) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          (p.sku || "").toLowerCase().includes(q) ||
          (p.barcode || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, categoryFilter, missingOnly, search]);

  const allSelected = filtered.length > 0 && filtered.every((p) => selectedIds.has(p._id));
  const someSelected = filtered.some((p) => selectedIds.has(p._id));

  function toggleAll() {
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filtered.forEach((p) => next.delete(p._id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filtered.forEach((p) => next.add(p._id));
        return next;
      });
    }
  }

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function generateBarcode(product: Product) {
    setGeneratingId(product._id);
    try {
      const updated = await apiRequest<Product>(
        `/api/products/${product._id}/generate-barcode`,
        { method: "POST" }
      );
      setProducts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
      setSelectedIds((prev) => new Set([...prev, updated._id]));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to generate barcode");
    } finally {
      setGeneratingId(null);
    }
  }

  async function handlePrint(singleProduct?: Product) {
    const toPrint = singleProduct
      ? [singleProduct]
      : products.filter((p) => selectedIds.has(p._id));
    if (toPrint.length === 0) return;
    setPrinting(true);
    try {
      await printLabels(toPrint, settings);
    } finally {
      setPrinting(false);
    }
  }

  const selectedCount = selectedIds.size;
  const totalCopies = selectedCount * settings.copies;

  if (profile?.planFeatures && !profile.planFeatures.includes("labels")) {
    return <PlanGate featureKey="labels" />;
  }

  return (
    <div className="p-5 flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[16px] font-semibold text-slate-900">Labels &amp; Barcodes</h1>
          <p className="text-[12px] text-slate-500 mt-0.5">
            Generate barcodes and print product labels
          </p>
        </div>
        <button
          onClick={() => handlePrint()}
          disabled={selectedCount === 0 || printing}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-[12px] font-medium px-4 py-2 rounded-md transition-colors"
        >
          {printing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Printer className="w-3.5 h-3.5" />
          )}
          {selectedCount === 0
            ? "Print Labels"
            : `Print ${totalCopies} Label${totalCopies !== 1 ? "s" : ""}`}
        </button>
      </div>

      {/* Settings row */}
      <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 flex flex-wrap items-center gap-3">
        <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />

        {/* Label size */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-500 font-medium">Size</span>
          <div className="relative">
            <select
              value={settings.size}
              onChange={(e) =>
                setSettings((s) => ({ ...s, size: e.target.value as LabelSize }))
              }
              className="appearance-none text-[12px] pl-2.5 pr-7 py-1 rounded-md border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition cursor-pointer"
            >
              {(Object.keys(SIZE_LABELS) as LabelSize[]).map((k) => (
                <option key={k} value={k}>{SIZE_LABELS[k]}</option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="w-px h-4 bg-slate-200" />

        {/* Copies */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-500 font-medium">Copies</span>
          <input
            type="number"
            min={1}
            max={50}
            value={settings.copies}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                copies: Math.max(1, Math.min(50, Number(e.target.value) || 1)),
              }))
            }
            className="w-14 text-[12px] px-2 py-1 rounded-md border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 text-center transition"
          />
        </div>

        <div className="w-px h-4 bg-slate-200" />

        {/* Show fields */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-500 font-medium">Show</span>
          {(
            [
              ["showName", "Name"],
              ["showPrice", "Price"],
              ["showSku", "SKU"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={settings[key]}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, [key]: e.target.checked }))
                }
                className="w-3 h-3 rounded accent-blue-600"
              />
              <span className="text-[11px] text-slate-600">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white border border-slate-200 rounded-lg flex flex-col flex-1 min-h-0">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 px-4 py-3 border-b border-slate-100">
          <div className="relative flex-1 min-w-45 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-slate-50 border border-slate-200 rounded-md text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none text-[12px] pl-2.5 pr-7 py-1.5 rounded-md border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition cursor-pointer"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={() => setMissingOnly((v) => !v)}
            className={`flex items-center gap-1.5 text-[12px] px-2.5 py-1.5 rounded-md border transition-colors ${
              missingOnly
                ? "bg-amber-100 text-amber-700 border-amber-300"
                : "text-slate-600 border-slate-200 bg-slate-50 hover:bg-slate-100"
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            Missing barcodes
          </button>

          {selectedCount > 0 && (
            <button
              onClick={() => setSelectedIds(new Set())}
              className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-700 transition ml-auto"
            >
              <X className="w-3 h-3" />
              Clear selection
            </button>
          )}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto min-h-0">
          {error ? (
            <div className="px-4 py-8 text-center text-[13px] text-red-500">{error}</div>
          ) : loading ? (
            <div className="px-4 py-12 text-center text-[13px] text-slate-400">
              Loading products…
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-12 text-center text-[13px] text-slate-400">
              {products.length === 0
                ? "No products yet."
                : "No products match your filters."}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-3 w-8">
                    <button
                      onClick={toggleAll}
                      className="flex items-center justify-center text-slate-400 hover:text-slate-700 transition"
                    >
                      {allSelected ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : someSelected ? (
                        <CheckSquare className="w-4 h-4 text-blue-300" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  {["Product", "SKU", "Category", "Price", "Barcode", ""].map((h) => (
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
                {filtered.map((p) => {
                  const checked = selectedIds.has(p._id);
                  return (
                    <tr
                      key={p._id}
                      className={`hover:bg-slate-50 transition-colors ${checked ? "bg-blue-50/40" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggle(p._id)}
                          className="flex items-center justify-center text-slate-400 hover:text-slate-700 transition"
                        >
                          {checked ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[13px] font-medium text-slate-800 whitespace-nowrap">
                          {p.name}
                        </p>
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
                        <span className="text-[12px] text-slate-700 tabular-nums">
                          {p.sellPrice.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {p.barcode ? (
                          <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {p.barcode}
                          </span>
                        ) : (
                          <button
                            onClick={() => generateBarcode(p)}
                            disabled={generatingId === p._id}
                            className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition disabled:opacity-60"
                          >
                            {generatingId === p._id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Wand2 className="w-3 h-3" />
                            )}
                            Generate
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handlePrint(p)}
                          disabled={!p.barcode || printing}
                          title={
                            !p.barcode
                              ? "Generate a barcode first"
                              : `Print label for ${p.name}`
                          }
                          className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Printer className="w-3 h-3" />
                          Print
                        </button>
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
            {filtered.length}
            {filtered.length !== products.length ? ` of ${products.length} ` : " "}
            product{filtered.length !== 1 ? "s" : ""}
            {selectedCount > 0 && (
              <span className="ml-2 text-blue-600 font-medium">
                · {selectedCount} selected
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
