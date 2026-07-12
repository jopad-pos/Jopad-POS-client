export interface BranchOption {
  _id: string;
  name: string;
  isHQ?: boolean;
}

export interface ProductOption {
  _id: string;
  name: string;
  sku?: string;
  qty: number;
  unit: string;
}

export interface TransferLineItem {
  productId: string;
  destProductId: string;
  name: string;
  sku?: string;
  unit: string;
  qty: number;
}

export interface StockTransfer {
  _id: string;
  ref: string;
  // null = the client's "unassigned" stock pool (products with no branchId)
  fromBranchId: { _id: string; name: string } | string | null;
  toBranchId: { _id: string; name: string } | string | null;
  items: TransferLineItem[];
  note: string;
  createdBy?: { name: string; email: string } | null;
  createdByName?: string;
  createdAt: string;
}

export function branchName(b: StockTransfer["fromBranchId"]): string {
  if (!b) return "Unassigned Stock";
  return typeof b === "string" ? b : b.name;
}

export function totalQty(t: StockTransfer): number {
  return t.items.reduce((sum, li) => sum + li.qty, 0);
}
