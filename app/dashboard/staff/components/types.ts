export type StaffRole = "Manager" | "Cashier" | "Stock Manager" | "Accountant" | "Sales Rep";

export interface StaffMember {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  staffRole?: StaffRole;
  isActive: boolean;
  createdAt: string;
  branchId?: { _id: string; name: string; location: string } | null;
}

export const ROLES: StaffRole[] = [
  "Manager",
  "Cashier",
  "Stock Manager",
  "Accountant",
  "Sales Rep",
];

export const roleConfig: Record<StaffRole, string> = {
  Manager: "bg-blue-50 text-blue-700",
  "Stock Manager": "bg-indigo-50 text-indigo-700",
  Cashier: "bg-slate-100 text-slate-600",
  Accountant: "bg-purple-50 text-purple-700",
  "Sales Rep": "bg-amber-50 text-amber-700",
};

export function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function formatJoined(iso: string) {
  return new Date(iso).toLocaleDateString("en-UG", {
    month: "short",
    year: "numeric",
  });
}
