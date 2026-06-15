"use client";

import { useEffect, useState } from "react";
import { X, ShoppingCart } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { Sale, SaleLineItem, methodStyles } from "./types";
import { ModalOverlay } from "./shared";

interface Props {
  sale: Sale;
  onClose: () => void;
}

const DATE_FMT: Intl.DateTimeFormatOptions = {
  weekday: "short",
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
};

export default function ViewSaleModal({ sale, onClose, onEdit }: Props) {
  const [lineItems, setLineItems] = useState<SaleLineItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);

  useEffect(() => {
    apiRequest<Sale>(`/api/sales/${sale._id}`)
      .then((full) => setLineItems(full.lineItems ?? []))
      .catch(() => {})
      .finally(() => setItemsLoading(false));
  }, [sale._id]);

  const formatted = new Date(sale.date).toLocaleString("en-UG", DATE_FMT);
  const subtotal = lineItems.reduce((s, li) => s + li.qty * li.unitPrice, 0);

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-slate-800 leading-none">
                {sale.ref}
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">{formatted}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {/* Transaction meta */}
          <div className="space-y-0">
            <MetaRow label="Customer" value={sale.customer} />
            <MetaRow label="Cashier"  value={sale.cashier || "—"} />
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                Payment
              </span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded font-medium ${methodStyles[sale.method]}`}
              >
                {sale.method}
              </span>
            </div>
          </div>

          {/* Line items */}
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Items Purchased
            </p>

            {itemsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-3 bg-slate-100 rounded animate-pulse w-32" />
                    <div className="h-3 bg-slate-100 rounded animate-pulse w-16" />
                  </div>
                ))}
              </div>
            ) : lineItems.length === 0 ? (
              <p className="text-[12px] text-slate-400 italic">No item details recorded.</p>
            ) : (
              <div className="rounded-lg border border-slate-100 overflow-hidden">
                <div className="max-h-52 overflow-y-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 z-10 bg-slate-50">
                      <tr className="border-b border-slate-100">
                        <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-3 py-2 text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider w-12">
                          Qty
                        </th>
                        <th className="px-3 py-2 text-right text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          Unit Price
                        </th>
                        <th className="px-3 py-2 text-right text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {lineItems.map((li, i) => (
                        <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-3 py-2.5">
                            <span className="text-[12px] text-slate-700">{li.name}</span>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className="text-[12px] text-slate-500 tabular-nums">
                              {li.qty}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <span className="text-[12px] text-slate-500 tabular-nums whitespace-nowrap">
                              {li.unitPrice.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <span className="text-[12px] font-medium text-slate-700 tabular-nums whitespace-nowrap">
                              {(li.qty * li.unitPrice).toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Subtotal / total rows */}
                <div className="border-t border-slate-200 bg-slate-50 px-3 py-2 space-y-1">
                  {subtotal !== sale.amount && (
                    <div className="flex justify-between text-[12px] text-slate-400">
                      <span>Subtotal</span>
                      <span className="tabular-nums">UGX {subtotal.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[13px] font-semibold text-slate-700">Total</span>
                    <span className="text-[14px] font-bold text-slate-900 tabular-nums">
                      UGX {sale.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-5 py-4 border-t border-slate-100 shrink-0">
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

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50">
      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-[13px] text-slate-700">{value}</span>
    </div>
  );
}
