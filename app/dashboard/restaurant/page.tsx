"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useBranchQuery } from "@/contexts/BranchContext";
import PlanGate from "@/components/PlanGate";
import TablesBoard from "./components/TablesBoard";
import TableModal from "./components/TableModal";
import DeleteTableConfirm from "./components/DeleteTableConfirm";
import OpenTableModal from "./components/OpenTableModal";
import OrderTabView from "./components/OrderTabView";
import MenuItemsTable from "./components/MenuItemsTable";
import MenuItemModal from "./components/MenuItemModal";
import DeleteMenuItemConfirm from "./components/DeleteMenuItemConfirm";
import ReservationsTable from "./components/ReservationsTable";
import ReservationModal from "./components/ReservationModal";
import SeatReservationModal from "./components/SeatReservationModal";
import CancelReservationConfirm from "./components/CancelReservationConfirm";
import NoShowConfirm from "./components/NoShowConfirm";
import KitchenDisplay from "./components/KitchenDisplay";
import type {
  MenuItem,
  MenuStats,
  Order,
  OrderStats,
  Reservation,
  ReservationStats,
  RestaurantTable,
  TableStats,
} from "./components/types";

export default function RestaurantPage() {
  return (
    <PlanGate featureKey="restaurant">
      <RestaurantDashboard />
    </PlanGate>
  );
}

type Tab = "tables" | "menu" | "reservations" | "kitchen";

