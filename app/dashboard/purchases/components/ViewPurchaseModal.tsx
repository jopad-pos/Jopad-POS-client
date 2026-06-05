"use client";

import { X, Pencil } from "lucide-react";
import { Purchase, purchaseStatusConfig } from "./types";
import { ModalOverlay } from "./shared";

interface Props {
  purchase: Purchase;
  onClose: () => void;
  onEdit: () => void;
}

export default function ViewPurchaseModal({ purchase, onClose, onEdit }: Props) {
  const s = purchaseStatusConfig[purchase.status];

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
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
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${s.class}`}>
                  {purchase.status}
                </span>
              </div>
            </div>
            <Row label="Date" value={purchase.date} />
          </div>
        </div>

        <div className="flex justify-end px-5 py-4 border-t border-slate-100">
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
