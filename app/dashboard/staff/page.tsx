"use client";

import { useState, useEffect, useMemo } from "react";
import { ShieldCheck } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import { StaffMember } from "./components/types";
import StaffTable from "./components/StaffTable";
import AddStaffModal from "./components/AddStaffModal";
import EditStaffModal from "./components/EditStaffModal";
import DeleteConfirm from "./components/DeleteConfirm";

// ── Permissions reference (static) ───────────────────────────────────────────

const PERMISSIONS = [
  { label: "Process sales",       cashier: true,  stock: false, accountant: false, manager: true  },
  { label: "View stock levels",   cashier: true,  stock: true,  accountant: false, manager: true  },
  { label: "Add / edit products", cashier: false, stock: true,  accountant: false, manager: true  },
  { label: "Record purchases",    cashier: false, stock: true,  accountant: false, manager: true  },
  { label: "Add expenses",        cashier: false, stock: false, accountant: true,  manager: true  },
  { label: "View reports",        cashier: false, stock: false, accountant: true,  manager: true  },
  { label: "View accounting",     cashier: false, stock: false, accountant: true,  manager: true  },
  { label: "Manage staff",        cashier: false, stock: false, accountant: false, manager: true  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");

  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<StaffMember | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null);

  function loadStaff() {
    setLoading(true);
    apiRequest<{ staff: StaffMember[] }>("/api/staff?limit=200")
      .then((res) => { setStaff(res.staff); setError(""); })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load staff"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadStaff(); }, []);

  const filtered = useMemo(() => {
    return staff.filter((s) => {
      if (roleFilter !== "All Roles" && s.staffRole !== roleFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!s.name.toLowerCase().includes(q) && !s.email.toLowerCase().includes(q))
          return false;
      }
      return true;
    });
  }, [staff, search, roleFilter]);

  async function toggleActive(s: StaffMember) {
    try {
      await apiRequest(`/api/staff/${s._id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !s.isActive }),
      });
      loadStaff();
    } catch {
      // keep current state on failure
    }
  }

  const activeCount = staff.filter((s) => s.isActive).length;
  const inactiveCount = staff.length - activeCount;

  return (
    <div className="p-5 space-y-4">

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Staff",  value: staff.length,  sub: "registered accounts" },
          { label: "Active",       value: activeCount,   sub: "currently enabled" },
          { label: "Inactive",     value: inactiveCount, sub: "disabled accounts" },
          {
            label: "Roles in Use",
            value: new Set(staff.map((s) => s.staffRole).filter(Boolean)).size,
            sub: "distinct roles",
          },
        ].map((card) => (
          <div key={card.label} className="bg-white border border-slate-200 rounded-lg px-4 py-3.5">
            <p className="text-[11px] font-medium text-slate-500">{card.label}</p>
            <p className="text-base font-semibold text-slate-900 mt-1 tabular-nums leading-none">
              {card.value}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Staff table */}
      <StaffTable
        items={filtered}
        loading={loading}
        error={error}
        totalAll={staff.length}
        search={search}
        onSearchChange={setSearch}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        onNew={() => setShowAdd(true)}
        onEdit={setEditTarget}
        onToggleActive={toggleActive}
        onDelete={setDeleteTarget}
      />

      {/* Role permissions reference */}
      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="px-4 py-3.5 border-b border-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <div>
            <h2 className="text-[13px] font-semibold text-slate-900">Role Permissions</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">What each role can access</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-left">
                  Permission
                </th>
                {(["Cashier", "Stock Manager", "Accountant", "Manager"] as const).map((r) => (
                  <th
                    key={r}
                    className="px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center whitespace-nowrap"
                  >
                    {r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-center">
              {PERMISSIONS.map((row) => (
                <tr key={row.label} className="hover:bg-slate-50/50">
                  <td className="px-4 py-2.5 text-left text-[12px] text-slate-700">
                    {row.label}
                  </td>
                  {[row.cashier, row.stock, row.accountant, row.manager].map((allowed, i) => (
                    <td key={i} className="px-4 py-2.5">
                      <span className={`text-[13px] ${allowed ? "text-emerald-500" : "text-slate-200"}`}>
                        {allowed ? "✓" : "✕"}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showAdd && (
        <AddStaffModal
          onClose={() => setShowAdd(false)}
          onCreated={() => { setShowAdd(false); loadStaff(); }}
        />
      )}

      {editTarget && (
        <EditStaffModal
          staff={editTarget}
          onClose={() => setEditTarget(null)}
          onUpdated={() => { setEditTarget(null); loadStaff(); }}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          staff={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => { setDeleteTarget(null); loadStaff(); }}
        />
      )}
    </div>
  );
}
