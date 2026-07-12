"use client";

import { useState } from "react";
import { X, Plus, Trash2, ArrowRight, Receipt, Printer } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { MenuItem, Order } from "./types";
import {
  KITCHEN_NEXT_STATUS,
  KITCHEN_STATUS_STYLES,
  formatDateTime,
  formatMoney,
  lineItemTotal,
  orderTotal,
} from "./types";
import AddOrderItemModal from "./AddOrderItemModal";
import CloseOrderModal from "./CloseOrderModal";
import CancelOrderConfirm from "./CancelOrderConfirm";
import { printOrderBill } from "./printOrderBill";

interface Props {
  order: Order;
  menuItems: MenuItem[];
  onClose: () => void;
  onUpdated: (order: Order) => void;
  onClosed: (order: Order) => void;
  onCancelled: (order: Order) => void;
}

export default function OrderTabView({ order, menuItems, onClose, onUpdated, onClosed, onCancelled }: Props) {
  const { profile } = useAuth();
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function bumpItem(itemId: string, nextStatus: string) {
    setBusyItemId(itemId);
    setError("");
    try {
      const updated = await apiRequest<Order>(`/api/orders/${order._id}/items/${itemId}`, {
        method: "PATCH",
        body: JSON.stringify({ kitchenStatus: nextStatus }),
      });
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update item");
    } finally {
      setBusyItemId(null);
    }
  }

  async function removeItem(itemId: string) {
    setBusyItemId(itemId);
    setError("");
    try {
      const updated = await apiRequest<Order>(`/api/orders/${order._id}/items/${itemId}`, {
        method: "DELETE",
      });
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to remove item");
    } finally {
      setBusyItemId(null);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-slate-900 text-base font-semibold">Table {order.tableLabel}</h2>
            <p className="text-[11px] text-slate-400">
              {order.ref} · party of {order.partySize} · opened {formatDateTime(order.openedAt)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => printOrderBill(order, profile)}
              disabled={order.lineItems.length === 0}
              title="Print an unpaid bill the guest can review before paying"
              className="flex items-center gap-1.5 text-[12px] font-medium text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Printer className="w-4 h-4" />
              Print bill
            </button>
            <button
              onClick={onClose}
              title="Back to tables — this only hides the panel, the tab stays open"
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-0">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <button
            onClick={() => setAddItemOpen(true)}
            className="flex items-center justify-center gap-1.5 w-full border border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 text-[13px] font-medium px-3 py-2.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add item to this tab
          </button>

          {order.lineItems.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No items on this tab yet.</p>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg">
              {order.lineItems.map((li) => {
                const next = li.kitchenStatus !== "served" ? KITCHEN_NEXT_STATUS[li.kitchenStatus] : null;
                const busy = busyItemId === li._id;
                return (
                  <div key={li._id} className="px-3 py-2.5 flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-slate-800">
                        {li.qty} × {li.name}
                      </p>
                      {li.modifiers.length > 0 && (
                        <p className="text-[11px] text-slate-400 truncate">
                          {li.modifiers.map((m) => m.name).join(", ")}
                        </p>
                      )}
                      {li.notes && <p className="text-[11px] text-slate-400 italic">{li.notes}</p>}
                    </div>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded border whitespace-nowrap ${KITCHEN_STATUS_STYLES[li.kitchenStatus]}`}
                    >
                      {li.kitchenStatus}
                    </span>
                    <span className="text-[12px] font-medium text-slate-700 tabular-nums whitespace-nowrap w-20 text-right">
                      {formatMoney(lineItemTotal(li))}
                    </span>
                    <div className="flex items-center gap-1">
                      {next && (
                        <button
                          onClick={() => bumpItem(li._id, next)}
                          disabled={busy}
                          title={`Mark ${next}`}
                          className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-40"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {li.kitchenStatus === "pending" && (
                        <button
                          onClick={() => removeItem(li._id)}
                          disabled={busy}
                          title="Remove item"
                          className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-slate-100 flex-shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-800">Total</span>
            <span className="text-lg font-semibold text-slate-900 tabular-nums">
              {formatMoney(orderTotal(order))}
            </span>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setCancelOpen(true)}
              title="Void this tab with no charge and free the table"
              className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
            >
              Void tab
            </button>
            <button
              onClick={() => setCloseOpen(true)}
              disabled={order.lineItems.length === 0}
              title="Take payment and free the table — this is not the same as the X above"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-60"
            >
              <Receipt className="w-4 h-4" />
              Bill &amp; close tab
            </button>
          </div>
        </div>
      </div>

      {addItemOpen && (
        <AddOrderItemModal
          order={order}
          menuItems={menuItems}
          onClose={() => setAddItemOpen(false)}
          onAdded={(updated) => {
            onUpdated(updated);
            setAddItemOpen(false);
          }}
        />
      )}
      {closeOpen && (
        <CloseOrderModal
          order={order}
          onClose={() => setCloseOpen(false)}
          onClosed={(updated) => {
            onClosed(updated);
            setCloseOpen(false);
          }}
        />
      )}
      {cancelOpen && (
        <CancelOrderConfirm
          order={order}
          onClose={() => setCancelOpen(false)}
          onCancelled={(updated) => {
            onCancelled(updated);
            setCancelOpen(false);
          }}
        />
      )}
    </div>
  );
}
