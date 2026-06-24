"use client";

import { useEffect, useState } from "react";
import { apiRequest, ApiError } from "@/lib/api";
import { Customer, CustomerStats, getCustomerType } from "./components/types";
import CustomersTable from "./components/CustomersTable";
import CustomerModal from "./components/CustomerModal";
import DeleteConfirm from "./components/DeleteConfirm";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<CustomerStats>({
    total: 0,
    regular: 0,
    creditAccounts: 0,
    overdueCredit: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("All");
  const [overdueOnly, setOverdueOnly] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      apiRequest<{ items: Customer[] }>("/api/customers?limit=1000"),
      apiRequest<CustomerStats>("/api/customers/stats"),
    ])
      .then(([customersRes, statsRes]) => {
        if (cancelled) return;
        setCustomers(customersRes.items);
        setStats(statsRes);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Failed to load customers");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const refreshStats = () =>
    apiRequest<CustomerStats>("/api/customers/stats")
      .then(setStats)
      .catch(() => {});

  const filtered = customers.filter((c) => {
    if (overdueOnly && !c.overdueCredit) return false;
    if (activeType !== "All" && getCustomerType(c.visits) !== activeType) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.ref.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSaved = (saved: Customer) => {
    setCustomers((prev) => {
      const idx = prev.findIndex((c) => c._id === saved._id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
    refreshStats();
    setAddOpen(false);
    setEditCustomer(null);
  };

  const handleDeleted = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c._id !== id));
    refreshStats();
    setDeleteCustomer(null);
  };

  return (
    <div className="p-5 flex flex-col h-full gap-4">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Customers", value: stats.total, sub: "registered accounts" },
          { label: "Regular Customers", value: stats.regular, sub: "15+ visits" },
          {
            label: "Credit Accounts",
            value: stats.creditAccounts,
            sub: "have outstanding balance",
            warn: stats.creditAccounts > 0,
          },
          {
            label: "Overdue Credit",
            value: stats.overdueCredit,
            sub: "need follow-up",
            alert: stats.overdueCredit > 0,
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`bg-white border rounded-lg px-4 py-3.5 ${"alert" in s && s.alert ? "border-red-200" : "warn" in s && s.warn ? "border-amber-200" : "border-slate-200"}`}
          >
            <p className="text-[11px] font-medium text-slate-500">{s.label}</p>
            <p
              className={`text-lg font-semibold mt-1 tabular-nums leading-none ${"alert" in s && s.alert ? "text-red-600" : "warn" in s && s.warn ? "text-amber-600" : "text-slate-900"}`}
            >
              {loading ? "—" : s.value.toString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <CustomersTable
        customers={customers}
        filtered={filtered}
        loading={loading}
        error={error}
        search={search}
        onSearchChange={setSearch}
        activeType={activeType}
        onTypeChange={setActiveType}
        overdueOnly={overdueOnly}
        onOverdueToggle={() => setOverdueOnly((v) => !v)}
        onAddClick={() => setAddOpen(true)}
        onEdit={setEditCustomer}
        onDelete={setDeleteCustomer}
      />

      {addOpen && (
        <CustomerModal customer={null} onClose={() => setAddOpen(false)} onSaved={handleSaved} />
      )}
      {editCustomer && (
        <CustomerModal
          customer={editCustomer}
          onClose={() => setEditCustomer(null)}
          onSaved={handleSaved}
        />
      )}
      {deleteCustomer && (
        <DeleteConfirm
          customer={deleteCustomer}
          onClose={() => setDeleteCustomer(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
