export type PurchaseStatus = "Received" | "Pending" | "Partial";

export interface PurchaseLineItem {
  productId: string;
  name: string;
  qty: number;
  buyPrice: number;
}

export interface Purchase {
  _id: string;
  ref: string;
  supplier: string;
  description: string;
  amount: number;
  status: PurchaseStatus;
  date: string;
  items: number;
  lineItems?: PurchaseLineItem[];
  stockUpdated?: boolean;
}

export interface Expense {
  _id: string;
  ref: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  recorder: string;
}

export interface PurchaseFormState {
  supplier: string;
  description: string;
  items: string;
  amount: string;
  status: PurchaseStatus;
  date: string;
}

export interface ExpenseFormState {
  category: string;
  description: string;
  amount: string;
  date: string;
}

export const PURCHASE_STATUSES: PurchaseStatus[] = ["Received", "Pending", "Partial"];

export const purchaseStatusConfig: Record<PurchaseStatus, { class: string; dot: string }> = {
  Received: { class: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  Pending:  { class: "bg-amber-50 text-amber-700",   dot: "bg-amber-400"  },
  Partial:  { class: "bg-blue-50 text-blue-700",     dot: "bg-blue-500"   },
};

export const EXPENSE_CATEGORIES = [
  "Rent",
  "Utilities",
  "Transport",
  "Cleaning",
  "Repairs",
  "Salaries",
  "Marketing",
  "Insurance",
  "Miscellaneous",
  "Other",
];

export const expenseCategoryColors: Record<string, string> = {
  Rent:          "bg-indigo-50 text-indigo-700",
  Utilities:     "bg-blue-50 text-blue-700",
  Transport:     "bg-sky-50 text-sky-700",
  Cleaning:      "bg-teal-50 text-teal-700",
  Repairs:       "bg-orange-50 text-orange-700",
  Salaries:      "bg-purple-50 text-purple-700",
  Marketing:     "bg-pink-50 text-pink-700",
  Insurance:     "bg-cyan-50 text-cyan-700",
  Miscellaneous: "bg-slate-100 text-slate-600",
  Other:         "bg-slate-100 text-slate-500",
};

export function emptyPurchaseForm(): PurchaseFormState {
  return {
    supplier: "",
    description: "",
    items: "1",
    amount: "",
    status: "Pending",
    date: todayISO(),
  };
}

export function emptyExpenseForm(): ExpenseFormState {
  return { category: "", description: "", amount: "", date: todayISO() };
}

export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export function formatDate(isoOrDisplay: string): string {
  if (!isoOrDisplay) return "";
  // If it doesn't start with a 4-digit year it's already a display string
  if (!/^\d{4}-\d{2}-\d{2}/.test(isoOrDisplay)) return isoOrDisplay;
  const d = new Date(isoOrDisplay);
  if (isNaN(d.getTime())) return isoOrDisplay;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function toInputDate(displayOrISO: string): string {
  if (!displayOrISO) return todayISO();
  // Already in YYYY-MM-DD or YYYY-MM-DDTHH:... form
  if (/^\d{4}-\d{2}-\d{2}/.test(displayOrISO)) return displayOrISO.slice(0, 10);
  const d = new Date(displayOrISO);
  if (isNaN(d.getTime())) return todayISO();
  return d.toISOString().split("T")[0];
}
