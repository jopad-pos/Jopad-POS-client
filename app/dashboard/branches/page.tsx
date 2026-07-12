"use client";

import { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Phone,
  Plus,
  Pencil,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Trash2,
  Building2,
  TrendingUp,
  ShoppingCart,
  Crown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { apiRequest, ApiError } from "@/lib/api";
import PlanGate from "@/components/PlanGate";
import { useBranch, Branch } from "@/contexts/BranchContext";
import { useAuth } from "@/contexts/AuthContext";

interface BranchStats extends Branch {
  todayRevenue: number;
  todayTransactions: number;
}

interface FormState {
  name: string;
  location: string;
  phone: string;
}

const EMPTY_FORM: FormState = { name: "", location: "", phone: "" };

function formatCurrency(n: number) {
  return "UGX " + n.toLocaleString();
}

// ── Branch card ───────────────────────────────────────────────────────────────

function BranchCard({
  branch,
  onEdit,
  onToggle,
  onDelete,
}: {
  branch: BranchStats;
  onEdit: (b: BranchStats) => void;
  onToggle: (b: BranchStats) => void;
  onDelete: (b: BranchStats) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      className={`bg-white border rounded-xl p-5 flex flex-col gap-4 transition-all ${
        branch.isActive ? "border-slate-200" : "border-slate-100 opacity-60"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Building2 className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-[13px] font-semibold text-slate-900 truncate">
                {branch.name}
              </h3>
              {branch.isHQ && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wide bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded-full shrink-0">
                  <Crown className="w-2.5 h-2.5" /> HQ
                </span>
              )}
              {!branch.isActive && (
                <span className="text-[9px] font-bold uppercase tracking-wide bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full shrink-0">
                  Inactive
                </span>
              )}
            </div>
            {branch.location && (
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <p className="text-[11px] text-slate-500 truncate">{branch.location}</p>
              </div>
            )}
            {branch.phone && (
              <div className="flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                <p className="text-[11px] text-slate-500">{branch.phone}</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions menu */}
        <div ref={menuRef} className="relative shrink-0">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 min-w-[140px] py-1">
              <button
                onClick={() => { onEdit(branch); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
              {!branch.isHQ && (
                <>
                  <button
                    onClick={() => { onToggle(branch); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    {branch.isActive ? (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-amber-500" /> Deactivate
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Activate
                      </>
                    )}
                  </button>
                  <div className="h-px bg-slate-100 my-1" />
                  <button
                    onClick={() => { onDelete(branch); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Today's stats */}
      {branch.isActive && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-50 rounded-lg px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <p className="text-[10px] font-medium text-slate-500">Revenue Today</p>
            </div>
            <p className="text-[13px] font-semibold text-slate-900 tabular-nums">
              {formatCurrency(branch.todayRevenue)}
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <ShoppingCart className="w-3 h-3 text-blue-500" />
              <p className="text-[10px] font-medium text-slate-500">Transactions</p>
            </div>
            <p className="text-[13px] font-semibold text-slate-900 tabular-nums">
              {branch.todayTransactions}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Branch modal (create / edit) ──────────────────────────────────────────────

function BranchModal({
  initial,
  onClose,
  onSaved,
}: {
  initial?: BranchStats;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = Boolean(initial);
  const [form, setForm] = useState<FormState>(
    initial ? { name: initial.name, location: initial.location, phone: initial.phone } : EMPTY_FORM
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isEdit && initial) {
        await apiRequest(`/api/branches/${initial._id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
      } else {
        await apiRequest("/api/branches", {
          method: "POST",
          body: JSON.stringify(form),
        });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save branch");
      setLoading(false);
    }
  }

  const inputCls =
    "w-full text-[13px] px-3 py-2 border border-slate-200 rounded-md bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5">
        <h2 className="text-[15px] font-semibold text-slate-800 mb-4">
          {isEdit ? "Edit Branch" : "New Branch"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Branch Name <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputCls}
              placeholder="e.g. Kampala Main, Entebbe Branch"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Location / Address
            </label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className={inputCls}
              placeholder="e.g. Kampala Road, Plot 12"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Phone
            </label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={inputCls}
              placeholder="+256 7xx xxx xxx"
            />
          </div>
          {error && <p className="text-[12px] text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-[13px] font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-md transition"
            >
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Branch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete confirm ────────────────────────────────────────────────────────────

function DeleteConfirm({
  branch,
  onClose,
  onDeleted,
}: {
  branch: BranchStats;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    setError("");
    try {
      await apiRequest(`/api/branches/${branch._id}`, { method: "DELETE" });
      onDeleted();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete branch");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5">
        <h2 className="text-[15px] font-semibold text-slate-800 mb-2">Delete Branch</h2>
        <p className="text-[13px] text-slate-600 mb-4">
          Are you sure you want to delete <strong>{branch.name}</strong>? This action cannot be undone.
        </p>
        {error && <p className="text-[12px] text-red-600 mb-3">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 text-[13px] font-medium bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-md transition"
          >
            {loading ? "Deleting..." : "Delete Branch"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BranchesPage() {
  return (
    <PlanGate featureKey="branches">
      <BranchesDashboard />
    </PlanGate>
  );
}

function BranchesDashboard() {
  const { refreshBranches } = useBranch();
  const { profile } = useAuth();
  const router = useRouter();
  const [branches, setBranches] = useState<BranchStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Branch management is owner-only — bounce staff (e.g. Managers) back to the dashboard
  useEffect(() => {
    if (profile && profile.role !== "client") router.replace("/dashboard");
  }, [profile, router]);

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<BranchStats | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BranchStats | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await apiRequest<BranchStats[]>("/api/branches/stats");
      setBranches(data);
      setError("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load branches");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleToggle(branch: BranchStats) {
    try {
      await apiRequest(`/api/branches/${branch._id}/status`, { method: "PATCH" });
      await load();
      await refreshBranches();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update branch status");
    }
  }

  const activeBranches = branches.filter((b) => b.isActive);
  const totalRevenue = activeBranches.reduce((s, b) => s + b.todayRevenue, 0);
  const totalTransactions = activeBranches.reduce((s, b) => s + b.todayTransactions, 0);

  return (
    <div className="p-5 space-y-5">
      {/* Header + action */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[15px] font-semibold text-slate-900">Branch Management</h1>
          <p className="text-[12px] text-slate-500 mt-0.5">
            Manage your store locations across Uganda and beyond.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium px-3 py-2 rounded-lg transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Branch
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "Total Branches", value: branches.length, sub: `${activeBranches.length} active` },
          { label: "Revenue Today", value: formatCurrency(totalRevenue), sub: "across all branches" },
          { label: "Transactions Today", value: totalTransactions, sub: "combined" },
        ].map((card) => (
          <div key={card.label} className="bg-white border border-slate-200 rounded-lg px-4 py-3.5">
            <p className="text-[11px] font-medium text-slate-500">{card.label}</p>
            <p className={`text-base font-semibold mt-1 tabular-nums leading-none ${loading ? "text-slate-300" : "text-slate-900"}`}>
              {loading ? "—" : card.value}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-[12px] rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Branch cards grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 animate-pulse">
              <div className="flex gap-3 mb-4">
                <div className="w-9 h-9 bg-slate-100 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                  <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-14 bg-slate-50 rounded-lg" />
                <div className="h-14 bg-slate-50 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : branches.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-[14px] font-medium text-slate-600">No branches yet</p>
          <p className="text-[12px] text-slate-400 mt-1 mb-5">
            Create your first branch to start managing multiple locations.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Create First Branch
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {branches.map((branch) => (
            <BranchCard
              key={branch._id}
              branch={branch}
              onEdit={setEditTarget}
              onToggle={handleToggle}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <BranchModal
          onClose={() => setShowCreate(false)}
          onSaved={async () => {
            setShowCreate(false);
            await load();
            await refreshBranches();
          }}
        />
      )}
      {editTarget && (
        <BranchModal
          initial={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={async () => {
            setEditTarget(null);
            await load();
            await refreshBranches();
          }}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          branch={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={async () => {
            setDeleteTarget(null);
            await load();
            await refreshBranches();
          }}
        />
      )}
    </div>
  );
}
