import {
  Search,
  Plus,
  MoreHorizontal,
  AlertTriangle,
  SlidersHorizontal,
  Download,
  Tag,
} from "lucide-react";

type StockStatus = "OK" | "Low" | "Critical" | "Out";

interface Product {
  sku: string;
  name: string;
  category: string;
  qty: number;
  minQty: number;
  buyPrice: number;
  sellPrice: number;
  status: StockStatus;
}

const products: Product[] = [
  {
    sku: "GRC-001",
    name: "Bread (Brown 400g)",
    category: "Groceries",
    qty: 4,
    minQty: 20,
    buyPrice: 3000,
    sellPrice: 3500,
    status: "Critical",
  },
  {
    sku: "GRC-002",
    name: "Cooking Oil 5L",
    category: "Groceries",
    qty: 2,
    minQty: 10,
    buyPrice: 24000,
    sellPrice: 28000,
    status: "Critical",
  },
  {
    sku: "GRC-003",
    name: "Maize Flour 2kg",
    category: "Groceries",
    qty: 3,
    minQty: 12,
    buyPrice: 8000,
    sellPrice: 9500,
    status: "Critical",
  },
  {
    sku: "GRC-004",
    name: "Sugar 2kg",
    category: "Groceries",
    qty: 8,
    minQty: 15,
    buyPrice: 10500,
    sellPrice: 12500,
    status: "Low",
  },
  {
    sku: "GRC-005",
    name: "Sugar 1kg",
    category: "Groceries",
    qty: 18,
    minQty: 20,
    buyPrice: 5500,
    sellPrice: 6500,
    status: "Low",
  },
  {
    sku: "GRC-006",
    name: "Rice (Pishori) 2kg",
    category: "Groceries",
    qty: 25,
    minQty: 15,
    buyPrice: 14000,
    sellPrice: 16000,
    status: "OK",
  },
  {
    sku: "GRC-007",
    name: "Cooking Oil 1L",
    category: "Groceries",
    qty: 34,
    minQty: 20,
    buyPrice: 5500,
    sellPrice: 6500,
    status: "OK",
  },
  {
    sku: "BEV-001",
    name: "Mineral Water 500ml",
    category: "Beverages",
    qty: 48,
    minQty: 24,
    buyPrice: 1000,
    sellPrice: 1500,
    status: "OK",
  },
  {
    sku: "BEV-002",
    name: "Coca-Cola 500ml",
    category: "Beverages",
    qty: 36,
    minQty: 12,
    buyPrice: 1500,
    sellPrice: 2000,
    status: "OK",
  },
  {
    sku: "BEV-003",
    name: "Soda Water 300ml",
    category: "Beverages",
    qty: 72,
    minQty: 24,
    buyPrice: 900,
    sellPrice: 1200,
    status: "OK",
  },
  {
    sku: "BEV-004",
    name: "Pepsi 500ml",
    category: "Beverages",
    qty: 24,
    minQty: 12,
    buyPrice: 1500,
    sellPrice: 2000,
    status: "OK",
  },
  {
    sku: "DAI-001",
    name: "Milk Fresh 500ml",
    category: "Dairy",
    qty: 22,
    minQty: 20,
    buyPrice: 2500,
    sellPrice: 3200,
    status: "OK",
  },
  {
    sku: "DAI-002",
    name: "Eggs (tray 30)",
    category: "Dairy",
    qty: 6,
    minQty: 5,
    buyPrice: 15000,
    sellPrice: 18000,
    status: "OK",
  },
  {
    sku: "DAI-003",
    name: "Yoghurt 500ml",
    category: "Dairy",
    qty: 14,
    minQty: 10,
    buyPrice: 4000,
    sellPrice: 5000,
    status: "OK",
  },
  {
    sku: "CLN-001",
    name: "Omo Detergent 400g",
    category: "Cleaning",
    qty: 15,
    minQty: 10,
    buyPrice: 7000,
    sellPrice: 8500,
    status: "OK",
  },
  {
    sku: "CLN-002",
    name: "Toilet Paper (4pk)",
    category: "Cleaning",
    qty: 30,
    minQty: 20,
    buyPrice: 5500,
    sellPrice: 7000,
    status: "OK",
  },
  {
    sku: "CLN-003",
    name: "Dettol 250ml",
    category: "Cleaning",
    qty: 11,
    minQty: 8,
    buyPrice: 9000,
    sellPrice: 11000,
    status: "OK",
  },
  {
    sku: "AIR-001",
    name: "Airtime MTN 1k",
    category: "Airtime",
    qty: 14,
    minQty: 25,
    buyPrice: 900,
    sellPrice: 1000,
    status: "Low",
  },
  {
    sku: "AIR-002",
    name: "Airtime MTN 2k",
    category: "Airtime",
    qty: 20,
    minQty: 25,
    buyPrice: 1800,
    sellPrice: 2000,
    status: "Low",
  },
  {
    sku: "AIR-003",
    name: "Airtime Airtel 1k",
    category: "Airtime",
    qty: 8,
    minQty: 25,
    buyPrice: 900,
    sellPrice: 1000,
    status: "Low",
  },
  {
    sku: "SNK-001",
    name: "Crisps (Assorted)",
    category: "Snacks",
    qty: 45,
    minQty: 20,
    buyPrice: 1500,
    sellPrice: 2000,
    status: "OK",
  },
  {
    sku: "SNK-002",
    name: "Chocolate 50g",
    category: "Snacks",
    qty: 0,
    minQty: 15,
    buyPrice: 1800,
    sellPrice: 2500,
    status: "Out",
  },
];

