export type TableStatus = "available" | "occupied" | "reserved" | "needs-cleaning";
export type KitchenStatus = "pending" | "preparing" | "ready" | "served";
export type OrderStatus = "open" | "closed" | "cancelled";
export type PayMethod = "Cash" | "Mobile Money" | "Card" | "Credit";
export type ReservationType = "reservation" | "waitlist";
export type ReservationStatus = "booked" | "waiting" | "seated" | "cancelled" | "no-show" | "completed";

export interface RestaurantTable {
  _id: string;
  clientId: string;
  branchId: string | null;
  label: string;
  section: string;
  capacity: number;
  status: TableStatus;
  notes: string;
  isActive: boolean;
  createdAt: string;
}

export interface ModifierOption {
  name: string;
  priceDelta: number;
}

export interface ModifierGroup {
  name: string;
  required: boolean;
  multiple: boolean;
  options: ModifierOption[];
}

export interface MenuItem {
  _id: string;
  clientId: string;
  branchId: string | null;
  name: string;
  category: string;
  price: number;
  description: string;
  modifierGroups: ModifierGroup[];
  isActive: boolean;
  createdAt: string;
}

export interface OrderLineItem {
  _id: string;
  menuItemId: string;
  name: string;
  qty: number;
  unitPrice: number;
  modifiers: ModifierOption[];
  notes: string;
  kitchenStatus: KitchenStatus;
  addedAt: string;
}

export interface Order {
  _id: string;
  clientId: string;
  branchId: string | null;
  ref: string;
  table: string;
  tableLabel: string;
  partySize: number;
  status: OrderStatus;
  lineItems: OrderLineItem[];
  openedAt: string;
  closedAt: string | null;
  cashier: string;
  cashierId: string | null;
  paymentMethod: PayMethod | null;
  saleId: string | null;
  notes: string;
  createdAt: string;
}

export interface Reservation {
  _id: string;
  clientId: string;
  branchId: string | null;
  ref: string;
  type: ReservationType;
  guestName: string;
  guestPhone: string;
  partySize: number;
  table: string | null;
  reservedFor: string | null;
  status: ReservationStatus;
  seatedAt: string | null;
  notes: string;
  createdAt: string;
}

export interface TableStats {
  total: number;
  available: number;
  occupied: number;
  reserved: number;
  needsCleaning: number;
}

export interface OrderStats {
  openOrders: number;
  itemsPending: number;
  itemsPreparing: number;
  itemsReady: number;
}

export interface MenuStats {
  total: number;
  categories: number;
  averagePrice: number;
  highestPrice: number;
}

export interface ReservationStats {
  upcomingToday: number;
  waiting: number;
  seatedToday: number;
}

export interface KitchenTicket {
  orderId: string;
  ref: string;
  tableLabel: string;
  openedAt: string;
  lineItems: OrderLineItem[];
}

export function formatMoney(amount: number, currency = "UGX"): string {
  return `${currency} ${Math.round(amount).toLocaleString()}`;
}

export function formatDateTime(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

/** Per-unit price with the chosen modifiers' price deltas baked in. */
export function lineItemUnitPrice(li: { unitPrice: number; modifiers: ModifierOption[] }): number {
  return li.unitPrice + li.modifiers.reduce((sum, m) => sum + (m.priceDelta || 0), 0);
}

export function lineItemTotal(li: { qty: number; unitPrice: number; modifiers: ModifierOption[] }): number {
  return li.qty * lineItemUnitPrice(li);
}

export function orderTotal(order: { lineItems: OrderLineItem[] }): number {
  return order.lineItems.reduce((sum, li) => sum + lineItemTotal(li), 0);
}

export const TABLE_STATUS_STYLES: Record<
  TableStatus,
  { label: string; dot: string; card: string; text: string }
> = {
  available: {
    label: "Available",
    dot: "bg-emerald-500",
    card: "border-emerald-200 bg-emerald-50 hover:border-emerald-300",
    text: "text-emerald-700",
  },
  occupied: {
    label: "Occupied",
    dot: "bg-blue-500",
    card: "border-blue-200 bg-blue-50 hover:border-blue-300",
    text: "text-blue-700",
  },
  reserved: {
    label: "Reserved",
    dot: "bg-purple-500",
    card: "border-purple-200 bg-purple-50 hover:border-purple-300",
    text: "text-purple-700",
  },
  "needs-cleaning": {
    label: "Needs cleaning",
    dot: "bg-amber-500",
    card: "border-amber-200 bg-amber-50 hover:border-amber-300",
    text: "text-amber-700",
  },
};

export const KITCHEN_STATUS_STYLES: Record<KitchenStatus, string> = {
  pending: "bg-slate-100 text-slate-600 border-slate-200",
  preparing: "bg-amber-50 text-amber-700 border-amber-200",
  ready: "bg-emerald-50 text-emerald-700 border-emerald-200",
  served: "bg-blue-50 text-blue-600 border-blue-200",
};

export const KITCHEN_NEXT_STATUS: Record<Exclude<KitchenStatus, "served">, KitchenStatus> = {
  pending: "preparing",
  preparing: "ready",
  ready: "served",
};

export const ORDER_STATUS_STYLES: Record<Exclude<OrderStatus, "open">, string> = {
  closed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

export const PAYMENT_METHOD_STYLES: Record<PayMethod, string> = {
  Cash: "bg-slate-100 text-slate-600",
  "Mobile Money": "bg-purple-50 text-purple-700",
  Card: "bg-blue-50 text-blue-700",
  Credit: "bg-amber-50 text-amber-700",
};

export const RESERVATION_STATUS_STYLES: Record<ReservationStatus, string> = {
  booked: "bg-blue-50 text-blue-700 border-blue-200",
  waiting: "bg-amber-50 text-amber-700 border-amber-200",
  seated: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
  "no-show": "bg-slate-100 text-slate-500 border-slate-200",
  completed: "bg-slate-100 text-slate-500 border-slate-200",
};
