"use client";

import { useEffect, useRef, useState } from "react";
import { Search, MoreHorizontal } from "lucide-react";
import { Paginator, usePagination } from "../../components/Paginator";
import type { Reservation, ReservationStatus } from "./types";
import { RESERVATION_STATUS_STYLES, formatDateTime } from "./types";

const FILTERS: { key: string; label: string }[] = [
  { key: "All", label: "All" },
  { key: "booked", label: "Booked" },
  { key: "waiting", label: "Waiting" },
  { key: "seated", label: "Seated" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
  { key: "no-show", label: "No-show" },
];

const STATUS_LABEL: Record<ReservationStatus, string> = {
  booked: "Booked",
  waiting: "Waiting",
  seated: "Seated",
  cancelled: "Cancelled",
  "no-show": "No-show",
  completed: "Completed",
};

function RowMenu({
  onSeat,
  onEdit,
  onCancel,
  onNoShow,
}: {
  onSeat: () => void;
  onEdit: () => void;
  onCancel: () => void;
  onNoShow: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const item = (label: string, action: () => void, danger = false) => (
    <button
      onMouseDown={() => {
        action();
        setOpen(false);
      }}
      className={`w-full text-left px-3 py-1.5 text-[12px] rounded transition ${
        danger ? "text-red-600 hover:bg-red-50" : "text-slate-700 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-300 transition"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg py-1">
          {item("Seat", onSeat)}
          {item("Edit", onEdit)}
          <div className="border-t border-slate-100 my-1" />
          {item("No-show", onNoShow, true)}
          {item("Cancel", onCancel, true)}
        </div>
      )}
    </div>
  );
}

interface Props {
  reservations: Reservation[];
  loading: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  onAddClick: () => void;
  onSeat: (r: Reservation) => void;
  onEdit: (r: Reservation) => void;
  onCancel: (r: Reservation) => void;
  onNoShow: (r: Reservation) => void;
}

export default function ReservationsTable({
  reservations,
  loading,
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onAddClick,
  onSeat,
  onEdit,
  onCancel,
  onNoShow,
}: Props) {
  const filtered = reservations.filter((r) => {
    if (statusFilter !== "All" && r.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.guestName.toLowerCase().includes(q) ||
        r.ref.toLowerCase().includes(q) ||
        r.guestPhone.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const { page, setPage, totalPages, paged } = usePagination(filtered, 10);

  return (
    <div className="bg-white border border-slate-200 rounded-lg flex flex-col flex-1 min-h-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-800">Reservations &amp; Waitlist</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 rounded-md p-0.5">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => onStatusChange(f.key)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                  statusFilter === f.key
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search guest, ref…"
              className="w-full sm:w-56 pl-8 pr-3 py-1.5 text-[12px] border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <button
            onClick={onAddClick}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md whitespace-nowrap"
          >
            New
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-slate-50 z-10">
            <tr className="text-[10px] uppercase tracking-wider text-slate-400">
              <th className="text-left font-semibold px-4 py-2.5">Ref</th>
              <th className="text-left font-semibold px-4 py-2.5">Guest</th>
              <th className="text-left font-semibold px-4 py-2.5">Type</th>
              <th className="text-left font-semibold px-4 py-2.5">Party</th>
              <th className="text-left font-semibold px-4 py-2.5">When</th>
              <th className="text-left font-semibold px-4 py-2.5">Status</th>
              <th className="text-left font-semibold px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center text-sm text-slate-400 py-10">
                  Loading reservations…
                </td>
              </tr>
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-sm text-slate-400 py-10">
                  No reservations found.
                </td>
              </tr>
            ) : (
              paged.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50 text-[12px]">
                  <td className="px-4 py-2.5 text-slate-500 font-mono">{r.ref}</td>
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-slate-800">{r.guestName}</p>
                    {r.guestPhone && <p className="text-[11px] text-slate-400">{r.guestPhone}</p>}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600 capitalize">{r.type}</td>
                  <td className="px-4 py-2.5 text-slate-600">{r.partySize}</td>
                  <td className="px-4 py-2.5 text-slate-600">
                    {r.type === "reservation" ? formatDateTime(r.reservedFor) : "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded border ${RESERVATION_STATUS_STYLES[r.status]}`}
                    >
                      {STATUS_LABEL[r.status]}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    {["booked", "waiting"].includes(r.status) && (
                      <RowMenu
                        onSeat={() => onSeat(r)}
                        onEdit={() => onEdit(r)}
                        onCancel={() => onCancel(r)}
                        onNoShow={() => onNoShow(r)}
                      />
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Paginator page={page} totalPages={totalPages} total={filtered.length} setPage={setPage} />
    </div>
  );
}
