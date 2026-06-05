"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import { Product, ProductFormState, emptyForm } from "./types";
import { ModalOverlay, FormField, inputClass } from "./shared";

interface Props {
  product: Product | null;
  categories: string[];
  onClose: () => void;
  onSaved: (p: Product) => void;
}

export default function ProductModal({ product, categories, onClose, onSaved }: Props) {
  const isEdit = !!product;
  const [form, setForm] = useState<ProductFormState>(
    product
      ? {
          name: product.name,
          category: product.category,
          sku: product.sku || "",
          qty: String(product.qty),
          minQty: String(product.minQty),
          buyPrice: String(product.buyPrice),
          sellPrice: String(product.sellPrice),
          barcode: product.barcode || "",
          description: product.description || "",
        }
      : emptyForm()
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [catOpen, setCatOpen] = useState(false);

  const set =
    (key: keyof ProductFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Product name is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const body = {
        name: form.name.trim(),
        category: form.category.trim(),
        sku: form.sku.trim() || undefined,
        qty: Number(form.qty) || 0,
        minQty: Number(form.minQty) || 0,
        buyPrice: Number(form.buyPrice) || 0,
        sellPrice: Number(form.sellPrice) || 0,
        barcode: form.barcode.trim() || undefined,
        description: form.description.trim(),
      };
      const saved = isEdit
        ? await apiRequest<Product>(`/api/products/${product._id}`, {
            method: "PUT",
            body: JSON.stringify(body),
          })
        : await apiRequest<Product>("/api/products", {
            method: "POST",
            body: JSON.stringify(body),
          });
      onSaved(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-[15px] font-semibold text-slate-800">
            {isEdit ? "Edit Product" : "Add Product"}
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

          <FormField label="Product Name" required>
            <input
              className={inputClass}
              value={form.name}
              onChange={set("name")}
              placeholder="e.g. Cooking Oil 5L"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Category">
              <div className="relative">
                <input
                  className={inputClass}
                  value={form.category}
                  onChange={set("category")}
                  onFocus={() => setCatOpen(true)}
                  onBlur={() => setTimeout(() => setCatOpen(false), 150)}
                  placeholder="e.g. Groceries"
                />
                {catOpen && categories.length > 0 && (
                  <ul className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-36 overflow-y-auto">
                    {categories
                      .filter((c) => c.toLowerCase().includes(form.category.toLowerCase()))
                      .map((c) => (
                        <li
                          key={c}
                          onMouseDown={() => setForm((f) => ({ ...f, category: c }))}
                          className="px-3 py-1.5 text-[12px] text-slate-700 hover:bg-slate-50 cursor-pointer"
                        >
                          {c}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </FormField>
            <FormField label="SKU">
              <input
                className={inputClass}
                value={form.sku}
                onChange={set("sku")}
                placeholder="e.g. GRC-001"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label={isEdit ? "Current Qty" : "Opening Qty"}>
              <input
                className={inputClass}
                type="number"
                min="0"
                value={form.qty}
                onChange={set("qty")}
                placeholder="0"
                disabled={isEdit}
                title={isEdit ? "Use Adjust Stock to change quantity" : undefined}
              />
              {isEdit && (
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Use &ldquo;Adjust Stock&rdquo; to change qty
                </p>
              )}
            </FormField>
            <FormField label="Min Qty (Reorder)">
              <input
                className={inputClass}
                type="number"
                min="0"
                value={form.minQty}
                onChange={set("minQty")}
                placeholder="0"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Buy Price (UGX)">
              <input
                className={inputClass}
                type="number"
                min="0"
                value={form.buyPrice}
                onChange={set("buyPrice")}
                placeholder="0"
              />
            </FormField>
            <FormField label="Sell Price (UGX)">
              <input
                className={inputClass}
                type="number"
                min="0"
                value={form.sellPrice}
                onChange={set("sellPrice")}
                placeholder="0"
              />
            </FormField>
          </div>

          <FormField label="Barcode">
            <input
              className={inputClass}
              value={form.barcode}
              onChange={set("barcode")}
              placeholder="Scan or enter barcode"
            />
          </FormField>

          <FormField label="Description">
            <textarea
              className={`${inputClass} resize-none`}
              rows={2}
              value={form.description}
              onChange={set("description")}
              placeholder="Optional notes about this product"
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
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}
