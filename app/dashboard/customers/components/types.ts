export type CustomerType = "Regular" | "Occasional" | "New";

export interface Customer {
  _id: string;
  ref: string;
  name: string;
  phone: string;
  email: string;
  visits: number;
  totalSpent: number;
  creditBalance: number;
  overdueCredit: boolean;
  lastVisit: string | null;
  notes: string;
  status: "Active" | "Inactive";
  createdAt: string;
}

export interface CustomerStats {
  total: number;
  regular: number;
  creditAccounts: number;
  overdueCredit: number;
}

export interface CustomerFormState {
  name: string;
  phone: string;
  email: string;
  notes: string;
  creditBalance: string;
  overdueCredit: boolean;
}

export function emptyCustomerForm(): CustomerFormState {
  return { name: "", phone: "", email: "", notes: "", creditBalance: "0", overdueCredit: false };
}

export function customerToForm(c: Customer): CustomerFormState {
  return {
    name: c.name,
    phone: c.phone,
    email: c.email,
    notes: c.notes,
    creditBalance: String(c.creditBalance),
    overdueCredit: c.overdueCredit,
  };
}

export function getCustomerType(visits: number): CustomerType {
  if (visits >= 15) return "Regular";
  if (visits >= 5) return "Occasional";
  return "New";
}

export function formatLastVisit(date: string | null): string {
  if (!date) return "Never";
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-UG", { month: "short", day: "numeric" });
}

export const typeStyles: Record<CustomerType, string> = {
  Regular: "bg-blue-50 text-blue-700",
  Occasional: "bg-slate-100 text-slate-600",
  New: "bg-emerald-50 text-emerald-700",
};
