"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import {
  Expense,
  ExpenseFormState,
  EXPENSE_CATEGORIES,
  emptyExpenseForm,
  toInputDate,
} from "./types";
import { ModalOverlay, FormField, HeroDatePicker, inputClass } from "./shared";

interface Props {
  expense: Expense | null;
  onClose: () => void;
  onSaved: (e: Expense) => void;
}

export default function ExpenseModal({ expense, onClose, onSaved }: Props) {
  const isEdit = !!expense;

  const [form, setForm] = useState<ExpenseFormState>(
    expense
      ? {
          category: expense.category,
          description: expense.description,
          amount: String(expense.amount),
          date: toInputDate(expense.date),
        }
      : emptyExpenseForm()
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set =
    (key: keyof ExpenseFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category) { setError("Category is required"); return; }
    if (!form.amount || Number(form.amount) <= 0) { setError("Amount must be greater than 0"); return; }

    setSaving(true);
    setError("");
    try {
      const body = {
        category: form.category,
        description: form.description.trim(),
        amount: Number(form.amount),
        date: form.date,
      };

      const saved = isEdit
        ? await apiRequest<Expense>(`/api/expenses/${expense._id}`, {
            method: "PUT",
            body: JSON.stringify(body),
          })
        : await apiRequest<Expense>("/api/expenses", {
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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-[15px] font-semibold text-slate-800">
            {isEdit ? "Edit Expense" : "Add Expense"}
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

          <FormField label="Category" required>
            <select className={inputClass} value={form.category} onChange={set("category")}>
              <option value="">Select a category…</option>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Description">
            <textarea
              className={`${inputClass} resize-none`}
              rows={2}
              value={form.description}
              onChange={set("description")}
              placeholder="e.g. Shop rent — June 2026"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
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
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}
