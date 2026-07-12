"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import { useBranch } from "@/contexts/BranchContext";
import type { Reservation, ReservationType } from "./types";

interface Props {
  reservation: Reservation | null;
  onClose: () => void;
  onSaved: (r: Reservation) => void;
}

function toLocalInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function ReservationModal({ reservation, onClose, onSaved }: Props) {
  const isEdit = !!reservation;
  const { selectedBranchId } = useBranch();

  const [type, setType] = useState<ReservationType>(reservation?.type ?? "reservation");
  const [guestName, setGuestName] = useState(reservation?.guestName ?? "");
  const [guestPhone, setGuestPhone] = useState(reservation?.guestPhone ?? "");
  const [partySize, setPartySize] = useState(reservation ? String(reservation.partySize) : "2");
  const [reservedFor, setReservedFor] = useState(toLocalInputValue(reservation?.reservedFor ?? null));
  const [notes, setNotes] = useState(reservation?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!guestName.trim()) {
      setError("Guest name is required");
      return;
    }
    if (type === "reservation" && !reservedFor) {
      setError("A reservation date/time is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      let saved: Reservation;
      if (isEdit) {
        saved = await apiRequest<Reservation>(`/api/reservations/${reservation!._id}`, {
          method: "PUT",
          body: JSON.stringify({
            guestName: guestName.trim(),
            guestPhone: guestPhone.trim(),
            partySize: Number(partySize) || 1,
            reservedFor: type === "reservation" ? reservedFor : null,
            notes: notes.trim(),
          }),
        });
      } else {
        saved = await apiRequest<Reservation>("/api/reservations", {
          method: "POST",
          body: JSON.stringify({
            type,
            guestName: guestName.trim(),
            guestPhone: guestPhone.trim(),
            partySize: Number(partySize) || 1,
            reservedFor: type === "reservation" ? reservedFor : undefined,
            notes: notes.trim(),
            branchId: selectedBranchId || undefined,
          }),
        });
      }
      onSaved(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save reservation");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-slate-900 text-base font-semibold">
            {isEdit ? "Edit Reservation" : "New Reservation / Waitlist"}
          </h2>
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

          {!isEdit && (
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
              {(["reservation", "waitlist"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`text-[12px] font-medium px-3.5 py-1.5 rounded-md transition-colors ${
                    type === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {t === "reservation" ? "Reservation" : "Walk-in waitlist"}
                </button>
              ))}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Guest name <span className="text-red-500">*</span>
            </label>
            <input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Phone</label>
              <input
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Party size</label>
              <input
                type="number"
                min={1}
                value={partySize}
                onChange={(e) => setPartySize(e.target.value)}
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>

          {type === "reservation" && (
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Date &amp; time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={reservedFor}
                onChange={(e) => setReservedFor(e.target.value)}
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
            />
          </div>

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
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-60"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? "Save changes" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
