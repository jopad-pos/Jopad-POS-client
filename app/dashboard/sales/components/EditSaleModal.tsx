"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import { Sale, PayMethod } from "./types";
import { ModalOverlay, FormField, inputClass } from "./shared";

interface Props {
  sale: Sale;
  onClose: () => void;
  onSaved: (updated: Sale) => void;
}

interface FormState {
  customer: string;
  cashier: string;
  items: string;
  amount: string;
  method: PayMethod;
  date: string;
}

function toLocalDatetimeInput(dateStr: string): string {
  const d = new Date(dateStr);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

export default function EditSaleModal({ sale, onClose, onSaved }: Props) {
  const [form, setForm] = useState<FormState>({
    customer: sale.customer,
    cashier: sale.cashier,
    items: String(sale.items),
    amount: String(sale.amount),
    method: sale.method,
    date: toLocalDatetimeInput(sale.date),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) < 0) {
      setError("Amount must be 0 or greater");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const updated = await apiRequest<Sale>(`/api/sales/${sale._id}`, {
        method: "PUT",
        body: JSON.stringify({
          customer: form.customer.trim() || "Walk-in Customer",
          cashier: form.cashier.trim(),
          items: Number(form.items) || 1,
          amount: Number(form.amount),
          method: form.method,
          date: new Date(form.date).toISOString(),
        }),
      });
      onSaved(updated);
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
          <div>
            <h2 className="text-[15px] font-semibold text-slate-800">Edit Sale</h2>
            <p className="text-[12px] text-slate-400 mt-0.5">{sale.ref}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <FormField label="Customer">
            <input
              className={inputClass}
              value={form.customer}
              onChange={set("customer")}
              placeholder="Walk-in Customer"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Cashier">
              <input
                className={inputClass}
                value={form.cashier}
                onChange={set("cashier")}
                placeholder="e.g. Diana A."
              />
            </FormField>
            <FormField label="Items">
              <input
                className={inputClass}
                type="number"
                min="1"
                value={form.items}
                onChange={set("items")}
                placeholder="1"
              />
            </FormField>
          </div>

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
            <FormField label="Payment Method" required>
              <select
                className={inputClass}
                value={form.method}
                onChange={set("method")}
              >
                <option>Cash</option>
                <option>Mobile Money</option>
                <option>Card</option>
                <option>Credit</option>
              </select>
            </FormField>
          </div>

          <FormField label="Date & Time">
            <input
              className={inputClass}
              type="datetime-local"
              value={form.date}
              onChange={set("date")}
            />
          </FormField>

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
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}
