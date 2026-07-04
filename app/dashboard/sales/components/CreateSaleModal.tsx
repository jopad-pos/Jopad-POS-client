"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import { Sale, PayMethod } from "./types";
import { ModalOverlay, FormField, inputClass } from "./shared";
import { useBranch } from "@/contexts/BranchContext";

interface Product {
  _id: string;
  name: string;
  category: string;
  sellPrice: number;
  qty: number;
}

interface Service {
  _id: string;
  name: string;
  category: string;
  price: number;
}

interface CustomerOption {
  _id: string;
  name: string;
}

interface StaffOption {
  _id: string;
  name: string;
}

interface LineItemDraft {
  productId: string;
  serviceId: string;
  name: string;
  qty: string;
  unitPrice: string;
}

interface Props {
  onClose: () => void;
  onCreated: (sale: Sale) => void;
}

function nowLocalDatetime(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

const blankItem = (): LineItemDraft => ({
  productId: "",
  serviceId: "",
  name: "",
  qty: "1",
  unitPrice: "",
});

const rowInput =
  "w-full px-2 py-1.5 text-[12px] border border-slate-200 rounded bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition";

export default function CreateSaleModal({ onClose, onCreated }: Props) {
  const { selectedBranchId } = useBranch();
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [staffOptions, setStaffOptions] = useState<StaffOption[]>([]);
  const [customer, setCustomer] = useState("");
  const [cashier, setCashier] = useState("");
  const [method, setMethod] = useState<PayMethod>("Cash");
  const [date, setDate] = useState(nowLocalDatetime());
  const [lineItems, setLineItems] = useState<LineItemDraft[]>([blankItem()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  // One key per modal instance: retrying after a network error re-sends the
  // same key, so the API records the sale at most once.
  const idempotencyKeyRef = useRef(crypto.randomUUID());

  useEffect(() => {
    apiRequest<{ items: Product[] }>("/api/products?limit=500")
      .then((res) => setProducts(res.items.filter((p) => p.qty > 0)))
      .catch(() => {});
    apiRequest<{ items: Service[] }>("/api/services?limit=500")
      .then((res) => setServices(res.items))
      .catch(() => {});
    apiRequest<{ items: CustomerOption[] }>("/api/customers?limit=500&status=Active")
      .then((res) => setCustomers(res.items))
      .catch(() => {});
    apiRequest<{ staff: StaffOption[] }>("/api/staff?limit=500")
      .then((res) => setStaffOptions(res.staff))
      .catch(() => {});
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort(),
    [products]
  );

  const total = lineItems.reduce(
    (sum, li) => sum + (Number(li.qty) || 0) * (Number(li.unitPrice) || 0),
    0
  );

  // Option values are prefixed ("p:" product, "s:" service) so both can share one picker
  function selectItem(idx: number, value: string) {
    const product = value.startsWith("p:")
      ? products.find((p) => p._id === value.slice(2))
      : undefined;
    const service = value.startsWith("s:")
      ? services.find((s) => s._id === value.slice(2))
      : undefined;
    setLineItems((prev) =>
      prev.map((li, i) =>
        i !== idx
          ? li
          : product
          ? {
              ...li,
              productId: product._id,
              serviceId: "",
              name: product.name,
              unitPrice: String(product.sellPrice),
            }
          : service
          ? {
              ...li,
              productId: "",
              serviceId: service._id,
              name: service.name,
              unitPrice: String(service.price),
            }
          : { ...li, productId: "", serviceId: "", name: "", unitPrice: "" }
      )
    );
  }

  function updateItem(idx: number, field: keyof LineItemDraft, value: string) {
    setLineItems((prev) =>
      prev.map((li, i) => (i === idx ? { ...li, [field]: value } : li))
    );
  }

  function addItem() {
    setLineItems((prev) => [...prev, blankItem()]);
  }

  function removeItem(idx: number) {
    setLineItems((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validItems = lineItems.filter((li) => li.productId || li.serviceId);
    if (validItems.length === 0) {
      setError("Select at least one product or service.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const sale = await apiRequest<Sale>("/api/sales", {
        method: "POST",
        body: JSON.stringify({
          customer: customer.trim() || "Walk-in Customer",
          cashier: cashier.trim(),
          method,
          date: new Date(date).toISOString(),
          branchId: selectedBranchId || undefined,
          idempotencyKey: idempotencyKeyRef.current,
          lineItems: validItems.map((li) => ({
            productId: li.productId || undefined,
            serviceId: li.serviceId || undefined,
            name: li.name,
            qty: Math.max(1, Number(li.qty) || 1),
            unitPrice: Math.max(0, Number(li.unitPrice) || 0),
          })),
        }),
      });
      onCreated(sale);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-[15px] font-semibold text-slate-800">New Sale</h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
            {error && (
              <div className="text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Customer">
                <select
                  className={inputClass}
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                >
                  <option value="">Walk-in Customer</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Cashier">
                <select
                  className={inputClass}
                  value={cashier}
                  onChange={(e) => setCashier(e.target.value)}
                >
                  <option value="">Select cashier…</option>
                  {staffOptions.map((s) => (
                    <option key={s._id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Payment Method" required>
                <select
                  className={inputClass}
                  value={method}
                  onChange={(e) => setMethod(e.target.value as PayMethod)}
                >
                  <option>Cash</option>
                  <option>Mobile Money</option>
                  <option>Card</option>
                  <option>Credit</option>
                </select>
              </FormField>
              <FormField label="Date & Time">
                <input
                  className={inputClass}
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </FormField>
            </div>

            {/* Line items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  Items <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Item
                </button>
              </div>

              <div className="rounded-lg border border-slate-200 overflow-hidden">
                {/* Column headers */}
                <div className="grid grid-cols-[1fr_52px_100px_76px_28px] gap-2 bg-slate-50 border-b border-slate-200 px-3 py-1.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                    Item
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide text-center">
                    Qty
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide text-right">
                    Unit Price
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide text-right">
                    Total
                  </span>
                  <span />
                </div>

                {/* Rows */}
                <div className="divide-y divide-slate-50 max-h-52 overflow-y-auto">
                  {lineItems.map((li, idx) => {
                    const lineTotal =
                      (Number(li.qty) || 0) * (Number(li.unitPrice) || 0);
                    return (
                      <div
                        key={idx}
                        className="grid grid-cols-[1fr_52px_100px_76px_28px] gap-2 items-center px-3 py-2"
                      >
                        <select
                          className={rowInput}
                          value={
                            li.productId
                              ? `p:${li.productId}`
                              : li.serviceId
                              ? `s:${li.serviceId}`
                              : ""
                          }
                          onChange={(e) => selectItem(idx, e.target.value)}
                        >
                          <option value="">Select item…</option>
                          {categories.map((cat) => (
                            <optgroup key={cat} label={cat}>
                              {products
                                .filter((p) => p.category === cat)
                                .map((p) => (
                                  <option key={p._id} value={`p:${p._id}`}>
                                    {p.name}
                                  </option>
                                ))}
                            </optgroup>
                          ))}
                          {services.length > 0 && (
                            <optgroup label="Services">
                              {services.map((s) => (
                                <option key={s._id} value={`s:${s._id}`}>
                                  {s.name}
                                </option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                        <input
                          className={`${rowInput} text-center`}
                          type="number"
                          min="1"
                          placeholder="1"
                          value={li.qty}
                          onChange={(e) => updateItem(idx, "qty", e.target.value)}
                        />
                        <input
                          className={`${rowInput} text-right`}
                          type="number"
                          min="0"
                          placeholder="0"
                          value={li.unitPrice}
                          onChange={(e) =>
                            updateItem(idx, "unitPrice", e.target.value)
                          }
                        />
                        <span className="text-[12px] text-slate-600 tabular-nums text-right pr-1">
                          {lineTotal > 0 ? lineTotal.toLocaleString() : "—"}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          disabled={lineItems.length === 1}
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
                  <span className="text-[12px] font-semibold text-slate-600">
                    Total
                  </span>
                  <span className="text-[14px] font-bold text-slate-900 tabular-nums">
                    UGX {total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-100 shrink-0">
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
              {saving ? "Creating…" : "Create Sale"}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}
