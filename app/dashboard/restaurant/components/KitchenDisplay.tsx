"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, ChefHat } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import { useBranchQuery } from "@/contexts/BranchContext";
import type { KitchenTicket } from "./types";
import { KITCHEN_NEXT_STATUS, KITCHEN_STATUS_STYLES } from "./types";

const POLL_MS = 12000;

function elapsedMinutes(openedAt: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(openedAt).getTime()) / 60000));
}

export default function KitchenDisplay() {
  const branchQuery = useBranchQuery();
  const [tickets, setTickets] = useState<KitchenTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyItemId, setBusyItemId] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    try {
      const res = await apiRequest<{ items: KitchenTicket[] }>(`/api/orders/kitchen?1=1${branchQuery}`);
      setTickets(res.items);
      setError("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load kitchen tickets");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchQuery]);

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, POLL_MS);
    return () => clearInterval(interval);
  }, [fetchTickets]);

  async function bumpItem(orderId: string, itemId: string, nextStatus: string) {
    setBusyItemId(itemId);
    try {
      await apiRequest(`/api/orders/${orderId}/items/${itemId}`, {
        method: "PATCH",
        body: JSON.stringify({ kitchenStatus: nextStatus }),
      });
      await fetchTickets();
    } catch {
      // Surfaced via the next poll's error state if it's a persistent problem
    } finally {
      setBusyItemId(null);
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-800">Kitchen Display</h2>
        <span className="text-[11px] text-slate-400">Refreshes automatically</span>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-md px-3 py-2 mb-3">
            {error}
          </div>
        )}
        {loading ? (
          <p className="text-sm text-slate-400 text-center py-10">Loading tickets…</p>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12">
            <ChefHat className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No open tickets right now</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {tickets.map((ticket) => (
              <div key={ticket.orderId} className="border border-slate-200 rounded-lg p-3 flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <p className="text-sm font-semibold text-slate-900">Table {ticket.tableLabel}</p>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">
                    {elapsedMinutes(ticket.openedAt)}m ago
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{ticket.ref}</p>

                <div className="divide-y divide-slate-100 border-t border-slate-100 mt-1">
                  {ticket.lineItems.map((li) => {
                    const next = li.kitchenStatus !== "served" ? KITCHEN_NEXT_STATUS[li.kitchenStatus] : null;
                    const busy = busyItemId === li._id;
                    return (
                      <div key={li._id} className="py-2 flex items-center gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-medium text-slate-800">
                            {li.qty} × {li.name}
                          </p>
                          {li.notes && <p className="text-[11px] text-slate-400 italic">{li.notes}</p>}
                        </div>
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded border whitespace-nowrap ${KITCHEN_STATUS_STYLES[li.kitchenStatus]}`}
                        >
                          {li.kitchenStatus}
                        </span>
                        {next && (
                          <button
                            onClick={() => bumpItem(ticket.orderId, li._id, next)}
                            disabled={busy}
                            title={`Mark ${next}`}
                            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-40"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
