import {
  Plus,
  Search,
  MoreHorizontal,
  ShieldCheck,
  ShoppingCart,
  Package,
} from "lucide-react";

type Role = "Cashier" | "Stock Manager" | "Manager";
type Status = "Active" | "Inactive";

interface StaffMember {
  id: string;
  name: string;
  role: Role;
  phone: string;
  status: Status;
  salesToday: number;
  revenueToday: number;
  salesMonth: number;
  revenueMonth: number;
  joined: string;
  pin: string;
}

const staff: StaffMember[] = [
  {
    id: "STF001",
    name: "Namukasa Aisha",
    role: "Manager",
    phone: "+256 772 xxx xxx",
    status: "Active",
    salesToday: 0,
    revenueToday: 0,
    salesMonth: 0,
    revenueMonth: 0,
    joined: "Jan 2026",
    pin: "****",
  },
  {
    id: "STF002",
    name: "Diana Apio",
    role: "Cashier",
    phone: "+256 703 xxx xxx",
    status: "Active",
    salesToday: 14,
    revenueToday: 189000,
    salesMonth: 87,
    revenueMonth: 1245000,
    joined: "Jan 2026",
    pin: "****",
  },
  {
    id: "STF003",
    name: "Brian Okello",
    role: "Stock Manager",
    phone: "+256 756 xxx xxx",
    status: "Active",
    salesToday: 11,
    revenueToday: 156000,
    salesMonth: 74,
    revenueMonth: 1080000,
    joined: "Feb 2026",
    pin: "****",
  },
  {
    id: "STF004",
    name: "Ruth Nambi",
    role: "Cashier",
    phone: "+256 704 xxx xxx",
    status: "Active",
    salesToday: 9,
    revenueToday: 118000,
    salesMonth: 68,
    revenueMonth: 947000,
    joined: "Mar 2026",
    pin: "****",
  },
];

const roleConfig: Record<Role, { label: string; style: string }> = {
  Manager: { label: "Manager", style: "bg-blue-50 text-blue-700" },
  "Stock Manager": {
    label: "Stock Manager",
    style: "bg-indigo-50 text-indigo-700",
  },
  Cashier: { label: "Cashier", style: "bg-slate-100 text-slate-600" },
};

export default function StaffPage() {
  return (
    <div className="p-5 space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Total Staff",
            value: staff.length.toString(),
            sub: "registered accounts",
          },
          {
            label: "On Shift Today",
            value: staff
              .filter((s) => s.status === "Active" && s.salesToday > 0)
              .length.toString(),
            sub: "active today",
          },
          {
            label: "Sales Today",
            value: staff.reduce((a, s) => a + s.salesToday, 0).toString(),
            sub: "transactions",
          },
          {
            label: "Revenue Today",
            value: `UGX ${staff.reduce((a, s) => a + s.revenueToday, 0).toLocaleString()}`,
            sub: "across all staff",
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

      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="flex flex-wrap items-center gap-2.5 px-4 py-3 border-b border-slate-100">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search staff..."
              className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-slate-50 border border-slate-200 rounded-md text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>
          <select className="text-[12px] bg-slate-50 border border-slate-200 rounded-md text-slate-600 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option>All Roles</option>
            <option>Manager</option>
            <option>Stock Manager</option>
            <option>Cashier</option>
          </select>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium px-3 py-1.5 rounded-md transition-colors ml-auto">
            <Plus className="w-3.5 h-3.5" />
            Add Staff
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {[
                  "Staff Member",
                  "Role",
                  "Phone",
                  "Status",
                  "Sales Today",
                  "Revenue Today",
                  "Revenue (Month)",
                  "Joined",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap ${["Sales Today", "Revenue Today", "Revenue (Month)"].includes(h) ? "text-right" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {staff.map((s) => {
                const rc = roleConfig[s.role];
                return (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-semibold text-blue-600">
                            {s.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-slate-800">
                            {s.name}
                          </p>
                          <p className="text-[10px] text-slate-400">{s.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded font-medium ${rc.style}`}
                      >
                        {rc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[12px] text-slate-500">
                        {s.phone}
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
                    <td className="px-4 py-3 text-right">
                      <span className="text-[13px] text-slate-700 tabular-nums">
                        {s.salesToday > 0 ? s.salesToday : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[12px] font-medium text-slate-800 tabular-nums whitespace-nowrap">
                        {s.revenueToday > 0
                          ? `UGX ${s.revenueToday.toLocaleString()}`
                          : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[12px] font-medium text-slate-700 tabular-nums whitespace-nowrap">
                        {s.revenueMonth > 0
                          ? `UGX ${s.revenueMonth.toLocaleString()}`
                          : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[12px] text-slate-400">
                        {s.joined}
                      </span>
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
      </div>

      {/* Permissions reference */}
      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="px-4 py-3.5 border-b border-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <div>
            <h2 className="text-[13px] font-semibold text-slate-900">
              Role Permissions
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              What each role can access
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-left">
                  Permission
                </th>
                {(["Cashier", "Stock Manager", "Manager"] as Role[]).map(
                  (r) => (
                    <th
                      key={r}
                      className="px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center whitespace-nowrap"
                    >
                      {r}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-center">
              {[
                {
                  label: "Process sales",
                  cashier: true,
                  stock: false,
                  manager: true,
                },
                {
                  label: "View stock levels",
                  cashier: true,
                  stock: true,
                  manager: true,
                },
                {
                  label: "Add / edit products",
                  cashier: false,
                  stock: true,
                  manager: true,
                },
                {
                  label: "Record purchases",
                  cashier: false,
                  stock: true,
                  manager: true,
                },
                {
                  label: "Add expenses",
                  cashier: false,
                  stock: false,
                  manager: true,
                },
                {
                  label: "View reports",
                  cashier: false,
                  stock: false,
                  manager: true,
                },
                {
                  label: "Manage staff",
                  cashier: false,
                  stock: false,
                  manager: true,
                },
              ].map((row) => (
                <tr key={row.label} className="hover:bg-slate-50/50">
                  <td className="px-4 py-2.5 text-left text-[12px] text-slate-700">
                    {row.label}
                  </td>
                  {[row.cashier, row.stock, row.manager].map((allowed, i) => (
                    <td key={i} className="px-4 py-2.5">
                      <span
                        className={`text-[13px] ${allowed ? "text-emerald-500" : "text-slate-200"}`}
                      >
                        {allowed ? "✓" : "✕"}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
