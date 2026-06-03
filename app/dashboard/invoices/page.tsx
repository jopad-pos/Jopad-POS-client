import { Plus, Search, MoreHorizontal, FileText, Download } from "lucide-react";

type InvoiceStatus = "Paid" | "Sent" | "Draft" | "Overdue";

interface Invoice {
  ref: string;
  customer: string;
  date: string;
  dueDate: string;
  amount: number;
  status: InvoiceStatus;
  items: number;
}

const invoices: Invoice[] = [
  {
    ref: "INV-014",
    customer: "Kasozi James",
    date: "May 12, 2026",
    dueDate: "May 19, 2026",
    amount: 480000,
    status: "Sent",
    items: 4,
  },
  {
    ref: "INV-013",
    customer: "Mugisha Robert",
    date: "May 10, 2026",
    dueDate: "May 17, 2026",
    amount: 320000,
    status: "Overdue",
    items: 3,
  },
  {
    ref: "INV-012",
    customer: "Nakato Sarah",
    date: "May 8, 2026",
    dueDate: "May 15, 2026",
    amount: 215000,
    status: "Paid",
    items: 5,
  },
  {
    ref: "INV-011",
    customer: "Wasswa Peter",
    date: "May 6, 2026",
    dueDate: "May 13, 2026",
    amount: 560000,
    status: "Paid",
    items: 7,
  },
  {
    ref: "INV-010",
    customer: "Akello Grace",
    date: "May 5, 2026",
    dueDate: "May 12, 2026",
    amount: 90000,
    status: "Overdue",
    items: 2,
  },
  {
    ref: "INV-009",
    customer: "Nambooze Faith",
    date: "May 3, 2026",
    dueDate: "May 10, 2026",
    amount: 145000,
    status: "Paid",
    items: 3,
  },
  {
    ref: "INV-008",
    customer: "Okello Samuel",
    date: "May 2, 2026",
    dueDate: "May 9, 2026",
    amount: 380000,
    status: "Paid",
    items: 6,
  },
  {
    ref: "INV-007",
    customer: "Opolot David",
    date: "May 1, 2026",
    dueDate: "May 8, 2026",
    amount: 250000,
    status: "Paid",
    items: 4,
  },
  {
    ref: "INV-006",
    customer: "Kirabo Teddy",
    date: "Apr 28, 2026",
    dueDate: "May 5, 2026",
    amount: 175000,
    status: "Paid",
    items: 3,
  },
  {
    ref: "INV-005",
    customer: "Kasozi James",
    date: "Apr 25, 2026",
    dueDate: "May 2, 2026",
    amount: 420000,
    status: "Draft",
    items: 5,
  },
];

const statusConfig: Record<InvoiceStatus, string> = {
  Paid: "bg-emerald-50 text-emerald-700",
  Sent: "bg-blue-50 text-blue-700",
  Draft: "bg-slate-100 text-slate-500",
  Overdue: "bg-red-50 text-red-700",
};

export default function InvoicesPage() {
  const totalOutstanding = invoices
    .filter((i) => ["Sent", "Overdue"].includes(i.status))
    .reduce((a, i) => a + i.amount, 0);
  const overdueCount = invoices.filter((i) => i.status === "Overdue").length;

  return (
    <div className="p-5 space-y-4">
      {/* Plus badge */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold bg-blue-600 text-white px-2 py-0.5 rounded">
          PLUS
        </span>
        <span className="text-[11px] text-slate-400">
          This feature is included in your Plus plan
        </span>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Total Invoices",
            value: invoices.length.toString(),
            sub: "all time",
          },
          {
            label: "Outstanding",
            value: `UGX ${(totalOutstanding / 1000).toFixed(0)}k`,
            sub: `${invoices.filter((i) => i.status === "Sent").length} sent`,
            warn: false,
          },
          {
            label: "Overdue",
            value: overdueCount.toString(),
            sub: "need follow-up",
            alert: overdueCount > 0,
          },
          {
            label: "Collected (May)",
            value: `UGX ${invoices
              .filter((i) => i.status === "Paid")
              .reduce((a, i) => a + i.amount, 0)
              .toLocaleString()}`,
            sub: "paid invoices",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`bg-white border rounded-lg px-4 py-3.5 ${(s as any).alert ? "border-red-200" : "border-slate-200"}`}
          >
            <p className="text-[11px] font-medium text-slate-500">{s.label}</p>
            <p
              className={`text-base font-semibold mt-1 tabular-nums leading-none ${(s as any).alert ? "text-red-600" : "text-slate-900"}`}
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
              placeholder="Search invoices..."
              className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-slate-50 border border-slate-200 rounded-md text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>
          <select className="text-[12px] bg-slate-50 border border-slate-200 rounded-md text-slate-600 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option>All Statuses</option>
            <option>Paid</option>
            <option>Sent</option>
            <option>Draft</option>
            <option>Overdue</option>
          </select>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium px-3 py-1.5 rounded-md transition-colors ml-auto">
            <Plus className="w-3.5 h-3.5" />
            New Invoice
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {[
                  "Invoice",
                  "Customer",
                  "Date",
                  "Due Date",
                  "Items",
                  "Amount",
                  "Status",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap ${["Items", "Amount"].includes(h) ? "text-right" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {invoices.map((inv) => (
                <tr
                  key={inv.ref}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-slate-300" />
                      <span className="text-[12px] font-medium text-slate-700 font-mono">
                        {inv.ref}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[13px] text-slate-800">
                      {inv.customer}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-slate-400 whitespace-nowrap">
                      {inv.date}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[12px] whitespace-nowrap ${inv.status === "Overdue" ? "text-red-600 font-medium" : "text-slate-400"}`}
                    >
                      {inv.dueDate}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-[12px] text-slate-600 tabular-nums">
                      {inv.items}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-[13px] font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                      UGX {inv.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded font-medium ${statusConfig[inv.status]}`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
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
