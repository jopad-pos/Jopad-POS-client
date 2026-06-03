import {
  Plus,
  Search,
  MoreHorizontal,
  ArrowDownToLine,
  Receipt,
} from "lucide-react";

type PurchaseStatus = "Received" | "Pending" | "Partial";

interface Purchase {
  ref: string;
  supplier: string;
  description: string;
  amount: number;
  status: PurchaseStatus;
  date: string;
  items: number;
}

interface Expense {
  ref: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  recorder: string;
}

const purchases: Purchase[] = [
  {
    ref: "PO-026",
    supplier: "Quality Superfoods",
    description: "Bread (Brown) × 50, Eggs × 10 trays",
    amount: 310000,
    status: "Pending",
    date: "May 13, 2026",
    items: 2,
  },
  {
    ref: "PO-025",
    supplier: "Crown Beverages Ltd",
    description: "Mineral Water × 96, Soda Water × 144",
    amount: 225600,
    status: "Received",
    date: "May 11, 2026",
    items: 2,
  },
  {
    ref: "PO-024",
    supplier: "Mukwano Industries",
    description: "Cooking Oil 5L × 24",
    amount: 672000,
    status: "Received",
    date: "May 10, 2026",
    items: 1,
  },
  {
    ref: "PO-023",
    supplier: "Crown Beverages Ltd",
    description: "Coca-Cola × 48, Pepsi × 48",
    amount: 216000,
    status: "Received",
    date: "May 8, 2026",
    items: 2,
  },
  {
    ref: "PO-022",
    supplier: "Britannia Allied Industries",
    description: "Assorted biscuits × 100",
    amount: 180000,
    status: "Received",
    date: "May 7, 2026",
    items: 1,
  },
  {
    ref: "PO-021",
    supplier: "MTN Uganda",
    description: "Airtime cards MTN 1k × 100, 2k × 50",
    amount: 190000,
    status: "Received",
    date: "May 6, 2026",
    items: 2,
  },
  {
    ref: "PO-020",
    supplier: "Airtel Uganda",
    description: "Airtime Airtel 1k × 50",
    amount: 45000,
    status: "Partial",
    date: "May 5, 2026",
    items: 1,
  },
];

const expenses: Expense[] = [
  {
    ref: "EXP-018",
    category: "Rent",
    description: "Shop rent — May 2026",
    amount: 650000,
    date: "May 1, 2026",
    recorder: "Namukasa A.",
  },
  {
    ref: "EXP-019",
    category: "Utilities",
    description: "Electricity — UMEME partial",
    amount: 180000,
    date: "May 1, 2026",
    recorder: "Namukasa A.",
  },
  {
    ref: "EXP-020",
    category: "Transport",
    description: "Staff transport allowances",
    amount: 90000,
    date: "May 12, 2026",
    recorder: "Namukasa A.",
  },
  {
    ref: "EXP-021",
    category: "Cleaning",
    description: "Cleaning supplies & materials",
    amount: 35000,
    date: "May 9, 2026",
    recorder: "Diana A.",
  },
  {
    ref: "EXP-022",
    category: "Repairs",
    description: "Shelf repair — carpentry",
    amount: 120000,
    date: "May 7, 2026",
    recorder: "Namukasa A.",
  },
  {
    ref: "EXP-023",
    category: "Miscellaneous",
    description: "Stationery and packaging bags",
    amount: 28000,
    date: "May 10, 2026",
    recorder: "Brian O.",
  },
];

const statusConfig: Record<PurchaseStatus, string> = {
  Received: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Partial: "bg-blue-50 text-blue-700",
};

const expenseCategoryColors: Record<string, string> = {
  Rent: "bg-indigo-50 text-indigo-700",
  Utilities: "bg-blue-50 text-blue-700",
  Transport: "bg-sky-50 text-sky-700",
  Cleaning: "bg-teal-50 text-teal-700",
  Repairs: "bg-orange-50 text-orange-700",
  Miscellaneous: "bg-slate-100 text-slate-600",
};

const totalPurchases = purchases.reduce((a, p) => a + p.amount, 0);
const totalExpenses = expenses.reduce((a, e) => a + e.amount, 0);

export default function PurchasesPage() {
  return (
    <div className="p-5 space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Purchases (May)",
            value: `UGX ${(totalPurchases / 1000000).toFixed(2)}M`,
            sub: `${purchases.length} orders`,
          },
          {
            label: "Pending Orders",
            value: purchases
              .filter((p) => p.status === "Pending")
              .length.toString(),
            sub: "awaiting delivery",
          },
          {
            label: "Expenses (May)",
            value: `UGX ${(totalExpenses / 1000).toFixed(0)}k`,
            sub: `${expenses.length} entries`,
          },
          {
            label: "Total Outflow",
            value: `UGX ${((totalPurchases + totalExpenses) / 1000000).toFixed(2)}M`,
            sub: "purchases + expenses",
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

      {/* Purchases table */}
      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ArrowDownToLine className="w-4 h-4 text-slate-400" />
            <div>
              <h2 className="text-[13px] font-semibold text-slate-900">
                Purchase Orders
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Stock bought from suppliers
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium px-3 py-1.5 rounded-md transition-colors">
            <Plus className="w-3.5 h-3.5" />
            New Purchase
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {[
                  "Order Ref",
                  "Supplier",
                  "Description",
                  "Items",
                  "Amount",
                  "Status",
                  "Date",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap ${["Amount", "Items"].includes(h) ? "text-right" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {purchases.map((p) => (
                <tr
                  key={p.ref}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  <td className="px-4 py-3">
                    <span className="text-[12px] font-medium text-slate-700 font-mono">
                      {p.ref}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[13px] text-slate-800 whitespace-nowrap">
                      {p.supplier}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-slate-500 max-w-[240px] block truncate">
                      {p.description}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-[12px] text-slate-600 tabular-nums">
                      {p.items}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-[13px] font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                      UGX {p.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded font-medium ${statusConfig[p.status]}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-slate-400 whitespace-nowrap">
                      {p.date}
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
      </div>

      {/* Expenses table */}
      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-slate-400" />
            <div>
              <h2 className="text-[13px] font-semibold text-slate-900">
                Expenses
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Operating costs and business expenses
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-[12px] font-medium px-3 py-1.5 rounded-md border border-slate-200 transition-colors">
            <Plus className="w-3.5 h-3.5 text-slate-400" />
            Add Expense
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {[
                  "Ref",
                  "Category",
                  "Description",
                  "Amount",
                  "Date",
                  "Recorded by",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap ${h === "Amount" ? "text-right" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {expenses.map((e) => (
                <tr
                  key={e.ref}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  <td className="px-4 py-3">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {e.ref}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded font-medium ${expenseCategoryColors[e.category] ?? "bg-slate-100 text-slate-600"}`}
                    >
                      {e.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[13px] text-slate-700">
                      {e.description}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-[13px] font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                      UGX {e.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-slate-400 whitespace-nowrap">
                      {e.date}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-slate-500">
                      {e.recorder}
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

        <div className="px-4 py-3 border-t border-slate-100 flex justify-between items-center">
          <p className="text-[12px] text-slate-400">
            {expenses.length} expense entries this month
          </p>
          <p className="text-[13px] font-semibold text-slate-800 tabular-nums">
            Total: UGX {totalExpenses.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
