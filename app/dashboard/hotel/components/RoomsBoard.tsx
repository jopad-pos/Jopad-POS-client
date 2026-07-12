"use client";

import { Plus, Pencil, Trash2, BedDouble, CalendarClock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Paginator, usePagination } from "../../components/Paginator";
import type { Room } from "./types";
import { ROOM_STATUS_STYLES, formatMoney } from "./types";

interface RoomsBoardProps {
  rooms: Room[];
  loading: boolean;
  isOwner: boolean;
  onAddRoom: () => void;
  onCheckIn: (room: Room) => void;
  onReserve: (room: Room) => void;
  onCheckOut: (room: Room) => void;
  onEditRoom: (room: Room) => void;
  onDeleteRoom: (room: Room) => void;
}

export default function RoomsBoard({
  rooms,
  loading,
  isOwner,
  onAddRoom,
  onCheckIn,
  onReserve,
  onCheckOut,
  onEditRoom,
  onDeleteRoom,
}: RoomsBoardProps) {
  const { profile } = useAuth();
  const currency = profile?.currency ?? "UGX";

  const { page, setPage, totalPages, paged } = usePagination(rooms, 20);

  return (
    <div className="bg-white border border-slate-200 rounded-lg flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-800">Rooms</h2>
        {isOwner && (
          <button
            onClick={onAddRoom}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            <Plus className="w-3.5 h-3.5" />
            Add room
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <p className="text-sm text-slate-400 text-center py-10">Loading rooms…</p>
        ) : rooms.length === 0 ? (
          <div className="text-center py-12">
            <BedDouble className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500 mb-1">No rooms yet</p>
            <p className="text-[12px] text-slate-400">
              {isOwner ? "Add your first room to start checking in guests." : "No rooms configured."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {paged.map((room) => {
              const s = ROOM_STATUS_STYLES[room.status];
              const isOccupied = room.status === "occupied";
              const isMaintenance = room.status === "maintenance";
              return (
                <div
                  key={room._id}
                  className={`border rounded-lg p-3 flex flex-col gap-2 transition-colors ${s.card}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        Room {room.number}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{room.type}</p>
                    </div>
                    <span className={`flex items-center gap-1 text-[10px] font-medium ${s.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {s.label}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500">{formatMoney(room.rate, currency)} / night</p>

                  <div className="flex items-center gap-1.5 mt-auto pt-1">
                    {isOccupied ? (
                      <button
                        onClick={() => onCheckOut(room)}
                        className="flex-1 text-[11px] font-medium text-white bg-blue-600 hover:bg-blue-700 rounded px-2 py-1.5"
                      >
                        Check out
                      </button>
                    ) : (
                      <button
                        onClick={() => onCheckIn(room)}
                        disabled={isMaintenance}
                        className="flex-1 text-[11px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded px-2 py-1.5 disabled:bg-slate-300 disabled:cursor-not-allowed"
                      >
                        Check in
                      </button>
                    )}
                    {!isMaintenance && (
                      <button
                        onClick={() => onReserve(room)}
                        title="Reserve for a future date"
                        className="p-1.5 rounded text-violet-500 hover:text-violet-700 hover:bg-white/60"
                      >
                        <CalendarClock className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isOwner && (
                      <>
                        <button
                          onClick={() => onEditRoom(room)}
                          title="Edit room"
                          className="p-1.5 rounded text-slate-400 hover:text-slate-600 hover:bg-white/60"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteRoom(room)}
                          disabled={isOccupied}
                          title={isOccupied ? "Check the guest out first" : "Delete room"}
                          className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-white/60 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Paginator page={page} totalPages={totalPages} total={rooms.length} setPage={setPage} />
    </div>
  );
}
