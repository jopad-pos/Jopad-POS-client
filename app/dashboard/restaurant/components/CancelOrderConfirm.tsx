"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import type { Order } from "./types";

interface Props {
  order: Order;
  onClose: () => void;
  onCancelled: (order: Order) => void;
}

export default function CancelOrderConfirm({ order, onClose, onCancelled }: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleCancel() {
    setSaving(true);
    setError("");
    try {
      const updated = await apiRequest<Order>(`/api/orders/${order._id}/cancel`, { method: "POST" });
      onCancelled(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to cancel the tab");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <h2 className="text-slate-900 text-base font-semibold">Void this tab?</h2>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Table {order.tableLabel}&rsquo;s tab ({order.ref}) will be voided and the table freed. No
          charge will be recorded — this is different from billing the guest.
        </p>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-md px-3 py-2 mb-3">
            {error}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md"
          >
            Keep tab
          </button>
          <button
            onClick={handleCancel}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-60"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Void tab
          </button>
        </div>
      </div>
    </div>
  );
}
