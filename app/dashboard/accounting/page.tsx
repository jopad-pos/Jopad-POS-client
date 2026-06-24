"use client";

import { useEffect, useState, useCallback } from "react";
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight, Download, RefreshCw } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import PlanGate from "@/components/PlanGate";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PLData {
  period: { year: number; month: number };
  revenue: number;
  cogs: number;
  grossProfit: number;
  expensesByCategory: { category: string; amount: number }[];
  totalOpex: number;
  netProfit: number;
  prev: {
    revenue: number;
    cogs: number;
    grossProfit: number;
    totalOpex: number;
    netProfit: number;
  };
  trend: {
    label: string;
    revenue: number;
    cogs: number;
    opex: number;
    grossProfit: number;
    netProfit: number;
  }[];
}

interface BalanceSheetData {
  assets: {
    currentAssets: {
      inventory: number;
      accountsReceivable: number;
      unpaidInvoices: number;
      total: number;
    };
    totalAssets: number;
  };
  liabilities: { accountsPayable: number; totalLiabilities: number };
  equity: { retainedEarnings: number; totalEquity: number };
  totalLiabilitiesAndEquity: number;
}

interface CashFlowData {
  period: { year: number; month: number };
  operating: { cashFromSales: number; cashPaidExpenses: number; net: number };
  investing: { cashPaidInventory: number; net: number };
  netCashFlow: number;
}

type Tab = "pl" | "balance-sheet" | "cash-flow";

// ── Helpers ───────────────────────────────────────────────────────────────────

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmt(n: number) {
  if (n < 0) return `(UGX ${Math.abs(n).toLocaleString()})`;
  return `UGX ${n.toLocaleString()}`;
}