const statusConfig: Record<
  StockStatus,
  { label: string; class: string; dot: string }
> = {
  OK: {
    label: "In Stock",
    class: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  Low: {
    label: "Low Stock",
    class: "bg-amber-50 text-amber-700",
    dot: "bg-amber-400",
  },
  Critical: {
    label: "Critical",
    class: "bg-red-50 text-red-600",
    dot: "bg-red-500",
  },
  Out: {
    label: "Out of Stock",
    class: "bg-slate-100 text-slate-500",
    dot: "bg-slate-300",
  },
};

const categories = [
  "All",
  "Groceries",
  "Beverages",
  "Dairy",
  "Cleaning",
  "Airtime",
  "Snacks",
];

const lowCount = products.filter(
  (p) => p.status === "Low" || p.status === "Critical" || p.status === "Out",
).length;
const totalValue = products.reduce((a, p) => a + p.sellPrice * p.qty, 0);

export default function StockPage() {
  return (
    <div className="p-5 space-y-4">
      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Total Products",
            value: products.length.toString(),
            sub: "across all categories",
          },
          {
            label: "Stock Value",
            value: `UGX ${(totalValue / 1000000).toFixed(1)}M`,
            sub: "at selling price",
          },
          {
            label: "Low / Critical",
            value: lowCount.toString(),
            sub: "need reorder",
            highlight: true,
          },
          {
            label: "Out of Stock",
            value: products.filter((p) => p.status === "Out").length.toString(),
            sub: "0 units available",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`bg-white border rounded-lg px-4 py-3.5 ${s.highlight ? "border-amber-200" : "border-slate-200"}`}
          >
            <p className="text-[11px] font-medium text-slate-500">{s.label}</p>
            <p
              className={`text-lg font-semibold mt-1 tabular-nums leading-none ${s.highlight ? "text-amber-600" : "text-slate-900"}`}
            >
              {s.value}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-lg">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 px-4 py-3 border-b border-slate-100">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-slate-50 border border-slate-200 rounded-md text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`text-[11px] px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${cat === "All" ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100"}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button className="flex items-center gap-1.5 text-[12px] text-slate-500 border border-amber-200 bg-amber-50 hover:bg-amber-100 px-2.5 py-1.5 rounded-md text-amber-700 transition-colors">
              <AlertTriangle className="w-3.5 h-3.5" />
              Low stock only
            </button>
            <button className="flex items-center gap-1.5 text-[12px] text-slate-600 border border-slate-200 bg-slate-50 hover:bg-white px-2.5 py-1.5 rounded-md transition-colors">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              Labels
            </button>
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium px-3 py-1.5 rounded-md transition-colors">
              <Plus className="w-3.5 h-3.5" />
              Add Product
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {[
                  "Product",
                  "SKU",
                  "Category",
                  "Qty",
                  "Min Qty",
                  "Buy Price",
                  "Sell Price",
                  "Status",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap ${["Qty", "Min Qty", "Buy Price", "Sell Price"].includes(h) ? "text-right" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.map((p) => {
                const s = statusConfig[p.status];
                return (
                  <tr
                    key={p.sku}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <p className="text-[13px] font-medium text-slate-800 whitespace-nowrap">
                        {p.name}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {p.sku}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[12px] text-slate-500">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`text-[13px] font-semibold tabular-nums ${p.status === "Out" ? "text-slate-400" : p.status === "Critical" ? "text-red-600" : p.status === "Low" ? "text-amber-600" : "text-slate-800"}`}
                      >
                        {p.qty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[12px] text-slate-400 tabular-nums">
                        {p.minQty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[12px] text-slate-500 tabular-nums whitespace-nowrap">
                        {p.buyPrice.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[12px] font-medium text-slate-700 tabular-nums whitespace-nowrap">
                        {p.sellPrice.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded font-medium ${s.class}`}
                        >
                          {s.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-all">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <p className="text-[12px] text-slate-400">
            {products.length} products
          </p>
          <button className="flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-700 transition-colors">
            <Download className="w-3.5 h-3.5" /> Export stock list
          </button>
        </div>
      </div>
    </div>
  );
}
