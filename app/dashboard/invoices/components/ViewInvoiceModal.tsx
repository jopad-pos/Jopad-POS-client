"use client";

import { useEffect, useState } from "react";
import { X, FileText, Download } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Invoice, InvoiceStatus, ModalOverlay, statusConfig, fmtDate } from "./shared";
import { printInvoice } from "./printInvoice";

interface Props {
  invoice: Invoice;
  onClose: () => void;
  onEdit: (inv: Invoice) => void;
}

export default function ViewInvoiceModal({ invoice, onClose, onEdit }: Props) {
  const { profile } = useAuth();
  const [full, setFull] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<Invoice>(`/api/invoices/${invoice._id}`)
      .then(setFull)
      .finally(() => setLoading(false));
  }, [invoice._id]);

  const data = full ?? invoice;
  const lineItems = full?.lineItems ?? [];

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <span className="text-[14px] font-semibold text-slate-900 font-mono">{data.ref}</span>
            <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${statusConfig[data.status as InvoiceStatus]}`}>
              {data.status}
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Customer</p>
              <p className="text-[13px] text-slate-800 mt-0.5">{data.customer || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Issue Date</p>
              <p className="text-[13px] text-slate-800 mt-0.5">{fmtDate(data.issueDate)}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Due Date</p>
              <p className={`text-[13px] mt-0.5 ${data.status === "Overdue" ? "text-red-600 font-medium" : "text-slate-800"}`}>
                {fmtDate(data.dueDate)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Total Amount</p>
              <p className="text-[13px] font-bold text-slate-900 tabular-nums mt-0.5">
                UGX {data.amount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Line Items */}
          {loading ? (
            <div className="py-4 text-center text-[12px] text-slate-400">Loading…</div>
          ) : lineItems.length > 0 ? (
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Line Items</p>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-400 uppercase">Description</th>
                      <th className="px-3 py-2 text-right text-[10px] font-semibold text-slate-400 uppercase">Qty</th>
                      <th className="px-3 py-2 text-right text-[10px] font-semibold text-slate-400 uppercase">Unit Price</th>
                      <th className="px-3 py-2 text-right text-[10px] font-semibold text-slate-400 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lineItems.map((li, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 text-[12px] text-slate-700">{li.name}</td>
                        <td className="px-3 py-2 text-[12px] text-slate-600 text-right tabular-nums">{li.qty}</td>
                        <td className="px-3 py-2 text-[12px] text-slate-600 text-right tabular-nums">{li.unitPrice.toLocaleString()}</td>
                        <td className="px-3 py-2 text-[12px] font-medium text-slate-800 text-right tabular-nums">
                          {(li.qty * li.unitPrice).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-slate-200 bg-slate-50">
                      <td colSpan={3} className="px-3 py-2 text-right text-[11px] font-semibold text-slate-500">TOTAL</td>
                      <td className="px-3 py-2 text-right text-[13px] font-bold text-slate-900 tabular-nums">
                        UGX {data.amount.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : null}

          {data.notes && (
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Notes</p>
              <p className="text-[12px] text-slate-600 whitespace-pre-wrap">{data.notes}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 shrink-0">
          <button
            onClick={() => printInvoice(full ?? invoice, profile)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </button>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-3.5 py-1.5 text-[12px] text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition">
              Close
            </button>
            <button
              onClick={() => { onClose(); onEdit(data); }}
              className="px-4 py-1.5 text-[12px] font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
}
