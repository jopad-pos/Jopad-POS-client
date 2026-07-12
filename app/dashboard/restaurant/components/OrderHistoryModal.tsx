"use client";

import { X } from "lucide-react";
import type { Order } from "./types";
import { ORDER_STATUS_STYLES, PAYMENT_METHOD_STYLES, formatDateTime, formatMoney, lineItemTotal, orderTotal } from "./types";

interface Props {
  order: Order;
  onClose: () => void;
}

export default function OrderHistoryModal({ order, onClose }: Props) {
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
            <span
              className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded border capitalize ${
                order.status === "cancelled" ? ORDER_STATUS_STYLES.cancelled : ORDER_STATUS_STYLES.closed
              }`}
            >
              {order.status}
            </span>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-0">
          <div className="grid grid-cols-2 gap-3 text-[12px]">
            <Row label="Closed at" value={formatDateTime(order.closedAt)} />
            <Row label="Cashier" value={order.cashier || "—"} />
            <Row
              label="Payment method"
              value={
                order.paymentMethod ? (
                  <span
                    className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded ${PAYMENT_METHOD_STYLES[order.paymentMethod]}`}
                  >
                    {order.paymentMethod}
                  </span>
                ) : (
                  "—"
                )
              }
            />
            <Row label="Notes" value={order.notes || "—"} />
          </div>

          {order.lineItems.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">This tab had no items.</p>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg">
              {order.lineItems.map((li) => (
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
                  <span className="text-[12px] font-medium text-slate-700 tabular-nums whitespace-nowrap">
                    {formatMoney(lineItemTotal(li))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-slate-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-800">Total</span>
            <span className="text-lg font-semibold text-slate-900 tabular-nums">
              {formatMoney(orderTotal(order))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between bg-slate-50 rounded-md px-3 py-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}
