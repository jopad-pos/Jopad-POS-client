import type { CalendarDate } from "@internationalized/date";

export type Period = "today" | "week" | "month" | "last_month" | "custom";

export interface DateRange {
  start: CalendarDate;
  end: CalendarDate;
}

export interface ReportSummary {
  revenue: number;
  prevRevenue: number;
  transactions: number;
  grossProfit: number;
  bestDay: { date: string; day: string; revenue: number } | null;
}

export interface DailyRevenue {
  date: string;
  day: string;
  revenue: number;
  transactions: number;
}

export interface TopProduct {
  name: string;
  qty: number;
  revenue: number;
  margin: number;
}

export interface StaffMember {
  name: string;
  sales: number;
  revenue: number;
  avgSale: number;
}

export interface DamagedGoods {
  totalQty: number;
  totalValue: number;
  byReason: { reason: string; qty: number; value: number }[];
}

export interface ReportData {
  summary: ReportSummary;
  dailyRevenue: DailyRevenue[];
  topProducts: TopProduct[];
  staffPerformance: StaffMember[];
  damagedGoods: DamagedGoods;
}

export function fmtAmt(n: number, currency: string) {
  return `${currency} ${n.toLocaleString()}`;
}

export function periodLabel(period: Period): string {
  switch (period) {
    case "today": return "Today";
    case "week": return "This Week";
    case "month": return "This Month";
    case "last_month": return "Last Month";
    case "custom": return "Custom";
  }
}
