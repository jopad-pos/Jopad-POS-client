"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import {
  Supplier,
  SupplierFormState,
  emptySupplierForm,
  supplierToForm,
  parseCategories,
  SUPPLIER_STATUSES,
} from "./types";
import { ModalOverlay, FormField, inputClass } from "./shared";

interface Props {
  supplier: Supplier | null;
  onClose: () => void;
  onSaved: (s: Supplier) => void;
}

export default function SupplierModal({ supplier, onClose, onSaved }: Props) {
  const isEdit = !!supplier;
  const [form, setForm] = useState<SupplierFormState>(
    isEdit ? supplierToForm(supplier) : emptySupplierForm()
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set =
    (key: keyof SupplierFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Supplier name is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name.trim(),
        contact: form.contact.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        categories: parseCategories(form.categories),
        status: form.status,
        notes: form.notes.trim(),
      };
      const saved = isEdit
        ? await apiRequest<Supplier>(`/api/suppliers/${supplier._id}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          })
        : await apiRequest<Supplier>("/api/suppliers", {
            method: "POST",
            body: JSON.stringify(payload),
          });
      onSaved(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save supplier");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-[14px] font-semibold text-slate-900">
            {isEdit ? "Edit Supplier" : "Add Supplier"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-5 py-4 space-y-3.5">
            {error && (
              <p className="text-[12px] text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>
            )}

            <FormField label="Supplier Name" required>
              <input
                className={inputClass}
                placeholder="e.g. Quality Superfoods Ltd"
                value={form.name}
                onChange={set("name")}
                autoFocus
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Contact Person">
                <input
                  className={inputClass}
                  placeholder="e.g. James Onyango"
                  value={form.contact}
                  onChange={set("contact")}
                />
              </FormField>
              <FormField label="Phone">
                <input
                  className={inputClass}
                  placeholder="+256 772 xxx xxx"
                  value={form.phone}
                  onChange={set("phone")}
                />
              </FormField>
            </div>

            <FormField label="Email">
              <input
                type="email"
                className={inputClass}
                placeholder="supplier@example.com"
                value={form.email}
                onChange={set("email")}
              />
            </FormField>

            <FormField label="Categories">
              <input
                className={inputClass}
                placeholder="e.g. Groceries, Beverages, Dairy"
                value={form.categories}
                onChange={set("categories")}
              />
              <p className="text-[11px] text-slate-400 mt-1">Separate with commas</p>
            </FormField>

            <FormField label="Status">
              <select className={inputClass} value={form.status} onChange={set("status")}>
                {SUPPLIER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Notes">
              <textarea
                className={`${inputClass} resize-none`}
                rows={2}
                placeholder="Optional notes…"
                value={form.notes}
                onChange={set("notes")}
              />
            </FormField>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-[12px] text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 text-[12px] font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-md transition"
            >
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Supplier"}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}
