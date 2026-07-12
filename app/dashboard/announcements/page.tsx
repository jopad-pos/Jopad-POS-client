"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Megaphone, Loader2, CheckCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, ApiError } from "@/lib/api";

interface AnnouncementItem {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

const PAGE_SIZE = 15;

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AnnouncementsPage() {
  const { profile } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [marking, setMarking] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const isOwnerOrManager =
    profile?.role === "client" || profile?.staffRole === "Manager";

  // Announcements are owner/manager-only — bounce everyone else back to the dashboard
  useEffect(() => {
    if (profile && !isOwnerOrManager) router.replace("/dashboard");
  }, [profile, isOwnerOrManager, router]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    if (!isOwnerOrManager) return;
    apiRequest<{ count: number }>("/api/announcements/unread-count")
      .then((data) => setUnreadCount(data.count))
      .catch(() => {});
  }, [isOwnerOrManager]);

  useEffect(() => {
    if (!isOwnerOrManager) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await apiRequest<{ items: AnnouncementItem[]; total: number }>(
          `/api/announcements?page=${page}&limit=${PAGE_SIZE}`,
        );
        if (cancelled) return;
        setItems(data.items ?? []);
        setTotal(data.total ?? 0);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof ApiError ? err.message : "Failed to load announcements");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page, isOwnerOrManager]);

  async function markRead(id: string) {
    setItems((prev) => prev.map((a) => (a._id === id ? { ...a, read: true } : a)));
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await apiRequest(`/api/announcements/${id}/read`, { method: "PATCH" });
    } catch {
      // ignore — non-critical
    }
  }

  async function markAllRead() {
    setMarking(true);
    setItems((prev) => prev.map((a) => ({ ...a, read: true })));
    setUnreadCount(0);
    try {
      await apiRequest("/api/announcements/read-all", { method: "PATCH" });
    } catch {
      // ignore — non-critical
    } finally {
      setMarking(false);
    }
  }

  if (!isOwnerOrManager) return null;

  return (
    <div className="p-5 flex flex-col h-full gap-4">
      <div className="bg-white border border-slate-200 rounded-lg flex flex-col flex-1 min-h-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Megaphone className="w-4 h-4 text-blue-600" />
            <h2 className="font-semibold text-slate-900">Announcements</h2>
            <span className="text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-medium tabular-nums">
              {total} total
            </span>
          </div>
          <button
            onClick={markAllRead}
            disabled={marking || unreadCount === 0}
            className="flex items-center gap-1.5 text-[12px] font-medium text-blue-600 hover:text-blue-700 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        </div>

        <div className="flex-1 overflow-auto min-h-0">
          {loading && (
            <div className="px-4 py-12 text-center">
              <Loader2 className="w-5 h-5 animate-spin text-slate-400 mx-auto" />
            </div>
          )}
          {!loading && error && (
            <div className="px-4 py-10 text-center text-[13px] text-red-500">{error}</div>
          )}
          {!loading && !error && items.length === 0 && (
            <div className="px-4 py-10 text-center text-[13px] text-slate-400">
              No announcements yet
            </div>
          )}
          {!loading &&
            !error &&
            items.map((a) => (
              <button
                key={a._id}
                onClick={() => !a.read && markRead(a._id)}
                className={`w-full text-left flex items-start gap-3 px-4 py-3.5 border-b border-slate-50 hover:bg-slate-50/70 transition-colors ${
                  a.read ? "" : "bg-blue-50/40"
                }`}
              >
                {!a.read && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                )}
                <div className={`min-w-0 flex-1 ${a.read ? "pl-[18px]" : ""}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[13px] font-medium text-slate-900 truncate">
                      {a.title}
                    </p>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">
                      {formatDateTime(a.createdAt)}
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-600 mt-1 whitespace-pre-line">
                    {a.message}
                  </p>
                </div>
              </button>
            ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <p className="text-[12px] text-slate-400">
            {total === 0
              ? "No announcements"
              : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total}`}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2.5 py-1.5 text-[12px] rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-2.5 py-1.5 text-[12px] rounded-md border transition-colors ${
                  p === page
                    ? "bg-blue-600 text-white border-blue-600 font-medium"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2.5 py-1.5 text-[12px] rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
