"use client";

import { Search, Plus, Eye, ArrowRight } from "lucide-react";
import { Paginator, usePagination } from "../../components/Paginator";
import { StockTransfer, branchName, totalQty } from "./types";

const PAGE_SIZE = 15;

interface Props {
  transfers: StockTransfer[];
  loading: boolean;
  error: string;
  search: string;
  onSearchChange: (v: string) => void;
  onNewTransfer: () => void;
  onView: (t: StockTransfer) => void;
}

export default function TransferHistoryTable({
  transfers,
  loading,
  error,
  search,
  onSearchChange,
  onNewTransfer,
  onView,
}: Props) {
  const { page, setPage, totalPages, paged } = usePagination(transfers, PAGE_SIZE);

  return (
    <div className="bg-white border border-slate-200 rounded-lg flex flex-col flex-1 min-h-0">
      <div className="flex flex-wrap items-center gap-2.5 px-4 py-3 border-b border-slate-100">
        <div className="relative flex-1 min-w-45 max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search transfers…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-slate-50 border border-slate-200 rounded-md text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>
        <button
          onClick={onNewTransfer}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium px-3 py-1.5 rounded-md transition-colors ml-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          New Transfer
        </button>
      </div>

      <div className="flex-1 overflow-auto min-h-0">
        {error ? (
          <div className="px-4 py-8 text-center text-[13px] text-red-500">{error}</div>
        ) : loading ? (
          <div className="px-4 py-12 text-center text-[13px] text-slate-400">Loading transfers…</div>
        ) : transfers.length === 0 ? (
          <div className="px-4 py-12 text-center text-[13px] text-slate-400">
            No stock transfers yet. Move stock between branches to see history here.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {["Ref", "Route", "Items", "Qty", "Note", "Date", ""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-[12px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap text-left"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paged.map((t) => (
                <tr key={t._id} className="hover:bg-slate-100 transition-colors group">
                  <td className="px-4 py-3">
                    <span className="text-[13px] font-medium text-slate-800 whitespace-nowrap">{t.ref}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-[12px] text-slate-600 whitespace-nowrap">
                      {branchName(t.fromBranchId)}
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      {branchName(t.toBranchId)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-slate-500 tabular-nums">{t.items.length}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-slate-500 tabular-nums">{totalQty(t)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-slate-400 truncate max-w-45 block">{t.note || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-slate-400 whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onView(t)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
                        title="View transfer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Paginator page={page} totalPages={totalPages} total={transfers.length} setPage={setPage} />
    </div>
  );
}
