"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import { Invoice, PaymentMethod, ModalOverlay, FormField, inputClass } from "./shared";

interface Props {
  invoice: Invoice;
  onClose: () => void;
  onPaid: (inv: Invoice) => void;
}

export default function MarkPaidModal({ invoice, onClose, onPaid }: Props) {
  const [method, setMethod] = useState<PaymentMethod>("Cash");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    setSaving(true);
    setError("");
    try {
      const updated = await apiRequest<Invoice>(`/api/invoices/${invoice._id}/pay`, {
        method: "POST",
        body: JSON.stringify({ method }),
      });
      onPaid(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to mark invoice as paid");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-[14px] font-semibold text-slate-900">Mark as Paid</h2>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-3">
          {error && (
            <p className="text-[12px] text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>
          )}
          <p className="text-[13px] text-slate-700">
            Mark <span className="font-semibold font-mono">{invoice.ref}</span> for{" "}
            <span className="font-semibold">{invoice.customer}</span> as paid. This will record a{" "}
            <span className="font-semibold">UGX {invoice.amount.toLocaleString()}</span> sale so it
            shows up in sales, reports, and cash flow.
          </p>
          <FormField label="Payment Method" required>
            <select
              className={inputClass}
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
            >
              <option>Cash</option>
              <option>Mobile Money</option>
              <option>Card</option>
              <option>Credit</option>
            </select>
          </FormField>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100">
          <button onClick={onClose} className="px-3.5 py-1.5 text-[12px] text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={saving}
            className="px-4 py-1.5 text-[12px] font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-md transition"
          >
            {saving ? "Marking Paid…" : "Mark as Paid"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
