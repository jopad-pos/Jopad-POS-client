"use client";

import { useEffect, useState } from "react";
import { apiRequest, ApiError } from "@/lib/api";
import PlanGate from "@/components/PlanGate";
import TransferHistoryTable from "./components/TransferHistoryTable";
import TransferModal from "./components/TransferModal";
import ViewTransferModal from "./components/ViewTransferModal";
import { StockTransfer } from "./components/types";

function StockTransfersDashboard() {
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const [viewTransfer, setViewTransfer] = useState<StockTransfer | null>(null);

  const load = () => {
    setLoading(true);
    apiRequest<{ items: StockTransfer[] }>("/api/stock-transfers?limit=500")
      .then((res) => {
        setTransfers(res.items);
        setError("");
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load transfers");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = transfers.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return t.ref.toLowerCase().includes(q) || (t.note || "").toLowerCase().includes(q);
  });

  return (
    <div className="p-5 flex flex-col h-full gap-4">
      <TransferHistoryTable
        transfers={filtered}
        loading={loading}
        error={error}
        search={search}
        onSearchChange={setSearch}
        onNewTransfer={() => setNewOpen(true)}
        onView={setViewTransfer}
      />

      {newOpen && (
        <TransferModal
          onClose={() => setNewOpen(false)}
          onSaved={() => {
            setNewOpen(false);
            load();
          }}
        />
      )}
      {viewTransfer && (
        <ViewTransferModal transfer={viewTransfer} onClose={() => setViewTransfer(null)} />
      )}
    </div>
  );
}

export default function StockTransfersPage() {
  return (
    <PlanGate featureKey="transfers">
      <StockTransfersDashboard />
    </PlanGate>
  );
}
