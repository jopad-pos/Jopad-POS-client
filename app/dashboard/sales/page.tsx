import {
  Search,
  SlidersHorizontal,
  Download,
  ShoppingCart,
  MoreHorizontal,
  Calendar,
} from "lucide-react";

type PayMethod = "Cash" | "Mobile Money" | "Card" | "Credit";

interface Sale {
  ref: string;
  customer: string;
  cashier: string;
  items: number;
  amount: number;
  method: PayMethod;
  time: string;
  date: string;
}

const sales: Sale[] = [
  {
    ref: "T-034",
    customer: "Walk-in Customer",
    cashier: "Diana A.",
    items: 4,
    amount: 45000,
    method: "Cash",
    time: "10:32 AM",
    date: "Today",
  },
  {
    ref: "T-033",
    customer: "Kasozi James",
    cashier: "Brian O.",
    items: 2,
    amount: 12500,
    method: "Mobile Money",
    time: "10:15 AM",
    date: "Today",
  },
  {
    ref: "T-032",
    customer: "Nakato Sarah",
    cashier: "Diana A.",
    items: 7,
    amount: 78000,
    method: "Credit",
    time: "09:58 AM",
    date: "Today",
  },
  {
    ref: "T-031",
    customer: "Walk-in Customer",
    cashier: "Diana A.",
    items: 1,
    amount: 6000,
    method: "Cash",
    time: "09:45 AM",
    date: "Today",
  },
  {
    ref: "T-030",
    customer: "Mugisha Robert",
    cashier: "Brian O.",
    items: 3,
    amount: 31500,
    method: "Cash",
    time: "09:30 AM",
    date: "Today",
  },
  {
    ref: "T-029",
    customer: "Akello Grace",
    cashier: "Ruth N.",
    items: 5,
    amount: 54000,
    method: "Mobile Money",
    time: "09:14 AM",
    date: "Today",
  },
  {
    ref: "T-028",
    customer: "Walk-in Customer",
    cashier: "Ruth N.",
    items: 2,
    amount: 15000,
    method: "Cash",
    time: "08:55 AM",
    date: "Today",
  },
  {
    ref: "T-027",
    customer: "Wasswa Peter",
    cashier: "Diana A.",
    items: 8,
    amount: 112000,
    method: "Card",
    time: "08:40 AM",
    date: "Today",
  },
  {
    ref: "T-026",
    customer: "Nambooze Faith",
    cashier: "Brian O.",
    items: 3,
    amount: 22500,
    method: "Cash",
    time: "08:22 AM",
    date: "Today",
  },
  {
    ref: "T-025",
    customer: "Walk-in Customer",
    cashier: "Ruth N.",
    items: 6,
    amount: 67000,
    method: "Mobile Money",
    time: "08:10 AM",
    date: "Today",
  },
  {
    ref: "T-024",
    customer: "Opolot David",
    cashier: "Diana A.",
    items: 4,
    amount: 38000,
    method: "Cash",
    time: "Yesterday",
    date: "Yesterday",
  },
  {
    ref: "T-023",
    customer: "Kirabo Teddy",
    cashier: "Brian O.",
    items: 2,
    amount: 18500,
    method: "Cash",
    time: "Yesterday",
    date: "Yesterday",
  },
  {
    ref: "T-022",
    customer: "Walk-in Customer",
    cashier: "Ruth N.",
    items: 9,
    amount: 143000,
    method: "Mobile Money",
    time: "Yesterday",
    date: "Yesterday",
  },
];

const methodStyles: Record<PayMethod, string> = {
  Cash: "bg-slate-100 text-slate-600",
  "Mobile Money": "bg-purple-50 text-purple-700",
  Card: "bg-blue-50 text-blue-700",
  Credit: "bg-amber-50 text-amber-700",
};

const totalToday = sales
  .filter((s) => s.date === "Today")
  .reduce((a, s) => a + s.amount, 0);
const countToday = sales.filter((s) => s.date === "Today").length;
const avgToday = Math.round(totalToday / countToday);

export default function SalesPage() {
  return (
    <div className="p-5 space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Revenue Today",
            value: `UGX ${totalToday.toLocaleString()}`,
            sub: "10 transactions",
          },
          {
            label: "Avg Transaction",
            value: `UGX ${avgToday.toLocaleString()}`,
            sub: "per sale",
          },
          { label: "Cash Sales", value: "UGX 292,000", sub: "5 transactions" },
          {
            label: "Mobile Money",
            value: "UGX 112,500",
            sub: "3 transactions",
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
            <p className="text-[11px] text-slate-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white border border-slate-200 rounded-lg">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 px-4 py-3 border-b border-slate-100">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer or ref..."
              className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-slate-50 border border-slate-200 rounded-md text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button className="flex items-center gap-1.5 text-[12px] text-slate-600 border border-slate-200 bg-slate-50 hover:bg-white px-2.5 py-1.5 rounded-md transition-colors">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Today
            </button>
            <select className="text-[12px] bg-slate-50 border border-slate-200 rounded-md text-slate-600 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option>All Methods</option>
              <option>Cash</option>
              <option>Mobile Money</option>
              <option>Card</option>
              <option>Credit</option>
            </select>
            <select className="text-[12px] bg-slate-50 border border-slate-200 rounded-md text-slate-600 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option>All Cashiers</option>
              <option>Diana A.</option>
              <option>Brian O.</option>
              <option>Ruth N.</option>
            </select>
            <button className="flex items-center gap-1.5 text-[12px] text-slate-600 border border-slate-200 bg-slate-50 hover:bg-white px-2.5 py-1.5 rounded-md transition-colors ml-auto">
              <Download className="w-3.5 h-3.5 text-slate-400" />
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {[
                  "Ref",
                  "Customer",
                  "Cashier",
                  "Items",
                  "Payment",
                  "Amount",
                  "Time",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap ${h === "Amount" || h === "Items" ? "text-right" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sales.map((sale) => (
                <tr
                  key={sale.ref}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <ShoppingCart className="w-3 h-3 text-slate-400" />
                      </div>
                      <span className="text-[12px] font-medium text-slate-700 font-mono">
                        {sale.ref}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[13px] text-slate-800 whitespace-nowrap">
                      {sale.customer}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-slate-500">
                      {sale.cashier}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-[13px] text-slate-600 tabular-nums">
                      {sale.items}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded font-medium whitespace-nowrap ${methodStyles[sale.method]}`}
                    >
                      {sale.method}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-[13px] font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                      UGX {sale.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-slate-400 whitespace-nowrap">
                      {sale.date === "Today" ? sale.time : sale.date}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-all">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <p className="text-[12px] text-slate-400">
            Showing {sales.length} transactions
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled
              className="px-2.5 py-1.5 text-[12px] rounded-md text-slate-300 border border-slate-200 cursor-not-allowed"
            >
              Previous
            </button>
            <button className="px-2.5 py-1.5 text-[12px] rounded-md bg-blue-600 text-white font-medium border border-blue-600">
              1
            </button>
            <button className="px-2.5 py-1.5 text-[12px] rounded-md text-slate-500 border border-slate-200 hover:bg-slate-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
