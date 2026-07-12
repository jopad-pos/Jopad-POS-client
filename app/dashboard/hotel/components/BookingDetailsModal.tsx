"use client";

import { X, BedDouble } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { Booking } from "./types";
import {
  BOOKING_STATUS_STYLES,
  BOOKING_STATUS_LABEL,
  formatMoney,
  formatDate,
  formatDateTime,
} from "./types";

interface BookingDetailsModalProps {
  booking: Booking;
  onClose: () => void;
}

export default function BookingDetailsModal({ booking, onClose }: BookingDetailsModalProps) {
  const { profile } = useAuth();
  const currency = profile?.currency ?? "UGX";
  const isReserved = booking.status === "reserved";

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-blue-600" />
            <h2 className="text-slate-900 text-base font-semibold">
              Booking {booking.ref}
            </h2>
            <span
              className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded border ${BOOKING_STATUS_STYLES[booking.status]}`}
            >
              {BOOKING_STATUS_LABEL[booking.status]}
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          <Section title="Guest">
            <Field label="Name" value={booking.guestName} />
            <Field label="Phone" value={booking.guestPhone || "—"} />
            <Field label="Email" value={booking.guestEmail || "—"} />
            <Field label="ID / Passport" value={booking.idNumber || "—"} />
            <Field label="Guests" value={`${booking.adults} adult${booking.adults !== 1 ? "s" : ""}, ${booking.children} child${booking.children !== 1 ? "ren" : ""}`} />
          </Section>

          <Section title="Stay">
            <Field label="Room" value={booking.roomNumber} />
            <Field
              label={isReserved ? "Reserved for" : "Checked in"}
              value={isReserved ? formatDate(booking.checkInAt) : formatDateTime(booking.checkInAt)}
            />
            <Field label="Expected check-out" value={formatDate(booking.expectedCheckOutAt)} />
            <Field label="Checked out" value={formatDateTime(booking.checkOutAt)} />
            {booking.nights > 0 && (
              <Field label="Nights" value={String(booking.nights)} />
            )}
          </Section>

          <Section title="Billing">
            <Field label="Nightly rate" value={formatMoney(booking.nightlyRate, currency)} />
            <Field
              label="Payment"
              value={
                booking.paymentStatus === "paid"
                  ? `Paid${booking.paymentMethod ? ` · ${booking.paymentMethod}` : ""}`
                  : "Unpaid"
              }
              highlight={booking.paymentStatus === "paid" ? "green" : "amber"}
            />
            {booking.paidAt && (
              <Field label="Paid at" value={formatDateTime(booking.paidAt)} />
            )}
            {booking.totalCharge > 0 && (
              <Field label="Total charge" value={formatMoney(booking.totalCharge, currency)} />
            )}
          </Section>

          {booking.notes && (
            <Section title="Details / notes">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{booking.notes}</p>
            </Section>
          )}
        </div>

        <div className="flex justify-end px-5 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
        {title}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "green" | "amber";
}) {
  const valueClass =
    highlight === "green"
      ? "text-emerald-700"
      : highlight === "amber"
        ? "text-amber-700"
        : "text-slate-800";
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className={`font-medium text-right ${valueClass}`}>{value}</span>
    </div>
  );
}
