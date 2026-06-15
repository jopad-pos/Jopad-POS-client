export type PayMethod = "Cash" | "Mobile Money" | "Card" | "Credit";

export interface SaleLineItem {
  productId?: string;
  name: string;
  qty: number;
  unitPrice: number;
}

export interface Sale {
  _id: string;
  ref: string;
  customer: string;
  cashier: string;
  items: number;
  amount: number;
  method: PayMethod;
  date: string;
  lineItems?: SaleLineItem[];
}

export const methodStyles: Record<PayMethod, string> = {
  Cash: "bg-slate-100 text-slate-600",
  "Mobile Money": "bg-purple-50 text-purple-700",
  Card: "bg-blue-50 text-blue-700",
  Credit: "bg-amber-50 text-amber-700",
};

export function formatSaleTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yestStart = new Date(todayStart);
  yestStart.setDate(yestStart.getDate() - 1);
  const saleDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (saleDay.getTime() === todayStart.getTime()) {
    return d.toLocaleTimeString("en-UG", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
  if (saleDay.getTime() === yestStart.getTime()) return "Yesterday";
  return d.toLocaleDateString("en-UG", { month: "short", day: "numeric" });
}

export function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}
