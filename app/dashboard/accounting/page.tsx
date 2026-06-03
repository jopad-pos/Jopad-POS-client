import { TrendingUp, TrendingDown, Calendar, Download } from "lucide-react";

const plMonths = [
  { month: "Jan", revenue: 8240000, cogs: 6270000, opex: 1050000 },
  { month: "Feb", revenue: 9120000, cogs: 6930000, opex: 1050000 },
  { month: "Mar", revenue: 10450000, cogs: 7940000, opex: 1100000 },
  { month: "Apr", revenue: 11280000, cogs: 8570000, opex: 1100000 },
  { month: "May", revenue: 12640000, cogs: 9600000, opex: 1103000 },
];

const currentMonth = plMonths[plMonths.length - 1];
const previousMonth = plMonths[plMonths.length - 2];
const grossProfit = currentMonth.revenue - currentMonth.cogs;
const netProfit = grossProfit - currentMonth.opex;
const grossMargin = Math.round((grossProfit / currentMonth.revenue) * 100);
const prevGross = previousMonth.revenue - previousMonth.cogs;
const prevNet = prevGross - previousMonth.opex;
const revDelta = Math.round(
  ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) *
    100,
);

function Row({
  label,
  value,
  indent = false,
  bold = false,
  border = false,
  positive,
}: {
  label: string;
  value: number;
  indent?: boolean;
  bold?: boolean;
  border?: boolean;
  positive?: boolean;
}) {
  const isPositive = positive !== undefined ? positive : value >= 0;
  return (
    <div
      className={`flex items-center justify-between py-2 px-4 text-[12px] ${border ? "border-t border-slate-200 mt-1 pt-3" : ""} ${bold ? "font-semibold text-slate-900" : "text-slate-600"}`}
    >
      <span className={indent ? "pl-4" : ""}>{label}</span>
      <span
        className={`tabular-nums ${bold && !isPositive ? "text-red-600" : bold ? "" : ""}`}
      >
        {value < 0
          ? `(UGX ${Math.abs(value).toLocaleString()})`
          : `UGX ${value.toLocaleString()}`}
      </span>
    </div>
  );
}

export default function AccountingPage() {
  return (
    <div className="p-5 space-y-5">
      {/* Plus badge */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold bg-blue-600 text-white px-2 py-0.5 rounded">
            PLUS
          </span>
          <span className="text-[11px] text-slate-400">
            Accounting overview — included in your Plus plan
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[12px] text-slate-500 border border-slate-200 bg-white px-2.5 py-1.5 rounded-md">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            May 2026
          </div>
          <button className="flex items-center gap-1.5 text-[12px] text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-md transition-colors">
            <Download className="w-3.5 h-3.5 text-slate-400" />
            Export
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Total Revenue",
            value: `UGX ${(currentMonth.revenue / 1000000).toFixed(2)}M`,
            delta: `+${revDelta}% vs Apr`,
            up: revDelta > 0,
          },
          {
            label: "Gross Profit",
            value: `UGX ${(grossProfit / 1000).toFixed(0)}k`,
            delta: `${grossMargin}% margin`,
            up: null,
          },
          {
            label: "Operating Expenses",
            value: `UGX ${(currentMonth.opex / 1000).toFixed(0)}k`,
            delta: "rent + utilities + more",
            up: null,
          },
          {
            label: "Net Profit",
            value: `UGX ${(netProfit / 1000).toFixed(0)}k`,
            delta: `${Math.round((netProfit / currentMonth.revenue) * 100)}% net margin`,
            up: netProfit > prevNet,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border border-slate-200 rounded-lg px-4 py-3.5"
          >
            <p className="text-[11px] font-medium text-slate-500">{s.label}</p>
            <p className="text-base font-semibold text-slate-900 mt-1 tabular-nums leading-none">
              {s.value}
            </p>
            <p
              className={`text-[11px] mt-1.5 flex items-center gap-1 ${s.up ? "text-emerald-600" : "text-slate-400"}`}
            >
              {s.up && <TrendingUp className="w-3 h-3" />}
              {s.delta}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* P&L Statement */}
        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-[13px] font-semibold text-slate-900">
                Profit & Loss Statement
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">May 2026</p>
            </div>
          </div>
          <div className="py-2">
            <div className="px-4 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Revenue
            </div>
            <Row label="Product Sales" value={currentMonth.revenue} indent />
            <Row label="Total Revenue" value={currentMonth.revenue} bold />

            <div className="px-4 py-1.5 mt-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Cost of Goods Sold
            </div>
            <Row label="Purchase costs" value={currentMonth.cogs} indent />
            <Row label="Total COGS" value={currentMonth.cogs} bold />

            <Row label="Gross Profit" value={grossProfit} bold border />

            <div className="px-4 py-1.5 mt-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Operating Expenses
            </div>
            <Row label="Rent" value={650000} indent />
            <Row label="Utilities" value={180000} indent />
            <Row label="Transport" value={90000} indent />
            <Row label="Cleaning" value={35000} indent />
            <Row label="Repairs" value={120000} indent />
            <Row label="Miscellaneous" value={28000} indent />
            <Row
              label="Total Operating Expenses"
              value={currentMonth.opex}
              bold
            />

            <Row
              label="Net Profit"
              value={netProfit}
              bold
              border
              positive={netProfit > 0}
            />
          </div>
        </div>

        {/* Monthly trend */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h2 className="text-[13px] font-semibold text-slate-900 mb-1">
              Revenue vs Profit Trend
            </h2>
            <p className="text-[11px] text-slate-400 mb-4">Jan – May 2026</p>
            <div className="space-y-2.5">
              {plMonths.map((m) => {
                const net = m.revenue - m.cogs - m.opex;
                const revPct = Math.round(
                  (m.revenue / plMonths[plMonths.length - 1].revenue) * 100,
                );
                const netPct = Math.max(Math.round((net / 3000000) * 100), 2);
                return (
                  <div key={m.month}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-slate-500 w-8">
                        {m.month}
                      </span>
                      <div className="flex-1 flex items-center gap-2 ml-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-400 rounded-full"
                            style={{ width: `${revPct}%` }}
                          />
                        </div>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-400 rounded-full"
                            style={{ width: `${netPct}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 w-20 text-right tabular-nums">
                        {(m.revenue / 1000000).toFixed(1)}M
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

          {/* Quick ratios */}
          <div className="bg-white border border-slate-200 rounded-lg">
            <div className="px-4 py-3.5 border-b border-slate-100">
              <h2 className="text-[13px] font-semibold text-slate-900">
                Key Ratios — May 2026
              </h2>
            </div>
            <div className="divide-y divide-slate-50">
              {[
                {
                  label: "Gross Margin",
                  value: `${Math.round((grossProfit / currentMonth.revenue) * 100)}%`,
                },
                {
                  label: "Net Margin",
                  value: `${Math.round((netProfit / currentMonth.revenue) * 100)}%`,
                },
                {
                  label: "COGS as % of Revenue",
                  value: `${Math.round((currentMonth.cogs / currentMonth.revenue) * 100)}%`,
                },
                {
                  label: "OpEx as % of Revenue",
                  value: `${Math.round((currentMonth.opex / currentMonth.revenue) * 100)}%`,
                },
              ].map((r) => (
                <div
                  key={r.label}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <span className="text-[12px] text-slate-600">{r.label}</span>
                  <span className="text-[13px] font-semibold text-slate-800 tabular-nums">
                    {r.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