function RestaurantDashboard() {
  const { profile } = useAuth();
  const branchQuery = useBranchQuery();
  const isOwner = profile?.role === "client";

  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [openOrders, setOpenOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuCategories, setMenuCategories] = useState<string[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const [tableStats, setTableStats] = useState<TableStats>({
    total: 0,
    available: 0,
    occupied: 0,
    reserved: 0,
    needsCleaning: 0,
  });
  const [orderStats, setOrderStats] = useState<OrderStats>({
    openOrders: 0,
    itemsPending: 0,
    itemsPreparing: 0,
    itemsReady: 0,
  });
  const [menuStats, setMenuStats] = useState<MenuStats>({
    total: 0,
    categories: 0,
    averagePrice: 0,
    highestPrice: 0,
  });
  const [reservationStats, setReservationStats] = useState<ReservationStats>({
    upcomingToday: 0,
    waiting: 0,
    seatedToday: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("tables");

  // Menu filters
  const [menuSearch, setMenuSearch] = useState("");
  const [menuCategory, setMenuCategory] = useState("All");

  // Reservation filters
  const [resSearch, setResSearch] = useState("");
  const [resStatusFilter, setResStatusFilter] = useState("All");

  // Table modals
  const [addTableOpen, setAddTableOpen] = useState(false);
  const [editTable, setEditTable] = useState<RestaurantTable | null>(null);
  const [deleteTable, setDeleteTable] = useState<RestaurantTable | null>(null);
  const [openTableFor, setOpenTableFor] = useState<RestaurantTable | null>(null);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  // Menu modals
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [editMenuItem, setEditMenuItem] = useState<MenuItem | null>(null);
  const [deleteMenuItem, setDeleteMenuItem] = useState<MenuItem | null>(null);

  // Reservation modals
  const [addReservationOpen, setAddReservationOpen] = useState(false);
  const [editReservation, setEditReservation] = useState<Reservation | null>(null);
  const [seatReservation, setSeatReservation] = useState<Reservation | null>(null);
  const [cancelReservation, setCancelReservation] = useState<Reservation | null>(null);
  const [noShowReservation, setNoShowReservation] = useState<Reservation | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [
        tablesRes,
        ordersRes,
        menuRes,
        catsRes,
        reservationsRes,
        tStats,
        oStats,
        mStats,
        rStats,
      ] = await Promise.all([
        apiRequest<{ items: RestaurantTable[] }>(`/api/tables?limit=500${branchQuery}`),
        apiRequest<{ items: Order[] }>(`/api/orders?status=open&limit=500${branchQuery}`),
        apiRequest<{ items: MenuItem[] }>(`/api/menu-items?limit=500${branchQuery}`),
        apiRequest<string[]>(`/api/menu-items/categories?1=1${branchQuery}`),
        apiRequest<{ items: Reservation[] }>(`/api/reservations?limit=500${branchQuery}`),
        apiRequest<TableStats>(`/api/tables/stats?1=1${branchQuery}`),
        apiRequest<OrderStats>(`/api/orders/stats?1=1${branchQuery}`),
        apiRequest<MenuStats>(`/api/menu-items/stats?1=1${branchQuery}`),
        apiRequest<ReservationStats>(`/api/reservations/stats?1=1${branchQuery}`),
      ]);
      setTables(tablesRes.items);
      setOpenOrders(ordersRes.items);
      setMenuItems(menuRes.items);
      setMenuCategories(catsRes);
      setReservations(reservationsRes.items);
      setTableStats(tStats);
      setOrderStats(oStats);
      setMenuStats(mStats);
      setReservationStats(rStats);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load restaurant data");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchQuery]);

  useEffect(() => {
    load();
  }, [load]);

  // A table can be "occupied" purely from a seated reservation with no Order
  // opened yet (reservations.js's /seat doesn't create one — staff opens the
  // tab separately). Only an actual open order should offer "View tab".
  const openOrderTableIds = useMemo(() => new Set(openOrders.map((o) => o.table)), [openOrders]);

  const cards = [
    { label: "Tables", value: tableStats.total, sub: `${tableStats.occupied} occupied` },
    { label: "Open Tabs", value: orderStats.openOrders, sub: `${orderStats.itemsPreparing} preparing` },
    { label: "Menu Items", value: menuStats.total, sub: `${menuStats.categories} categories` },
    { label: "Waitlist", value: reservationStats.waiting, sub: `${reservationStats.upcomingToday} booked today` },
  ];

  // ── Table handlers ──────────────────────────────────────────────────────

  function handleTableSaved(saved: RestaurantTable) {
    setTables((prev) => {
      const idx = prev.findIndex((t) => t._id === saved._id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
    setAddTableOpen(false);
    setEditTable(null);
    load();
  }

  function handleTableDeleted(id: string) {
    setTables((prev) => prev.filter((t) => t._id !== id));
    setDeleteTable(null);
    load();
  }

  async function markClean(table: RestaurantTable) {
    try {
      const updated = await apiRequest<RestaurantTable>(`/api/tables/${table._id}`, {
        method: "PUT",
        body: JSON.stringify({ status: "available" }),
      });
      setTables((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
    } catch {
      load();
    }
  }

  function handleOrderOpened(order: Order) {
    setOpenOrders((prev) => [order, ...prev]);
    setTables((prev) => prev.map((t) => (t._id === order.table ? { ...t, status: "occupied" } : t)));
    setOpenTableFor(null);
    setViewOrder(order);
    load();
  }

  function viewTabFor(table: RestaurantTable) {
    const found = openOrders.find((o) => o.table === table._id);
    if (found) setViewOrder(found);
  }

  function handleOrderUpdated(order: Order) {
    setOpenOrders((prev) => prev.map((o) => (o._id === order._id ? order : o)));
    setViewOrder(order);
  }

  function handleOrderClosed(order: Order) {
    setOpenOrders((prev) => prev.filter((o) => o._id !== order._id));
    setTables((prev) => prev.map((t) => (t._id === order.table ? { ...t, status: "available" } : t)));
    setViewOrder(null);
    load();
  }

  function handleOrderCancelled(order: Order) {
    setOpenOrders((prev) => prev.filter((o) => o._id !== order._id));
    setTables((prev) => prev.map((t) => (t._id === order.table ? { ...t, status: "available" } : t)));
    setViewOrder(null);
    load();
  }

  // ── Menu handlers ────────────────────────────────────────────────────────

  const refreshMenuMeta = () =>
    Promise.all([
      apiRequest<string[]>(`/api/menu-items/categories?1=1${branchQuery}`),
      apiRequest<MenuStats>(`/api/menu-items/stats?1=1${branchQuery}`),
    ])
      .then(([cats, st]) => {
        setMenuCategories(cats);
        setMenuStats(st);
      })
      .catch(() => {});

  function handleMenuItemSaved(saved: MenuItem) {
    setMenuItems((prev) => {
      const idx = prev.findIndex((m) => m._id === saved._id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved].sort((a, b) => a.name.localeCompare(b.name));
    });
    refreshMenuMeta();
    setAddMenuOpen(false);
    setEditMenuItem(null);
  }

  function handleMenuItemDeleted(id: string) {
    setMenuItems((prev) => prev.filter((m) => m._id !== id));
    refreshMenuMeta();
    setDeleteMenuItem(null);
  }

  const filteredMenuItems = menuItems.filter((m) => {
    if (menuCategory !== "All" && m.category !== menuCategory) return false;
    if (menuSearch) {
      const q = menuSearch.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        (m.description || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  // ── Reservation handlers ─────────────────────────────────────────────────

  function handleReservationSaved(saved: Reservation) {
    setReservations((prev) => {
      const idx = prev.findIndex((r) => r._id === saved._id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    setAddReservationOpen(false);
    setEditReservation(null);
    load();
  }

  function handleReservationSeated(updated: Reservation) {
    setReservations((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
    setSeatReservation(null);
    load();
  }

  function handleReservationCancelled(updated: Reservation) {
    setReservations((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
    setCancelReservation(null);
  }

  function handleReservationNoShow(updated: Reservation) {
    setReservations((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
    setNoShowReservation(null);
  }

  return (
    <div className="p-5 flex flex-col h-full gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border border-slate-200 rounded-lg px-4 py-3.5">
            <p className="text-[11px] font-medium text-slate-500">{c.label}</p>
            <p className="text-lg font-semibold mt-1 tabular-nums leading-none text-slate-900">
              {loading ? "—" : c.value.toString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-md px-4 py-2.5">
          {error}
        </div>
      )}

      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit flex-shrink-0">
        {(
          [
            { key: "tables", label: "Tables" },
            { key: "menu", label: "Menu" },
            { key: "reservations", label: "Reservations" },
            { key: "kitchen", label: "Kitchen" },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`text-[12px] font-medium px-3.5 py-1.5 rounded-md transition-colors ${
              tab === t.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "tables" && (
        <TablesBoard
          tables={tables}
          openOrderTableIds={openOrderTableIds}
          loading={loading}
          isOwner={isOwner}
          onAddTable={() => setAddTableOpen(true)}
          onOpenTab={setOpenTableFor}
          onViewTab={viewTabFor}
          onMarkClean={markClean}
          onEditTable={setEditTable}
          onDeleteTable={setDeleteTable}
        />
      )}

      {tab === "menu" && (
        <MenuItemsTable
          items={menuItems}
          filtered={filteredMenuItems}
          categories={menuCategories}
          loading={loading}
          error=""
          search={menuSearch}
          onSearchChange={setMenuSearch}
          activeCategory={menuCategory}
          onCategoryChange={setMenuCategory}
          onAddClick={() => setAddMenuOpen(true)}
          onEdit={setEditMenuItem}
          onDelete={setDeleteMenuItem}
        />
      )}

      {tab === "reservations" && (
        <ReservationsTable
          reservations={reservations}
          loading={loading}
          search={resSearch}
          onSearchChange={setResSearch}
          statusFilter={resStatusFilter}
          onStatusChange={setResStatusFilter}
          onAddClick={() => setAddReservationOpen(true)}
          onSeat={setSeatReservation}
          onEdit={setEditReservation}
          onCancel={setCancelReservation}
          onNoShow={setNoShowReservation}
        />
      )}

      {tab === "kitchen" && <KitchenDisplay />}

      {/* Table modals */}
      {addTableOpen && (
        <TableModal table={null} onClose={() => setAddTableOpen(false)} onSaved={handleTableSaved} />
      )}
      {editTable && (
        <TableModal table={editTable} onClose={() => setEditTable(null)} onSaved={handleTableSaved} />
      )}
      {deleteTable && (
        <DeleteTableConfirm
          table={deleteTable}
          onClose={() => setDeleteTable(null)}
          onDeleted={handleTableDeleted}
        />
      )}
      {openTableFor && (
        <OpenTableModal
          table={openTableFor}
          onClose={() => setOpenTableFor(null)}
          onOpened={handleOrderOpened}
        />
      )}
      {viewOrder && (
        <OrderTabView
          order={viewOrder}
          menuItems={menuItems}
          onClose={() => setViewOrder(null)}
          onUpdated={handleOrderUpdated}
          onClosed={handleOrderClosed}
          onCancelled={handleOrderCancelled}
        />
      )}

      {/* Menu modals */}
      {addMenuOpen && (
        <MenuItemModal
          item={null}
          categories={menuCategories}
          onClose={() => setAddMenuOpen(false)}
          onSaved={handleMenuItemSaved}
        />
      )}
      {editMenuItem && (
        <MenuItemModal
          item={editMenuItem}
          categories={menuCategories}
          onClose={() => setEditMenuItem(null)}
          onSaved={handleMenuItemSaved}
        />
      )}
      {deleteMenuItem && (
        <DeleteMenuItemConfirm
          item={deleteMenuItem}
          onClose={() => setDeleteMenuItem(null)}
          onDeleted={handleMenuItemDeleted}
        />
      )}

      {/* Reservation modals */}
      {addReservationOpen && (
        <ReservationModal
          reservation={null}
          onClose={() => setAddReservationOpen(false)}
          onSaved={handleReservationSaved}
        />
      )}
      {editReservation && (
        <ReservationModal
          reservation={editReservation}
          onClose={() => setEditReservation(null)}
          onSaved={handleReservationSaved}
        />
      )}
      {seatReservation && (
        <SeatReservationModal
          reservation={seatReservation}
          tables={tables}
          onClose={() => setSeatReservation(null)}
          onSeated={handleReservationSeated}
        />
      )}
      {cancelReservation && (
        <CancelReservationConfirm
          reservation={cancelReservation}
          onClose={() => setCancelReservation(null)}
          onCancelled={handleReservationCancelled}
        />
      )}
      {noShowReservation && (
        <NoShowConfirm
          reservation={noShowReservation}
          onClose={() => setNoShowReservation(null)}
          onMarked={handleReservationNoShow}
        />
      )}
    </div>
  );
}
