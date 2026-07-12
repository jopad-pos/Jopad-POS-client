"use client";

import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import { ModalOverlay, FormField, inputClass } from "../../stock/components/shared";
import { useBranch } from "@/contexts/BranchContext";
import type { MenuItem, ModifierGroup } from "./types";

interface Props {
  item: MenuItem | null;
  categories: string[];
  onClose: () => void;
  onSaved: (item: MenuItem) => void;
}

function emptyGroup(): ModifierGroup {
  return { name: "", required: false, multiple: false, options: [{ name: "", priceDelta: 0 }] };
}

export default function MenuItemModal({ item, categories, onClose, onSaved }: Props) {
  const isEdit = !!item;
  const { selectedBranchId } = useBranch();

  const [name, setName] = useState(item?.name ?? "");
  const [category, setCategory] = useState(item?.category ?? "");
  const [price, setPrice] = useState(item ? String(item.price) : "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [groups, setGroups] = useState<ModifierGroup[]>(
    item?.modifierGroups.map((g) => ({ ...g, options: g.options.map((o) => ({ ...o })) })) ?? [],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function addGroup() {
    setGroups((g) => [...g, emptyGroup()]);
  }
  function removeGroup(idx: number) {
    setGroups((g) => g.filter((_, i) => i !== idx));
  }
  function updateGroup(idx: number, patch: Partial<ModifierGroup>) {
    setGroups((g) => g.map((grp, i) => (i === idx ? { ...grp, ...patch } : grp)));
  }
  function addOption(idx: number) {
    setGroups((g) =>
      g.map((grp, i) => (i === idx ? { ...grp, options: [...grp.options, { name: "", priceDelta: 0 }] } : grp)),
    );
  }
  function removeOption(idx: number, optIdx: number) {
    setGroups((g) =>
      g.map((grp, i) => (i === idx ? { ...grp, options: grp.options.filter((_, j) => j !== optIdx) } : grp)),
    );
  }
  function updateOption(idx: number, optIdx: number, patch: { name?: string; priceDelta?: number }) {
    setGroups((g) =>
      g.map((grp, i) =>
        i === idx
          ? { ...grp, options: grp.options.map((o, j) => (j === optIdx ? { ...o, ...patch } : o)) }
          : grp,
      ),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Menu item name is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const cleanGroups = groups
        .map((g) => ({
          name: g.name.trim(),
          required: g.required,
          multiple: g.multiple,
          options: g.options
            .map((o) => ({ name: o.name.trim(), priceDelta: Number(o.priceDelta) || 0 }))
            .filter((o) => o.name),
        }))
        .filter((g) => g.name && g.options.length > 0);

      const body: Record<string, unknown> = {
        name: name.trim(),
        category: category.trim(),
        price: Number(price) || 0,
        description: description.trim(),
        modifierGroups: cleanGroups,
        ...(!isEdit && { branchId: selectedBranchId || undefined }),
      };

      const saved = isEdit
        ? await apiRequest<MenuItem>(`/api/menu-items/${item!._id}`, {
            method: "PUT",
            body: JSON.stringify(body),
          })
        : await apiRequest<MenuItem>("/api/menu-items", {
            method: "POST",
            body: JSON.stringify(body),
          });
      onSaved(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save menu item");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-[15px] font-semibold text-slate-800">
            {isEdit ? "Edit Menu Item" : "Add Menu Item"}
          </h2>
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

          <FormField label="Item Name" required>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Grilled Chicken"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Category">
              <input
                className={inputClass}
                list="menu-categories"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Mains"
              />
              <datalist id="menu-categories">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </FormField>
            <FormField label="Price (UGX)" required>
              <input
                className={inputClass}
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
              />
            </FormField>
          </div>

          <FormField label="Description">
            <textarea
              className={`${inputClass} resize-none`}
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes shown to staff"
            />
          </FormField>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Modifier groups
              </label>
              <button
                type="button"
                onClick={addGroup}
                className="flex items-center gap-1 text-[12px] text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-3.5 h-3.5" />
                Add group
              </button>
            </div>

            <div className="space-y-3">
              {groups.map((group, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      className={`${inputClass} flex-1`}
                      value={group.name}
                      onChange={(e) => updateGroup(idx, { name: e.target.value })}
                      placeholder="Group name, e.g. Size"
                    />
                    <button
                      type="button"
                      onClick={() => removeGroup(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 text-[12px] text-slate-600">
                    <label className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={group.required}
                        onChange={(e) => updateGroup(idx, { required: e.target.checked })}
                      />
                      Required
                    </label>
                    <label className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={group.multiple}
                        onChange={(e) => updateGroup(idx, { multiple: e.target.checked })}
                      />
                      Allow multiple
                    </label>
                  </div>
                  <div className="space-y-1.5">
                    {group.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <input
                          className={`${inputClass} flex-1`}
                          value={opt.name}
                          onChange={(e) => updateOption(idx, optIdx, { name: e.target.value })}
                          placeholder="Option name"
                        />
                        <input
                          className={`${inputClass} w-24`}
                          type="number"
                          value={opt.priceDelta}
                          onChange={(e) => updateOption(idx, optIdx, { priceDelta: Number(e.target.value) })}
                          placeholder="+/- price"
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(idx, optIdx)}
                          className="p-1.5 text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addOption(idx)}
                      className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="w-3 h-3" />
                      Add option
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

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
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Menu Item"}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}
