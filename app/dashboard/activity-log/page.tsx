"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { History, Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, ApiError } from "@/lib/api";

interface AuditLogItem {
  _id: string;
  actorEmail: string;
  actorRole: "client" | "staff" | "superadmin";
  actorStaffRole?: string | null;
  action: string;
  targetLabel: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

const PAGE_SIZE = 20;

const ACTION_LABELS: Record<string, string> = {
  "staff.created": "Staff added",
  "staff.deleted": "Staff removed",
  "staff.role_changed": "Role changed",
  "staff.branch_changed": "Branch reassigned",
  "staff.activated": "Staff reactivated",
  "staff.deactivated": "Staff deactivated",
  "staff.permissions_updated": "Permissions updated",
  "branch.deleted": "Branch deleted",
  "sale.deleted": "Sale deleted",
  "customer.deleted": "Customer deleted",
  "supplier.deleted": "Supplier deleted",
  "expense.deleted": "Expense deleted",
  "purchase.deleted": "Purchase deleted",
  "invoice.deleted": "Invoice deleted",
  "invoice.paid": "Invoice paid",
  "quotation.deleted": "Quotation deleted",
  "order.voided": "Order voided",
  "booking.cancelled": "Booking cancelled",
  "product.damaged": "Damaged goods recorded",
};

const ACTION_STYLES: Record<string, string> = {
  "staff.created": "bg-emerald-50 text-emerald-700",
  "staff.deleted": "bg-red-50 text-red-600",
  "staff.role_changed": "bg-blue-50 text-blue-700",
  "staff.branch_changed": "bg-blue-50 text-blue-700",
  "staff.activated": "bg-emerald-50 text-emerald-700",
  "staff.deactivated": "bg-amber-50 text-amber-700",
  "staff.permissions_updated": "bg-purple-50 text-purple-700",
  "branch.deleted": "bg-red-50 text-red-600",
  "sale.deleted": "bg-red-50 text-red-600",
  "customer.deleted": "bg-red-50 text-red-600",
  "supplier.deleted": "bg-red-50 text-red-600",
  "expense.deleted": "bg-red-50 text-red-600",
  "purchase.deleted": "bg-red-50 text-red-600",
  "invoice.deleted": "bg-red-50 text-red-600",
  "invoice.paid": "bg-emerald-50 text-emerald-700",
  "quotation.deleted": "bg-red-50 text-red-600",
  "order.voided": "bg-amber-50 text-amber-700",
  "booking.cancelled": "bg-amber-50 text-amber-700",
  "product.damaged": "bg-orange-50 text-orange-700",
};

function describeEvent(log: AuditLogItem): string {
  const d = log.details ?? {};
  switch (log.action) {
    case "staff.created":
      return `Added staff member "${log.targetLabel}"${d.staffRole ? ` as ${d.staffRole}` : ""}`;
    case "staff.deleted":
      return `Removed staff member "${log.targetLabel}"`;
    case "staff.role_changed":
      return `Changed ${log.targetLabel}'s role from ${d.from} to ${d.to}`;
    case "staff.branch_changed":
      return `Reassigned ${log.targetLabel} from ${d.from} to ${d.to}`;
    case "staff.activated":
      return `Reactivated staff member "${log.targetLabel}"`;
    case "staff.deactivated":
      return `Deactivated staff member "${log.targetLabel}"`;
    case "staff.permissions_updated":
      return "Updated staff role permissions";
    case "branch.deleted":
      return `Deleted branch "${log.targetLabel}"`;
    case "sale.deleted":
      return `Deleted sale ${log.targetLabel}`;
    case "customer.deleted":
      return `Deleted customer ${log.targetLabel}`;
    case "supplier.deleted":
      return `Deleted supplier ${log.targetLabel}`;
    case "expense.deleted":
      return `Deleted expense ${log.targetLabel}`;
    case "purchase.deleted":
      return `Deleted purchase ${log.targetLabel}`;
    case "invoice.deleted":
      return `Deleted invoice ${log.targetLabel}`;
    case "invoice.paid":
      return `Marked invoice ${log.targetLabel} as paid via ${d.method} (${d.saleRef})`;
    case "quotation.deleted":
      return `Deleted quotation ${log.targetLabel}`;
    case "order.voided":
      return `Voided order ${log.targetLabel}`;
    case "booking.cancelled":
      return `Cancelled stay ${log.targetLabel}`;
    case "product.damaged":
      return `Wrote off ${d.qty} × "${log.targetLabel}" as damaged (${d.reason})`;
    default:
      return log.action;
  }
}

function describeActor(log: AuditLogItem): string {
  const role =
    log.actorRole === "client"
      ? "Owner"
      : log.actorRole === "superadmin"
        ? "Superadmin"
        : (log.actorStaffRole ?? "Staff");
  return `${log.actorEmail} · ${role}`;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ActivityLogPage() {
  const { profile } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isOwner = profile?.role === "client";

  // This is a trace of dangerous actions across the whole business — owner-only
  useEffect(() => {
    if (profile && !isOwner) router.replace("/dashboard");
  }, [profile, isOwner, router]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    if (!isOwner) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
          ...(actionFilter && { action: actionFilter }),
        });
        const data = await apiRequest<{ items: AuditLogItem[]; total: number }>(
          `/api/audit-logs?${params}`,
        );
        if (cancelled) return;
        setItems(data.items ?? []);
        setTotal(data.total ?? 0);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof ApiError ? err.message : "Failed to load activity log");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page, actionFilter, isOwner]);

  if (!isOwner) return null;

  return (
    <div className="p-5 flex flex-col h-full gap-4">
      <div className="bg-white border border-slate-200 rounded-lg flex flex-col flex-1 min-h-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-blue-600" />
            <h2 className="font-semibold text-slate-900">Activity Log</h2>
            <span className="text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-medium tabular-nums">
              {total} total
            </span>
          </div>
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="text-[12px] bg-slate-50 border border-slate-200 rounded-md text-slate-600 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
          >
            <option value="">All actions</option>
            {Object.entries(ACTION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-auto flex-1 min-h-0">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                {["Action", "Details", "Performed By", "Date"].map((label) => (
                  <th
                    key={label}
                    className="px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap text-left"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400 mx-auto" />
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-[13px] text-red-500">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-[13px] text-slate-400">
                    <History className="w-5 h-5 text-slate-300 mx-auto mb-2" />
                    No activity recorded yet
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                items.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 text-left whitespace-nowrap">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                          ACTION_STYLES[log.action] ?? "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {ACTION_LABELS[log.action] ?? log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-left">
                      <p className="text-[13px] text-slate-700">{describeEvent(log)}</p>
                    </td>
                    <td className="px-4 py-3 text-left">
                      <span className="text-[12px] text-slate-500 whitespace-nowrap">
                        {describeActor(log)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-left">
                      <span className="text-[12px] text-slate-400 whitespace-nowrap">
                        {formatDateTime(log.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <p className="text-[12px] text-slate-400">
            {total === 0
              ? "No activity"
              : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total}`}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2.5 py-1.5 text-[12px] rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-2.5 py-1.5 text-[12px] rounded-md border transition-colors ${
                  p === page
                    ? "bg-blue-600 text-white border-blue-600 font-medium"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2.5 py-1.5 text-[12px] rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