function fmtCompact(n: number) {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}UGX ${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}UGX ${(abs / 1_000).toFixed(0)}k`;
  return `${sign}UGX ${abs.toLocaleString()}`;
}

function pct(a: number, b: number) {
  if (!b) return 0;
  return Math.round((a / b) * 100);
}

function delta(current: number, prev: number) {
  if (!prev) return null;
  return Math.round(((current - prev) / Math.abs(prev)) * 100);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Row({
  label,
  value,
  indent = false,
  bold = false,
  border = false,
  colorValue = false,
}: {
  label: string;
  value: number;
  indent?: boolean;
  bold?: boolean;
  border?: boolean;
  colorValue?: boolean;
}) {
  const negative = value < 0;
  return (
    <div
      className={`flex items-center justify-between py-2 px-4 text-[12px]
        ${border ? "border-t border-slate-200 mt-1 pt-3" : ""}
        ${bold ? "font-semibold text-slate-900" : "text-slate-600"}`}
    >
      <span className={indent ? "pl-4" : ""}>{label}</span>
      <span
        className={`tabular-nums ${colorValue && negative ? "text-red-600" : colorValue && !negative ? "text-emerald-700" : ""}`}
      >
        {fmt(value)}
      </span>
    </div>
  );
}

// ── P&L Tab ───────────────────────────────────────────────────────────────────

function PLTab({ data }: { data: PLData }) {
  const { revenue, cogs, grossProfit, expensesByCategory, totalOpex, netProfit, prev, trend } = data;
  const maxRev = Math.max(...trend.map((t) => t.revenue), 1);

  const revDelta = delta(revenue, prev.revenue);
  const netDelta = delta(netProfit, prev.netProfit);

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Total Revenue",
            value: fmtCompact(revenue),
            sub: revDelta !== null ? `${revDelta >= 0 ? "+" : ""}${revDelta}% vs prev month` : "—",
            up: revDelta !== null && revDelta > 0,
          },
          {
            label: "Gross Profit",
            value: fmtCompact(grossProfit),
            sub: `${pct(grossProfit, revenue)}% margin`,
            up: null,
          },
          {
            label: "Operating Expenses",
            value: fmtCompact(totalOpex),
            sub: `${expensesByCategory.length} categor${expensesByCategory.length === 1 ? "y" : "ies"}`,
            up: null,
          },
          {
            label: "Net Profit",
            value: fmtCompact(netProfit),
            sub: netDelta !== null ? `${netDelta >= 0 ? "+" : ""}${netDelta}% vs prev month` : "—",
            up: netDelta !== null && netDelta > 0,
          },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-lg px-4 py-3.5">
            <p className="text-[11px] font-medium text-slate-500">{s.label}</p>
            <p className="text-base font-semibold text-slate-900 mt-1 tabular-nums leading-none">
              {s.value}
            </p>
            <p className={`text-[11px] mt-1.5 flex items-center gap-1 ${s.up ? "text-emerald-600" : s.up === false ? "text-red-500" : "text-slate-400"}`}>
              {s.up === true && <TrendingUp className="w-3 h-3" />}
              {s.up === false && <TrendingDown className="w-3 h-3" />}
              {s.sub}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* P&L Statement */}
        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="px-4 py-3.5 border-b border-slate-100">
            <h2 className="text-[13px] font-semibold text-slate-900">Profit & Loss Statement</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">{MONTH_NAMES[data.period.month - 1]} {data.period.year}</p>
          </div>
          <div className="py-2">
            <div className="px-4 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Revenue</div>
            <Row label="Product Sales" value={revenue} indent />
            <Row label="Total Revenue" value={revenue} bold />

            <div className="px-4 py-1.5 mt-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Cost of Goods Sold</div>
            <Row label="Purchase costs" value={cogs} indent />
            <Row label="Total COGS" value={cogs} bold />

            <Row label="Gross Profit" value={grossProfit} bold border colorValue />

            {expensesByCategory.length > 0 && (
              <>
                <div className="px-4 py-1.5 mt-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Operating Expenses</div>
                {expensesByCategory.map((e) => (
                  <Row key={e.category} label={e.category} value={e.amount} indent />
                ))}
                <Row label="Total Operating Expenses" value={totalOpex} bold />
              </>
            )}

            {expensesByCategory.length === 0 && (
              <p className="px-4 py-3 text-[11px] text-slate-400">No expenses recorded this month.</p>
            )}

            <Row label="Net Profit" value={netProfit} bold border colorValue />
          </div>
        </div>

        {/* Trend + Ratios */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h2 className="text-[13px] font-semibold text-slate-900 mb-1">Revenue vs Profit Trend</h2>
            <p className="text-[11px] text-slate-400 mb-4">Last 6 months</p>
            <div className="space-y-2.5">
              {trend.map((m) => {
                const revPct = Math.round((m.revenue / maxRev) * 100);
                const netPct = m.netProfit > 0
                  ? Math.max(Math.round((m.netProfit / maxRev) * 100), 2)
                  : 0;
                return (
                  <div key={m.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-slate-500 w-16 shrink-0">{m.label}</span>
                      <div className="flex-1 flex items-center gap-2 ml-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-400 rounded-full" style={{ width: `${revPct}%` }} />
                        </div>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${netPct}%` }} />
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 w-20 text-right tabular-nums">
                        {fmtCompact(m.revenue)}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-blue-400" />
                  <span className="text-[10px] text-slate-400">Revenue</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
                  <span className="text-[10px] text-slate-400">Net Profit</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg">
            <div className="px-4 py-3.5 border-b border-slate-100">
              <h2 className="text-[13px] font-semibold text-slate-900">Key Ratios</h2>
            </div>
            <div className="divide-y divide-slate-50">
              {[
                { label: "Gross Margin", value: `${pct(grossProfit, revenue)}%` },
                { label: "Net Margin", value: `${pct(netProfit, revenue)}%` },
                { label: "COGS as % of Revenue", value: `${pct(cogs, revenue)}%` },
                { label: "OpEx as % of Revenue", value: `${pct(totalOpex, revenue)}%` },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between px-4 py-3">
                  <span className="text-[12px] text-slate-600">{r.label}</span>
                  <span className="text-[13px] font-semibold text-slate-800 tabular-nums">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Balance Sheet Tab ─────────────────────────────────────────────────────────

function BSRow({
  label,
  value,
  indent = false,
  bold = false,
  border = false,
  colorValue = false,
}: {
  label: string;
  value: number;
  indent?: boolean;
  bold?: boolean;
  border?: boolean;
  colorValue?: boolean;
}) {
  const negative = value < 0;
  return (
    <div
      className={`flex items-center justify-between py-2 px-4 text-[12px]
        ${border ? "border-t border-slate-200 mt-1 pt-3" : ""}
        ${bold ? "font-semibold text-slate-900" : "text-slate-600"}`}
    >
      <span className={indent ? "pl-4" : ""}>{label}</span>
      <span className={`tabular-nums ${colorValue && negative ? "text-red-600" : colorValue && !negative ? "text-emerald-700" : ""}`}>
        {fmt(value)}
      </span>
    </div>
  );
}

function BalanceSheetTab({ data }: { data: BalanceSheetData }) {
  const { assets, liabilities, equity, totalLiabilitiesAndEquity } = data;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {/* Assets */}
      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="px-4 py-3.5 border-b border-slate-100">
          <h2 className="text-[13px] font-semibold text-slate-900">Assets</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Current snapshot</p>
        </div>
        <div className="py-2">
          <div className="px-4 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Current Assets</div>
          <BSRow label="Inventory (at cost)" value={assets.currentAssets.inventory} indent />
          <BSRow label="Accounts Receivable (customer credit)" value={assets.currentAssets.accountsReceivable} indent />
          <BSRow label="Unpaid Invoices (Sent / Overdue)" value={assets.currentAssets.unpaidInvoices} indent />
          <BSRow label="Total Current Assets" value={assets.currentAssets.total} bold border />
          <BSRow label="Total Assets" value={assets.totalAssets} bold border />
        </div>
      </div>

      {/* Liabilities + Equity */}
      <div className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="px-4 py-3.5 border-b border-slate-100">
            <h2 className="text-[13px] font-semibold text-slate-900">Liabilities</h2>
          </div>
          <div className="py-2">
            <div className="px-4 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Current Liabilities</div>
            <BSRow label="Accounts Payable (pending orders)" value={liabilities.accountsPayable} indent />
            <BSRow label="Total Liabilities" value={liabilities.totalLiabilities} bold border />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="px-4 py-3.5 border-b border-slate-100">
            <h2 className="text-[13px] font-semibold text-slate-900">Equity</h2>
          </div>
          <div className="py-2">
            <BSRow label="Retained Earnings (all-time net profit)" value={equity.retainedEarnings} indent colorValue />
            <BSRow label="Total Equity" value={equity.totalEquity} bold border colorValue />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="py-2">
            <BSRow
              label="Total Liabilities + Equity"
              value={totalLiabilitiesAndEquity}
              bold
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Cash Flow Tab ─────────────────────────────────────────────────────────────

function CashFlowTab({ data, period }: { data: CashFlowData; period: string }) {
  const { operating, investing, netCashFlow } = data;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <div className="space-y-4">
        {/* Operating */}
        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="px-4 py-3.5 border-b border-slate-100">
            <h2 className="text-[13px] font-semibold text-slate-900">Operating Activities</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">{period}</p>
          </div>
          <div className="py-2">
            <Row label="Cash received from sales" value={operating.cashFromSales} indent />
            <Row label="Cash paid for expenses" value={-operating.cashPaidExpenses} indent />
            <Row label="Net Operating Cash Flow" value={operating.net} bold border colorValue />
          </div>
        </div>

        {/* Investing */}
        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="px-4 py-3.5 border-b border-slate-100">
            <h2 className="text-[13px] font-semibold text-slate-900">Investing Activities</h2>
          </div>
          <div className="py-2">
            <Row label="Cash paid for inventory (received POs)" value={-investing.cashPaidInventory} indent />
            <Row label="Net Investing Cash Flow" value={investing.net} bold border colorValue />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="px-4 py-3.5 border-b border-slate-100">
            <h2 className="text-[13px] font-semibold text-slate-900">Cash Flow Summary</h2>
          </div>
          <div className="py-2">
            <Row label="Net Operating Cash Flow" value={operating.net} indent />
            <Row label="Net Investing Cash Flow" value={investing.net} indent />
            <Row label="Net Cash Flow" value={netCashFlow} bold border colorValue />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Cash In (Sales)", value: fmtCompact(operating.cashFromSales), positive: true },
            { label: "Cash Out (Expenses)", value: fmtCompact(operating.cashPaidExpenses), positive: false },
            { label: "Cash Out (Inventory)", value: fmtCompact(investing.cashPaidInventory), positive: false },
            { label: "Net Cash Flow", value: fmtCompact(netCashFlow), positive: netCashFlow >= 0 },
          ].map((c) => (
            <div key={c.label} className="bg-white border border-slate-200 rounded-lg px-4 py-3.5">
              <p className="text-[11px] font-medium text-slate-500">{c.label}</p>
              <p className={`text-sm font-semibold mt-1 tabular-nums ${c.positive ? "text-emerald-700" : "text-slate-800"}`}>
                {c.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AccountingPage() {
  const { profile } = useAuth();
  const now = new Date();
  const [tab, setTab] = useState<Tab>("pl");
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const [plData, setPlData] = useState<PLData | null>(null);
  const [bsData, setBsData] = useState<BalanceSheetData | null>(null);
  const [cfData, setCfData] = useState<CashFlowData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const periodLabel = `${MONTH_NAMES[month - 1]} ${year}`;

  const fetchCurrent = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (tab === "pl") {
        const data = await apiRequest<PLData>(`/api/accounting/pl?year=${year}&month=${month}`);
        setPlData(data);
      } else if (tab === "balance-sheet") {
        const data = await apiRequest<BalanceSheetData>("/api/accounting/balance-sheet");
        setBsData(data);
      } else {
        const data = await apiRequest<CashFlowData>(`/api/accounting/cash-flow?year=${year}&month=${month}`);
        setCfData(data);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [tab, year, month]);

  useEffect(() => {
    fetchCurrent();
  }, [fetchCurrent]);

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
    if (isCurrentMonth) return;
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
  const showMonthPicker = tab !== "balance-sheet";

  if (profile?.planFeatures && !profile.planFeatures.includes("accounting")) {
    return <PlanGate featureKey="accounting" />;
  }

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold bg-blue-600 text-white px-2 py-0.5 rounded">PLUS</span>
          <span className="text-[11px] text-slate-400">Accounting — included in your Plus plan</span>
        </div>
        <div className="flex items-center gap-2">
          {showMonthPicker && (
            <div className="flex items-center gap-0.5 border border-slate-200 bg-white rounded-md overflow-hidden">
              <button
                onClick={prevMonth}
                className="p-1.5 hover:bg-slate-50 transition-colors text-slate-500"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[12px] text-slate-600 px-2 min-w-[110px] text-center tabular-nums">
                {MONTH_SHORT[month - 1]} {year}
              </span>
              <button
                onClick={nextMonth}
                disabled={isCurrentMonth}
                className="p-1.5 hover:bg-slate-50 transition-colors text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <button
            onClick={fetchCurrent}
            disabled={loading}
            className="flex items-center gap-1.5 text-[12px] text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 px-2.5 py-1.5 rounded-md transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button className="flex items-center gap-1.5 text-[12px] text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-md transition-colors">
            <Download className="w-3.5 h-3.5 text-slate-400" />
            Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {(["pl", "balance-sheet", "cash-flow"] as Tab[]).map((t) => {
          const labels: Record<Tab, string> = {
            pl: "Profit & Loss",
            "balance-sheet": "Balance Sheet",
            "cash-flow": "Cash Flow",
          };
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-[12px] font-medium px-3.5 py-1.5 rounded-md transition-colors ${
                tab === t
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {labels[t]}
            </button>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-[12px] px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-lg px-4 py-3.5 animate-pulse">
              <div className="h-2.5 w-20 bg-slate-200 rounded mb-2" />
              <div className="h-4 w-28 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {tab === "pl" && plData && <PLTab data={plData} />}
          {tab === "balance-sheet" && bsData && <BalanceSheetTab data={bsData} />}
          {tab === "cash-flow" && cfData && <CashFlowTab data={cfData} period={periodLabel} />}
        </>
      )}
    </div>
  );
}
