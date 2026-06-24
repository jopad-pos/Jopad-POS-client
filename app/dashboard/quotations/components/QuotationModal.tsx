"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Plus, Trash2, UserPlus } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import {
  Quotation,
  QuotationStatus,
  ModalOverlay,
  FormField,
  inputClass,
  fmtDateInput,
} from "./shared";

interface CustomerOption {
  _id: string;
  name: string;
  phone: string;
}

interface ProductOption {
  _id: string;
  name: string;
  category: string;
  sellPrice: number;
  qty: number;
}

interface LineItemDraft {
  productId: string;
  name: string;
  qty: string;
  unitPrice: string;
}

interface FormState {
  customerId: string;
  customerName: string;
  issueDate: string;
  validUntil: string;
  status: QuotationStatus;
  notes: string;
  lineItems: LineItemDraft[];
}

function emptyForm(): FormState {
  return {
    customerId: "",
    customerName: "",
    issueDate: new Date().toISOString().slice(0, 10),
    validUntil: "",
    status: "Draft",
    notes: "",
    lineItems: [{ productId: "", name: "", qty: "1", unitPrice: "" }],
  };
}

function quotationToForm(q: Quotation): FormState {
  return {
    customerId: q.customerId ?? "",
    customerName: q.customer,
    issueDate: fmtDateInput(q.issueDate),
    validUntil: fmtDateInput(q.validUntil),
    status: q.status,
    notes: q.notes ?? "",
    lineItems: q.lineItems?.length
      ? q.lineItems.map((li) => ({
          productId: li.productId ?? "",
          name: li.name,
          qty: String(li.qty),
          unitPrice: String(li.unitPrice),
        }))
      : [{ productId: "", name: "", qty: "1", unitPrice: "" }],
  };
}

interface Props {
  quotation?: Quotation | null;
  onClose: () => void;
  onSaved: (q: Quotation) => void;
}

const rowInput =
  "w-full px-2 py-1.5 text-[12px] border border-slate-200 rounded bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition";

