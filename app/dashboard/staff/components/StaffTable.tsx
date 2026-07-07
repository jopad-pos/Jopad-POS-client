"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Plus, MoreHorizontal, Pencil, Trash2, UserCheck, UserX, KeyRound } from "lucide-react";
import { StaffMember, ROLES, roleConfig, initials, formatJoined } from "./types";
import { Paginator, usePagination } from "../../components/Paginator";

const PAGE_SIZE = 15;

// ── Row action menu ───────────────────────────────────────────────────────────

function RowMenu({
  member,
  onEdit,
  onSetPassword,
  onToggleActive,
  onDelete,
}: {
  member: StaffMember;
  onEdit: () => void;
  onSetPassword: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const item = (
    label: string,
    icon: React.ReactNode,
    action: () => void,
    danger = false,
  ) => (
    <button
      onMouseDown={() => {
        action();
        setOpen(false);
      }}
      className={`w-full text-left px-3 py-1.5 text-[12px] flex items-center gap-2 rounded transition ${
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-slate-700 hover:bg-slate-50"
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-300 transition"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg py-1">
          {item("Edit", <Pencil className="w-3.5 h-3.5" />, onEdit)}
          {item("Set Password", <KeyRound className="w-3.5 h-3.5" />, onSetPassword)}
          {item(
            member.isActive ? "Deactivate" : "Activate",
            member.isActive ? (
              <UserX className="w-3.5 h-3.5" />
            ) : (
              <UserCheck className="w-3.5 h-3.5" />
            ),
            onToggleActive,
          )}
          <div className="border-t border-slate-100 my-1" />
          {item("Delete", <Trash2 className="w-3.5 h-3.5" />, onDelete, true)}
        </div>
      )}
    </div>
  );
}

// ── StaffTable ────────────────────────────────────────────────────────────────

const COLS = ["Staff Member", "Role", "Phone", "Status", "Joined", ""];

interface Props {
  items: StaffMember[];
  loading: boolean;
  error: string;
  totalAll: number;
  search: string;
  onSearchChange: (v: string) => void;
  roleFilter: string;
  onRoleFilterChange: (v: string) => void;
  onNew: () => void;
  onEdit: (s: StaffMember) => void;
  onSetPassword: (s: StaffMember) => void;
  onToggleActive: (s: StaffMember) => void;
  onDelete: (s: StaffMember) => void;
}

export default function StaffTable({
  items,
  loading,
  error,
  totalAll,
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  onNew,
  onEdit,
  onSetPassword,
  onToggleActive,
  onDelete,
}: Props) {
  const { page, setPage, totalPages, paged } = usePagination(items, PAGE_SIZE);
  return (
    <div className="bg-white border border-slate-200 rounded-lg flex flex-col flex-1 min-h-0">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5 px-4 py-3 border-b border-slate-100 shrink-0">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search staff..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-slate-50 border border-slate-200 rounded-md text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => onRoleFilterChange(e.target.value)}
          className="text-[12px] bg-slate-50 border border-slate-200 rounded-md text-slate-600 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option>All Roles</option>
          {ROLES.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <button
          onClick={onNew}
          className="flex items-center gap-1.5 text-[12px] font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md transition-colors ml-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Staff
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-auto min-h-0">
        {error ? (
          <div className="px-4 py-8 text-center text-[13px] text-red-500">{error}</div>
        ) : loading ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {COLS.map((h) => (
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
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {[144, 80, 96, 56, 56, 20].map((w, j) => (
                    <td key={j} className="px-4 py-3">
                      <div
                        className="h-3 bg-slate-100 rounded animate-pulse"
                        style={{ width: w }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
            <p className="text-[13px]">
              {totalAll === 0
                ? "No staff added yet."
                : "No staff match your filters."}
            </p>
            {totalAll === 0 && (
              <button
                onClick={onNew}
                className="text-[12px] text-blue-600 hover:underline"
              >
                Add your first staff member
              </button>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {COLS.map((h) => (
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
              {paged.map((s) => (
                <tr
                  key={s._id}
                  className="hover:bg-slate-100 transition-colors group"
                >
                  {/* Name + email */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                          s.isActive ? "bg-blue-100" : "bg-slate-100"
                        }`}
                      >
                        <span
                          className={`text-[10px] font-semibold ${
                            s.isActive ? "text-blue-600" : "text-slate-400"
                          }`}
                        >
                          {initials(s.name)}
                        </span>
                      </div>
                      <div>
                        <p
                          className={`text-[13px] font-medium ${
                            s.isActive ? "text-slate-800" : "text-slate-400"
                          }`}
                        >
                          {s.name}
                        </p>
                        <p className="text-[10px] text-slate-400">{s.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role badge */}
                  <td className="px-4 py-3">
                    {s.staffRole ? (
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                          roleConfig[s.staffRole] ?? "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {s.staffRole}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-300">—</span>
                    )}
                  </td>

                  {/* Phone */}
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-slate-500">
                      {s.phone || "—"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          s.isActive ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                      />
                      <span
                        className={`text-[12px] font-medium ${
                          s.isActive ? "text-emerald-700" : "text-slate-400"
                        }`}
                      >
                        {s.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </td>

                  {/* Joined */}
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-slate-400">
                      {formatJoined(s.createdAt)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <RowMenu
                        member={s}
                        onEdit={() => onEdit(s)}
                        onSetPassword={() => onSetPassword(s)}
                        onToggleActive={() => onToggleActive(s)}
                        onDelete={() => onDelete(s)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <Paginator
        page={page}
        totalPages={totalPages}
        total={items.length}
        setPage={setPage}
      />
      <div className="px-4 py-3 border-t border-slate-100 shrink-0">
        <p className="text-[12px] text-slate-400">
          {loading
            ? "Loading..."
            : items.length !== totalAll
              ? `${items.length} of ${totalAll} staff member${totalAll !== 1 ? "s" : ""}`
              : `${totalAll} staff member${totalAll !== 1 ? "s" : ""}`}
        </p>
      </div>
    </div>
  );
}
