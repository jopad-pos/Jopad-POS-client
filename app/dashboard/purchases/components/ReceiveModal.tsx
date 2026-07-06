"use client";

import { useState } from "react";
import { X, PackageCheck } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import { Purchase } from "./types";
import { ModalOverlay, inputClass } from "./shared";

interface ReceivedRow {
  index: number;
  productId: string;
  name: string;
  orderedQty: number;
  alreadyReceived: number;
  remaining: number;
  receivedQty: string;
}

interface Props {
  purchase: Purchase;
  onClose: () => void;
  onReceived: (updated: Purchase) => void;
}

export default function ReceiveModal({ purchase, onClose, onReceived }: Props) {
  const [rows, setRows] = useState<ReceivedRow[]>(
    (purchase.lineItems ?? []).map((li, index) => {
      const alreadyReceived = li.receivedQty || 0;
      const remaining = Math.max(0, li.qty - alreadyReceived);
      return {
        index,
        productId: li.productId,
        name: li.name,
        orderedQty: li.qty,
        alreadyReceived,
        remaining,
        receivedQty: String(remaining),
      };
    })
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const receiveAll = () =>
    setRows((prev) => prev.map((r) => ({ ...r, receivedQty: String(r.remaining) })));

  const updateQty = (idx: number, value: string) =>
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== idx) return r;
        const n = Number(value);
        const clamped = value === "" ? "" : String(Math.max(0, Math.min(n, r.remaining)));
        return { ...r, receivedQty: clamped };
      })
    );

  const willBeFullyReceived = rows.every(
    (r) => r.remaining === 0 || Number(r.receivedQty) >= r.remaining
  );

  const handleConfirm = async () => {
    const receivedItems = rows
      .filter((r) => r.remaining > 0)
      .map((r) => ({ index: r.index, productId: r.productId, qty: Number(r.receivedQty) }))
      .filter((r) => r.productId && r.qty > 0);

    if (receivedItems.length === 0) {
      setError("Enter a received quantity for at least one item");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const updated = await apiRequest<Purchase>(`/api/purchases/${purchase._id}/receive`, {
        method: "POST",
        body: JSON.stringify({ receivedItems }),
      });
      onReceived(updated);
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
          <div>
            <h2 className="text-[15px] font-semibold text-slate-800">Receive Stock</h2>
            <p className="text-[12px] text-slate-400 font-mono mt-0.5">{purchase.ref}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-[12px] text-slate-500">
              Enter what actually arrived. Leftover quantities stay open so you can receive the rest later.
            </p>
            <button
              type="button"
              onClick={receiveAll}
              className="text-[12px] text-blue-600 hover:text-blue-700 font-medium transition whitespace-nowrap"
            >
              Receive All
            </button>
          </div>

          {/* Items table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Product</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wide w-20">Ordered</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wide w-24">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row, idx) => (
                  <tr key={idx}>
                    <td className="px-3 py-2 text-slate-700">
                      {row.name}
                      {row.alreadyReceived > 0 && (
                        <span className="block text-[10px] text-slate-400 mt-0.5">
                          {row.remaining === 0
                            ? "Fully received"
                            : `${row.alreadyReceived} of ${row.orderedQty} already received`}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-slate-500 tabular-nums">{row.orderedQty}</td>
                    <td className="px-3 py-2">
                      {row.remaining === 0 ? (
                        <span className="text-[11px] text-emerald-600 font-medium">Complete</span>
                      ) : (
                        <input
                          className={`${inputClass} py-1.5 w-full`}
                          type="number"
                          min="0"
                          max={row.remaining}
                          value={row.receivedQty}
                          onChange={(e) => updateQty(idx, e.target.value)}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Auto-derived outcome */}
          <div
            className={`text-[12px] px-3 py-2 rounded-md border ${
              willBeFullyReceived
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : "bg-blue-50 text-blue-700 border-blue-100"
            }`}
          >
            This order will be marked{" "}
            <span className="font-semibold">{willBeFullyReceived ? "Received" : "Partial"}</span>{" "}
            based on the quantities entered.
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[13px] text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-md transition"
          >
            <PackageCheck className="w-4 h-4" />
            {saving ? "Updating…" : "Confirm Receipt"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
