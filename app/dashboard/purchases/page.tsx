"use client";

import { useEffect, useState } from "react";
import { apiRequest, ApiError } from "@/lib/api";
import { useBranchQuery } from "@/contexts/BranchContext";
import { Purchase, Expense } from "./components/types";
import PurchasesTable from "./components/PurchasesTable";
import ExpensesTable from "./components/ExpensesTable";
import PurchaseModal from "./components/PurchaseModal";
import ExpenseModal from "./components/ExpenseModal";
import ViewPurchaseModal from "./components/ViewPurchaseModal";
import ReceiveModal from "./components/ReceiveModal";
import DeleteConfirm from "./components/DeleteConfirm";

export default function PurchasesPage() {
  const branchQuery = useBranchQuery();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Purchase modal state
  const [addPurchaseOpen, setAddPurchaseOpen] = useState(false);
  const [editPurchase, setEditPurchase] = useState<Purchase | null>(null);
  const [viewPurchase, setViewPurchase] = useState<Purchase | null>(null);
  const [deletePurchase, setDeletePurchase] = useState<Purchase | null>(null);
  const [receivePurchase, setReceivePurchase] = useState<Purchase | null>(null);

  // Expense modal state
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [deleteExpense, setDeleteExpense] = useState<Expense | null>(null);

  // ── Load data ──────────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      apiRequest<{ items: Purchase[] }>(`/api/purchases?limit=1000${branchQuery}`),
      apiRequest<{ items: Expense[] }>(`/api/expenses?limit=1000${branchQuery}`),
    ])
      .then(([purchasesRes, expensesRes]) => {
        if (cancelled) return;
        setPurchases(purchasesRes.items);
        setExpenses(expensesRes.items);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Failed to load data");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [branchQuery]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handlePurchaseSaved = (saved: Purchase) => {
    setPurchases((prev) => {
      const idx = prev.findIndex((p) => p._id === saved._id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    setAddPurchaseOpen(false);
    setEditPurchase(null);
  };

  const handlePurchaseDeleted = (id: string) => {
    setPurchases((prev) => prev.filter((p) => p._id !== id));
    setDeletePurchase(null);
  };

  const handleReceived = (updated: Purchase) => {
    setPurchases((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
    setReceivePurchase(null);
    setViewPurchase(null);
  };

  const handleExpenseSaved = (saved: Expense) => {
    setExpenses((prev) => {
      const idx = prev.findIndex((e) => e._id === saved._id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    setAddExpenseOpen(false);
    setEditExpense(null);
  };

  const handleExpenseDeleted = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e._id !== id));
    setDeleteExpense(null);
  };

  // ── Summary ─────────────────────────────────────────────────────────────────

  const totalPurchases = purchases.reduce((a, p) => a + p.amount, 0);
  const pendingCount = purchases.filter((p) => p.status === "Pending").length;
  const totalExpenses = expenses.reduce((a, e) => a + e.amount, 0);
  const totalOutflow = totalPurchases + totalExpenses;

  const summaryCards = [
    {
      label: "Total Purchases",
      value:
        totalPurchases >= 1_000_000
          ? `UGX ${(totalPurchases / 1_000_000).toFixed(2)}M`
          : `UGX ${totalPurchases.toLocaleString()}`,
      sub: `${purchases.length} order${purchases.length !== 1 ? "s" : ""}`,
    },
    {
      label: "Pending Orders",
      value: String(pendingCount),
      sub: "awaiting delivery",
      highlight: pendingCount > 0,
    },
    {
      label: "Total Expenses",
      value:
        totalExpenses >= 1_000_000
          ? `UGX ${(totalExpenses / 1_000_000).toFixed(2)}M`
          : `UGX ${(totalExpenses / 1000).toFixed(0)}k`,
      sub: `${expenses.length} entr${expenses.length !== 1 ? "ies" : "y"}`,
    },
    {
      label: "Total Outflow",
      value:
        totalOutflow >= 1_000_000
          ? `UGX ${(totalOutflow / 1_000_000).toFixed(2)}M`
          : `UGX ${totalOutflow.toLocaleString()}`,
      sub: "purchases + expenses",
    },
  ];

  return (
    <div className="p-5 space-y-5">
      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {summaryCards.map((s) => (
          <div
            key={s.label}
            className={`bg-white border rounded-lg px-4 py-3.5 ${
              (s as { highlight?: boolean }).highlight
                ? "border-amber-200"
                : "border-slate-200"
            }`}
          >
            <p className="text-[11px] font-medium text-slate-500">{s.label}</p>
            <p
              className={`text-base font-semibold mt-1 tabular-nums leading-none ${
                (s as { highlight?: boolean }).highlight
                  ? "text-amber-600"
                  : loading
                    ? "text-slate-300"
                    : "text-slate-900"
              }`}
            >
              {loading ? "—" : s.value}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Purchase orders table */}
      <PurchasesTable
        purchases={purchases}
        loading={loading}
        error={error}
        onAddClick={() => setAddPurchaseOpen(true)}
        onView={setViewPurchase}
        onEdit={setEditPurchase}
        onDelete={setDeletePurchase}
      />

      {/* Expenses table */}
      <ExpensesTable
        expenses={expenses}
        loading={loading}
        error={error}
        onAddClick={() => setAddExpenseOpen(true)}
        onEdit={setEditExpense}
        onDelete={setDeleteExpense}
      />

      {/* ── Modals ── */}

      {addPurchaseOpen && (
        <PurchaseModal
          purchase={null}
          onClose={() => setAddPurchaseOpen(false)}
          onSaved={handlePurchaseSaved}
        />
      )}
      {editPurchase && (
        <PurchaseModal
          purchase={editPurchase}
          onClose={() => setEditPurchase(null)}
          onSaved={handlePurchaseSaved}
        />
      )}
      {viewPurchase && (
        <ViewPurchaseModal
          purchase={viewPurchase}
          onClose={() => setViewPurchase(null)}
          onEdit={() => {
            setEditPurchase(viewPurchase);
            setViewPurchase(null);
          }}
          onReceive={() => {
            setReceivePurchase(viewPurchase);
            setViewPurchase(null);
          }}
        />
      )}
      {receivePurchase && (
        <ReceiveModal
          purchase={receivePurchase}
          onClose={() => setReceivePurchase(null)}
          onReceived={handleReceived}
        />
      )}
      {deletePurchase && (
        <DeleteConfirm
          label={`purchase order ${deletePurchase.ref}`}
          endpoint={`/api/purchases/${deletePurchase._id}`}
          id={deletePurchase._id}
          onClose={() => setDeletePurchase(null)}
          onDeleted={handlePurchaseDeleted}
        />
      )}

      {addExpenseOpen && (
        <ExpenseModal
          expense={null}
          onClose={() => setAddExpenseOpen(false)}
          onSaved={handleExpenseSaved}
        />
      )}
      {editExpense && (
        <ExpenseModal
          expense={editExpense}
          onClose={() => setEditExpense(null)}
          onSaved={handleExpenseSaved}
        />
      )}
      {deleteExpense && (
        <DeleteConfirm
          label={`expense ${deleteExpense.ref}`}
          endpoint={`/api/expenses/${deleteExpense._id}`}
          id={deleteExpense._id}
          onClose={() => setDeleteExpense(null)}
          onDeleted={handleExpenseDeleted}
        />
      )}
    </div>
  );
}
