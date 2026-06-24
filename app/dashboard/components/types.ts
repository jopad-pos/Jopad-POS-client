export interface DashboardData {
  today: {
    revenue: number;
    transactions: number;
    itemsSold: number;
    creditTotal: number;
    creditCount: number;
  };
  delta: { revenueVsYesterday: number | null };
  weeklyRevenue: { date: string; day: string; revenue: number }[];
  topProducts: { name: string; sold: number; revenue: number }[];
  lowStock: {
    _id: string;
    name: string;
    category: string;
    qty: number;
    minQty: number;
  }[];
  recentSales: {
    _id: string;
    ref: string;
    customer: string;
    items: number;
    amount: number;
    method: string;
    date: string;
    cashier: string;
  }[];
}

export function formatAmount(n: number, currency: string) {
  return `${currency} ${n.toLocaleString()}`;
}

export function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