export default function QuotationModal({ quotation, onClose, onSaved }: Props) {
  const isEdit = !!quotation;

  const [form, setForm] = useState<FormState>(
    isEdit ? quotationToForm(quotation!) : emptyForm()
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadingFull, setLoadingFull] = useState(
    isEdit && !quotation!.lineItems?.length
  );

  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);

  useEffect(() => {
    apiRequest<{ items: CustomerOption[] }>("/api/customers?limit=500&status=Active")
      .then((r) => setCustomers(r.items))
      .catch(() => {});
    apiRequest<{ items: ProductOption[] }>("/api/products?limit=500")
      .then((r) => setProducts(r.items))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit || quotation!.lineItems?.length) return;
    apiRequest<Quotation>(`/api/quotations/${quotation!._id}`)
      .then((full) => setForm(quotationToForm(full)))
      .catch(() => {})
      .finally(() => setLoadingFull(false));
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category).filter(Boolean))).sort(),
    [products]
  );

  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [addingCust, setAddingCust] = useState(false);
  const [addCustError, setAddCustError] = useState("");

  async function handleAddCustomer() {
    if (!newCustName.trim()) { setAddCustError("Name is required"); return; }
    setAddingCust(true);
    setAddCustError("");
    try {
      const created = await apiRequest<CustomerOption>("/api/customers", {
        method: "POST",
        body: JSON.stringify({ name: newCustName.trim(), phone: newCustPhone.trim() }),
      });
      setCustomers((prev) => [created, ...prev]);
      setForm((prev) => ({ ...prev, customerId: created._id, customerName: created.name }));
      setShowAddCustomer(false);
      setNewCustName("");
      setNewCustPhone("");
    } catch (err) {
      setAddCustError(err instanceof ApiError ? err.message : "Failed to add customer");
    } finally {
      setAddingCust(false);
    }
  }

  function selectProduct(idx: number, productId: string) {
    const product = products.find((p) => p._id === productId);
    setForm((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((li, i) =>
        i !== idx
          ? li
          : product
          ? { ...li, productId: product._id, name: product.name, unitPrice: String(product.sellPrice) }
          : { ...li, productId: "", name: "", unitPrice: "" }
      ),
    }));
  }

  function updateLineItem(idx: number, field: keyof LineItemDraft, value: string) {
    setForm((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((li, i) => (i === idx ? { ...li, [field]: value } : li)),
    }));
  }

  function addLine() {
    setForm((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, { productId: "", name: "", qty: "1", unitPrice: "" }],
    }));
  }

  function removeLine(idx: number) {
    setForm((prev) => ({ ...prev, lineItems: prev.lineItems.filter((_, i) => i !== idx) }));
  }

  const total = form.lineItems.reduce(
    (sum, li) => sum + (Number(li.qty) || 0) * (Number(li.unitPrice) || 0),
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const customerName = form.customerId
      ? (customers.find((c) => c._id === form.customerId)?.name ?? form.customerName)
      : form.customerName.trim();
    if (!customerName) { setError("Customer is required"); return; }

    const validLines = form.lineItems.filter((li) => li.name.trim() || li.productId);
    if (validLines.length === 0) { setError("At least one line item is required"); return; }

    setSaving(true);
    setError("");
    try {
      const payload = {
        customer: customerName,
        customerId: form.customerId || null,
        issueDate: form.issueDate || undefined,
        validUntil: form.validUntil || null,
        status: form.status,
        notes: form.notes.trim(),
        lineItems: validLines.map((li) => ({
          productId: li.productId || null,
          name: li.name.trim(),
          qty: Math.max(1, Number(li.qty) || 1),
          unitPrice: Math.max(0, Number(li.unitPrice) || 0),
        })),
      };
      const saved = isEdit
        ? await apiRequest<Quotation>(`/api/quotations/${quotation!._id}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          })
        : await apiRequest<Quotation>("/api/quotations", {
            method: "POST",
            body: JSON.stringify(payload),
          });
      onSaved(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save quotation");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-[14px] font-semibold text-slate-900">
            {isEdit ? `Edit ${quotation!.ref}` : "New Quotation"}
          </h2>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1">
            {error && (
              <p className="text-[12px] text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    Customer <span className="text-red-500">*</span>
                  </label>
                  {!showAddCustomer && (
                    <button
                      type="button"
                      onClick={() => setShowAddCustomer(true)}
                      className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-medium transition"
                    >
                      <UserPlus className="w-3 h-3" />
                      Add new
                    </button>
                  )}
                </div>
                <select
                  className={inputClass}
                  value={form.customerId}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      customerId: e.target.value,
                      customerName: customers.find((c) => c._id === e.target.value)?.name ?? "",
                    }))
                  }
                >
                  <option value="">Select customer…</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}{c.phone ? ` · ${c.phone}` : ""}
                    </option>
                  ))}
                </select>

                {showAddCustomer && (
                  <div className="mt-2 p-3 border border-blue-200 bg-blue-50 rounded-lg space-y-2">
                    <p className="text-[11px] font-semibold text-blue-700">New customer</p>
                    {addCustError && (
                      <p className="text-[11px] text-red-600">{addCustError}</p>
                    )}
                    <input
                      className={rowInput}
                      placeholder="Full name *"
                      value={newCustName}
                      onChange={(e) => setNewCustName(e.target.value)}
                      autoFocus
                    />
                    <input
                      className={rowInput}
                      placeholder="Phone (optional)"
                      value={newCustPhone}
                      onChange={(e) => setNewCustPhone(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleAddCustomer}
                        disabled={addingCust}
                        className="px-3 py-1 text-[11px] font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded transition"
                      >
                        {addingCust ? "Saving…" : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowAddCustomer(false); setAddCustError(""); }}
                        className="px-3 py-1 text-[11px] text-slate-600 hover:bg-slate-200 rounded transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <FormField label="Status">
                <select
                  className={inputClass}
                  value={form.status}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, status: e.target.value as QuotationStatus }))
                  }
                >
                  <option>Draft</option>
                  <option>Sent</option>
                  <option>Accepted</option>
                  <option>Declined</option>
                  <option>Expired</option>
                </select>
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Issue Date">
                <input
                  type="date"
                  className={inputClass}
                  value={form.issueDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, issueDate: e.target.value }))}
                />
              </FormField>
              <FormField label="Valid Until">
                <input
                  type="date"
                  className={inputClass}
                  value={form.validUntil}
                  onChange={(e) => setForm((prev) => ({ ...prev, validUntil: e.target.value }))}
                />
              </FormField>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  Items <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={addLine}
                  className="flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add item
                </button>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="grid grid-cols-[1fr_52px_110px_80px_28px] gap-2 bg-slate-50 border-b border-slate-200 px-3 py-1.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Item</span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide text-center">Qty</span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide text-right">Unit Price</span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide text-right">Total</span>
                  <span />
                </div>

                <div className="divide-y divide-slate-50 max-h-52 overflow-y-auto">
                  {loadingFull ? (
                    Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="grid grid-cols-[1fr_52px_110px_80px_28px] gap-2 items-center px-3 py-3">
                        <div className="h-6 bg-slate-100 rounded animate-pulse" />
                        <div className="h-6 bg-slate-100 rounded animate-pulse" />
                        <div className="h-6 bg-slate-100 rounded animate-pulse" />
                        <div className="h-6 bg-slate-100 rounded animate-pulse" />
                        <div />
                      </div>
                    ))
                  ) : form.lineItems.map((li, idx) => {
                    const lineTotal = (Number(li.qty) || 0) * (Number(li.unitPrice) || 0);
                    return (
                      <div
                        key={idx}
                        className="grid grid-cols-[1fr_52px_110px_80px_28px] gap-2 items-center px-3 py-2"
                      >
                        <select
                          className={rowInput}
                          value={li.productId}
                          onChange={(e) => selectProduct(idx, e.target.value)}
                        >
                          <option value="">{li.name || "Select item…"}</option>
                          {categories.map((cat) => (
                            <optgroup key={cat} label={cat}>
                              {products
                                .filter((p) => p.category === cat)
                                .map((p) => (
                                  <option key={p._id} value={p._id}>
                                    {p.name}
                                  </option>
                                ))}
                            </optgroup>
                          ))}
                          {products.filter((p) => !p.category).map((p) => (
                            <option key={p._id} value={p._id}>{p.name}</option>
                          ))}
                        </select>

                        <input
                          className={`${rowInput} text-center`}
                          type="number"
                          min="1"
                          placeholder="1"
                          value={li.qty}
                          onChange={(e) => updateLineItem(idx, "qty", e.target.value)}
                        />

                        <input
                          className={`${rowInput} text-right`}
                          type="number"
                          min="0"
                          placeholder="0"
                          value={li.unitPrice}
                          onChange={(e) => updateLineItem(idx, "unitPrice", e.target.value)}
                        />

                        <span className="text-[12px] text-slate-600 tabular-nums text-right pr-1">
                          {lineTotal > 0 ? lineTotal.toLocaleString() : "—"}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeLine(idx)}
                          disabled={form.lineItems.length === 1}
                          className="flex items-center justify-center text-slate-300 hover:text-red-500 disabled:opacity-0 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-slate-200 bg-slate-50 flex items-center justify-between px-3 py-2">
                  <span className="text-[12px] font-semibold text-slate-600">Total</span>
                  <span className="text-[14px] font-bold text-slate-900 tabular-nums">
                    UGX {total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <FormField label="Notes">
              <textarea
                className={`${inputClass} resize-none`}
                rows={2}
                placeholder="Optional notes or terms…"
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </FormField>
          </div>

          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100 shrink-0">
            <button type="button" onClick={onClose} className="px-3.5 py-1.5 text-[12px] text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition">
              Cancel
            </button>
            <button type="submit" disabled={saving || loadingFull} className="px-4 py-1.5 text-[12px] font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-md transition">
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Quotation"}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}
