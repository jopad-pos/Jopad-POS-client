"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import { Product, DAMAGE_REASONS } from "./types";
import { ModalOverlay, FormField, inputClass } from "./shared";

interface Props {
  product: Product;
  onClose: () => void;
  onDamaged: (p: Product) => void;
}

export default function DamageModal({ product, onClose, onDamaged }: Props) {
  const [qty, setQty] = useState("");
  const [reason, setReason] = useState<(typeof DAMAGE_REASONS)[number]>(DAMAGE_REASONS[0]);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const value = Number(qty);
  const validQty = qty !== "" && !isNaN(value) && value > 0 && value <= product.qty;
  const estimatedLoss = validQty ? value * product.buyPrice : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validQty) {
      setError(
        !qty || isNaN(value) || value <= 0
          ? "Enter a valid quantity"
          : "Quantity cannot exceed current stock"
      );
      return;
    }
    setSaving(true);
    setError("");
    try {
      const updated = await apiRequest<Product>(`/api/products/${product._id}/damage`, {
        method: "POST",
        body: JSON.stringify({ qty: value, reason, note: note.trim() }),
      });
      onDamaged(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-[15px] font-semibold text-slate-800">Report Damage</h2>
            <p className="text-[12px] text-slate-400 mt-0.5">{product.name}</p>
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

          <div className="bg-slate-50 rounded-md px-4 py-3 flex items-center justify-between">
            <span className="text-[12px] text-slate-500">Current qty</span>
            <span className="text-[15px] font-semibold text-slate-800 tabular-nums">{product.qty}</span>
          </div>

          <FormField label="Quantity Damaged" required>
            <input
              className={inputClass}
              type="number"
              min="0"
              max={product.qty}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="0"
              autoFocus
            />
          </FormField>

          <FormField label="Reason" required>
            <select
              className={inputClass}
              value={reason}
              onChange={(e) => setReason(e.target.value as (typeof DAMAGE_REASONS)[number])}
            >
              {DAMAGE_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </FormField>

          {estimatedLoss !== null && (
            <div className="text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              Estimated loss value:{" "}
              <span className="font-semibold tabular-nums">{estimatedLoss.toLocaleString()}</span>
            </div>
          )}

          <FormField label="Note (optional)">
            <input
              className={inputClass}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Dropped during unloading"
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
              className="px-4 py-2 text-[13px] font-medium bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-md transition"
            >
              {saving ? "Saving…" : "Report Damage"}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}
