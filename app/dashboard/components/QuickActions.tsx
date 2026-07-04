"use client";

import { AlertTriangle, FileDown, BoxSelect, Plus, Loader2 } from "lucide-react";
import Link from "next/link";

interface QuickActionsProps {
  loading: boolean;
  error: string | null;
  lowStockCount: number;
  onRefresh: () => void;
}

export function QuickActions({ loading, error, lowStockCount, onRefresh }: QuickActionsProps) {
  return (
    <>
      <div className="flex items-center gap-2.5 flex-wrap">
        <Link
          href="/dashboard/sales?new=true"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium px-3 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New Sale
        </Link>
        <Link
          href="/dashboard/stock"
          className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-[12px] font-medium px-3 py-2 rounded-lg border border-slate-200 transition-colors"
        >
          <BoxSelect className="w-3.5 h-3.5 text-slate-400" />
          Add Product
        </Link>
        <button className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-[12px] font-medium px-3 py-2 rounded-lg border border-slate-200 transition-colors">
          <FileDown className="w-3.5 h-3.5 text-slate-400" />
          Export Today
        </button>

        {lowStockCount > 0 && (
          <div className="ml-auto flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-[12px] font-medium px-3 py-1.5 rounded-lg">
            <AlertTriangle className="w-3.5 h-3.5" />
            {lowStockCount} item{lowStockCount !== 1 ? "s" : ""} low on stock
            <Link
              href="/dashboard/stock"
              className="underline underline-offset-2 text-amber-600 hover:text-amber-800"
            >
              View
            </Link>
          </div>
        )}

        {!loading && !error && (
          <button
            onClick={onRefresh}
            className="ml-auto flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Loader2 className="w-3 h-3" />
            Refresh
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-[12px] px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={onRefresh} className="underline hover:no-underline">
            Retry
          </button>
        </div>
      )}
    </>
  );
}
