"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, MoreHorizontal, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Paginator, usePagination } from "../../components/Paginator";
import type { Booking, BookingStatus } from "./types";
import {
  BOOKING_STATUS_STYLES,
  formatMoney,
  formatDateTime,
} from "./types";

const FILTERS: { key: string; label: string }[] = [
  { key: "All", label: "All" },
  { key: "checked-in", label: "In-house" },
  { key: "checked-out", label: "Checked out" },
  { key: "cancelled", label: "Cancelled" },
];

const STATUS_LABEL: Record<BookingStatus, string> = {
  "checked-in": "In-house",
  "checked-out": "Checked out",
  cancelled: "Cancelled",
};

type SortKey = "ref" | "guestName" | "roomNumber" | "checkInAt" | "checkOutAt";

function SortHeader({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey | null;
  direction: "asc" | "desc";
  onSort: (key: SortKey) => void;
}) {
  const active = activeKey === sortKey;
  return (
    <th className="text-left font-semibold px-4 py-2.5">
      <button
        onClick={() => onSort(sortKey)}
        className={`flex items-center gap-0.5 uppercase tracking-wider transition-colors ${
          active ? "text-slate-600" : "text-slate-400 hover:text-slate-600"
        }`}
      >
        {label}
        {active ? (
          direction === "asc" ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )
        ) : (
          <ChevronsUpDown className="w-3 h-3 text-slate-300" />
        )}
      </button>
    </th>
  );
}

function RowMenu({ onCheckOut, onCancel }: { onCheckOut: () => void; onCancel: () => void }) {
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
      onMouseDown={() => { action(); setOpen(false); }}
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
        <div className="absolute right-0 z-20 mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-lg py-1">
          {item("Check out", onCheckOut)}
          <div className="border-t border-slate-100 my-1" />
          {item("Cancel", onCancel, true)}
        </div>
      )}
    </div>
  );
}

interface BookingsTableProps {
  bookings: Booking[];
  loading: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  onCheckOut: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
}

export default function BookingsTable({
  bookings,
  loading,
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onCheckOut,
  onCancel,
}: BookingsTableProps) {
  const { profile } = useAuth();
  const currency = profile?.currency ?? "UGX";

  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filtered = bookings.filter((b) => {
    if (statusFilter !== "All" && b.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        b.guestName.toLowerCase().includes(q) ||
        b.ref.toLowerCase().includes(q) ||
        b.roomNumber.toLowerCase().includes(q) ||
        b.guestPhone.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const list = [...filtered];
    list.sort((a, b) => {
      let cmp: number;
      if (sortKey === "checkInAt" || sortKey === "checkOutAt") {
        const aTime = a[sortKey] ? new Date(a[sortKey] as string).getTime() : 0;
        const bTime = b[sortKey] ? new Date(b[sortKey] as string).getTime() : 0;
        cmp = aTime - bTime;
      } else {
        cmp = a[sortKey].localeCompare(b[sortKey], undefined, { sensitivity: "base" });
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [filtered, sortKey, sortDir]);

  const { page, setPage, totalPages, paged } = usePagination(sorted, 10);

  return (
    <div className="bg-white border border-slate-200 rounded-lg flex flex-col flex-1 min-h-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-800">Bookings</h2>
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
              placeholder="Search guest, room, ref…"
              className="w-full sm:w-56 pl-8 pr-3 py-1.5 text-[12px] border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-slate-50 z-10">
            <tr className="text-[10px] uppercase tracking-wider text-slate-400">
              <SortHeader label="Ref" sortKey="ref" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
              <SortHeader label="Guest" sortKey="guestName" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
              <SortHeader label="Room" sortKey="roomNumber" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
              <SortHeader label="Check-in" sortKey="checkInAt" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
              <SortHeader label="Check-out" sortKey="checkOutAt" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
              <th className="text-left font-semibold px-4 py-2.5">Charge</th>
              <th className="text-left font-semibold px-4 py-2.5">Status</th>
              <th className="text-left font-semibold px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center text-sm text-slate-400 py-10">
                  Loading bookings…
                </td>
              </tr>
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-sm text-slate-400 py-10">
                  No bookings found.
                </td>
              </tr>
            ) : (
              paged.map((b) => (
                <tr key={b._id} className="hover:bg-slate-50 text-[12px]">
                  <td className="px-4 py-2.5 text-slate-500 font-mono">{b.ref}</td>
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-slate-800">{b.guestName}</p>
                    {b.guestPhone && <p className="text-[11px] text-slate-400">{b.guestPhone}</p>}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">{b.roomNumber}</td>
                  <td className="px-4 py-2.5 text-slate-600">{formatDateTime(b.checkInAt)}</td>
                  <td className="px-4 py-2.5 text-slate-600">{formatDateTime(b.checkOutAt)}</td>
                  <td className="px-4 py-2.5 text-slate-700 tabular-nums">
                    {b.status === "checked-out"
                      ? formatMoney(b.totalCharge, currency)
                      : "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded border ${BOOKING_STATUS_STYLES[b.status]}`}
                    >
                      {STATUS_LABEL[b.status]}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    {b.status === "checked-in" && (
                      <RowMenu onCheckOut={() => onCheckOut(b)} onCancel={() => onCancel(b)} />
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Paginator page={page} totalPages={totalPages} total={sorted.length} setPage={setPage} />
    </div>
  );
}
