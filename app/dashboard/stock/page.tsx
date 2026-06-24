"use client";

import { useEffect, useState } from "react";
import { apiRequest, ApiError } from "@/lib/api";
import { useBranchQuery } from "@/contexts/BranchContext";
import { Product, StatsData } from "./components/types";
import { printLabels } from "../labels/printLabels";
import StockTable from "./components/StockTable";
import ProductModal from "./components/ProductModal";
import AdjustModal from "./components/AdjustModal";
import HistoryModal from "./components/HistoryModal";
import DeleteConfirm from "./components/DeleteConfirm";
import PurchaseModal from "../purchases/components/PurchaseModal";

export default function StockPage() {
  const branchQuery = useBranchQuery();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    totalValue: 0,
    outOfStock: 0,
    lowOrCritical: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Modals
  const [addOpen, setAddOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
  const [historyProduct, setHistoryProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [purchaseProduct, setPurchaseProduct] = useState<Product | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      apiRequest<{ items: Product[] }>(`/api/products?limit=1000${branchQuery}`),
      apiRequest<string[]>("/api/categories"),
      apiRequest<StatsData>(`/api/products/stats?1=1${branchQuery}`),
    ])
      .then(([productsRes, catsRes, statsRes]) => {
        if (cancelled) return;
        setProducts(productsRes.items);
        setCategories(catsRes);
        setStats(statsRes);
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

  const refreshMeta = () =>
    Promise.all([
      apiRequest<string[]>("/api/categories"),
      apiRequest<StatsData>("/api/products/stats"),
    ])
      .then(([cats, st]) => {
        setCategories(cats);
        setStats(st);
      })
      .catch(() => {});

  const handleAddCategory = async (name: string) => {
    await apiRequest<{ name: string }>("/api/categories", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    setCategories((prev) =>
      [...new Set([...prev, name])].sort((a, b) => a.localeCompare(b))
    );
  };

  // Client-side filtering
  const filtered = products.filter((p) => {
    if (activeCategory !== "All" && p.category !== activeCategory) return false;
    if (lowStockOnly && p.status !== "Low" && p.status !== "Critical" && p.status !== "Out")
      return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        (p.sku || "").toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleProductSaved = (saved: Product) => {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p._id === saved._id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
    refreshMeta();
    setAddOpen(false);
    setEditProduct(null);
  };

  const handleAdjusted = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
    apiRequest<StatsData>("/api/products/stats").then(setStats).catch(() => {});
    setAdjustProduct(null);
  };

  const handleDeleted = (id: string) => {
    setProducts((prev) => prev.filter((p) => p._id !== id));
    apiRequest<StatsData>("/api/products/stats").then(setStats).catch(() => {});
    setDeleteProduct(null);
  };

  return (
    <div className="p-5 flex flex-col h-full gap-4">
      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Products", value: stats.total.toString(), sub: "across all categories" },
          {
            label: "Stock Value",
            value:
              stats.totalValue >= 1_000_000
                ? `UGX ${(stats.totalValue / 1_000_000).toFixed(1)}M`
                : `UGX ${stats.totalValue.toLocaleString()}`,
            sub: "at selling price",
          },
          {
            label: "Low / Critical",
            value: stats.lowOrCritical.toString(),
            sub: "need reorder",
            highlight: true,
          },
          { label: "Out of Stock", value: stats.outOfStock.toString(), sub: "0 units available" },
        ].map((s) => (
          <div
            key={s.label}
            className={`bg-white border rounded-lg px-4 py-3.5 ${
              (s as { highlight?: boolean }).highlight ? "border-amber-200" : "border-slate-200"
            }`}
          >
            <p className="text-[11px] font-medium text-slate-500">{s.label}</p>
            <p
              className={`text-lg font-semibold mt-1 tabular-nums leading-none ${
                (s as { highlight?: boolean }).highlight ? "text-amber-600" : "text-slate-900"
              }`}
            >
              {loading ? "—" : s.value}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <StockTable
        products={products}
        filtered={filtered}
        categories={categories}
        loading={loading}
        error={error}
        search={search}
        onSearchChange={setSearch}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        lowStockOnly={lowStockOnly}
        onLowStockToggle={() => setLowStockOnly((v) => !v)}
        onAddClick={() => setAddOpen(true)}
        onAddCategory={handleAddCategory}
        onEdit={setEditProduct}
        onAdjust={setAdjustProduct}
        onHistory={setHistoryProduct}
        onDelete={setDeleteProduct}
        onPurchaseOrder={setPurchaseProduct}
      onPrintLabel={(p) => printLabels([p], { size: "medium", copies: 1, showName: true, showPrice: true, showSku: true })}
      />

      {/* Modals */}
      {addOpen && (
        <ProductModal
          product={null}
          categories={categories}
          onClose={() => setAddOpen(false)}
          onSaved={handleProductSaved}
          onAddCategory={handleAddCategory}
        />
      )}
      {editProduct && (
        <ProductModal
          product={editProduct}
          categories={categories}
          onClose={() => setEditProduct(null)}
          onSaved={handleProductSaved}
          onAddCategory={handleAddCategory}
        />
      )}
      {adjustProduct && (
        <AdjustModal
          product={adjustProduct}
          onClose={() => setAdjustProduct(null)}
          onAdjusted={handleAdjusted}
        />
      )}
      {historyProduct && (
        <HistoryModal product={historyProduct} onClose={() => setHistoryProduct(null)} />
      )}
      {deleteProduct && (
        <DeleteConfirm
          product={deleteProduct}
          onClose={() => setDeleteProduct(null)}
          onDeleted={handleDeleted}
        />
      )}
      {purchaseProduct && (
        <PurchaseModal
          purchase={null}
          initialLineItems={[{
            productId: purchaseProduct._id,
            name: purchaseProduct.name,
            qty: "1",
            buyPrice: String(purchaseProduct.buyPrice),
          }]}
          onClose={() => setPurchaseProduct(null)}
          onSaved={() => setPurchaseProduct(null)}
        />
      )}
    </div>
  );
}
