"use client";

import { Plus, Pencil, Trash2, UtensilsCrossed } from "lucide-react";
import { Paginator, usePagination } from "../../components/Paginator";
import type { RestaurantTable } from "./types";
import { TABLE_STATUS_STYLES } from "./types";

interface Props {
  tables: RestaurantTable[];
  openOrderTableIds: Set<string>;
  loading: boolean;
  isOwner: boolean;
  onAddTable: () => void;
  onOpenTab: (table: RestaurantTable) => void;
  onViewTab: (table: RestaurantTable) => void;
  onMarkClean: (table: RestaurantTable) => void;
  onEditTable: (table: RestaurantTable) => void;
  onDeleteTable: (table: RestaurantTable) => void;
}

export default function TablesBoard({
  tables,
  openOrderTableIds,
  loading,
  isOwner,
  onAddTable,
  onOpenTab,
  onViewTab,
  onMarkClean,
  onEditTable,
  onDeleteTable,
}: Props) {
  const { page, setPage, totalPages, paged } = usePagination(tables, 20);

  return (
    <div className="bg-white border border-slate-200 rounded-lg flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-800">Tables</h2>
        {isOwner && (
          <button
            onClick={onAddTable}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            <Plus className="w-3.5 h-3.5" />
            Add table
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <p className="text-sm text-slate-400 text-center py-10">Loading tables…</p>
        ) : tables.length === 0 ? (
          <div className="text-center py-12">
            <UtensilsCrossed className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500 mb-1">No tables yet</p>
            <p className="text-[12px] text-slate-400">
              {isOwner ? "Add your first table to start taking orders." : "No tables configured."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {paged.map((table) => {
              const s = TABLE_STATUS_STYLES[table.status];
              const needsCleaning = table.status === "needs-cleaning";
              // A table can be "occupied" purely from a seated reservation with
              // no Order opened yet — only an actual open order should block
              // edits/deletes or offer "View tab" instead of "Open tab".
              const hasOpenOrder = openOrderTableIds.has(table._id);
              return (
                <div
                  key={table._id}
                  className={`border rounded-lg p-3 flex flex-col gap-2 transition-colors ${s.card}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        Table {table.label}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {table.section || "—"} · seats {table.capacity}
                      </p>
                    </div>
                    <span className={`flex items-center gap-1 text-[10px] font-medium ${s.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {s.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mt-auto pt-1">
                    {hasOpenOrder ? (
                      <button
                        onClick={() => onViewTab(table)}
                        className="flex-1 text-[11px] font-medium text-white bg-blue-600 hover:bg-blue-700 rounded px-2 py-1.5"
                      >
                        View tab
                      </button>
                    ) : needsCleaning ? (
                      <button
                        onClick={() => onMarkClean(table)}
                        className="flex-1 text-[11px] font-medium text-white bg-amber-600 hover:bg-amber-700 rounded px-2 py-1.5"
                      >
                        Mark clean
                      </button>
                    ) : (
                      <button
                        onClick={() => onOpenTab(table)}
                        className="flex-1 text-[11px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded px-2 py-1.5"
                      >
                        Open tab
                      </button>
                    )}
                    {isOwner && (
                      <>
                        <button
                          onClick={() => onEditTable(table)}
                          title="Edit table"
                          className="p-1.5 rounded text-slate-400 hover:text-slate-600 hover:bg-white/60"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTable(table)}
                          disabled={hasOpenOrder}
                          title={hasOpenOrder ? "Close the tab first" : "Delete table"}
                          className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-white/60 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Paginator page={page} totalPages={totalPages} total={tables.length} setPage={setPage} />
    </div>
  );
}
