"use client";

import { useState } from "react";
import { apiRequest, ApiError } from "@/lib/api";
import { StaffMember, StaffRole, ROLES } from "./types";
import { ModalOverlay, FormField, inputCls } from "./shared";
import { useBranch } from "@/contexts/BranchContext";

interface Props {
  staff: StaffMember;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditStaffModal({ staff, onClose, onUpdated }: Props) {
  const { branches } = useBranch();

  const currentBranchId =
    staff.branchId && typeof staff.branchId === "object"
      ? staff.branchId._id
      : (staff.branchId as string | null | undefined) ?? "";

  const [form, setForm] = useState({
    name: staff.name,
    email: staff.email,
    phone: staff.phone ?? "",
    staffRole: staff.staffRole ?? "",
    branchId: currentBranchId,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await apiRequest(`/api/staff/${staff._id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          staffRole: form.staffRole || null,
          branchId: form.branchId || null,
        }),
      });
      onUpdated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update staff member");
      setLoading(false);
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-5">
        <h2 className="text-[15px] font-semibold text-slate-800 mb-4">
          Edit Staff Member
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <FormField label="Full Name" required>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputCls}
            />
          </FormField>

          <FormField label="Email" required>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputCls}
            />
          </FormField>

          <FormField label="Phone">
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={inputCls}
              placeholder="+256 7xx xxx xxx"
            />
          </FormField>

          <FormField label="Role">
            <select
              value={form.staffRole}
              onChange={(e) =>
                setForm({ ...form, staffRole: e.target.value as StaffRole })
              }
              className={inputCls}
            >
              <option value="">No role assigned</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </FormField>

          {branches.length > 0 && (
            <FormField label="Branch">
              <select
                value={form.branchId}
                onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                className={inputCls}
              >
                <option value="">All branches (no restriction)</option>
                {branches.filter((b) => b.isActive).map((b) => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </FormField>
          )}

          {error && <p className="text-[12px] text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-[13px] font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-md transition"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}
