"use client";

import { useEffect, useState } from "react";
import { apiRequest, ApiError } from "@/lib/api";
import { Supplier, SupplierStats } from "./components/types";
import SuppliersTable from "./components/SuppliersTable";
import SupplierModal from "./components/SupplierModal";
import DeleteConfirm from "./components/DeleteConfirm";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stats, setStats] = useState<SupplierStats>({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState("All");

  // Modals
  const [addOpen, setAddOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [deleteSupplier, setDeleteSupplier] = useState<Supplier | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      apiRequest<{ items: Supplier[] }>("/api/suppliers?limit=1000"),
      apiRequest<SupplierStats>("/api/suppliers/stats"),
    ])
      .then(([suppliersRes, statsRes]) => {
        if (cancelled) return;
        setSuppliers(suppliersRes.items);
        setStats(statsRes);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Failed to load suppliers");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshStats = () =>
    apiRequest<SupplierStats>("/api/suppliers/stats")
      .then(setStats)
      .catch(() => {});

  // Client-side filtering
  const filtered = suppliers.filter((s) => {
    if (activeStatus !== "All" && s.status !== activeStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.contact.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.ref.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSaved = (saved: Supplier) => {
    setSuppliers((prev) => {
      const idx = prev.findIndex((s) => s._id === saved._id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
    refreshStats();
    setAddOpen(false);
    setEditSupplier(null);
  };

  const handleDeleted = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s._id !== id));
    refreshStats();
    setDeleteSupplier(null);
  };

  return (
    <div className="p-5 flex flex-col h-full gap-4">
      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "Total Suppliers", value: stats.total.toString(), sub: "registered" },
          { label: "Active", value: stats.active.toString(), sub: "currently ordering" },
          { label: "Inactive", value: stats.inactive.toString(), sub: "not currently ordering" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border border-slate-200 rounded-lg px-4 py-3.5"
          >
            <p className="text-[11px] font-medium text-slate-500">{s.label}</p>
            <p className="text-lg font-semibold text-slate-900 mt-1 tabular-nums leading-none">
              {loading ? "—" : s.value}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <SuppliersTable
        suppliers={suppliers}
        filtered={filtered}
        loading={loading}
        error={error}
        search={search}
        onSearchChange={setSearch}
        activeStatus={activeStatus}
        onStatusChange={setActiveStatus}
        onAddClick={() => setAddOpen(true)}
        onEdit={setEditSupplier}
        onDelete={setDeleteSupplier}
      />

      {/* Modals */}
      {addOpen && (
        <SupplierModal supplier={null} onClose={() => setAddOpen(false)} onSaved={handleSaved} />
      )}
      {editSupplier && (
        <SupplierModal
          supplier={editSupplier}
          onClose={() => setEditSupplier(null)}
          onSaved={handleSaved}
        />
      )}
      {deleteSupplier && (
        <DeleteConfirm
          supplier={deleteSupplier}
          onClose={() => setDeleteSupplier(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
