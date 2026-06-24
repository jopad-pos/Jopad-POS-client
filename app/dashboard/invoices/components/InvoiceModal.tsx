"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Plus, Trash2, UserPlus } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import {
  Invoice,
  InvoiceStatus,
  ModalOverlay,
  FormField,
  inputClass,
  fmtDateInput,
} from "./shared";

// ── Local option types ────────────────────────────────────────────────────────

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

// ── Form state ────────────────────────────────────────────────────────────────

interface FormState {
  customerId: string;
  customerName: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  notes: string;
  lineItems: LineItemDraft[];
}

function emptyForm(): FormState {
  return {
    customerId: "",
    customerName: "",
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: "",
    status: "Draft",
    notes: "",
    lineItems: [{ productId: "", name: "", qty: "1", unitPrice: "" }],
  };
}

function invoiceToForm(inv: Invoice): FormState {
  return {
    customerId: inv.customerId ?? "",
    customerName: inv.customer,
    issueDate: fmtDateInput(inv.issueDate),
    dueDate: fmtDateInput(inv.dueDate),
    status: inv.status,
    notes: inv.notes ?? "",
    lineItems: inv.lineItems?.length
      ? inv.lineItems.map((li) => ({
          productId: li.productId ?? "",
          name: li.name,
          qty: String(li.qty),
          unitPrice: String(li.unitPrice),
        }))
      : [{ productId: "", name: "", qty: "1", unitPrice: "" }],
  };
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  invoice?: Invoice | null;
  onClose: () => void;
  onSaved: (inv: Invoice) => void;
}

// ── Row input style ───────────────────────────────────────────────────────────

const rowInput =
  "w-full px-2 py-1.5 text-[12px] border border-slate-200 rounded bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition";

// ── Component ─────────────────────────────────────────────────────────────────

export default function InvoiceModal({ invoice, onClose, onSaved }: Props) {
  const isEdit = !!invoice;

  const [form, setForm] = useState<FormState>(
    isEdit ? invoiceToForm(invoice!) : emptyForm()
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadingInvoice, setLoadingInvoice] = useState(
    isEdit && !invoice!.lineItems?.length
  );

  // ── Data: customers + products ──────────────────────────────────────────────
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

  // Fetch full invoice (with lineItems) if we only have the list-view stub
  useEffect(() => {
    if (!isEdit || invoice!.lineItems?.length) return;
    apiRequest<Invoice>(`/api/invoices/${invoice!._id}`)
      .then((full) => setForm(invoiceToForm(full)))
      .catch(() => {})
      .finally(() => setLoadingInvoice(false));
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category).filter(Boolean))).sort(),
    [products]
  );

  // ── Inline "add customer" sub-form ─────────────────────────────────────────
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

  // ── Line item helpers ───────────────────────────────────────────────────────

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

  // ── Submit ──────────────────────────────────────────────────────────────────

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
        dueDate: form.dueDate || null,
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
        ? await apiRequest<Invoice>(`/api/invoices/${invoice!._id}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          })
        : await apiRequest<Invoice>("/api/invoices", {
            method: "POST",
            body: JSON.stringify(payload),
          });
      onSaved(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save invoice");
    } finally {
      setSaving(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-[14px] font-semibold text-slate-900">
            {isEdit ? `Edit ${invoice!.ref}` : "New Invoice"}
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

            {/* Customer + Status */}
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

                {/* Inline add customer sub-form */}
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
                    setForm((prev) => ({ ...prev, status: e.target.value as InvoiceStatus }))
                  }
                >
                  <option>Draft</option>
                  <option>Sent</option>
                  <option>Paid</option>
                  <option>Overdue</option>
                </select>
              </FormField>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Issue Date">
                <input
                  type="date"
                  className={inputClass}
                  value={form.issueDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, issueDate: e.target.value }))}
                />
              </FormField>
              <FormField label="Due Date">
                <input
                  type="date"
                  className={inputClass}
                  value={form.dueDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                />
              </FormField>
            </div>

            {/* Line Items */}
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
                {/* Column headers */}
                <div className="grid grid-cols-[1fr_52px_110px_80px_28px] gap-2 bg-slate-50 border-b border-slate-200 px-3 py-1.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Item</span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide text-center">Qty</span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide text-right">Unit Price</span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide text-right">Total</span>
                  <span />
                </div>

                {/* Rows */}
                <div className="divide-y divide-slate-50 max-h-52 overflow-y-auto">
                  {loadingInvoice ? (
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
                        {/* Product dropdown — placeholder shows existing name when no productId */}
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
                          {/* Products with no category */}
                          {products.filter((p) => !p.category).map((p) => (
                            <option key={p._id} value={p._id}>{p.name}</option>
                          ))}
                        </select>

                        {/* Qty */}
                        <input
                          className={`${rowInput} text-center`}
                          type="number"
                          min="1"
                          placeholder="1"
                          value={li.qty}
                          onChange={(e) => updateLineItem(idx, "qty", e.target.value)}
                        />

                        {/* Unit price — editable even after auto-population */}
                        <input
                          className={`${rowInput} text-right`}
                          type="number"
                          min="0"
                          placeholder="0"
                          value={li.unitPrice}
                          onChange={(e) => updateLineItem(idx, "unitPrice", e.target.value)}
                        />

                        {/* Line total */}
                        <span className="text-[12px] text-slate-600 tabular-nums text-right pr-1">
                          {lineTotal > 0 ? lineTotal.toLocaleString() : "—"}
                        </span>

                        {/* Remove */}
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

                {/* Total footer */}
                <div className="border-t border-slate-200 bg-slate-50 flex items-center justify-between px-3 py-2">
                  <span className="text-[12px] font-semibold text-slate-600">Total</span>
                  <span className="text-[14px] font-bold text-slate-900 tabular-nums">
                    UGX {total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <FormField label="Notes">
              <textarea
                className={`${inputClass} resize-none`}
                rows={2}
                placeholder="Optional notes or payment terms…"
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </FormField>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100 shrink-0">
            <button type="button" onClick={onClose} className="px-3.5 py-1.5 text-[12px] text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition">
              Cancel
            </button>
            <button type="submit" disabled={saving || loadingInvoice} className="px-4 py-1.5 text-[12px] font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-md transition">
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Invoice"}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}
