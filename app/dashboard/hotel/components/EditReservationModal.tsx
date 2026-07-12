"use client";

import { useState } from "react";
import { X, Loader2, CalendarClock } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Booking, Room } from "./types";
import { formatMoney, toDateInputValue } from "./types";

interface EditReservationModalProps {
  booking: Booking;
  /** Rooms available to reassign this reservation to (same branch as the page's selection). */
  rooms: Room[];
  onClose: () => void;
  onSaved: (booking: Booking) => void;
}

export default function EditReservationModal({
  booking,
  rooms,
  onClose,
  onSaved,
}: EditReservationModalProps) {
  const { profile } = useAuth();
  const currency = profile?.currency ?? "UGX";

  const [roomId, setRoomId] = useState(booking.room);
  const [guestName, setGuestName] = useState(booking.guestName);
  const [guestPhone, setGuestPhone] = useState(booking.guestPhone);
  const [guestEmail, setGuestEmail] = useState(booking.guestEmail);
  const [idNumber, setIdNumber] = useState(booking.idNumber);
  const [adults, setAdults] = useState(String(booking.adults));
  const [children, setChildren] = useState(String(booking.children));
  const [checkInDate, setCheckInDate] = useState(toDateInputValue(booking.checkInAt));
  const [expectedCheckOutAt, setExpectedCheckOutAt] = useState(
    toDateInputValue(booking.expectedCheckOutAt),
  );
  const [notes, setNotes] = useState(booking.notes);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // The room currently assigned to the reservation is always selectable even
  // if it isn't in `rooms` (e.g. a different branch filter is active).
  const roomOptions = rooms.some((r) => r._id === booking.room)
    ? rooms
    : [
        { _id: booking.room, number: booking.roomNumber, rate: booking.nightlyRate } as Room,
        ...rooms,
      ];
  const selectedRoom = roomOptions.find((r) => r._id === roomId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!guestName.trim()) {
      setError("Guest name is required");
      return;
    }
    if (!checkInDate) {
      setError("A check-in date is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const updated = await apiRequest<Booking>(`/api/bookings/${booking._id}/reservation`, {
        method: "PUT",
        body: JSON.stringify({
          roomId,
          guestName: guestName.trim(),
          guestPhone: guestPhone.trim(),
          guestEmail: guestEmail.trim(),
          idNumber: idNumber.trim(),
          adults: Number(adults) || 1,
          children: Number(children) || 0,
          checkInAt: checkInDate,
          expectedCheckOutAt: expectedCheckOutAt || null,
          notes: notes.trim(),
        }),
      });
      onSaved(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save reservation");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-violet-600" />
            <h2 className="text-slate-900 text-base font-semibold">
              Edit reservation — {booking.ref}
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

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Room</label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              {roomOptions.map((r) => (
                <option key={r._id} value={r._id}>
                  Room {r.number}
                </option>
              ))}
            </select>
            {selectedRoom && (
              <p className="text-[11px] text-slate-400 mt-1">
                {formatMoney(selectedRoom.rate, currency)} / night
              </p>
            )}
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

          <div className="grid grid-cols-2 gap-3">
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Check-in date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full border border-slate-200 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Expected check-out
              </label>
              <input
                type="date"
                value={expectedCheckOutAt}
                min={checkInDate || undefined}
                onChange={(e) => setExpectedCheckOutAt(e.target.value)}
                className="w-full border border-slate-200 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Booking details / notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Special requests, arrival time, payment terms…"
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
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-md disabled:opacity-60"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
