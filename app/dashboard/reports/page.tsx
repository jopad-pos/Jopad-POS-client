import {
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  FileText,
} from "lucide-react";

const weeklySales = [
  { day: "Mon 6", revenue: 380000, transactions: 28 },
  { day: "Tue 7", revenue: 445000, transactions: 31 },
  { day: "Wed 8", revenue: 320000, transactions: 24 },
  { day: "Thu 9", revenue: 512000, transactions: 36 },
  { day: "Fri 10", revenue: 680000, transactions: 47 },
  { day: "Sat 11", revenue: 745000, transactions: 52 },
  { day: "Sun 12", revenue: 290000, transactions: 21 },
];

const topProducts = [
  { name: "Mineral Water 500ml", qty: 186, revenue: 279000, margin: 50 },
  { name: "Cooking Oil 1L", qty: 84, revenue: 546000, margin: 18 },
  { name: "Bread (Brown 400g)", qty: 120, revenue: 420000, margin: 17 },
  { name: "Coca-Cola 500ml", qty: 98, revenue: 196000, margin: 33 },
  { name: "Sugar 1kg", qty: 63, revenue: 409500, margin: 18 },
  { name: "Eggs (tray 30)", qty: 24, revenue: 432000, margin: 20 },
  { name: "Maize Flour 2kg", qty: 45, revenue: 427500, margin: 19 },
];

const cashierPerformance = [
  { name: "Diana Apio", sales: 87, revenue: 1245000, avgSale: 14310 },
  { name: "Brian Okello", sales: 74, revenue: 1080000, avgSale: 14595 },
  { name: "Ruth Nambi", sales: 68, revenue: 947000, avgSale: 13926 },
];

const maxRevenue = Math.max(...weeklySales.map((d) => d.revenue));
const weekTotal = weeklySales.reduce((a, d) => a + d.revenue, 0);
const weekTransactions = weeklySales.reduce((a, d) => a + d.transactions, 0);

export default function ReportsPage() {
  return (
    <div className="p-5 space-y-5">
      {/* Period selector */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {["Today", "This Week", "This Month", "Last Month", "Custom"].map(
            (p) => (
              <button
                key={p}
                className={`text-[12px] px-3 py-1.5 rounded-md font-medium transition-colors ${p === "This Week" ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"}`}
              >
                {p}
              </button>
            ),
          )}
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-[12px] text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-md transition-colors">
            <Download className="w-3.5 h-3.5 text-slate-400" />
            Export PDF
          </button>
          <button className="flex items-center gap-1.5 text-[12px] text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-md transition-colors">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Revenue (This Week)",
            value: `UGX ${(weekTotal / 1000000).toFixed(2)}M`,
            delta: "+14.3% vs last week",
            up: true,
          },
          {
            label: "Transactions",
            value: weekTransactions.toString(),
            delta: `Avg ${Math.round(weekTotal / weekTransactions).toLocaleString()} UGX/sale`,
            up: null,
          },
          {
            label: "Gross Profit (est.)",
            value: `UGX ${((weekTotal * 0.22) / 1000).toFixed(0)}k`,
            delta: "~22% margin",
            up: null,
          },
          {
            label: "Best Day",
            value: "Saturday",
            delta: "UGX 745,000 revenue",
            up: true,
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

      {/* Revenue chart + cashier performance */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Bar chart */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-[13px] font-semibold text-slate-900">
                Daily Revenue — This Week
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Mon 6 May – Sun 12 May 2026
              </p>
            </div>
          </div>

          <div className="flex items-end gap-3 h-36">
            {weeklySales.map((day) => {
              const pct = (day.revenue / maxRevenue) * 100;
              const isBest = day.revenue === maxRevenue;
              return (
                <div
                  key={day.day}
                  className="flex flex-col items-center gap-1.5 flex-1"
                >
                  <span className="text-[10px] text-slate-500 tabular-nums">
                    {(day.revenue / 1000).toFixed(0)}k
                  </span>
                  <div
                    className="w-full flex items-end"
                    style={{ height: "80px" }}
                  >
                    <div
                      className={`w-full rounded-t-sm ${isBest ? "bg-emerald-500" : "bg-blue-500"}`}
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 text-center leading-tight">
                    {day.day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-4">
            <div>
              <p className="text-[11px] text-slate-400">Total transactions</p>
              <p className="text-[13px] font-semibold text-slate-800 mt-0.5">
                {weekTransactions}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Avg daily revenue</p>
              <p className="text-[13px] font-semibold text-slate-800 mt-0.5">
                UGX {(weekTotal / 7000).toFixed(0)}k
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400">
                Avg transaction value
              </p>
              <p className="text-[13px] font-semibold text-slate-800 mt-0.5">
                UGX {Math.round(weekTotal / weekTransactions).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Cashier performance */}
        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="px-4 py-3.5 border-b border-slate-100">
            <h2 className="text-[13px] font-semibold text-slate-900">
              Staff Performance
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">This week</p>
          </div>
          <div className="divide-y divide-slate-50">
            {cashierPerformance.map((c, i) => {
              const topRevenue = Math.max(
                ...cashierPerformance.map((x) => x.revenue),
              );
              const pct = Math.round((c.revenue / topRevenue) * 100);
              return (
                <div key={c.name} className="px-4 py-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[11px] text-slate-400 w-3">
                        {i + 1}
                      </span>
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                        <span className="text-[9px] font-semibold text-slate-600">
                          {c.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <p className="text-[12px] font-medium text-slate-800">
                        {c.name}
                      </p>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-700 tabular-nums">
                      {c.sales} sales
                    </p>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 tabular-nums">
                    UGX {c.revenue.toLocaleString()} revenue
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top products table */}
      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="px-4 py-3.5 border-b border-slate-100">
          <h2 className="text-[13px] font-semibold text-slate-900">
            Top Products This Week
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            By revenue generated
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {[
                  "#",
                  "Product",
                  "Units Sold",
                  "Revenue",
                  "Est. Margin",
                  "Share",
                ].map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap ${["Units Sold", "Revenue", "Est. Margin"].includes(h) ? "text-right" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {topProducts.map((p, i) => {
                const totalRevenue = topProducts.reduce(
                  (a, x) => a + x.revenue,
                  0,
                );
                const share = Math.round((p.revenue / totalRevenue) * 100);
                return (
                  <tr
                    key={p.name}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="text-[12px] text-slate-400 tabular-nums">
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[13px] font-medium text-slate-800">
                        {p.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[13px] text-slate-700 tabular-nums">
                        {p.qty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[13px] font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                        UGX {p.revenue.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[12px] text-emerald-600 tabular-nums">
                        {p.margin}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[60px]">
                          <div
                            className="h-full bg-blue-400 rounded-full"
                            style={{ width: `${share}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-slate-400 tabular-nums w-8">
                          {share}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
