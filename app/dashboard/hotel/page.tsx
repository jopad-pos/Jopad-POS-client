"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useBranch } from "@/contexts/BranchContext";
import PlanGate from "@/components/PlanGate";
import RoomsBoard from "./components/RoomsBoard";
import BookingsTable from "./components/BookingsTable";
import RoomModal from "./components/RoomModal";
import CheckInModal from "./components/CheckInModal";
import CheckOutModal from "./components/CheckOutModal";
import ReservationCheckInModal from "./components/ReservationCheckInModal";
import BookingDetailsModal from "./components/BookingDetailsModal";
import EditReservationModal from "./components/EditReservationModal";
import DeleteRoomConfirm from "./components/DeleteRoomConfirm";
import CancelBookingConfirm from "./components/CancelBookingConfirm";
import type { Booking, BookingStats, Room, RoomStats } from "./components/types";

export default function HotelPage() {
  return (
    <PlanGate featureKey="hotel">
      <HotelDashboard />
    </PlanGate>
  );
}

function HotelDashboard() {
  const { profile } = useAuth();
  const { selectedBranchId } = useBranch();
  const isOwner = profile?.role === "client";

  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [roomStats, setRoomStats] = useState<RoomStats>({
    total: 0,
    available: 0,
    occupied: 0,
    maintenance: 0,
    occupancyRate: 0,
  });
  const [bookingStats, setBookingStats] = useState<BookingStats>({
    inHouse: 0,
    arrivalsToday: 0,
    departuresToday: 0,
    upcoming: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [tab, setTab] = useState<"rooms" | "bookings">("rooms");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [addRoomOpen, setAddRoomOpen] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [deleteRoom, setDeleteRoom] = useState<Room | null>(null);
  const [bookRoom, setBookRoom] = useState<{ room: Room; mode: "checkin" | "reserve" } | null>(null);
  const [checkInReservation, setCheckInReservation] = useState<Booking | null>(null);
  const [checkOutBooking, setCheckOutBooking] = useState<Booking | null>(null);
  const [cancelBooking, setCancelBooking] = useState<Booking | null>(null);
  const [detailsBooking, setDetailsBooking] = useState<Booking | null>(null);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);

  const branchParam = selectedBranchId ? `&branchId=${selectedBranchId}` : "";
  const branchQuery = selectedBranchId ? `?branchId=${selectedBranchId}` : "";

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [roomsRes, bookingsRes, rStats, bStats] = await Promise.all([
        apiRequest<{ items: Room[] }>(`/api/rooms?limit=500${branchParam}`),
        apiRequest<{ items: Booking[] }>(`/api/bookings?limit=500${branchParam}`),
        apiRequest<RoomStats>(`/api/rooms/stats${branchQuery}`),
        apiRequest<BookingStats>(`/api/bookings/stats${branchQuery}`),
      ]);
      setRooms(roomsRes.items);
      setBookings(bookingsRes.items);
      setRoomStats(rStats);
      setBookingStats(bStats);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load hotel data");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranchId]);

  useEffect(() => {
    load();
  }, [load]);

  const cards = [
    { label: "Rooms", value: roomStats.total, sub: "total rooms" },
    { label: "Occupied", value: roomStats.occupied, sub: `${roomStats.occupancyRate}% occupancy` },
    { label: "In-house Guests", value: bookingStats.inHouse, sub: `${bookingStats.arrivalsToday} arrivals today` },
    { label: "Reservations", value: bookingStats.upcoming, sub: "upcoming stays" },
  ];

  function handleRoomSaved(saved: Room) {
    setRooms((prev) => {
      const idx = prev.findIndex((r) => r._id === saved._id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
    setAddRoomOpen(false);
    setEditRoom(null);
    load();
  }

  function handleRoomDeleted(id: string) {
    setRooms((prev) => prev.filter((r) => r._id !== id));
    setDeleteRoom(null);
    load();
  }

  function handleBooked(booking: Booking) {
    setBookings((prev) => [booking, ...prev]);
    setBookRoom(null);
    load();
  }

  function handleReservationCheckedIn(updated: Booking) {
    setBookings((prev) => prev.map((b) => (b._id === updated._id ? updated : b)));
    setCheckInReservation(null);
    load();
  }

  function handleCheckedOut(updated: Booking) {
    setBookings((prev) => prev.map((b) => (b._id === updated._id ? updated : b)));
    setCheckOutBooking(null);
    load();
  }

  function handleCancelled(updated: Booking) {
    setBookings((prev) => prev.map((b) => (b._id === updated._id ? updated : b)));
    setCancelBooking(null);
    load();
  }

  function handleReservationEdited(updated: Booking) {
    setBookings((prev) => prev.map((b) => (b._id === updated._id ? updated : b)));
    setEditBooking(null);
    load();
  }

  // Resolve the active booking for an occupied room to drive the check-out modal
  function openCheckOutForRoom(room: Room) {
    const active = bookings.find((b) => b.room === room._id && b.status === "checked-in");
    if (active) setCheckOutBooking(active);
  }

  return (
    <div className="p-5 flex flex-col h-full gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border border-slate-200 rounded-lg px-4 py-3.5">
            <p className="text-[11px] font-medium text-slate-500">{c.label}</p>
            <p className="text-lg font-semibold mt-1 tabular-nums leading-none text-slate-900">
              {loading ? "—" : c.value.toString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-md px-4 py-2.5">
          {error}
        </div>
      )}

      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit flex-shrink-0">
        {([
          { key: "rooms", label: "Rooms" },
          { key: "bookings", label: "Bookings" },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`text-[12px] font-medium px-3.5 py-1.5 rounded-md transition-colors ${
              tab === t.key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "rooms" ? (
        <RoomsBoard
          rooms={rooms}
          loading={loading}
          isOwner={isOwner}
          onAddRoom={() => setAddRoomOpen(true)}
          onCheckIn={(room) => setBookRoom({ room, mode: "checkin" })}
          onReserve={(room) => setBookRoom({ room, mode: "reserve" })}
          onCheckOut={openCheckOutForRoom}
          onEditRoom={setEditRoom}
          onDeleteRoom={setDeleteRoom}
        />
      ) : (
        <BookingsTable
          bookings={bookings}
          loading={loading}
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          onCheckIn={setCheckInReservation}
          onCheckOut={setCheckOutBooking}
          onCancel={setCancelBooking}
          onViewDetails={setDetailsBooking}
          onEdit={setEditBooking}
        />
      )}

      {addRoomOpen && (
        <RoomModal room={null} onClose={() => setAddRoomOpen(false)} onSaved={handleRoomSaved} />
      )}
      {editRoom && (
        <RoomModal room={editRoom} onClose={() => setEditRoom(null)} onSaved={handleRoomSaved} />
      )}
      {deleteRoom && (
        <DeleteRoomConfirm
          room={deleteRoom}
          onClose={() => setDeleteRoom(null)}
          onDeleted={handleRoomDeleted}
        />
      )}
      {bookRoom && (
        <CheckInModal
          room={bookRoom.room}
          initialMode={bookRoom.mode}
          onClose={() => setBookRoom(null)}
          onCheckedIn={handleBooked}
        />
      )}
      {checkInReservation && (
        <ReservationCheckInModal
          booking={checkInReservation}
          onClose={() => setCheckInReservation(null)}
          onCheckedIn={handleReservationCheckedIn}
        />
      )}
      {checkOutBooking && (
        <CheckOutModal
          booking={checkOutBooking}
          onClose={() => setCheckOutBooking(null)}
          onCheckedOut={handleCheckedOut}
        />
      )}
      {cancelBooking && (
        <CancelBookingConfirm
          booking={cancelBooking}
          onClose={() => setCancelBooking(null)}
          onCancelled={handleCancelled}
        />
      )}
      {detailsBooking && (
        <BookingDetailsModal
          booking={detailsBooking}
          onClose={() => setDetailsBooking(null)}
        />
      )}
      {editBooking && (
        <EditReservationModal
          booking={editBooking}
          rooms={rooms}
          onClose={() => setEditBooking(null)}
          onSaved={handleReservationEdited}
        />
      )}
    </div>
  );
}
