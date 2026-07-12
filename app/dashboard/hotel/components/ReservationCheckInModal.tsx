"use client";

import { useState } from "react";
import { X, Loader2, BedDouble } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Booking, PayMethod } from "./types";
import { formatMoney, formatDate, nightsBetween } from "./types";

interface ReservationCheckInModalProps {
  booking: Booking;
  onClose: () => void;
  onCheckedIn: (booking: Booking) => void;
}

/**
 * Converts a pending reservation into an active stay. Optionally takes payment
 * up front (bills the expected nights from now → expected check-out).
 */
export default function ReservationCheckInModal({
  booking,
  onClose,
  onCheckedIn,
}: ReservationCheckInModalProps) {
  const { profile } = useAuth();
  const currency = profile?.currency ?? "UGX";

  const [collectPayment, setCollectPayment] = useState(false);
  const [method, setMethod] = useState<PayMethod>("Cash");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const nights = booking.expectedCheckOutAt
    ? nightsBetween(new Date().toISOString(), new Date(booking.expectedCheckOutAt))
    : 1;
  const payAmount = nights * booking.nightlyRate;

  async function handleCheckIn() {
    setSaving(true);
    setError("");
    try {
      const updated = await apiRequest<Booking>(`/api/bookings/${booking._id}/check-in`, {
        method: "POST",
        body: JSON.stringify({ collectPayment, method }),
      });
      onCheckedIn(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to check in guest");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-blue-600" />
            <h2 className="text-slate-900 text-base font-semibold">Check in guest</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <div className="space-y-2 text-sm">
            <Row label="Guest" value={booking.guestName} />
            <Row label="Room" value={booking.roomNumber} />
            <Row label="Reserved for" value={formatDate(booking.checkInAt)} />
            <Row label="Expected out" value={formatDate(booking.expectedCheckOutAt)} />
            <Row label="Reference" value={booking.ref} />
          </div>

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
                    {nights} night{nights !== 1 ? "s" : ""} ×{" "}
                    {formatMoney(booking.nightlyRate, currency)}
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
              </>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCheckIn}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-60"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirm check in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}
