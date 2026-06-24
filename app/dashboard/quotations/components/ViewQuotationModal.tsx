"use client";

import { useEffect, useState } from "react";
import { X, ClipboardList, Download, ArrowRight } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Quotation, QuotationStatus, ModalOverlay, statusConfig, fmtDate } from "./shared";
import { printQuotation } from "./printQuotation";

interface ConvertResult {
  invoice: { ref: string };
  quotation: Quotation;
}

interface Props {
  quotation: Quotation;
  onClose: () => void;
  onEdit: (q: Quotation) => void;
  onConverted?: (updatedQuotation: Quotation) => void;
}

export default function ViewQuotationModal({ quotation, onClose, onEdit, onConverted }: Props) {
  const { profile } = useAuth();
  const [full, setFull] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [convertError, setConvertError] = useState("");
  const [convertedRef, setConvertedRef] = useState("");

  useEffect(() => {
    apiRequest<Quotation>(`/api/quotations/${quotation._id}`)
      .then(setFull)
      .finally(() => setLoading(false));
  }, [quotation._id]);

  const data = full ?? quotation;
  const lineItems = full?.lineItems ?? [];

  async function handleConvertToInvoice() {
    setConverting(true);
    setConvertError("");
    try {
      const result = await apiRequest<ConvertResult>(
        `/api/quotations/${quotation._id}/convert`,
        { method: "POST" }
      );
      setConvertedRef(result.invoice.ref);
      onConverted?.(result.quotation);
    } catch (err) {
      setConvertError(err instanceof ApiError ? err.message : "Failed to convert to invoice");
    } finally {
      setConverting(false);
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-slate-400" />
            <span className="text-[14px] font-semibold text-slate-900 font-mono">{data.ref}</span>
            <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${statusConfig[data.status as QuotationStatus]}`}>
              {data.status}
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1">
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
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Valid Until</p>
              <p className={`text-[13px] mt-0.5 ${data.status === "Expired" ? "text-amber-600 font-medium" : "text-slate-800"}`}>
                {fmtDate(data.validUntil)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Total Amount</p>
              <p className="text-[13px] font-bold text-slate-900 tabular-nums mt-0.5">
                UGX {data.amount.toLocaleString()}
              </p>
            </div>
          </div>

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

          {/* Convert to Invoice */}
          {!convertedRef && (
            <div className="border border-slate-100 rounded-lg px-4 py-3 bg-slate-50">
              <p className="text-[11px] font-semibold text-slate-500 mb-1.5">Convert to Invoice</p>
              {convertError && (
                <p className="text-[11px] text-red-600 mb-2">{convertError}</p>
              )}
              <button
                onClick={handleConvertToInvoice}
                disabled={converting || loading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white rounded-md transition"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                {converting ? "Creating invoice…" : "Create Invoice from this Quotation"}
              </button>
            </div>
          )}

          {convertedRef && (
            <div className="border border-emerald-200 rounded-lg px-4 py-3 bg-emerald-50">
              <p className="text-[12px] text-emerald-700 font-medium">
                Invoice <span className="font-mono font-bold">{convertedRef}</span> created successfully.
              </p>
              <p className="text-[11px] text-emerald-600 mt-0.5">Find it in the Invoices section.</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 shrink-0">
          <button
            onClick={() => printQuotation(full ?? quotation, profile)}
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
