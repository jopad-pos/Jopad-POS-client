"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import { Product } from "./types";
import { ModalOverlay, FormField, inputClass } from "./shared";

interface Props {
  product: Product;
  onClose: () => void;
  onAdjusted: (p: Product) => void;
}

export default function AdjustModal({ product, onClose, onAdjusted }: Props) {
  const [type, setType] = useState<"in" | "out" | "adjustment">("in");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const previewQty = () => {
    const v = Number(qty);
    if (isNaN(v) || v < 0) return null;
    if (type === "adjustment") return v;
    if (type === "in") return product.qty + v;
    return Math.max(0, product.qty - v);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = Number(qty);
    if (!qty || isNaN(v) || v < 0) {
      setError("Enter a valid quantity");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const updated = await apiRequest<Product>(`/api/products/${product._id}/adjust`, {
        method: "POST",
        body: JSON.stringify({ type, qty: v, note: note.trim() }),
      });
      onAdjusted(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const preview = previewQty();

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-[15px] font-semibold text-slate-800">Adjust Stock</h2>
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

          <div className="flex gap-2">
            {(["in", "out", "adjustment"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 py-2 text-[12px] font-medium rounded-md border transition ${
                  type === t
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {t === "in" ? "Stock In" : t === "out" ? "Stock Out" : "Set Qty"}
              </button>
            ))}
          </div>

          <div className="bg-slate-50 rounded-md px-4 py-3 flex items-center justify-between">
            <span className="text-[12px] text-slate-500">Current qty</span>
            <span className="text-[15px] font-semibold text-slate-800 tabular-nums">{product.qty}</span>
          </div>

          <FormField label={type === "adjustment" ? "New Quantity" : "Quantity"}>
            <input
              className={inputClass}
              type="number"
              min="0"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="0"
              autoFocus
            />
          </FormField>

          {preview !== null && preview !== product.qty && (
            <div className="text-[12px] text-slate-500 bg-blue-50 border border-blue-100 rounded-md px-3 py-2">
              New qty will be{" "}
              <span className="font-semibold text-blue-700 tabular-nums">{preview}</span>
            </div>
          )}

          <FormField label="Note (optional)">
            <input
              className={inputClass}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Received from supplier"
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
              {saving ? "Saving…" : "Apply"}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}
