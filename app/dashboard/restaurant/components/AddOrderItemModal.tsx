"use client";

import { useMemo, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import type { MenuItem, Order } from "./types";
import { formatMoney } from "./types";

interface Props {
  order: Order;
  menuItems: MenuItem[];
  onClose: () => void;
  onAdded: (order: Order) => void;
}

type Selections = Record<string, string[]>; // groupName -> optionNames

export default function AddOrderItemModal({ order, menuItems, onClose, onAdded }: Props) {
  const [menuItemId, setMenuItemId] = useState(menuItems[0]?._id ?? "");
  const [qty, setQty] = useState("1");
  const [notes, setNotes] = useState("");
  const [selections, setSelections] = useState<Selections>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const menuItem = useMemo(() => menuItems.find((m) => m._id === menuItemId) ?? null, [menuItems, menuItemId]);

  function handlePickMenuItem(id: string) {
    setMenuItemId(id);
    setSelections({});
  }

  function toggleOption(groupName: string, optionName: string, multiple: boolean) {
    setSelections((prev) => {
      const current = prev[groupName] ?? [];
      if (multiple) {
        const next = current.includes(optionName)
          ? current.filter((n) => n !== optionName)
          : [...current, optionName];
        return { ...prev, [groupName]: next };
      }
      return { ...prev, [groupName]: current.includes(optionName) ? [] : [optionName] };
    });
  }

  const previewPrice = useMemo(() => {
    if (!menuItem) return 0;
    let price = menuItem.price;
    for (const group of menuItem.modifierGroups) {
      for (const optName of selections[group.name] ?? []) {
        const opt = group.options.find((o) => o.name === optName);
        if (opt) price += opt.priceDelta;
      }
    }
    return price;
  }, [menuItem, selections]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!menuItem) {
      setError("Select a menu item");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const modifierSelections = Object.entries(selections).flatMap(([groupName, optionNames]) =>
        optionNames.map((optionName) => ({ groupName, optionName })),
      );
      const updated = await apiRequest<Order>(`/api/orders/${order._id}/items`, {
        method: "POST",
        body: JSON.stringify({
          menuItemId: menuItem._id,
          qty: Number(qty) || 1,
          modifierSelections,
          notes: notes.trim(),
        }),
      });
      onAdded(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add item");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-slate-900 text-base font-semibold">Add item — Table {order.tableLabel}</h2>
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

          {menuItems.length === 0 ? (
            <p className="text-sm text-slate-400">No menu items yet. Add one from the Menu tab first.</p>
          ) : (
            <>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Menu item</label>
                <select
                  value={menuItemId}
                  onChange={(e) => handlePickMenuItem(e.target.value)}
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                >
                  {menuItems.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} — {formatMoney(m.price)}
                    </option>
                  ))}
                </select>
              </div>

              {menuItem?.modifierGroups.map((group) => (
                <div key={group.name}>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">
                    {group.name} {group.required && <span className="text-red-500">*</span>}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {group.options.map((opt) => {
                      const selected = (selections[group.name] ?? []).includes(opt.name);
                      return (
                        <button
                          type="button"
                          key={opt.name}
                          onClick={() => toggleOption(group.name, opt.name, group.multiple)}
                          className={`text-[12px] px-2.5 py-1.5 rounded-md border transition-colors ${
                            selected
                              ? "bg-blue-600 border-blue-600 text-white"
                              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          {opt.name}
                          {opt.priceDelta !== 0 && (
                            <span className={selected ? "text-blue-100" : "text-slate-400"}>
                              {" "}
                              ({opt.priceDelta > 0 ? "+" : ""}
                              {opt.priceDelta.toLocaleString()})
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                </div>
                <div className="flex items-end justify-end">
                  <p className="text-sm text-slate-600">
                    Unit price: <span className="font-semibold text-slate-900">{formatMoney(previewPrice)}</span>
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Kitchen note</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. no onions"
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
                />
              </div>
            </>
          )}

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
              disabled={saving || menuItems.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-60"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Add to tab
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
