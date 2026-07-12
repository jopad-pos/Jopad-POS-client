"use client";

import { useMemo, useState } from "react";
import { X, Loader2, BedDouble, CalendarClock } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Booking, PayMethod, Room } from "./types";
import { formatMoney } from "./types";

interface CheckInModalProps {
  room: Room;
  /** Which flow to open in: an immediate check-in or a future reservation. */
  initialMode?: "checkin" | "reserve";
  onClose: () => void;
  onCheckedIn: (booking: Booking) => void;
}

/** Whole nights between two YYYY-MM-DD dates, min 1 — mirrors the server rule. */
function expectedNights(fromISO: string | null, toISO: string): number {
  if (!toISO) return 1;
  const from = fromISO ? new Date(fromISO) : new Date();
  const to = new Date(toISO);
  const nights = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, nights);
}

export default function CheckInModal({
  room,
  initialMode = "checkin",
  onClose,
  onCheckedIn,
}: CheckInModalProps) {
  const { profile } = useAuth();
  const currency = profile?.currency ?? "UGX";

  const [mode, setMode] = useState<"checkin" | "reserve">(initialMode);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [adults, setAdults] = useState("1");
  const [children, setChildren] = useState("0");
  const [checkInDate, setCheckInDate] = useState("");
  const [expectedCheckOutAt, setExpectedCheckOutAt] = useState("");
  const [notes, setNotes] = useState("");
  const [collectPayment, setCollectPayment] = useState(false);
  const [method, setMethod] = useState<PayMethod>("Cash");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isReserve = mode === "reserve";

  const nights = useMemo(
    () => expectedNights(isReserve ? checkInDate || null : null, expectedCheckOutAt),
    [isReserve, checkInDate, expectedCheckOutAt],
  );
  const payAmount = nights * room.rate;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!guestName.trim()) {
      setError("Guest name is required");
      return;
    }
    if (isReserve && !checkInDate) {
      setError("A check-in date is required for a reservation");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const booking = await apiRequest<Booking>("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          roomId: room._id,
          mode,
          guestName: guestName.trim(),
          guestPhone: guestPhone.trim(),
          guestEmail: guestEmail.trim(),
          idNumber: idNumber.trim(),
          adults: Number(adults) || 1,
          children: Number(children) || 0,
          checkInAt: isReserve ? checkInDate : null,
          expectedCheckOutAt: expectedCheckOutAt || null,
          notes: notes.trim(),
          collectPayment: !isReserve && collectPayment,
          method,
        }),
      });
      onCheckedIn(booking);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save booking");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {isReserve ? (
              <CalendarClock className="w-5 h-5 text-violet-600" />
            ) : (
              <BedDouble className="w-5 h-5 text-blue-600" />
            )}
            <h2 className="text-slate-900 text-base font-semibold">
              {isReserve ? "Reserve" : "Check in"} — Room {room.number}
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

          {/* Mode toggle */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            {([
              { key: "checkin", label: "Check in now" },
              { key: "reserve", label: "Reserve for later" },
            ] as const).map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMode(m.key)}
                className={`flex-1 text-[12px] font-medium px-3 py-1.5 rounded-md transition-colors ${
                  mode === m.key
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

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
            {isReserve && (
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
            )}
            <div className={isReserve ? "" : "col-span-2"}>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Expected check-out
              </label>
              <input
                type="date"
                value={expectedCheckOutAt}
                min={isReserve ? checkInDate || undefined : undefined}
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

          {/* Payment — check-in only. Reservations are settled on arrival/checkout. */}
          {!isReserve && (
            <div className="border border-slate-200 rounded-lg p-3 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={collectPayment}
                  onChange={(e) => setCollectPayment(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-400"
                />
                <span className="text-sm font-medium text-slate-700">Collect payment now</span>
              </label>
              {collectPayment && (
                <>
                  <div className="flex items-center justify-between bg-slate-50 rounded-md px-3 py-2 text-sm">
                    <span className="text-slate-500">
                      {nights} night{nights !== 1 ? "s" : ""} × {formatMoney(room.rate, currency)}
                    </span>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {formatMoney(payAmount, currency)}
                    </span>
                  </div>
                  <select
                    className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    value={method}
                    onChange={(e) => setMethod(e.target.value as PayMethod)}
                  >
                    <option>Cash</option>
                    <option>Mobile Money</option>
                    <option>Card</option>
                    <option>Credit</option>
                  </select>
                  <p className="text-[11px] text-slate-400">
                    Bills the expected nights up front. If the stay runs longer, no extra is charged
                    at check-out.
                  </p>
                </>
              )}
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
              disabled={saving}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-60 ${
                isReserve ? "bg-violet-600 hover:bg-violet-700" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isReserve ? "Reserve room" : "Check in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
