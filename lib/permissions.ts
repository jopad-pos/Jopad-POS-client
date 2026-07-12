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
  { key: "restaurant", label: "Restaurant" },
  { key: "staff", label: "Staff Mgmt" },
  { key: "transfers", label: "Stock Transfers" },
] as const;

/**
 * "branches" is plan-gated but owner-only, so it is not part of FEATURES
 * (which drives the staff-permission matrix in Settings).
 */
export type FeatureKey = (typeof FEATURES)[number]["key"] | "branches";

export type PlanTier = "Standard" | "Plus" | "Enterprise";

/** Features that are gated by plan (not available on every tier). */
export const PLAN_GATED_FEATURES: Partial<Record<FeatureKey, PlanTier>> = {
  invoices: "Plus",
  quotations: "Plus",
  accounting: "Plus",
  labels: "Plus",
  hotel: "Enterprise",
  restaurant: "Enterprise",
  branches: "Enterprise",
  transfers: "Enterprise",
};

export const DEFAULT_STAFF_PERMISSIONS: Record<StaffRole, FeatureKey[]> = {
  Manager: ["sales", "stock", "services", "purchases", "customers", "suppliers", "reports", "invoices", "quotations", "accounting", "labels", "hotel", "restaurant", "staff", "transfers"],
  Cashier: ["sales", "customers"],
  "Stock Manager": ["stock", "purchases", "suppliers", "labels", "transfers"],
  Accountant: ["sales", "reports", "invoices", "quotations", "accounting"],
  "Sales Rep": ["sales", "services", "customers", "quotations"],
};
