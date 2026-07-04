export const STAFF_ROLES = [
  "Manager",
  "Cashier",
  "Stock Manager",
  "Accountant",
  "Sales Rep",
] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

export const FEATURES = [
  { key: "sales", label: "Sales" },
  { key: "stock", label: "Stock" },
  { key: "services", label: "Services" },
  { key: "purchases", label: "Purchases" },
  { key: "customers", label: "Customers" },
  { key: "suppliers", label: "Suppliers" },
  { key: "reports", label: "Reports" },
  { key: "invoices", label: "Invoices" },
  { key: "quotations", label: "Quotations" },
  { key: "accounting", label: "Accounting" },
  { key: "labels", label: "Labels & Barcodes" },
  { key: "hotel", label: "Hotel" },
  { key: "staff", label: "Staff Mgmt" },
] as const;

export type FeatureKey = (typeof FEATURES)[number]["key"];

export type PlanTier = "Standard" | "Plus" | "Enterprise";

/** Features that are gated by plan (not available on every tier). */
export const PLAN_GATED_FEATURES: Partial<Record<FeatureKey, PlanTier>> = {
  invoices: "Plus",
  quotations: "Plus",
  accounting: "Plus",
  labels: "Plus",
  hotel: "Enterprise",
};

export const DEFAULT_STAFF_PERMISSIONS: Record<StaffRole, FeatureKey[]> = {
  Manager: ["sales", "stock", "services", "purchases", "customers", "suppliers", "reports", "invoices", "quotations", "accounting", "labels", "hotel", "staff"],
  Cashier: ["sales", "customers"],
  "Stock Manager": ["stock", "purchases", "suppliers", "labels"],
  Accountant: ["sales", "reports", "invoices", "quotations", "accounting"],
  "Sales Rep": ["sales", "services", "customers", "quotations"],
};
