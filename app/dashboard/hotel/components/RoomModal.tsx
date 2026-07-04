"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import { useBranch } from "@/contexts/BranchContext";
import type { Room, RoomStatus } from "./types";

const ROOM_TYPES = ["Standard", "Single", "Double", "Twin", "Deluxe", "Suite", "Family"];

interface RoomModalProps {
  room: Room | null;
  onClose: () => void;
  onSaved: (room: Room) => void;
}

export default function RoomModal({ room, onClose, onSaved }: RoomModalProps) {
  const { selectedBranchId } = useBranch();
  const editing = Boolean(room);

  const [number, setNumber] = useState(room?.number ?? "");
  const [type, setType] = useState(room?.type ?? "Standard");
  const [rate, setRate] = useState(room ? String(room.rate) : "");
  const [capacity, setCapacity] = useState(room ? String(room.capacity) : "2");
  const [status, setStatus] = useState<RoomStatus>(room?.status ?? "available");
  const [notes, setNotes] = useState(room?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isOccupied = room?.status === "occupied";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!number.trim()) {
      setError("Room number is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const body: Record<string, unknown> = {
        number: number.trim(),
        type,
        rate: Number(rate) || 0,
        capacity: Number(capacity) || 1,
        notes: notes.trim(),
      };
      if (!isOccupied) body.status = status;

      let saved: Room;
      if (editing) {
        saved = await apiRequest<Room>(`/api/rooms/${room!._id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
      } else {
        if (selectedBranchId) body.branchId = selectedBranchId;
        saved = await apiRequest<Room>("/api/rooms", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }
      onSaved(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save room");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-slate-900 text-base font-semibold">
            {editing ? `Edit Room ${room!.number}` : "Add Room"}
          </h2>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Room number
              </label>
              <input
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="e.g. 101"
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                {ROOM_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Nightly rate
              </label>
              <input
                type="number"
                min={0}
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="0"
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Capacity
              </label>
              <input
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as RoomStatus)}
              disabled={isOccupied}
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="available">Available</option>
              <option value="maintenance">Maintenance</option>
            </select>
            {isOccupied && (
              <p className="text-[11px] text-slate-400 mt-1">
                This room is occupied. Check the guest out to change its status.
              </p>
            )}
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
              {editing ? "Save changes" : "Add room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
