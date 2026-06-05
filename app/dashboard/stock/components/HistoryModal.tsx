"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { Product, Movement, movementTypeLabel } from "./types";
import { ModalOverlay } from "./shared";

interface Props {
  product: Product;
  onClose: () => void;
}

export default function HistoryModal({ product, onClose }: Props) {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<Movement[]>(`/api/products/${product._id}/movements`)
      .then(setMovements)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [product._id]);

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-[15px] font-semibold text-slate-800">Stock History</h2>
            <p className="text-[12px] text-slate-400 mt-0.5">{product.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5">
          {loading ? (
            <p className="text-[13px] text-slate-400 text-center py-8">Loading…</p>
          ) : movements.length === 0 ? (
            <p className="text-[13px] text-slate-400 text-center py-8">No movements yet.</p>
          ) : (
            <ul className="space-y-2">
              {movements.map((m) => (
                <li key={m._id} className="flex items-start gap-3 text-[12px]">
                  <span
                    className={`mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap ${
                      m.type === "in" || m.type === "purchase"
                        ? "bg-emerald-50 text-emerald-700"
                        : m.type === "out" || m.type === "sale"
                        ? "bg-red-50 text-red-600"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {movementTypeLabel[m.type] ?? m.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700">
                      {m.previousQty} → <span className="font-semibold">{m.newQty}</span>
                      {m.note ? <span className="text-slate-400"> · {m.note}</span> : null}
                    </p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      {new Date(m.createdAt).toLocaleString()}
                      {m.createdBy ? ` · ${m.createdBy.name}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </ModalOverlay>
  );
}
