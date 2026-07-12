"use client";

import { X, ArrowRight } from "lucide-react";
import { ModalOverlay } from "../../stock/components/shared";
import { StockTransfer, branchName, totalQty } from "./types";

interface Props {
  transfer: StockTransfer;
  onClose: () => void;
}

export default function ViewTransferModal({ transfer, onClose }: Props) {
  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-[15px] font-semibold text-slate-800">{transfer.ref}</h2>
            <p className="text-[12px] text-slate-400 mt-0.5 flex items-center gap-1.5">
              {branchName(transfer.fromBranchId)}
              <ArrowRight className="w-3 h-3" />
              {branchName(transfer.toBranchId)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                    Product
                  </th>
                  <th className="text-left px-2 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wide w-20">
                    Qty
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transfer.items.map((li, idx) => (
                  <tr key={idx}>
                    <td className="px-3 py-1.5 text-slate-700">
                      {li.name}
                      {li.sku && <span className="text-slate-400 font-mono"> · {li.sku}</span>}
                    </td>
                    <td className="px-2 py-1.5 text-slate-600 tabular-nums">
                      {li.qty} {li.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t border-slate-200">
                  <td className="px-3 py-2 text-[11px] font-semibold text-slate-500 text-right uppercase tracking-wide">
                    Total
                  </td>
                  <td className="px-2 py-2 text-[12px] font-semibold text-slate-800 tabular-nums">
                    {totalQty(transfer)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {transfer.note && (
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Note</p>
              <p className="text-[13px] text-slate-600">{transfer.note}</p>
            </div>
          )}

          <p className="text-[11px] text-slate-400">
            {new Date(transfer.createdAt).toLocaleString()}
            {transfer.createdBy ? ` · ${transfer.createdBy.name}` : transfer.createdByName ? ` · ${transfer.createdByName}` : ""}
          </p>
        </div>
      </div>
    </ModalOverlay>
  );
}
