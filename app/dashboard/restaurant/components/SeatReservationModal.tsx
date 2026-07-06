"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import type { Reservation, RestaurantTable } from "./types";

interface Props {
  reservation: Reservation;
  tables: RestaurantTable[];
  onClose: () => void;
  onSeated: (r: Reservation) => void;
}

export default function SeatReservationModal({ reservation, tables, onClose, onSeated }: Props) {
  const seatable = tables.filter((t) => t.status !== "occupied");
  const [tableId, setTableId] = useState(seatable[0]?._id ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tableId) {
      setError("Select a table");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const updated = await apiRequest<Reservation>(`/api/reservations/${reservation._id}/seat`, {
        method: "POST",
        body: JSON.stringify({ tableId }),
      });
      onSeated(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to seat guest");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-slate-900 text-base font-semibold">Seat {reservation.guestName}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-md px-3 py-2">
              {error}
            </div>
          )}

          {seatable.length === 0 ? (
            <p className="text-sm text-slate-400">No free tables right now.</p>
          ) : (
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Table</label>
              <select
                value={tableId}
                onChange={(e) => setTableId(e.target.value)}
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                {seatable.map((t) => (
                  <option key={t._id} value={t._id}>
                    Table {t.label} · seats {t.capacity}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || seatable.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-60"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Seat guest
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
