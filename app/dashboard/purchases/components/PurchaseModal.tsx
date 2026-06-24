"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import {
  Purchase,
  PurchaseFormState,
  PurchaseLineItem,
  PurchaseStatus,
  PURCHASE_STATUSES,
  emptyPurchaseForm,
  toInputDate,
} from "./types";
import { ModalOverlay, FormField, HeroDatePicker, inputClass } from "./shared";
import { useBranch } from "@/contexts/BranchContext";

interface ProductOption {
  _id: string;
  name: string;
  buyPrice: number;
}

interface SupplierOption {
  _id: string;
  name: string;
}

interface LineItemRow {
  productId: string;
  name: string;
  qty: string;
  buyPrice: string;
}

interface Props {
  purchase: Purchase | null;
  onClose: () => void;
  onSaved: (p: Purchase) => void;
  initialLineItems?: LineItemRow[];
}

const emptyRow = (): LineItemRow => ({
  productId: "",
  name: "",
  qty: "1",
  buyPrice: "0",
});

export default function PurchaseModal({ purchase, onClose, onSaved, initialLineItems }: Props) {
  const isEdit = !!purchase;
  const { selectedBranchId } = useBranch();

  const [form, setForm] = useState<PurchaseFormState>(
    purchase
      ? {
          supplier: purchase.supplier,
          description: purchase.description,
          items: String(purchase.items),
          amount: String(purchase.amount),
          status: purchase.status,
          date: toInputDate(purchase.date),
        }
      : emptyPurchaseForm(),
  );

  const [lineItems, setLineItems] = useState<LineItemRow[]>(
    purchase?.lineItems && purchase.lineItems.length > 0
      ? purchase.lineItems.map((li) => ({
          productId: li.productId,
          name: li.name,
          qty: String(li.qty),
          buyPrice: String(li.buyPrice),
        }))
      : purchase
        ? []
        : (initialLineItems ?? [emptyRow()]),
  );

  const [products, setProducts] = useState<ProductOption[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Inline add-supplier state
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState("");
  const [addingSupplier, setAddingSupplier] = useState(false);
  const [addSupplierError, setAddSupplierError] = useState("");

  // Inline add-product state
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    buyPrice: "",
    sellPrice: "",
  });
  const [addingProduct, setAddingProduct] = useState(false);
  const [addProductError, setAddProductError] = useState("");
  const [addProductTargetIndex, setAddProductTargetIndex] = useState<
    number | null
  >(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      apiRequest<{ items: ProductOption[] }>("/api/products?limit=1000"),
      apiRequest<{ items: SupplierOption[] }>("/api/suppliers?limit=1000"),
    ])
      .then(([productsRes, suppliersRes]) => {
        if (cancelled) return;
        setProducts(productsRes.items);
        setSuppliers(suppliersRes.items);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const set =
    (key: keyof PurchaseFormState) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  // Line item helpers
  const addRow = () => setLineItems((prev) => [...prev, emptyRow()]);

  const removeRow = (idx: number) =>
    setLineItems((prev) => prev.filter((_, i) => i !== idx));

  const updateRow = (idx: number, field: keyof LineItemRow, value: string) =>
    setLineItems((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row)),
    );

  const handleProductSelect = (idx: number, productId: string) => {
    const product = products.find((p) => p._id === productId);
    if (product) {
      setLineItems((prev) =>
        prev.map((row, i) =>
          i === idx
            ? {
                ...row,
                productId: product._id,
                name: product.name,
                buyPrice: String(product.buyPrice),
              }
            : row,
        ),
      );
    } else {
      updateRow(idx, "productId", "");
    }
  };

  // Inline add-supplier handlers
  const handleAddSupplier = async () => {
    if (!newSupplierName.trim()) {
      setAddSupplierError("Supplier name is required");
      return;
    }
    setAddingSupplier(true);
    setAddSupplierError("");
    try {
      const created = await apiRequest<SupplierOption>("/api/suppliers", {
        method: "POST",
        body: JSON.stringify({ name: newSupplierName.trim() }),
      });
      setSuppliers((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setForm((f) => ({ ...f, supplier: created.name }));
      setNewSupplierName("");
      setShowAddSupplier(false);
    } catch (err) {
      setAddSupplierError(
        err instanceof ApiError ? err.message : "Failed to add supplier",
      );
    } finally {
      setAddingSupplier(false);
    }
  };

  // Inline add-product handlers
  const openAddProduct = (rowIndex: number) => {
    setAddProductTargetIndex(rowIndex);
    setNewProduct({ name: "", buyPrice: "", sellPrice: "" });
    setAddProductError("");
    setShowAddProduct(true);
  };

  const cancelAddProduct = () => {
    setShowAddProduct(false);
    setAddProductTargetIndex(null);
    setAddProductError("");
  };

  const handleAddProduct = async () => {
    if (!newProduct.name.trim()) {
      setAddProductError("Product name is required");
      return;
    }
    setAddingProduct(true);
    setAddProductError("");
    try {
      const created = await apiRequest<ProductOption>("/api/products", {
        method: "POST",
        body: JSON.stringify({
          name: newProduct.name.trim(),
          buyPrice: Number(newProduct.buyPrice) || 0,
          sellPrice: Number(newProduct.sellPrice) || 0,
          qty: 0,
          minQty: 0,
          ...(!isEdit && selectedBranchId
            ? { branchId: selectedBranchId }
            : {}),
        }),
      });
      setProducts((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name)),
      );

      if (addProductTargetIndex !== null) {
        setLineItems((prev) =>
          prev.map((row, i) =>
            i === addProductTargetIndex
              ? {
                  ...row,
                  productId: created._id,
                  name: created.name,
                  buyPrice: String(created.buyPrice),
                }
              : row,
          ),
        );
      }
      setShowAddProduct(false);
      setAddProductTargetIndex(null);
    } catch (err) {
      setAddProductError(
        err instanceof ApiError ? err.message : "Failed to add product",
      );
    } finally {
      setAddingProduct(false);
    }
  };

  const lineItemsTotal = lineItems.reduce(
    (sum, li) => sum + (Number(li.qty) || 0) * (Number(li.buyPrice) || 0),
    0,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.supplier.trim()) {
      setError("Supplier is required");
      return;
    }
    const amount = lineItems.length > 0 ? lineItemsTotal : Number(form.amount);
    if (amount < 0) {
      setError("Amount must be 0 or greater");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const sanitizedLineItems: PurchaseLineItem[] = lineItems
        .filter((li) => li.name.trim())
        .map((li) => ({
          productId: li.productId,
          name: li.name.trim(),
          qty: Math.max(1, Number(li.qty) || 1),
          buyPrice: Math.max(0, Number(li.buyPrice) || 0),
        }));

      const body = {
        supplier: form.supplier.trim(),
        description: form.description.trim(),
        amount,
        status: form.status as PurchaseStatus,
        date: form.date,
        lineItems: sanitizedLineItems,
        ...(!isEdit && { branchId: selectedBranchId || undefined }),
      };

      const saved = isEdit
        ? await apiRequest<Purchase>(`/api/purchases/${purchase._id}`, {
            method: "PUT",
            body: JSON.stringify(body),
          })
        : await apiRequest<Purchase>("/api/purchases", {
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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-[15px] font-semibold text-slate-800">
            {isEdit ? "Edit Purchase Order" : "New Purchase Order"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <FormField label="Supplier" required>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <select
                  className={`${inputClass} flex-1`}
                  value={form.supplier}
                  onChange={set("supplier")}
                >
                  <option value="">— Select supplier —</option>
                  {/* Keep current value selectable even if not in list (e.g. deleted supplier) */}
                  {form.supplier && !suppliers.find((s) => s.name === form.supplier) && (
                    <option value={form.supplier}>{form.supplier}</option>
                  )}
                  {suppliers.map((s) => (
                    <option key={s._id} value={s.name}>{s.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => { setShowAddSupplier((v) => !v); setAddSupplierError(""); }}
                  title="Add new supplier"
                  className="p-1.5 rounded-md border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition flex-shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {showAddSupplier && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <input
                      autoFocus
                      className={`${inputClass} flex-1`}
                      placeholder="New supplier name"
                      value={newSupplierName}
                      onChange={(e) => setNewSupplierName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { e.preventDefault(); handleAddSupplier(); }
                        if (e.key === "Escape") { setShowAddSupplier(false); setNewSupplierName(""); }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddSupplier}
                      disabled={addingSupplier || !newSupplierName.trim()}
                      className="text-[12px] px-2.5 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition flex-shrink-0"
                    >
                      {addingSupplier ? "…" : "Add"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowAddSupplier(false); setNewSupplierName(""); }}
                      className="p-1.5 rounded-md border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition flex-shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {addSupplierError && (
                    <p className="text-[11px] text-red-500">{addSupplierError}</p>
                  )}
                </div>
              )}
            </div>
          </FormField>

          <FormField label="Description">
            <textarea
              className={`${inputClass} resize-none`}
              rows={2}
              value={form.description}
              onChange={set("description")}
              placeholder="Optional notes about this order"
            />
          </FormField>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Line Items
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

            {lineItems.length > 0 && (
              <div className="border border-slate-200 rounded-lg overflow-hidden mb-2">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                        Product
                      </th>
                      <th className="text-left px-2 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wide w-28">
                        Qty
                      </th>
                      <th className="text-left px-2 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wide w-36">
                        Buy Price (UGX)
                      </th>
                      <th className="text-left px-2 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wide w-32">
                        Subtotal
                      </th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lineItems.map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-1.5">
                          <div className="flex items-center gap-1">
                            <select
                              className={`${inputClass} py-1.5`}
                              value={row.productId}
                              onChange={(e) =>
                                handleProductSelect(idx, e.target.value)
                              }
                            >
                              <option value="">— Select product —</option>
                              {products.map((p) => (
                                <option key={p._id} value={p._id}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => openAddProduct(idx)}
                              title="Add new product"
                              className="p-1.5 rounded-md border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition flex-shrink-0"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            className={`${inputClass} py-1.5`}
                            type="number"
                            min="1"
                            value={row.qty}
                            onChange={(e) =>
                              updateRow(idx, "qty", e.target.value)
                            }
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            className={`${inputClass} py-1.5`}
                            type="number"
                            min="0"
                            value={row.buyPrice}
                            onChange={(e) =>
                              updateRow(idx, "buyPrice", e.target.value)
                            }
                          />
                        </td>
                        <td className="px-2 py-1.5 text-[12px] text-slate-600 tabular-nums whitespace-nowrap">
                          {(
                            (Number(row.qty) || 0) * (Number(row.buyPrice) || 0)
                          ).toLocaleString()}
                        </td>
                        <td className="px-2 py-1.5 text-right">
                          <button
                            type="button"
                            onClick={() => removeRow(idx)}
                            className="p-1 text-slate-400 hover:text-red-500 transition rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 border-t border-slate-200">
                      <td
                        colSpan={3}
                        className="px-3 py-2 text-[11px] font-semibold text-slate-500 text-right uppercase tracking-wide"
                      >
                        Total
                      </td>
                      <td className="px-2 py-2 text-[12px] font-semibold text-slate-800 tabular-nums whitespace-nowrap">
                        UGX {lineItemsTotal.toLocaleString()}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Inline add-product form */}
            {showAddProduct && (
              <div className="border border-blue-200 bg-blue-50 rounded-lg p-3 space-y-2">
                <p className="text-[11px] font-semibold text-blue-700 uppercase tracking-wide">
                  New Product
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-3">
                    <input
                      autoFocus
                      className={inputClass}
                      placeholder="Product name *"
                      value={newProduct.name}
                      onChange={(e) =>
                        setNewProduct((p) => ({ ...p, name: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddProduct();
                        }
                        if (e.key === "Escape") cancelAddProduct();
                      }}
                    />
                  </div>
                  <input
                    className={inputClass}
                    type="number"
                    min="0"
                    placeholder="Buy price"
                    value={newProduct.buyPrice}
                    onChange={(e) =>
                      setNewProduct((p) => ({ ...p, buyPrice: e.target.value }))
                    }
                  />
                  <input
                    className={inputClass}
                    type="number"
                    min="0"
                    placeholder="Sell price"
                    value={newProduct.sellPrice}
                    onChange={(e) =>
                      setNewProduct((p) => ({
                        ...p,
                        sellPrice: e.target.value,
                      }))
                    }
                  />
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={handleAddProduct}
                      disabled={addingProduct || !newProduct.name.trim()}
                      className="flex-1 text-[12px] px-2.5 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition"
                    >
                      {addingProduct ? "…" : "Add"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelAddProduct}
                      className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-400 hover:text-slate-600 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {addProductError && (
                  <p className="text-[11px] text-red-500">{addProductError}</p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Amount (UGX)" required>
              <input
                className={`${inputClass} ${lineItems.length > 0 ? "bg-slate-50 text-slate-500 cursor-default" : ""}`}
                type="number"
                min="0"
                value={lineItems.length > 0 ? lineItemsTotal : form.amount}
                onChange={lineItems.length > 0 ? undefined : set("amount")}
                readOnly={lineItems.length > 0}
                placeholder="0"
              />
              {lineItems.length > 0 && (
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Auto-calculated from line items
                </p>
              )}
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Status">
                <select
                  className={inputClass}
                  value={form.status}
                  onChange={set("status")}
                >
                  {PURCHASE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Date">
                <HeroDatePicker
                  value={form.date}
                  onChange={(iso) => setForm((f) => ({ ...f, date: iso }))}
                />
              </FormField>
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
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Purchase"}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}
