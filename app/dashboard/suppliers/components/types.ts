export type SupplierStatus = "Active" | "Inactive";

export interface Supplier {
  _id: string;
  ref: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  categories: string[];
  status: SupplierStatus;
  notes: string;
  createdAt: string;
}

export interface SupplierStats {
  total: number;
  active: number;
  inactive: number;
}

export interface SupplierFormState {
  name: string;
  contact: string;
  phone: string;
  email: string;
  categories: string;
  status: SupplierStatus;
  notes: string;
}

export const SUPPLIER_STATUSES: SupplierStatus[] = ["Active", "Inactive"];

export const supplierStatusConfig: Record<SupplierStatus, { class: string; dot: string }> = {
  Active:   { class: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  Inactive: { class: "bg-slate-100 text-slate-500",    dot: "bg-slate-300"   },
};

export function emptySupplierForm(): SupplierFormState {
  return {
    name: "",
    contact: "",
    phone: "",
    email: "",
    categories: "",
    status: "Active",
    notes: "",
  };
}

export function supplierToForm(s: Supplier): SupplierFormState {
  return {
    name: s.name,
    contact: s.contact,
    phone: s.phone,
    email: s.email,
    categories: s.categories.join(", "),
    status: s.status,
    notes: s.notes,
  };
}

export function parseCategories(raw: string): string[] {
  return raw
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}
