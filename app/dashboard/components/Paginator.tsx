"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function usePagination<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safeP = Math.min(page, totalPages);
  const paged = items.slice((safeP - 1) * pageSize, safeP * pageSize);

  useEffect(() => {
    setPage(1);
  }, [items]);

  return { page: safeP, setPage, totalPages, paged };
}

interface PaginatorProps {
  page: number;
  totalPages: number;
  total: number;
  setPage: (p: number) => void;
}

export function Paginator({ page, totalPages, total, setPage }: PaginatorProps) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 flex-shrink-0">
      <span className="text-[10px] text-slate-400">{total} total</span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />
        </button>
        <span className="text-[11px] text-slate-500 tabular-nums min-w-[40px] text-center">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        </button>
      </div>
    </div>
  );
}
