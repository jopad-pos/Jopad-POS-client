"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import type { Reservation } from "./types";

interface Props {
  reservation: Reservation;
  onClose: () => void;
  onMarked: (r: Reservation) => void;
}

export default function NoShowConfirm({ reservation, onClose, onMarked }: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    setSaving(true);
    setError("");
    try {
      const updated = await apiRequest<Reservation>(`/api/reservations/${reservation._id}/no-show`, {
        method: "POST",
      });
      onMarked(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update reservation");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <h2 className="text-slate-900 text-base font-semibold">Mark as no-show?</h2>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          {reservation.guestName} ({reservation.ref}) will be marked as a no-show.
        </p>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-md px-3 py-2 mb-3">
            {error}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-md disabled:opacity-60"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
