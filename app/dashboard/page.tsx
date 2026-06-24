"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { useBranchQuery } from "@/contexts/BranchContext";
import { useAuth } from "@/contexts/AuthContext";
import { type DashboardData } from "./components/types";
import { QuickActions } from "./components/QuickActions";
import { StatCards } from "./components/StatCards";
import { RevenueChart } from "./components/RevenueChart";
import { TopProducts } from "./components/TopProducts";
import { RecentSales } from "./components/RecentSales";
import { LowStock } from "./components/LowStock";

export default function OverviewPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const branchQuery = useBranchQuery();
  const { profile } = useAuth();
  const currency = profile?.currency || "UGX";

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const qs = branchQuery.startsWith("&") ? branchQuery.slice(1) : branchQuery;
        const d = await apiRequest<DashboardData>(
          `/api/dashboard${qs ? `?${qs}` : ""}`,
        );
        if (!cancelled) setData(d);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [branchQuery, refreshKey]);

  const weekTotal = data?.weeklyRevenue.reduce((s, d) => s + d.revenue, 0) ?? 0;

  return (
    <div className="p-5 space-y-5">
      <QuickActions
        loading={loading}
        error={error}
        lowStockCount={data?.lowStock.length ?? 0}
        onRefresh={() => setRefreshKey((k) => k + 1)}
      />

      <StatCards
        loading={loading}
        today={data?.today}
        delta={data?.delta}
        currency={currency}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <RevenueChart
          loading={loading}
          weeklyRevenue={data?.weeklyRevenue ?? []}
          weekTotal={weekTotal}
          delta={data?.delta}
          currency={currency}
        />
        <TopProducts
          loading={loading}
          topProducts={data?.topProducts ?? []}
          currency={currency}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <RecentSales
          loading={loading}
          recentSales={data?.recentSales ?? []}
          currency={currency}
        />
        <LowStock
          loading={loading}
          lowStock={data?.lowStock ?? []}
        />
      </div>
    </div>
  );
}
