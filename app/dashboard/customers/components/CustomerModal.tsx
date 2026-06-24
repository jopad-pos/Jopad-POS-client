"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import { Customer, CustomerFormState, emptyCustomerForm, customerToForm } from "./types";
import { ModalOverlay, FormField, inputClass } from "./shared";

interface Props {
  customer: Customer | null;
  onClose: () => void;
  onSaved: (c: Customer) => void;
}

export default function CustomerModal({ customer, onClose, onSaved }: Props) {
  const isEdit = !!customer;
  const [form, setForm] = useState<CustomerFormState>(
    isEdit ? customerToForm(customer) : emptyCustomerForm()
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set =
    (key: keyof CustomerFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Customer name is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        notes: form.notes.trim(),
      };
      if (isEdit) {
        payload.creditBalance = Number(form.creditBalance) || 0;
        payload.overdueCredit = form.overdueCredit;
      }
      const saved = isEdit
        ? await apiRequest<Customer>(`/api/customers/${customer._id}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          })
        : await apiRequest<Customer>("/api/customers", {
            method: "POST",
            body: JSON.stringify(payload),
          });
      onSaved(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save customer");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-[14px] font-semibold text-slate-900">
            {isEdit ? "Edit Customer" : "Add Customer"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-5 py-4 space-y-3.5">
            {error && (
              <p className="text-[12px] text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>
            )}

            <FormField label="Customer Name" required>
              <input
                className={inputClass}
                placeholder="e.g. Kasozi James"
                value={form.name}
                onChange={set("name")}
                autoFocus
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Phone">
                <input
                  className={inputClass}
                  placeholder="+256 772 xxx xxx"
                  value={form.phone}
                  onChange={set("phone")}
                />
              </FormField>
              <FormField label="Email">
                <input
                  type="email"
                  className={inputClass}
                  placeholder="customer@example.com"
                  value={form.email}
                  onChange={set("email")}
                />
              </FormField>
            </div>

            {isEdit && (
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Credit Balance (UGX)">
                  <input
                    type="number"
                    min="0"
                    className={inputClass}
                    value={form.creditBalance}
                    onChange={set("creditBalance")}
                  />
                </FormField>
                <FormField label="Overdue Credit">
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.overdueCredit}
                      onChange={set("overdueCredit")}
                      className="w-4 h-4 accent-red-600"
                    />
                    <span className="text-[13px] text-slate-700">Mark as overdue</span>
                  </label>
                </FormField>
              </div>
            )}

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
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Customer"}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}
