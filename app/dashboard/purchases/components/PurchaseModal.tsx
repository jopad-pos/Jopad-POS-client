"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import {
  Purchase,
  PurchaseFormState,
  PurchaseStatus,
  PURCHASE_STATUSES,
  emptyPurchaseForm,
  toInputDate,
} from "./types";
import { ModalOverlay, FormField, HeroDatePicker, inputClass } from "./shared";

interface Props {
  purchase: Purchase | null;
  onClose: () => void;
  onSaved: (p: Purchase) => void;
}

export default function PurchaseModal({ purchase, onClose, onSaved }: Props) {
  const isEdit = !!purchase;

  const [form, setForm] = useState<PurchaseFormState>(
    purchase
      ? {
          supplier: purchase.supplier,
          description: purchase.description,
          items: String(purchase.items),
          amount: String(purchase.amount),
          status: purchase.status,
          date: toInputDate(purchase.date),
        }
      : emptyPurchaseForm()
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set =
    (key: keyof PurchaseFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.supplier.trim()) { setError("Supplier is required"); return; }
    if (!form.amount || Number(form.amount) <= 0) { setError("Amount must be greater than 0"); return; }

    setSaving(true);
    setError("");
    try {
      const body = {
        supplier: form.supplier.trim(),
        description: form.description.trim(),
        items: Math.max(1, Number(form.items) || 1),
        amount: Number(form.amount),
        status: form.status as PurchaseStatus,
        date: form.date,
      };

      const saved = isEdit
        ? await apiRequest<Purchase>(`/api/purchases/${purchase._id}`, {
            method: "PUT",
            body: JSON.stringify(body),
          })
        : await apiRequest<Purchase>("/api/purchases", {
            method: "POST",
            body: JSON.stringify(body),
          });

      onSaved(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-[15px] font-semibold text-slate-800">
            {isEdit ? "Edit Purchase Order" : "New Purchase Order"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <FormField label="Supplier" required>
            <input
              className={inputClass}
              value={form.supplier}
              onChange={set("supplier")}
              placeholder="e.g. Crown Beverages Ltd"
            />
          </FormField>

          <FormField label="Description">
            <textarea
              className={`${inputClass} resize-none`}
              rows={2}
              value={form.description}
              onChange={set("description")}
              placeholder="e.g. Mineral Water × 96, Soda Water × 144"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="No. of Items">
              <input
                className={inputClass}
                type="number"
                min="1"
                value={form.items}
                onChange={set("items")}
                placeholder="1"
              />
            </FormField>
            <FormField label="Amount (UGX)" required>
              <input
                className={inputClass}
                type="number"
                min="0"
                value={form.amount}
                onChange={set("amount")}
                placeholder="0"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Status">
              <select className={inputClass} value={form.status} onChange={set("status")}>
                {PURCHASE_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Date">
              <HeroDatePicker
                value={form.date}
                onChange={(iso) => setForm((f) => ({ ...f, date: iso }))}
              />
            </FormField>
          </div>

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
              disabled={saving}
              className="px-4 py-2 text-[13px] font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-md transition"
            >
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Purchase"}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}
