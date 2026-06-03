import { Search, Plus, MoreHorizontal, AlertCircle, Users } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  phone: string;
  type: "Regular" | "Occasional" | "New";
  visits: number;
  totalSpent: number;
  creditBalance: number;
  lastVisit: string;
  overdueCredit: boolean;
}

const customers: Customer[] = [
  {
    id: "C001",
    name: "Kasozi James",
    phone: "+256 772 xxx xxx",
    type: "Regular",
    visits: 48,
    totalSpent: 2450000,
    creditBalance: 0,
    lastVisit: "Today",
    overdueCredit: false,
  },
  {
    id: "C002",
    name: "Nakato Sarah",
    phone: "+256 704 xxx xxx",
    type: "Regular",
    visits: 32,
    totalSpent: 1680000,
    creditBalance: 0,
    lastVisit: "Today",
    overdueCredit: false,
  },
  {
    id: "C003",
    name: "Mugisha Robert",
    phone: "+256 756 xxx xxx",
    type: "Regular",
    visits: 28,
    totalSpent: 1245000,
    creditBalance: 150000,
    lastVisit: "Yesterday",
    overdueCredit: true,
  },
  {
    id: "C004",
    name: "Akello Grace",
    phone: "+256 700 xxx xxx",
    type: "Occasional",
    visits: 12,
    totalSpent: 560000,
    creditBalance: 0,
    lastVisit: "May 10",
    overdueCredit: false,
  },
  {
    id: "C005",
    name: "Wasswa Peter",
    phone: "+256 789 xxx xxx",
    type: "Regular",
    visits: 22,
    totalSpent: 980000,
    creditBalance: 0,
    lastVisit: "May 11",
    overdueCredit: false,
  },
  {
    id: "C006",
    name: "Nambooze Faith",
    phone: "+256 752 xxx xxx",
    type: "Regular",
    visits: 19,
    totalSpent: 740000,
    creditBalance: 45000,
    lastVisit: "May 12",
    overdueCredit: false,
  },
  {
    id: "C007",
    name: "Opolot David",
    phone: "+256 703 xxx xxx",
    type: "Occasional",
    visits: 8,
    totalSpent: 310000,
    creditBalance: 0,
    lastVisit: "May 9",
    overdueCredit: false,
  },
  {
    id: "C008",
    name: "Kirabo Teddy",
    phone: "+256 771 xxx xxx",
    type: "New",
    visits: 3,
    totalSpent: 95000,
    creditBalance: 0,
    lastVisit: "May 8",
    overdueCredit: false,
  },
  {
    id: "C009",
    name: "Namutebi Joy",
    phone: "+256 706 xxx xxx",
    type: "Occasional",
    visits: 14,
    totalSpent: 620000,
    creditBalance: 0,
    lastVisit: "May 7",
    overdueCredit: false,
  },
  {
    id: "C010",
    name: "Okello Samuel",
    phone: "+256 774 xxx xxx",
    type: "Regular",
    visits: 31,
    totalSpent: 1340000,
    creditBalance: 80000,
    lastVisit: "May 6",
    overdueCredit: false,
  },
];

const typeStyles: Record<string, string> = {
  Regular: "bg-blue-50 text-blue-700",
  Occasional: "bg-slate-100 text-slate-600",
  New: "bg-emerald-50 text-emerald-700",
};

export default function CustomersPage() {
  const creditCount = customers.filter((c) => c.creditBalance > 0).length;
  const overdueCount = customers.filter((c) => c.overdueCredit).length;

  return (
    <div className="p-5 space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Total Customers",
            value: customers.length.toString(),
            sub: "registered accounts",
          },
          {
            label: "Regular Customers",
            value: customers
              .filter((c) => c.type === "Regular")
              .length.toString(),
            sub: "10+ visits",
          },
          {
            label: "Credit Accounts",
            value: creditCount.toString(),
            sub: "have outstanding balance",
            warn: creditCount > 0,
          },
          {
            label: "Overdue Credit",
            value: overdueCount.toString(),
            sub: "need follow-up",
            alert: overdueCount > 0,
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`bg-white border rounded-lg px-4 py-3.5 ${s.alert ? "border-red-200" : s.warn ? "border-amber-200" : "border-slate-200"}`}
          >
            <p className="text-[11px] font-medium text-slate-500">{s.label}</p>
            <p
              className={`text-lg font-semibold mt-1 tabular-nums leading-none ${s.alert ? "text-red-600" : s.warn ? "text-amber-600" : "text-slate-900"}`}
            >
              {s.value}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="flex flex-wrap items-center gap-2.5 px-4 py-3 border-b border-slate-100">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customers..."
              className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-slate-50 border border-slate-200 rounded-md text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>
          <select className="text-[12px] bg-slate-50 border border-slate-200 rounded-md text-slate-600 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option>All Types</option>
            <option>Regular</option>
            <option>Occasional</option>
            <option>New</option>
          </select>
          <button className="flex items-center gap-1.5 text-[12px] text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-md transition-colors">
            <AlertCircle className="w-3.5 h-3.5" />
            Credit overdue
          </button>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium px-3 py-1.5 rounded-md transition-colors ml-auto">
            <Plus className="w-3.5 h-3.5" />
            Add Customer
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {[
                  "Customer",
                  "Phone",
                  "Type",
                  "Visits",
                  "Total Spent",
                  "Credit Balance",
                  "Last Visit",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap ${["Visits", "Total Spent", "Credit Balance"].includes(h) ? "text-right" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {customers.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-semibold text-slate-500">
                          {c.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-slate-800 whitespace-nowrap flex items-center gap-1.5">
                          {c.name}
                          {c.overdueCredit && (
                            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                          )}
                        </p>
                        <p className="text-[10px] text-slate-400">{c.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-slate-500">
                      {c.phone}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded font-medium ${typeStyles[c.type]}`}
                    >
                      {c.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-[13px] text-slate-700 tabular-nums">
                      {c.visits}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-[12px] font-medium text-slate-800 tabular-nums whitespace-nowrap">
                      UGX {c.totalSpent.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`text-[12px] font-semibold tabular-nums whitespace-nowrap ${c.overdueCredit ? "text-red-600" : c.creditBalance > 0 ? "text-amber-600" : "text-slate-400"}`}
                    >
                      {c.creditBalance > 0
                        ? `UGX ${c.creditBalance.toLocaleString()}`
                        : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-slate-400">
                      {c.lastVisit}
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

        <div className="px-4 py-3 border-t border-slate-100">
          <p className="text-[12px] text-slate-400">
            {customers.length} customers
          </p>
        </div>
      </div>
    </div>
  );
}
