"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import { ROLES } from "./types";
import { ModalOverlay, FormField, inputCls } from "./shared";
import { useBranch } from "@/contexts/BranchContext";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function AddStaffModal({ onClose, onCreated }: Props) {
  const { branches } = useBranch();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    staffRole: "",
    password: "",
    branchId: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.staffRole) {
      setError("Please select a role");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await apiRequest("/api/staff", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone || undefined,
          staffRole: form.staffRole,
          branchId: form.branchId || undefined,
        }),
      });
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add staff member");
      setLoading(false);
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-5">
        <h2 className="text-[15px] font-semibold text-slate-800 mb-4">
          Add Staff Member
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <FormField label="Full Name" required>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputCls}
              placeholder="e.g. Diana Apio"
            />
          </FormField>

          <FormField label="Email" required>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputCls}
              placeholder="diana@example.com"
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

          <FormField label="Role" required>
            <select
              required
              value={form.staffRole}
              onChange={(e) => setForm({ ...form, staffRole: e.target.value })}
              className={inputCls}
            >
              <option value="">Select role...</option>
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

          <FormField label="Password" required>
            <div className="relative">
              <input
                required
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={inputCls + " pr-9"}
                placeholder="Minimum 8 characters"
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPw ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </FormField>

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
              {loading ? "Adding..." : "Add Staff"}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}
