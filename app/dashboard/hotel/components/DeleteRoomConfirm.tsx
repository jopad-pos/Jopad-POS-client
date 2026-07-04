"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import type { Room } from "./types";

interface DeleteRoomConfirmProps {
  room: Room;
  onClose: () => void;
  onDeleted: (id: string) => void;
}

export default function DeleteRoomConfirm({ room, onClose, onDeleted }: DeleteRoomConfirmProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setSaving(true);
    setError("");
    try {
      await apiRequest(`/api/rooms/${room._id}`, { method: "DELETE" });
      onDeleted(room._id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete room");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <h2 className="text-slate-900 text-base font-semibold">Delete Room {room.number}?</h2>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          This room will be removed from your hotel. Existing bookings are kept for your records.
        </p>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-md px-3 py-2 mb-3">
            {error}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-60"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
