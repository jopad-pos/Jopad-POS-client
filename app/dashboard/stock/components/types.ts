export type StockStatus = "OK" | "Low" | "Critical" | "Out";

export const UNIT_OPTIONS = ["pcs", "kg", "g", "litre", "ml", "box", "carton", "pack", "dozen"];

export interface CategoryRef {
  _id: string;
  name: string;
}

export interface SupplierRef {
  _id: string;
  name: string;
  ref?: string;
}

export interface Product {
  _id: string;
  name: string;
  category: string; // populated category name, for display
  categoryId?: CategoryRef | null;
  supplierId?: SupplierRef | null;
  sku?: string;
  qty: number;
  minQty: number;
  reorderQty: number;
  unit: string;
  buyPrice: number;
  sellPrice: number;
  taxRate: number;
  barcode?: string;
  description?: string;
  expiryDate?: string | null;
  batchNumber?: string;
  status: StockStatus;
}

export interface StatsData {
  total: number;
  totalValue: number;
  outOfStock: number;
  lowOrCritical: number;
}

export interface PendingPurchaseRef {
  status: "Received" | "Pending" | "Partial";
  lineItems?: { productId?: string | null }[];
}

export interface Movement {
  _id: string;
  type: "in" | "out" | "adjustment" | "sale" | "purchase" | "damaged" | "transfer_out" | "transfer_in";
  reason?: string;
  qty: number;
  previousQty: number;
  newQty: number;
  note: string;
  createdBy?: { name: string; email: string };
  createdAt: string;
}

export const DAMAGE_REASONS = ["Breakage", "Expired", "Theft/Loss", "Other"] as const;

export interface ProductFormState {
  name: string;
  categoryId: string;
  supplierId: string;
  sku: string;
  qty: string;
  minQty: string;
  reorderQty: string;
  unit: string;
  buyPrice: string;
  sellPrice: string;
  taxRate: string;
  barcode: string;
  description: string;
  expiryDate: string;
  batchNumber: string;
}

export const emptyForm = (): ProductFormState => ({
  name: "",
  categoryId: "",
  supplierId: "",
  sku: "",
  qty: "",
  minQty: "",
  reorderQty: "",
  unit: "pcs",
  buyPrice: "",
  sellPrice: "",
  taxRate: "",
  barcode: "",
  description: "",
  expiryDate: "",
  batchNumber: "",
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
  damaged: "Damaged",
  transfer_out: "Transferred Out",
  transfer_in: "Transferred In",
};

export function exportCSV(products: Product[]) {
  const header = [
    "Name",
    "SKU",
    "Category",
    "Supplier",
    "Qty",
    "Unit",
    "Min Qty",
    "Reorder Qty",
    "Buy Price",
    "Sell Price",
    "Tax Rate",
    "Expiry Date",
    "Batch Number",
    "Status",
  ];
  const rows = products.map((p) => [
    `"${p.name}"`,
    p.sku || "",
    `"${p.category}"`,
    `"${p.supplierId?.name || ""}"`,
    p.qty,
    p.unit,
    p.minQty,
    p.reorderQty,
    p.buyPrice,
    p.sellPrice,
    p.taxRate,
    p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : "",
    p.batchNumber || "",
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
