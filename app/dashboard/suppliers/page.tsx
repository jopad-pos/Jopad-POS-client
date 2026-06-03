import { Search, Plus, MoreHorizontal, Truck, Phone } from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  categories: string[];
  totalOrders: number;
  totalValue: number;
  lastOrder: string;
  status: "Active" | "Inactive";
}

const suppliers: Supplier[] = [
  {
    id: "S001",
    name: "Quality Superfoods Ltd",
    contact: "James Onyango",
    phone: "+256 772 xxx xxx",
    categories: ["Groceries", "Baked Goods"],
    totalOrders: 24,
    totalValue: 4820000,
    lastOrder: "May 13, 2026",
    status: "Active",
  },
  {
    id: "S002",
    name: "Crown Beverages Ltd",
    contact: "Patricia Nansubuga",
    phone: "+256 704 xxx xxx",
    categories: ["Beverages"],
    totalOrders: 18,
    totalValue: 3240000,
    lastOrder: "May 11, 2026",
    status: "Active",
  },
  {
    id: "S003",
    name: "Mukwano Industries",
    contact: "Sales Desk",
    phone: "+256 414 xxx xxx",
    categories: ["Cooking Oil", "Cleaning"],
    totalOrders: 12,
    totalValue: 6720000,
    lastOrder: "May 10, 2026",
    status: "Active",
  },
  {
    id: "S004",
    name: "Britannia Allied Industries",
    contact: "Charles Muwanga",
    phone: "+256 788 xxx xxx",
    categories: ["Snacks", "Biscuits"],
    totalOrders: 9,
    totalValue: 1620000,
    lastOrder: "May 7, 2026",
    status: "Active",
  },
  {
    id: "S005",
    name: "MTN Uganda",
    contact: "B2B Team",
    phone: "+256 756 xxx xxx",
    categories: ["Airtime"],
    totalOrders: 15,
    totalValue: 1350000,
    lastOrder: "May 6, 2026",
    status: "Active",
  },
  {
    id: "S006",
    name: "Airtel Uganda",
    contact: "Airtel Business",
    phone: "+256 700 xxx xxx",
    categories: ["Airtime"],
    totalOrders: 14,
    totalValue: 1260000,
    lastOrder: "May 5, 2026",
    status: "Active",
  },
  {
    id: "S007",
    name: "Sameer Africa (Bidco)",
    contact: "Trade Desk",
    phone: "+256 414 xxx xxx",
    categories: ["Dairy", "Cooking Oil"],
    totalOrders: 7,
    totalValue: 980000,
    lastOrder: "Apr 28, 2026",
    status: "Active",
  },
  {
    id: "S008",
    name: "Nile Packaging Ltd",
    contact: "Fred Kayiwa",
    phone: "+256 701 xxx xxx",
    categories: ["Packaging"],
    totalOrders: 4,
    totalValue: 320000,
    lastOrder: "Apr 20, 2026",
    status: "Inactive",
  },
];

export default function SuppliersPage() {
  return (
    <div className="p-5 space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          {
            label: "Total Suppliers",
            value: suppliers.length.toString(),
            sub: "registered",
          },
          {
            label: "Active",
            value: suppliers
              .filter((s) => s.status === "Active")
              .length.toString(),
            sub: "currently ordering",
          },
          {
            label: "Total Purchases (YTD)",
            value: `UGX ${(suppliers.reduce((a, s) => a + s.totalValue, 0) / 1000000).toFixed(1)}M`,
            sub: "across all suppliers",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border border-slate-200 rounded-lg px-4 py-3.5"
          >
            <p className="text-[11px] font-medium text-slate-500">{s.label}</p>
            <p className="text-lg font-semibold text-slate-900 mt-1 tabular-nums leading-none">
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
              placeholder="Search suppliers..."
              className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-slate-50 border border-slate-200 rounded-md text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>
          <select className="text-[12px] bg-slate-50 border border-slate-200 rounded-md text-slate-600 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option>All Statuses</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium px-3 py-1.5 rounded-md transition-colors ml-auto">
            <Plus className="w-3.5 h-3.5" />
            Add Supplier
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {[
                  "Supplier",
                  "Contact",
                  "Categories",
                  "Orders",
                  "Total Value",
                  "Last Order",
                  "Status",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap ${["Orders", "Total Value"].includes(h) ? "text-right" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {suppliers.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <Truck className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-slate-800 whitespace-nowrap">
                          {s.name}
                        </p>
                        <p className="text-[10px] text-slate-400">{s.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[12px] text-slate-700">{s.contact}</p>
                    <p className="text-[10px] text-slate-400">{s.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {s.categories.map((cat) => (
                        <span
                          key={cat}
                          className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-[13px] text-slate-700 tabular-nums">
                      {s.totalOrders}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-[12px] font-medium text-slate-800 tabular-nums whitespace-nowrap">
                      UGX {s.totalValue.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-slate-400 whitespace-nowrap">
                      {s.lastOrder}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${s.status === "Active" ? "bg-emerald-500" : "bg-slate-300"}`}
                      />
                      <span
                        className={`text-[12px] font-medium ${s.status === "Active" ? "text-emerald-700" : "text-slate-400"}`}
                      >
                        {s.status}
                      </span>
                    </div>
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
    </div>
  );
}
