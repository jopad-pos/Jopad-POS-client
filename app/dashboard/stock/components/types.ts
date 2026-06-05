export type StockStatus = "OK" | "Low" | "Critical" | "Out";

export interface Product {
  _id: string;
  name: string;
  category: string;
  sku?: string;
  qty: number;
  minQty: number;
  buyPrice: number;
  sellPrice: number;
  barcode?: string;
  description?: string;
  status: StockStatus;
}

export interface StatsData {
  total: number;
  totalValue: number;
  outOfStock: number;
  lowOrCritical: number;
}

export interface Movement {
  _id: string;
  type: "in" | "out" | "adjustment" | "sale" | "purchase";
  qty: number;
  previousQty: number;
  newQty: number;
  note: string;
  createdBy?: { name: string; email: string };
  createdAt: string;
}

export interface ProductFormState {
  name: string;
  category: string;
  sku: string;
  qty: string;
  minQty: string;
  buyPrice: string;
  sellPrice: string;
  barcode: string;
  description: string;
}

export const emptyForm = (): ProductFormState => ({
  name: "",
  category: "",
  sku: "",
  qty: "",
  minQty: "",
  buyPrice: "",
  sellPrice: "",
  barcode: "",
  description: "",
});

export const statusConfig: Record<StockStatus, { label: string; class: string; dot: string }> = {
  OK: { label: "In Stock", class: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  Low: { label: "Low Stock", class: "bg-amber-50 text-amber-700", dot: "bg-amber-400" },
  Critical: { label: "Critical", class: "bg-red-50 text-red-600", dot: "bg-red-500" },
  Out: { label: "Out of Stock", class: "bg-slate-100 text-slate-500", dot: "bg-slate-300" },
};

export const movementTypeLabel: Record<string, string> = {
  in: "Stock In",
  out: "Stock Out",
  adjustment: "Adjustment",
  sale: "Sale",
  purchase: "Purchase",
};

export function exportCSV(products: Product[]) {
  const header = ["Name", "SKU", "Category", "Qty", "Min Qty", "Buy Price", "Sell Price", "Status"];
  const rows = products.map((p) => [
    `"${p.name}"`,
    p.sku || "",
    `"${p.category}"`,
    p.qty,
    p.minQty,
    p.buyPrice,
    p.sellPrice,
    p.status,
  ]);
  const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "stock-list.csv";
  a.click();
  URL.revokeObjectURL(url);
}
