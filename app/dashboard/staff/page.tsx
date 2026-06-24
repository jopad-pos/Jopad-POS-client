"use client";

import { useState, useEffect, useMemo } from "react";
import { apiRequest, ApiError } from "@/lib/api";
import { StaffMember } from "./components/types";
import StaffTable from "./components/StaffTable";
import AddStaffModal from "./components/AddStaffModal";
import EditStaffModal from "./components/EditStaffModal";
import SetPasswordModal from "./components/SetPasswordModal";
import DeleteConfirm from "./components/DeleteConfirm";

// ── Page ──────────────────────────────────────────────────────────────────────

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");

  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<StaffMember | null>(null);
  const [pwTarget, setPwTarget] = useState<StaffMember | null>(null);
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
    <div className="p-5 flex flex-col gap-4 flex-1 min-h-0">

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
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
        onSetPassword={setPwTarget}
        onToggleActive={toggleActive}
        onDelete={setDeleteTarget}
      />

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

      {pwTarget && (
        <SetPasswordModal
          staff={pwTarget}
          onClose={() => setPwTarget(null)}
          onUpdated={() => setPwTarget(null)}
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
