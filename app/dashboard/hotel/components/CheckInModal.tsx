"use client";

import { useState } from "react";
import { X, Loader2, BedDouble } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Booking, Room } from "./types";
import { formatMoney } from "./types";

interface CheckInModalProps {
  room: Room;
  onClose: () => void;
  onCheckedIn: (booking: Booking) => void;
}

export default function CheckInModal({ room, onClose, onCheckedIn }: CheckInModalProps) {
  const { profile } = useAuth();
  const currency = profile?.currency ?? "UGX";

  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [adults, setAdults] = useState("1");
  const [children, setChildren] = useState("0");
  const [expectedCheckOutAt, setExpectedCheckOutAt] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!guestName.trim()) {
      setError("Guest name is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const booking = await apiRequest<Booking>("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          roomId: room._id,
          guestName: guestName.trim(),
          guestPhone: guestPhone.trim(),
          guestEmail: guestEmail.trim(),
          idNumber: idNumber.trim(),
          adults: Number(adults) || 1,
          children: Number(children) || 0,
          expectedCheckOutAt: expectedCheckOutAt || null,
          notes: notes.trim(),
        }),
      });
      onCheckedIn(booking);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to check in guest");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-blue-600" />
            <h2 className="text-slate-900 text-base font-semibold">
              Check in — Room {room.number}
            </h2>
          </div>
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

          <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2.5 text-sm">
            <span className="text-slate-500">
              {room.type} · sleeps {room.capacity}
            </span>
            <span className="font-semibold text-slate-800">
              {formatMoney(room.rate, currency)} / night
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Guest name <span className="text-red-500">*</span>
            </label>
            <input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Full name"
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
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                ID / Passport
              </label>
              <input
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Email</label>
            <input
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Adults</label>
              <input
                type="number"
                min={1}
                value={adults}
                onChange={(e) => setAdults(e.target.value)}
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Children</label>
              <input
                type="number"
                min={0}
                value={children}
                onChange={(e) => setChildren(e.target.value)}
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Expected out
              </label>
              <input
                type="date"
                value={expectedCheckOutAt}
                onChange={(e) => setExpectedCheckOutAt(e.target.value)}
                className="w-full border border-slate-200 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>

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
              Check in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
