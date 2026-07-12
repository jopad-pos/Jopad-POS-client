"use client";

import { useEffect, useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useBranch } from "@/contexts/BranchContext";
import { ModalOverlay, FormField, inputClass } from "../../stock/components/shared";
import { BranchOption, ProductOption, StockTransfer } from "./types";

interface LineItemRow {
  productId: string;
  destProductId: string; // "" = create a new product in the destination branch
  qty: string;
}

const emptyRow = (): LineItemRow => ({ productId: "", destProductId: "", qty: "1" });

function suggestMatch(source: ProductOption | undefined, destProducts: ProductOption[]): string {
  if (!source) return "";
  if (source.sku) {
    const bySku = destProducts.find((p) => p.sku && p.sku.toLowerCase() === source.sku!.toLowerCase());
    if (bySku) return bySku._id;
  }
  const byName = destProducts.find((p) => p.name.toLowerCase() === source.name.toLowerCase());
  return byName?._id || "";
}

interface Props {
  onClose: () => void;
  onSaved: (t: StockTransfer) => void;
}

export default function TransferModal({ onClose, onSaved }: Props) {
  const { user } = useAuth();
  const { selectedBranchId } = useBranch();
  const branchLocked = user?.role === "staff" && !!user.branchId;

  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [fromBranchId, setFromBranchId] = useState("");
  const [toBranchId, setToBranchId] = useState("");
  const [sourceProducts, setSourceProducts] = useState<ProductOption[]>([]);
  const [destProducts, setDestProducts] = useState<ProductOption[]>([]);
  const [rows, setRows] = useState<LineItemRow[]>([emptyRow()]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiRequest<BranchOption[]>("/api/stock-transfers/branches")
      .then((data) => {
        if (cancelled) return;
        setBranches(data);
        const initialFrom = branchLocked ? (user!.branchId as string) : selectedBranchId || data[0]?._id || "";
        setFromBranchId(initialFrom);
        const firstOther = data.find((b) => b._id !== initialFrom)?._id || "";
        setToBranchId(firstOther);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!fromBranchId) {
      setSourceProducts([]);
      return;
    }
    let cancelled = false;
    apiRequest<{ items: ProductOption[] }>(`/api/stock-transfers/products?branchId=${fromBranchId}`)
      .then((res) => {
        if (!cancelled) setSourceProducts(res.items);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [fromBranchId]);

  useEffect(() => {
    if (!toBranchId) {
      setDestProducts([]);
      return;
    }
    let cancelled = false;
    apiRequest<{ items: ProductOption[] }>(`/api/stock-transfers/products?branchId=${toBranchId}`)
      .then((res) => {
        if (cancelled) return;
        setDestProducts(res.items);
        // Re-suggest a destination match for rows whose product is already picked
        setRows((prev) =>
          prev.map((row) => {
            if (!row.productId) return row;
            const source = sourceProducts.find((p) => p._id === row.productId);
            return { ...row, destProductId: suggestMatch(source, res.items) };
          })
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toBranchId]);

  const destinationBranches = branches.filter((b) => b._id !== fromBranchId);

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);
  const removeRow = (idx: number) => setRows((prev) => prev.filter((_, i) => i !== idx));
  const updateRow = (idx: number, field: keyof LineItemRow, value: string) =>
    setRows((prev) => prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));

  const handleProductSelect = (idx: number, productId: string) => {
    const source = sourceProducts.find((p) => p._id === productId);
    setRows((prev) =>
      prev.map((row, i) =>
        i === idx
          ? { ...row, productId, destProductId: suggestMatch(source, destProducts) }
          : row
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fromBranchId || !toBranchId) {
      setError("Source and destination branch are required");
      return;
    }
    if (fromBranchId === toBranchId) {
      setError("Source and destination branch must be different");
      return;
    }

    const items = rows
      .filter((r) => r.productId && Number(r.qty) > 0)
      .map((r) => ({
        productId: r.productId,
        destProductId: r.destProductId || undefined,
        qty: Math.floor(Number(r.qty)),
      }));

    if (items.length === 0) {
      setError("Add at least one product to transfer");
      return;
    }

    setSaving(true);
    try {
      const saved = await apiRequest<StockTransfer>("/api/stock-transfers", {
        method: "POST",
        body: JSON.stringify({ fromBranchId, toBranchId, items, note: note.trim() }),
      });
      onSaved(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
      setSaving(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-[15px] font-semibold text-slate-800">New Stock Transfer</h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <FormField label="From branch" required>
              {branchLocked ? (
                <div className={`${inputClass} bg-slate-50 text-slate-500`}>
                  {branches.find((b) => b._id === fromBranchId)?.name || "Your branch"}
                </div>
              ) : (
                <select
                  className={inputClass}
                  value={fromBranchId}
                  onChange={(e) => setFromBranchId(e.target.value)}
                >
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              )}
            </FormField>
            <FormField label="To branch" required>
              <select
                className={inputClass}
                value={toBranchId}
                onChange={(e) => setToBranchId(e.target.value)}
              >
                <option value="">— Select branch —</option>
                {destinationBranches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Products to Move
              </label>
              <button
                type="button"
                onClick={addRow}
                className="flex items-center gap-1 text-[12px] text-blue-600 hover:text-blue-700 font-medium transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                      Product (source stock)
                    </th>
                    <th className="text-left px-2 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wide w-24">
                      Qty
                    </th>
                    <th className="text-left px-2 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wide w-56">
                      Destination product
                    </th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row, idx) => {
                    const source = sourceProducts.find((p) => p._id === row.productId);
                    return (
                      <tr key={idx}>
                        <td className="px-3 py-1.5">
                          <select
                            className={`${inputClass} py-1.5`}
                            value={row.productId}
                            onChange={(e) => handleProductSelect(idx, e.target.value)}
                          >
                            <option value="">— Select product —</option>
                            {sourceProducts.map((p) => (
                              <option key={p._id} value={p._id}>
                                {p.name} ({p.qty} {p.unit} available)
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            className={`${inputClass} py-1.5`}
                            type="number"
                            min="1"
                            max={source?.qty ?? undefined}
                            value={row.qty}
                            onChange={(e) => updateRow(idx, "qty", e.target.value)}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <select
                            className={`${inputClass} py-1.5`}
                            value={row.destProductId}
                            onChange={(e) => updateRow(idx, "destProductId", e.target.value)}
                            disabled={!toBranchId}
                          >
                            <option value="">— Create new product —</option>
                            {destProducts.map((p) => (
                              <option key={p._id} value={p._id}>
                                {p.name} ({p.qty} {p.unit} there)
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-1.5 text-right">
                          {rows.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRow(idx)}
                              className="p-1 text-slate-400 hover:text-red-500 transition rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <FormField label="Note">
            <textarea
              className={`${inputClass} resize-none`}
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional notes about this transfer"
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-[13px] font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-md transition"
            >
              {saving ? "Transferring…" : "Transfer Stock"}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}
