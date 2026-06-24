"use client";

export type QuotationStatus = "Draft" | "Sent" | "Accepted" | "Declined" | "Expired";

export interface LineItem {
  productId?: string | null;
  name: string;
  qty: number;
  unitPrice: number;
}

export interface Quotation {
  _id: string;
  ref: string;
  customer: string;
  customerId?: string | null;
  issueDate: string;
  validUntil?: string | null;
  status: QuotationStatus;
  items: number;
  amount: number;
  notes?: string;
  lineItems?: LineItem[];
}

export interface QuotationStats {
  total: number;
  pendingCount: number;
  acceptedCount: number;
  acceptedValue: number;
  monthName: string;
}

export const statusConfig: Record<QuotationStatus, string> = {
  Accepted: "bg-emerald-50 text-emerald-700",
  Sent: "bg-blue-50 text-blue-700",
  Draft: "bg-slate-100 text-slate-500",
  Declined: "bg-red-50 text-red-700",
  Expired: "bg-amber-50 text-amber-700",
};

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-UG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function fmtDateInput(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 10);
}

export const inputClass =
  "w-full px-3 py-2 text-[13px] border border-slate-200 rounded-md bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";

export function ModalOverlay({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {children}
    </div>
  );
}

export function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
