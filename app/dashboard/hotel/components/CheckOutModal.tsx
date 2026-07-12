"use client";

import { useState } from "react";
import { X, Loader2, LogOut } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Booking, PayMethod } from "./types";
import { formatMoney, formatDateTime, nightsBetween } from "./types";

interface CheckOutModalProps {
  booking: Booking;
  onClose: () => void;
  onCheckedOut: (booking: Booking) => void;
}

export default function CheckOutModal({ booking, onClose, onCheckedOut }: CheckOutModalProps) {
  const { profile } = useAuth();
  const currency = profile?.currency ?? "UGX";

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [method, setMethod] = useState<PayMethod>("Cash");

  const alreadyPaid = booking.paymentStatus === "paid";
  const nights = alreadyPaid ? booking.nights : nightsBetween(booking.checkInAt);
  const total = alreadyPaid ? booking.totalCharge : nights * booking.nightlyRate;

  async function handleCheckout() {
    setSaving(true);
    setError("");
    try {
      const updated = await apiRequest<Booking>(`/api/bookings/${booking._id}/checkout`, {
        method: "POST",
        body: JSON.stringify({ method }),
      });
      onCheckedOut(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to check out");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <LogOut className="w-5 h-5 text-blue-600" />
            <h2 className="text-slate-900 text-base font-semibold">Check out</h2>
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
            <Row label="Checked in" value={formatDateTime(booking.checkInAt)} />
            <Row label="Reference" value={booking.ref} />
          </div>

          <div className="bg-slate-50 rounded-lg px-4 py-3 space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>
                {formatMoney(booking.nightlyRate, currency)} × {nights} night
                {nights !== 1 ? "s" : ""}
              </span>
              <span>{formatMoney(total, currency)}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="text-sm font-semibold text-slate-800">
                {alreadyPaid ? "Total paid" : "Total due"}
              </span>
              <span className="text-lg font-semibold text-slate-900 tabular-nums">
                {formatMoney(total, currency)}
              </span>
            </div>
          </div>

          {alreadyPaid ? (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2 text-sm">
              <span className="font-medium text-emerald-700">Paid at check-in</span>
              <span className="text-emerald-700">{booking.paymentMethod}</span>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
              <select
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                value={method}
                onChange={(e) => setMethod(e.target.value as PayMethod)}
              >
                <option>Cash</option>
                <option>Mobile Money</option>
                <option>Card</option>
                <option>Credit</option>
              </select>
            </div>
          )}

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
              onClick={handleCheckout}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-60"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirm check out
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
