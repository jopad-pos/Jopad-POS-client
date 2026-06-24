"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import { Invoice, ModalOverlay } from "./shared";

interface Props {
  invoice: Invoice;
  onClose: () => void;
  onDeleted: (id: string) => void;
}

export default function DeleteConfirm({ invoice, onClose, onDeleted }: Props) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      await apiRequest(`/api/invoices/${invoice._id}`, { method: "DELETE" });
      onDeleted(invoice._id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete invoice");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-[14px] font-semibold text-slate-900">Delete Invoice</h2>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-3">
          {error && (
            <p className="text-[12px] text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>
          )}
          <p className="text-[13px] text-slate-700">
            Delete <span className="font-semibold font-mono">{invoice.ref}</span> for{" "}
            <span className="font-semibold">{invoice.customer}</span>? This cannot be undone.
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100">
          <button onClick={onClose} className="px-3.5 py-1.5 text-[12px] text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition">
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-1.5 text-[12px] font-medium bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-md transition"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
