"use client";

import { useEffect, useState, useMemo } from "react";
import { Plus, Search, MoreHorizontal, ClipboardList, Download, ArrowRight } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import PlanGate from "@/components/PlanGate";
import { usePagination, Paginator } from "../components/Paginator";
import { printQuotation } from "./components/printQuotation";
import {
  Quotation,
  QuotationStatus,
  QuotationStats,
  statusConfig,
  fmtDate,
} from "./components/shared";
import QuotationModal from "./components/QuotationModal";
import ViewQuotationModal from "./components/ViewQuotationModal";
import DeleteConfirm from "./components/DeleteConfirm";

const PAGE_SIZE = 15;

export default function QuotationsPage() {
  const { profile } = useAuth();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [stats, setStats] = useState<QuotationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showCreate, setShowCreate] = useState(false);
  const [editQuotation, setEditQuotation] = useState<Quotation | null>(null);
  const [viewQuotation, setViewQuotation] = useState<Quotation | null>(null);
  const [deleteQuotation, setDeleteQuotation] = useState<Quotation | null>(null);

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [convertingId, setConvertingId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    Promise.all([
      apiRequest<{ items: Quotation[] }>("/api/quotations?limit=500"),
      apiRequest<QuotationStats>("/api/quotations/stats"),
    ])
      .then(([list, s]) => {
        setQuotations(list.items);
        setStats(s);
        setError("");
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load quotations");
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return quotations.filter((q) => {
      if (statusFilter !== "All" && q.status !== statusFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!q.ref.toLowerCase().includes(s) && !q.customer.toLowerCase().includes(s))
          return false;
      }
      return true;
    });
  }, [quotations, search, statusFilter]);

  const { page, setPage, totalPages, paged } = usePagination(filtered, PAGE_SIZE);

  function refreshStats() {
    apiRequest<QuotationStats>("/api/quotations/stats").then(setStats).catch(() => {});
  }

  function handleCreated(q: Quotation) {
    setQuotations((prev) => [q, ...prev]);
    setShowCreate(false);
    refreshStats();
  }

  function handleUpdated(q: Quotation) {
    setQuotations((prev) => prev.map((i) => (i._id === q._id ? q : i)));
    setEditQuotation(null);
    refreshStats();
  }

  function handleDeleted(id: string) {
    setQuotations((prev) => prev.filter((i) => i._id !== id));
    setDeleteQuotation(null);
    refreshStats();
  }

  async function handleDownload(q: Quotation) {
    setDownloadingId(q._id);
    try {
      const full = await apiRequest<Quotation>(`/api/quotations/${q._id}`);
      printQuotation(full, profile);
    } catch {
      // silently ignore
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleConvert(q: Quotation) {
    setConvertingId(q._id);
    try {
      const result = await apiRequest<{ invoice: { ref: string }; quotation: Quotation }>(
        `/api/quotations/${q._id}/convert`,
        { method: "POST" }
      );
      handleConverted(result.quotation);
      alert(`Invoice ${result.invoice.ref} created successfully.`);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to convert to invoice");
    } finally {
      setConvertingId(null);
    }
  }

  function handleConverted(updated: Quotation) {
    setQuotations((prev) => prev.map((q) => (q._id === updated._id ? { ...q, status: updated.status } : q)));
    refreshStats();
  }

  function handleSearch(v: string) { setSearch(v); setPage(1); }
  function handleStatusFilter(v: string) { setStatusFilter(v); setPage(1); }

  if (profile?.planFeatures && !profile.planFeatures.includes("quotations")) {
    return <PlanGate featureKey="quotations" />;
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
            label: "Total Quotations",
            value: loading ? "—" : (stats?.total ?? 0).toString(),
            sub: "all time",
            alert: false,
          },
          {
            label: "Pending Response",
            value: loading ? "—" : (stats?.pendingCount ?? 0).toString(),
            sub: "sent, awaiting reply",
            alert: !loading && (stats?.pendingCount ?? 0) > 0,
          },
          {
            label: "Accepted",
            value: loading ? "—" : (stats?.acceptedCount ?? 0).toString(),
            sub: "all time",
            alert: false,
          },
          {
            label: `Accepted Value (${stats?.monthName ?? "…"})`,
            value: loading ? "—" : `UGX ${(stats?.acceptedValue ?? 0).toLocaleString()}`,
            sub: "this month",
            alert: false,
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`bg-white border rounded-lg px-4 py-3.5 ${s.alert ? "border-amber-200" : "border-slate-200"}`}
          >
            <p className="text-[11px] font-medium text-slate-500">{s.label}</p>
            <p className={`text-base font-semibold mt-1 tabular-nums leading-none ${s.alert ? "text-amber-600" : loading ? "text-slate-300" : "text-slate-900"}`}>
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
              placeholder="Search quotations…"
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
            <option>Draft</option>
            <option>Sent</option>
            <option>Accepted</option>
            <option>Declined</option>
            <option>Expired</option>
          </select>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium px-3 py-1.5 rounded-md transition-colors ml-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            New Quotation
          </button>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1">
          <table className="w-full">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-slate-100">
                {["Quotation", "Customer", "Date", "Valid Until", "Items", "Amount", "Status", ""].map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap text-left ${["Items", "Amount"].includes(h) ? "text-right" : ""}`}
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
                    {quotations.length === 0 ? "No quotations yet. Create your first one." : "No quotations match your filters."}
                  </td>
                </tr>
              ) : (
                paged.map((q) => (
                  <tr
                    key={q._id}
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    onClick={() => setViewQuotation(q)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <ClipboardList className="w-3.5 h-3.5 text-slate-300" />
                        <span className="text-[12px] font-medium text-slate-700 font-mono">{q.ref}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[13px] text-slate-800">{q.customer}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[12px] text-slate-400 whitespace-nowrap">{fmtDate(q.issueDate)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[12px] whitespace-nowrap ${q.status === "Expired" ? "text-amber-600 font-medium" : "text-slate-400"}`}>
                        {fmtDate(q.validUntil)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[12px] text-slate-600 tabular-nums">{q.items}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[13px] font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                        UGX {q.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${statusConfig[q.status as QuotationStatus]}`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all relative">
                        <button
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                          title="Download PDF"
                          disabled={downloadingId === q._id}
                          onClick={() => handleDownload(q)}
                        >
                          <Download className={`w-3.5 h-3.5 ${downloadingId === q._id ? "animate-pulse" : ""}`} />
                        </button>
                        <button
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          onClick={() => setOpenMenu(openMenu === q._id ? null : q._id)}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {openMenu === q._id && (
                          <div className="absolute right-0 top-7 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1">
                            <button
                              className="w-full text-left px-3 py-1.5 text-[12px] text-slate-700 hover:bg-slate-50"
                              onClick={() => { setOpenMenu(null); setEditQuotation(q); }}
                            >
                              Edit
                            </button>
                            <button
                              disabled={convertingId === q._id}
                              className="w-full text-left px-3 py-1.5 text-[12px] text-emerald-700 hover:bg-emerald-50 flex items-center gap-1.5 disabled:opacity-50"
                              onClick={() => { setOpenMenu(null); handleConvert(q); }}
                            >
                              <ArrowRight className="w-3 h-3" />
                              {convertingId === q._id ? "Converting…" : "Convert to Invoice"}
                            </button>
                            <button
                              className="w-full text-left px-3 py-1.5 text-[12px] text-red-600 hover:bg-red-50"
                              onClick={() => { setOpenMenu(null); setDeleteQuotation(q); }}
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
        <QuotationModal onClose={() => setShowCreate(false)} onSaved={handleCreated} />
      )}
      {editQuotation && (
        <QuotationModal quotation={editQuotation} onClose={() => setEditQuotation(null)} onSaved={handleUpdated} />
      )}
      {viewQuotation && (
        <ViewQuotationModal
          quotation={viewQuotation}
          onClose={() => setViewQuotation(null)}
          onEdit={(q) => setEditQuotation(q)}
          onConverted={handleConverted}
        />
      )}
      {deleteQuotation && (
        <DeleteConfirm
          quotation={deleteQuotation}
          onClose={() => setDeleteQuotation(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
