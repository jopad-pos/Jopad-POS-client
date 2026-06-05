"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import { ModalOverlay } from "./shared";

interface Props {
  label: string;
  endpoint: string;
  id: string;
  onClose: () => void;
  onDeleted: (id: string) => void;
}

export default function DeleteConfirm({ label, endpoint, id, onClose, onDeleted }: Props) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      await apiRequest(endpoint, { method: "DELETE" });
      onDeleted(id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete failed");
      setDeleting(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4">
        <div className="p-5">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <h2 className="text-[14px] font-semibold text-slate-800">Delete {label}?</h2>
              <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">
                This action cannot be undone.
              </p>
            </div>
          </div>
          {error && (
            <p className="mt-3 text-[12px] text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
              {error}
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2 px-5 pb-4">
          <button
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 text-[13px] text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 text-[13px] font-medium bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-md transition"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
