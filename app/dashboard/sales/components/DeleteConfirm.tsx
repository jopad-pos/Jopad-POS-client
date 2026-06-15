"use client";

import { useState } from "react";
import { apiRequest, ApiError } from "@/lib/api";
import { Sale } from "./types";
import { ModalOverlay } from "./shared";

interface Props {
  sale: Sale;
  onClose: () => void;
  onDeleted: (id: string) => void;
}

export default function DeleteConfirm({ sale, onClose, onDeleted }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setLoading(true);
    try {
      await apiRequest(`/api/sales/${sale._id}`, { method: "DELETE" });
      onDeleted(sale._id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-5">
        <h2 className="text-[15px] font-semibold text-slate-800 mb-1">Delete Sale</h2>
        <p className="text-[13px] text-slate-500 mb-4">
          Remove transaction{" "}
          <span className="font-medium text-slate-700">{sale.ref}</span> for{" "}
          <span className="font-medium text-slate-700">{sale.customer}</span>? This
          cannot be undone.
        </p>
        {error && <p className="text-[12px] text-red-600 mb-3">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 text-[13px] font-medium bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-md transition"
          >
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
