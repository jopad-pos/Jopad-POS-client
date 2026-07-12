"use client";

import { X, Pencil, PackageCheck } from "lucide-react";
import { Purchase, purchaseStatusConfig } from "./types";
import { ModalOverlay } from "./shared";

interface Props {
  purchase: Purchase;
  onClose: () => void;
  onEdit: () => void;
  onReceive: () => void;
}

export default function ViewPurchaseModal({ purchase, onClose, onEdit, onReceive }: Props) {
  const s = purchaseStatusConfig[purchase.status];
  const hasLineItems = (purchase.lineItems?.length ?? 0) > 0;
  const canReceive = hasLineItems && purchase.status !== "Received";

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-[15px] font-semibold text-slate-800">Purchase Order</h2>
            <p className="text-[12px] text-slate-400 font-mono mt-0.5">{purchase.ref}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onEdit}
              className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              title="Edit"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <Row label="Supplier" value={purchase.supplier} />

          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
              Description
            </p>
            <p className="text-[13px] text-slate-700 leading-relaxed">{purchase.description || "—"}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Row label="Items" value={String(purchase.items)} />
            <Row
              label="Amount"
              value={`UGX ${purchase.amount.toLocaleString()}`}
              valueClass="font-semibold text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
                Status
              </p>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${s.class}`}>
                  {purchase.status}
                </span>
                {purchase.stockUpdated && (
                  <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-emerald-50 text-emerald-700 flex items-center gap-1">
                    <PackageCheck className="w-3 h-3" />
                    Stock Updated
                  </span>
                )}
                {purchase.status === "Partial" && (
                  <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-blue-50 text-blue-700">
                    Remainder pending
                  </span>
                )}
              </div>
            </div>
            <Row label="Date" value={purchase.date} />
          </div>

          {/* Line Items */}
          {hasLineItems && (
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
                Line Items
              </p>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Product</th>
                      <th className="text-left px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wide w-16">Qty</th>
                      <th className="text-left px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wide w-20">Received</th>
                      <th className="text-left px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wide w-24">Buy Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {purchase.lineItems!.map((li, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 text-slate-700">{li.name}</td>
                        <td className="px-3 py-2 text-slate-700 tabular-nums">{li.qty}</td>
                        <td className="px-3 py-2 tabular-nums">
                          {li.productId ? (
                            <span
                              className={
                                (li.receivedQty || 0) >= li.qty
                                  ? "text-emerald-600 font-medium"
                                  : (li.receivedQty || 0) > 0
                                  ? "text-blue-600 font-medium"
                                  : "text-slate-400"
                              }
                            >
                              {li.receivedQty || 0} / {li.qty}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-slate-700 tabular-nums">
                          {li.buyPrice > 0 ? `UGX ${li.buyPrice.toLocaleString()}` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
          <div>
            {canReceive && (
              <button
                onClick={onReceive}
                className="flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition"
              >
                <PackageCheck className="w-4 h-4" />
                {purchase.status === "Partial" ? "Receive Remaining" : "Receive Stock"}
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

function Row({
  label,
  value,
  valueClass = "text-slate-700",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className={`text-[13px] ${valueClass}`}>{value || "—"}</p>
    </div>
  );
}
