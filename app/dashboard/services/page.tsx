"use client";

import { useEffect, useState } from "react";
import { apiRequest, ApiError } from "@/lib/api";
import { useBranchQuery } from "@/contexts/BranchContext";
import { Service, StatsData } from "./components/types";
import ServicesTable from "./components/ServicesTable";
import ServiceModal from "./components/ServiceModal";
import DeleteConfirm from "./components/DeleteConfirm";

function formatUGX(value: number): string {
  return value >= 1_000_000
    ? `UGX ${(value / 1_000_000).toFixed(1)}M`
    : `UGX ${value.toLocaleString()}`;
}

export default function ServicesPage() {
  const branchQuery = useBranchQuery();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    categories: 0,
    averagePrice: 0,
    highestPrice: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Modals
  const [addOpen, setAddOpen] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);
  const [deleteService, setDeleteService] = useState<Service | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      apiRequest<{ items: Service[] }>(`/api/services?limit=1000${branchQuery}`),
      apiRequest<string[]>(`/api/services/categories?1=1${branchQuery}`),
      apiRequest<StatsData>(`/api/services/stats?1=1${branchQuery}`),
    ])
      .then(([servicesRes, catsRes, statsRes]) => {
        if (cancelled) return;
        setServices(servicesRes.items);
        setCategories(catsRes);
        setStats(statsRes);
        setError("");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Failed to load services");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [branchQuery]);

  const refreshMeta = () =>
    Promise.all([
      apiRequest<string[]>(`/api/services/categories?1=1${branchQuery}`),
      apiRequest<StatsData>(`/api/services/stats?1=1${branchQuery}`),
    ])
      .then(([cats, st]) => {
        setCategories(cats);
        setStats(st);
      })
      .catch(() => {});

  // Client-side filtering
  const filtered = services.filter((s) => {
    if (activeCategory !== "All" && s.category !== activeCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        (s.description || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleServiceSaved = (saved: Service) => {
    setServices((prev) => {
      const idx = prev.findIndex((s) => s._id === saved._id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved].sort((a, b) => a.name.localeCompare(b.name));
    });
    refreshMeta();
    setAddOpen(false);
    setEditService(null);
  };

  const handleDeleted = (id: string) => {
    setServices((prev) => prev.filter((s) => s._id !== id));
    refreshMeta();
    setDeleteService(null);
  };

  return (
    <div className="p-5 flex flex-col h-full gap-4">
      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Services", value: stats.total.toString(), sub: "offered to customers" },
          {
            label: "Average Price",
            value: formatUGX(stats.averagePrice),
            sub: "across all services",
          },
          {
            label: "Highest Price",
            value: formatUGX(stats.highestPrice),
            sub: "most expensive service",
          },
          { label: "Categories", value: stats.categories.toString(), sub: "service groupings" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border border-slate-200 rounded-lg px-4 py-3.5"
          >
            <p className="text-[11px] font-medium text-slate-500">{s.label}</p>
            <p className="text-lg font-semibold mt-1 tabular-nums leading-none text-slate-900">
              {loading ? "—" : s.value}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <ServicesTable
        services={services}
        filtered={filtered}
        categories={categories}
        loading={loading}
        error={error}
        search={search}
        onSearchChange={setSearch}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        onAddClick={() => setAddOpen(true)}
        onEdit={setEditService}
        onDelete={setDeleteService}
      />

      {/* Modals */}
      {addOpen && (
        <ServiceModal
          service={null}
          categories={categories}
          onClose={() => setAddOpen(false)}
          onSaved={handleServiceSaved}
        />
      )}
      {editService && (
        <ServiceModal
          service={editService}
          categories={categories}
          onClose={() => setEditService(null)}
          onSaved={handleServiceSaved}
        />
      )}
      {deleteService && (
        <DeleteConfirm
          service={deleteService}
          onClose={() => setDeleteService(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
