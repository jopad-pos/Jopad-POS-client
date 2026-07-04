"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiRequest, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useBranchQuery } from "@/contexts/BranchContext";
import { Sale, SaleType, isToday } from "./components/types";
import SalesTable from "./components/SalesTable";
import ViewSaleModal from "./components/ViewSaleModal";
import CreateSaleModal from "./components/CreateSaleModal";
import DeleteConfirm from "./components/DeleteConfirm";
import { printReceipt } from "./components/printReceipt";

const PAGE_SIZE = 15;

export default function SalesPage() {
  return (
    <Suspense fallback={null}>
      <SalesPageInner />
    </Suspense>
  );
}

function SalesPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const branchQuery = useBranchQuery();
  const { profile } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("All Methods");
  const [cashierFilter, setCashierFilter] = useState("All Cashiers");
  const [typeFilter, setTypeFilter] = useState<SaleType | "All Types">("All Types");
  const [todayOnly, setTodayOnly] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);

  // Modals
  const [showCreate, setShowCreate] = useState(() => searchParams.get("new") === "true");
  const [viewSale, setViewSale] = useState<Sale | null>(null);
  const [deleteSale, setDeleteSale] = useState<Sale | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiRequest<{ items: Sale[] }>(`/api/sales?limit=500${branchQuery}`)
      .then((res) => {
        if (!cancelled) { setSales(res.items); setError(""); }
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof ApiError ? err.message : "Failed to load sales");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [branchQuery]);

  // Strip the query param used to auto-open the create modal (e.g. overview's "New Sale" button)
  useEffect(() => {
    if (searchParams.get("new") === "true") {
      router.replace("/dashboard/sales");
    }
  }, [searchParams, router]);

  // Derived cashier list for the filter dropdown
  const cashiers = useMemo(
    () => Array.from(new Set(sales.map((s) => s.cashier).filter(Boolean))).sort(),
    [sales]
  );

  // Client-side filtering
  const filtered = useMemo(() => {
    return sales.filter((s) => {
      if (todayOnly && !isToday(s.date)) return false;
      if (methodFilter !== "All Methods" && s.method !== methodFilter) return false;
      if (cashierFilter !== "All Cashiers" && s.cashier !== cashierFilter) return false;
      if (typeFilter !== "All Types" && !(s.saleTypes || []).includes(typeFilter)) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !s.ref.toLowerCase().includes(q) &&
          !s.customer.toLowerCase().includes(q) &&
          !s.cashier.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [sales, search, methodFilter, cashierFilter, typeFilter, todayOnly]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Filter change handlers — always reset to page 1
  function handleSearch(v: string) { setSearch(v); setPage(1); }
  function handleMethod(v: string) { setMethodFilter(v); setPage(1); }
  function handleCashier(v: string) { setCashierFilter(v); setPage(1); }
  function handleType(v: SaleType | "All Types") { setTypeFilter(v); setPage(1); }
  function handleTodayToggle() { setTodayOnly((v) => !v); setPage(1); }

  // Modal callbacks
  const handleCreated = (sale: Sale) => {
    setSales((prev) => [sale, ...prev]);
    setShowCreate(false);
  };

  const handleDeleted = (id: string) => {
    setSales((prev) => prev.filter((s) => s._id !== id));
    setDeleteSale(null);
  };

  async function handlePrint(sale: Sale) {
    try {
      const full = await apiRequest<Sale>(`/api/sales/${sale._id}`);
      printReceipt(full, profile);
    } catch {
      printReceipt(sale, profile);
    }
  }

  // Summary stats — always from today's full data regardless of current filter
  const todaySales = useMemo(() => sales.filter((s) => isToday(s.date)), [sales]);
  const totalToday = todaySales.reduce((a, s) => a + s.amount, 0);
  const countToday = todaySales.length;
  const avgToday = countToday > 0 ? Math.round(totalToday / countToday) : 0;
  const cashToday = todaySales.filter((s) => s.method === "Cash").reduce((a, s) => a + s.amount, 0);
  const mmToday = todaySales.filter((s) => s.method === "Mobile Money").reduce((a, s) => a + s.amount, 0);
  const cashCountToday = todaySales.filter((s) => s.method === "Cash").length;
  const mmCountToday = todaySales.filter((s) => s.method === "Mobile Money").length;

  return (
    <div className="p-5 flex flex-col h-full gap-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
        {[
          {
            label: "Revenue Today",
            value: `UGX ${totalToday.toLocaleString()}`,
            sub: `${countToday} transaction${countToday !== 1 ? "s" : ""}`,
          },
          {
            label: "Avg Transaction",
            value: `UGX ${avgToday.toLocaleString()}`,
            sub: "per sale",
          },
          {
            label: "Cash Sales",
            value: `UGX ${cashToday.toLocaleString()}`,
            sub: `${cashCountToday} transaction${cashCountToday !== 1 ? "s" : ""}`,
          },
          {
            label: "Mobile Money",
            value: `UGX ${mmToday.toLocaleString()}`,
            sub: `${mmCountToday} transaction${mmCountToday !== 1 ? "s" : ""}`,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border border-slate-200 rounded-lg px-4 py-3.5"
          >
            <p className="text-[11px] font-medium text-slate-500">{s.label}</p>
            <p
              className={`text-base font-semibold mt-1 tabular-nums leading-none ${
                loading ? "text-slate-300" : "text-slate-900"
              }`}
            >
              {loading ? "—" : s.value}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <SalesTable
        items={paginated}
        totalFiltered={filtered.length}
        totalAll={sales.length}
        loading={loading}
        error={error}
        search={search}
        onSearchChange={handleSearch}
        methodFilter={methodFilter}
        onMethodFilterChange={handleMethod}
        cashierFilter={cashierFilter}
        onCashierFilterChange={handleCashier}
        cashiers={cashiers}
        typeFilter={typeFilter}
        onTypeFilterChange={handleType}
        todayOnly={todayOnly}
        onTodayToggle={handleTodayToggle}
        page={safePage}
        totalPages={totalPages}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
        onPageSelect={setPage}
        onNew={() => setShowCreate(true)}
        onView={setViewSale}
        onPrint={handlePrint}
        onDelete={setDeleteSale}
      />

      {/* Modals */}
      {showCreate && (
        <CreateSaleModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
      {viewSale && (
        <ViewSaleModal
          sale={viewSale}
          onClose={() => setViewSale(null)}
        />
      )}
      {deleteSale && (
        <DeleteConfirm
          sale={deleteSale}
          onClose={() => setDeleteSale(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
