export type RoomStatus = "available" | "occupied" | "maintenance";
export type BookingStatus = "checked-in" | "checked-out" | "cancelled";
export type PayMethod = "Cash" | "Mobile Money" | "Card" | "Credit";

export interface Room {
  _id: string;
  clientId: string;
  branchId: string | null;
  number: string;
  type: string;
  rate: number;
  capacity: number;
  status: RoomStatus;
  notes: string;
  isActive: boolean;
  createdAt: string;
}

export interface Booking {
  _id: string;
  clientId: string;
  branchId: string | null;
  ref: string;
  room: string;
  roomNumber: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  idNumber: string;
  adults: number;
  children: number;
  nightlyRate: number;
  checkInAt: string;
  expectedCheckOutAt: string | null;
  checkOutAt: string | null;
  nights: number;
  totalCharge: number;
  paymentMethod: PayMethod | null;
  saleId: string | null;
  status: BookingStatus;
  notes: string;
  createdAt: string;
}

export interface RoomStats {
  total: number;
  available: number;
  occupied: number;
  maintenance: number;
  occupancyRate: number;
}

export interface BookingStats {
  inHouse: number;
  arrivalsToday: number;
  departuresToday: number;
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

/** Whole nights between two dates, minimum 1 — mirrors the server billing rule. */
export function nightsBetween(startISO: string, end: Date = new Date()): number {
  const start = new Date(startISO).getTime();
  const nights = Math.ceil((end.getTime() - start) / (1000 * 60 * 60 * 24));
  return Math.max(1, nights);
}

export const ROOM_STATUS_STYLES: Record<RoomStatus, { label: string; dot: string; card: string; text: string }> = {
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
  maintenance: {
    label: "Maintenance",
    dot: "bg-amber-500",
    card: "border-amber-200 bg-amber-50 hover:border-amber-300",
    text: "text-amber-700",
  },
};

export const BOOKING_STATUS_STYLES: Record<BookingStatus, string> = {
  "checked-in": "bg-blue-50 text-blue-700 border-blue-200",
  "checked-out": "bg-slate-100 text-slate-600 border-slate-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};
