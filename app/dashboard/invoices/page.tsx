"use client";

import { useEffect, useState, useMemo } from "react";
import { Plus, Search, MoreHorizontal, FileText, Download } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useBranchQuery } from "@/contexts/BranchContext";
import PlanGate from "@/components/PlanGate";
import { usePagination, Paginator } from "../components/Paginator";
import { printInvoice } from "./components/printInvoice";
import {
  Invoice,
  InvoiceStatus,
  InvoiceStats,
  statusConfig,
  fmtDate,
} from "./components/shared";
import InvoiceModal from "./components/InvoiceModal";
import ViewInvoiceModal from "./components/ViewInvoiceModal";
import DeleteConfirm from "./components/DeleteConfirm";

const PAGE_SIZE = 15;

export default function InvoicesPage() {
  const { profile } = useAuth();
  const branchQuery = useBranchQuery();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showCreate, setShowCreate] = useState(false);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [deleteInvoice, setDeleteInvoice] = useState<Invoice | null>(null);

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    Promise.all([
      apiRequest<{ items: Invoice[] }>(`/api/invoices?limit=500${branchQuery}`),
      apiRequest<InvoiceStats>(`/api/invoices/stats?1=1${branchQuery}`),
    ])
      .then(([list, s]) => {
        setInvoices(list.items);
        setStats(s);
        setError("");
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load invoices");
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchQuery]);

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      if (statusFilter !== "All" && inv.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!inv.ref.toLowerCase().includes(q) && !inv.customer.toLowerCase().includes(q))
          return false;
      }
      return true;
    });
  }, [invoices, search, statusFilter]);

  const { page, setPage, totalPages, paged } = usePagination(filtered, PAGE_SIZE);

  function handleCreated(inv: Invoice) {
    setInvoices((prev) => [inv, ...prev]);
    setShowCreate(false);
    apiRequest<InvoiceStats>("/api/invoices/stats").then(setStats).catch(() => {});
  }

  function handleUpdated(inv: Invoice) {
    setInvoices((prev) => prev.map((i) => (i._id === inv._id ? inv : i)));
    setEditInvoice(null);
    apiRequest<InvoiceStats>("/api/invoices/stats").then(setStats).catch(() => {});
  }

  function handleDeleted(id: string) {
    setInvoices((prev) => prev.filter((i) => i._id !== id));
    setDeleteInvoice(null);
    apiRequest<InvoiceStats>("/api/invoices/stats").then(setStats).catch(() => {});
  }

  async function handleDownload(inv: Invoice) {
    setDownloadingId(inv._id);
    try {
      const full = await apiRequest<Invoice>(`/api/invoices/${inv._id}`);
      printInvoice(full, profile);
    } catch {
      // silently ignore — user sees nothing printed
    } finally {
      setDownloadingId(null);
    }
  }

  function handleSearch(v: string) { setSearch(v); setPage(1); }
  function handleStatusFilter(v: string) { setStatusFilter(v); setPage(1); }

  if (profile?.planFeatures && !profile.planFeatures.includes("invoices")) {
    return <PlanGate featureKey="invoices" />;
  }

  return (
    <div className="p-5 flex flex-col h-full gap-4">
      {/* Plus badge */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[11px] font-semibold bg-blue-600 text-white px-2 py-0.5 rounded">
          PLUS
        </span>
        <span className="text-[11px] text-slate-400">
          This feature is included in your Plus plan
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
        {[
          {
            label: "Total Invoices",
            value: loading ? "—" : (stats?.total ?? 0).toString(),
            sub: "all time",
            alert: false,
          },
          {
            label: "Outstanding",
            value: loading ? "—" : `UGX ${((stats?.outstanding ?? 0) / 1000).toFixed(0)}k`,
            sub: loading ? "" : `${stats?.sentCount ?? 0} sent`,
            alert: false,
          },
          {
            label: "Overdue",
            value: loading ? "—" : (stats?.overdueCount ?? 0).toString(),
            sub: "need follow-up",
            alert: !loading && (stats?.overdueCount ?? 0) > 0,
          },
          {
            label: `Collected (${stats?.monthName ?? "…"})`,
            value: loading ? "—" : `UGX ${(stats?.collected ?? 0).toLocaleString()}`,
            sub: "paid invoices",
            alert: false,
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`bg-white border rounded-lg px-4 py-3.5 ${s.alert ? "border-red-200" : "border-slate-200"}`}
          >
            <p className="text-[11px] font-medium text-slate-500">{s.label}</p>
            <p className={`text-base font-semibold mt-1 tabular-nums leading-none ${s.alert ? "text-red-600" : loading ? "text-slate-300" : "text-slate-900"}`}>
              {s.value}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white border border-slate-200 rounded-lg flex flex-col flex-1 min-h-0">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 px-4 py-3 border-b border-slate-100 shrink-0">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search invoices…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-slate-50 border border-slate-200 rounded-md text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="text-[12px] bg-slate-50 border border-slate-200 rounded-md text-slate-600 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="All">All Statuses</option>
            <option>Paid</option>
            <option>Sent</option>
            <option>Draft</option>
            <option>Overdue</option>
          </select>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium px-3 py-1.5 rounded-md transition-colors ml-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            New Invoice
          </button>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1">
          <table className="w-full">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-slate-100">
                {["Invoice", "Customer", "Date", "Due Date", "Items", "Amount", "Status", ""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap text-left"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3 bg-slate-100 rounded animate-pulse w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[12px] text-red-500">{error}</td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[12px] text-slate-400">
                    {invoices.length === 0 ? "No invoices yet. Create your first one." : "No invoices match your filters."}
                  </td>
                </tr>
              ) : (
                paged.map((inv) => (
                  <tr
                    key={inv._id}
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    onClick={() => setViewInvoice(inv)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-slate-300" />
                        <span className="text-[12px] font-medium text-slate-700 font-mono">{inv.ref}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[13px] text-slate-800">{inv.customer}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[12px] text-slate-400 whitespace-nowrap">{fmtDate(inv.issueDate)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[12px] whitespace-nowrap ${inv.status === "Overdue" ? "text-red-600 font-medium" : "text-slate-400"}`}>
                        {fmtDate(inv.dueDate)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[12px] text-slate-600 tabular-nums">{inv.items}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[13px] font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                        UGX {inv.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${statusConfig[inv.status as InvoiceStatus]}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all relative">
                        <button
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                          title="Download PDF"
                          disabled={downloadingId === inv._id}
                          onClick={() => handleDownload(inv)}
                        >
                          <Download className={`w-3.5 h-3.5 ${downloadingId === inv._id ? "animate-pulse" : ""}`} />
                        </button>
                        <button
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          onClick={() => setOpenMenu(openMenu === inv._id ? null : inv._id)}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {openMenu === inv._id && (
                          <div className="absolute right-0 top-7 w-36 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1">
                            <button
                              className="w-full text-left px-3 py-1.5 text-[12px] text-slate-700 hover:bg-slate-50"
                              onClick={() => { setOpenMenu(null); setEditInvoice(inv); }}
                            >
                              Edit
                            </button>
                            <button
                              className="w-full text-left px-3 py-1.5 text-[12px] text-red-600 hover:bg-red-50"
                              onClick={() => { setOpenMenu(null); setDeleteInvoice(inv); }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Paginator page={page} totalPages={totalPages} total={filtered.length} setPage={setPage} />
      </div>

      {showCreate && (
        <InvoiceModal onClose={() => setShowCreate(false)} onSaved={handleCreated} />
      )}
      {editInvoice && (
        <InvoiceModal invoice={editInvoice} onClose={() => setEditInvoice(null)} onSaved={handleUpdated} />
      )}
      {viewInvoice && (
        <ViewInvoiceModal
          invoice={viewInvoice}
          onClose={() => setViewInvoice(null)}
          onEdit={(inv) => setEditInvoice(inv)}
        />
      )}
      {deleteInvoice && (
        <DeleteConfirm
          invoice={deleteInvoice}
          onClose={() => setDeleteInvoice(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
