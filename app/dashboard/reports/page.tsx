"use client";

import { useEffect, useState, useCallback } from "react";
import { today, getLocalTimeZone, startOfMonth } from "@internationalized/date";
import { apiRequest, ApiError } from "@/lib/api";
import { useBranchQuery } from "@/contexts/BranchContext";
import { useAuth } from "@/contexts/AuthContext";
import type { Period, DateRange, ReportData } from "./components/types";
import { periodLabel } from "./components/types";
import { exportToExcel, exportToPdf } from "./components/exportUtils";
import { ReportFilters } from "./components/ReportFilters";
import { SummaryCards } from "./components/SummaryCards";
import { RevenueBarChart } from "./components/RevenueBarChart";
import { StaffPerformance } from "./components/StaffPerformance";
import { TopProductsTable } from "./components/TopProductsTable";

function periodToDates(
  period: Period,
  customRange: DateRange | null,
  tz: string
): { from: string; to: string } | null {
  const now = today(tz);

  switch (period) {
    case "today":
      return { from: now.toString(), to: now.toString() };

    case "week": {
      const start = now.subtract({ days: 6 });
      return { from: start.toString(), to: now.toString() };
    }

    case "month": {
      const start = startOfMonth(now);
      return { from: start.toString(), to: now.toString() };
    }

    case "last_month": {
      const firstOfThisMonth = startOfMonth(now);
      const lastMonthEnd = firstOfThisMonth.subtract({ days: 1 });
      const lastMonthStart = startOfMonth(lastMonthEnd);
      return { from: lastMonthStart.toString(), to: lastMonthEnd.toString() };
    }

    case "custom":
      if (!customRange) return null;
      return {
        from: customRange.start.toString(),
        to: customRange.end.toString(),
      };
  }
}

function formatDateRange(dates: { from: string; to: string }): string {
  const fmt = (s: string) =>
    new Date(s + "T00:00:00").toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  return dates.from === dates.to
    ? fmt(dates.from)
    : `${fmt(dates.from)} – ${fmt(dates.to)}`;
}

export default function ReportsPage() {
  const branchQuery = useBranchQuery();
  const { profile } = useAuth();
  const currency = profile?.currency || "UGX";
  const tz = getLocalTimeZone();

  const [period, setPeriod] = useState<Period>("week");
  const [customRange, setCustomRange] = useState<DateRange | null>(null);
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchReport = useCallback(async () => {
    const dates = periodToDates(period, customRange, tz);
    if (!dates) return;

    const qs = new URLSearchParams({ from: dates.from, to: dates.to });
    if (branchQuery) {
      const branchId = branchQuery.replace(/^[?&]branchId=/, "");
      qs.set("branchId", branchId);
    }

    setLoading(true);
    setError(null);
    try {
      const result = await apiRequest<ReportData>(`/api/reports?${qs.toString()}`);
      setData(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load report");
    } finally {
      setLoading(false);
    }
  }, [period, customRange, branchQuery, tz]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  function handlePeriodChange(p: Period) {
    setPeriod(p);
    if (p !== "custom") setCustomRange(null);
  }

  function handleExportExcel() {
    if (!data) return;
    const dates = periodToDates(period, customRange, tz);
    const dateRange = dates ? formatDateRange(dates) : "";
    setExporting(true);
    try {
      exportToExcel(data, currency, periodLabel(period), dateRange);
    } finally {
      setExporting(false);
    }
  }

  function handleExportPdf() {
    if (!data) return;
    const dates = periodToDates(period, customRange, tz);
    const dateRange = dates ? formatDateRange(dates) : "";
    setExporting(true);
    try {
      exportToPdf(
        data,
        currency,
        periodLabel(period),
        dateRange,
        profile?.businessName || "Jopad POS"
      );
    } finally {
      setExporting(false);
    }
  }

  const label = periodLabel(period);

  return (
    <div className="p-5 space-y-5">
      <ReportFilters
        period={period}
        onPeriodChange={handlePeriodChange}
        customRange={customRange}
        onCustomRangeChange={setCustomRange}
        onExportPdf={handleExportPdf}
        onExportExcel={handleExportExcel}
        exporting={exporting || loading || !data}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-[12px] text-red-700">
          {error}
        </div>
      )}

      <SummaryCards
        loading={loading}
        summary={data?.summary}
        currency={currency}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <RevenueBarChart
          loading={loading}
          data={data?.dailyRevenue ?? []}
          currency={currency}
          periodLabel={label}
        />
        <StaffPerformance
          loading={loading}
          data={data?.staffPerformance ?? []}
          currency={currency}
        />
      </div>

      <TopProductsTable
        loading={loading}
        data={data?.topProducts ?? []}
        currency={currency}
      />
    </div>
  );
}
