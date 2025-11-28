import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { Order, fetchOrders, updateOrderStatus, OrderStatus } from "../dbMiddleware/OrderCRUD";
import { useToast } from "./ToastContext";
import { XMarkIcon } from "@heroicons/react/24/solid";

const STATUS_OPTIONS: OrderStatus[] = ["pending_payment", "created", "packing", "sent", "completed", "cancelled"];

function formatDateTime(iso: string, locale: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(locale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatAddress(address: Order["address"]): string {
  if (!address) return "";

  const line1 = [address.street, address.houseNumber].filter(Boolean).join(" ");
  const line2 = address.apartment;
  const line3 = [address.postalCode, address.city].filter(Boolean).join(" ");
  const line4 = address.country;

  return [line1, line2, line3, line4].filter(Boolean).join(", ");
}

function monthBounds(y: number, m: number) {
  const from = `${y}-${String(m).padStart(2, "0")}`;
  const nextM = m === 12 ? 1 : m + 1;
  const nextY = m === 12 ? y + 1 : y;
  const to = `${nextY}-${String(nextM).padStart(2, "0")}`;
  return { from, to };
}

export default function OrdersPanel() {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const locale = i18n.language === "lt" ? "lt-LT" : "en-US";
  const currencySymbol = i18n.language === "lt" ? "€" : "$";
  const currency = i18n.language === "lt" ? "EUR" : "USD";

  const priceFormatter = useMemo(() => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    });
  }, [locale, currency]);

  const formatPrice = (price: number): string => {
    return priceFormatter.format(price).replace(/\u20AC|\$/g, currencySymbol);
  };

  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [filterEmail, setFilterEmail] = useState(searchParams.get("email") || "");
  const [filterFrom, setFilterFrom] = useState(searchParams.get("from") || "");
  const [filterTo, setFilterTo] = useState(searchParams.get("to") || "");
  const [filterStatus, setFilterStatus] = useState<"" | OrderStatus>(
    (searchParams.get("status") as OrderStatus) || ""
  );
  const [filtering, setFiltering] = useState(false);

  const [page, setPage] = useState<number>(Number(searchParams.get("page") || 1));
  const [pageSize] = useState<number>(10);

  const [selected, setSelected] = useState<Order | null>(null);

  const hasEmail = filterEmail.trim().length > 0;
  const hasFrom = !!filterFrom;
  const hasTo = !!filterTo;
  const hasStatusF = !!filterStatus;

  const statusLabel = (s: OrderStatus) => {
    const keyMap = {
      created: "orders.status_created",
      packing: "orders.status_packing",
      sent: "orders.status_sent",
      completed: "orders.status_completed",
      pending_payment: "orders.pending_payment",
      cancelled: "orders.cancelled",
    } as const;
    return t(keyMap[s]) || s;
  };

  useEffect(() => {
    const email = searchParams.get("email") || undefined;
    const from = searchParams.get("from") || undefined;
    const to = searchParams.get("to") || undefined;
    const status = (searchParams.get("status") as OrderStatus) || undefined;
    const pageParam = Number(searchParams.get("page") || 1);

    setFilterEmail(searchParams.get("email") || "");
    setFilterFrom(searchParams.get("from") || "");
    setFilterTo(searchParams.get("to") || "");
    setFilterStatus(((searchParams.get("status") as OrderStatus) || "") as "" | OrderStatus);
    setPage(pageParam);

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchOrders({ email, from, to, status });
        setOrders(data);
      } catch (e: any) {
        setError(e?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    })();
  }, [searchParams]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
    };
    if (selected) {
      document.addEventListener('keydown', onEsc);
      return () => document.removeEventListener('keydown', onEsc);
    }
  }, [selected]);

  const applyFilters = () => {
    if (hasFrom && !hasTo) {
      showToast({
        type: "error",
        message:
          t("orders.validationToRequired") || "Please select an end month (To) when using From.",
      });
      return;
    }
    setFiltering(true);
    const next = new URLSearchParams(searchParams);
    if (hasEmail) next.set("email", filterEmail);
    else next.delete("email");

    if (hasFrom) next.set("from", filterFrom);
    else next.delete("from");

    if (hasTo) next.set("to", filterTo);
    else next.delete("to");

    if (hasStatusF) next.set("status", filterStatus as string);
    else next.delete("status");

    next.set("page", "1");

    setSearchParams(next, { replace: true });
    setFiltering(false);
  };

  const clearFilters = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("email");
    next.delete("from");
    next.delete("to");
    next.delete("status");
    next.set("page", "1");
    setSearchParams(next, { replace: true });
  };

  const thisMonth = () => {
    const now = new Date();
    const { from, to } = monthBounds(now.getUTCFullYear(), now.getUTCMonth() + 1);
    setFilterFrom(from);
    setFilterTo(to);
    setFilterEmail("");
    setFilterStatus("");
  };
  const lastMonth = () => {
    const now = new Date();
    const m = now.getUTCMonth() + 1;
    const y = now.getUTCFullYear();
    const prevM = m === 1 ? 12 : m - 1;
    const prevY = m === 1 ? y - 1 : y;
    const { from, to } = monthBounds(prevY, prevM);
    setFilterFrom(from);
    setFilterTo(to);
    setFilterEmail("");
    setFilterStatus("");
  };

  const total = orders.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const pagedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return orders.slice(start, start + pageSize);
  }, [orders, currentPage, pageSize]);

  const goToPage = (p: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(Math.min(Math.max(1, p), totalPages)));
    setSearchParams(next, { replace: true });
  };

  const onChangeStatus = async (id: string, status: OrderStatus) => {
    try {
      setSavingId(id);
      const updated = await updateOrderStatus(id, status);
      setOrders((prev) => prev.map((o) => (o._id === id ? updated : o)));
      showToast({ type: "success", message: t("adminToast.success") });
    } catch {
      showToast({ type: "error", message: t("adminToast.error") });
    } finally {
      setSavingId(null);
    }
  };

  const exportCSV = () => {
    const headers = [
      "orderNumber",
      "enteredEmail",
      "createdAt",
      "status",
      "delivery",
      "address",
      "total",
      "items",
    ];
    const rows = orders.map((o) => {
    const items = o.items
      .map((it) => `id:${it.manufacturingID};qty:${it.quantity}`)
      .join(" | ");
    return [
      o.orderNumber,
      o.enteredEmail,
      o.createdAt,
      o.status,
      o.delivery ? "true" : "false",
      o.delivery ? formatAddress(o.address) : "",
      String(o.total),
      items,
    ];
  });
    const csv = [headers.join(","), ...rows.map((r) => r.map(escapeCsvCell).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  function escapeCsvCell(s: string | null | undefined) {
    if (s == null) return "";
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  }

  const SkeletonRow = () => (
    <tr>
      {Array.from({ length: 9 }).map((_, i) => (
        <td key={i} className="px-3 py-2">
          <div className="h-4 w-full animate-pulse bg-gray-200 rounded" />
        </td>
      ))}
    </tr>
  );

  if (error) return <p className="text-center text-red-600 pt-6">{error}</p>;

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      {/* Filters */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-4">
        {/* Quick presets */}
        <div className="md:col-span-4 mb-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={thisMonth}
              className="w-full px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              {t("orders.thisMonth") || "This month"}
            </button>
            <button
              type="button"
              onClick={lastMonth}
              className="w-full px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              {t("orders.lastMonth") || "Last month"}
            </button>
          </div>
        </div>

        {/* Inputs row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-600 mb-1">{t("orders.email") || "Email"}</label>
            <input
              type="text"
              className="w-full border rounded px-2 py-1"
              placeholder={t("orders.email") || "Email"}
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">{t("orders.from") || "From"}</label>
            <input
              type="month"
              className="w-full border rounded px-2 py-1"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">{t("orders.to") || "To"}</label>
            <input
              type="month"
              className="w-full border rounded px-2 py-1"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">{t("orders.status") || "Status"}</label>
            <select
              className="w-full border rounded px-2 py-1 bg-white"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as "" | OrderStatus)}
            >
              <option value="">{t("orders.allStatuses") || "All statuses"}</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons row */}
          <div className="md:col-span-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <button
                onClick={applyFilters}
                className="w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-60"
                disabled={filtering || (hasFrom && !hasTo)}
              >
                {t("orders.apply") || "Apply"}
              </button>
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-60"
                disabled={filtering}
              >
                {t("orders.clear") || "Clear"}
              </button>
            </div>
            {(hasFrom && !hasTo) && (
              <p className="text-xs text-red-600 mt-2">
                {t("orders.validationToRequired") || "“To” is required when “From” is set."}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Header actions: count + export */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <span className="inline-flex items-center gap-2 text-sm">
          <span className="px-2 py-0.5 rounded-full bg-gray-100 border">
            {t("orders.results") || "Results"}: <strong className="ml-1">{total}</strong>
          </span>
        </span>
        <button
          type="button"
          className="px-3 py-2 rounded border"
          onClick={exportCSV}
          title={t("orders.exportCsv") || "Export CSV"}
        >
          {t("orders.exportCsv") || "Export CSV"}
        </button>
      </div>

      {/* Table / Skeleton */}
      <div className="overflow-x-auto">
        {loading ? (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {Array.from({ length: 9 }).map((_, i) => (
                  <th key={i} className="px-3 py-2 text-left font-medium">&nbsp;</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </tbody>
          </table>
        ) : total === 0 ? (
          <p className="text-center text-lg text-gray-500 py-6">
            {t("designManager.empty") || "No data."}
          </p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium">#</th>
                <th className="px-3 py-2 text-left font-medium">{t("orders.orderNumber") || "Order #"}</th>
                <th className="px-3 py-2 text-left font-medium">{t("orders.email") || "Email"}</th>
                <th className="px-3 py-2 text-left font-medium">{t("orders.createdAt") || "Created"}</th>
                <th className="px-3 py-2 text-left font-medium">{t("orders.status") || "Status"}</th>
                <th className="px-3 py-2 text-left font-medium">{t("orders.delivery") || "Delivery"}</th>
                <th className="px-3 py-2 text-left font-medium">{t("orders.address") || "Address"}</th>
                <th className="px-3 py-2 text-left font-medium">{t("orders.items") || "Items"}</th>
                <th className="px-3 py-2 text-left font-medium">{t("orders.total") || "Total"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pagedOrders.map((o, idx) => (
                <tr key={o._id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">{(currentPage - 1) * pageSize + idx + 1}</td>
                  <td className="px-3 py-2 font-mono">{o.orderNumber}</td>
                  <td className="px-3 py-2">{o.enteredEmail}</td>
                  <td className="px-3 py-2">{formatDateTime(o.createdAt, locale)}</td>
                  <td className="px-3 py-2">
                    <select
                      className="border rounded px-2 py-1 bg-white"
                      value={o.status}
                      onChange={(e) => onChangeStatus(o._id, e.target.value as OrderStatus)}
                      disabled={savingId === o._id}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {statusLabel(s)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">{o.delivery ? (t("common.yes") || "Yes") : (t("common.no") || "No")}</td>
                  <td className="px-3 py-2">{o.delivery ? formatAddress(o.address) || "—" : "—"}</td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      className="underline"
                      onClick={() => setSelected(o)}
                    >
                      {t("orders.viewItems") || "View"}
                    </button>
                  </td>
                  <td className="px-3 py-2">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            className="px-3 py-1 rounded border disabled:opacity-50"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            {t("orders.prev") || "Prev"}
          </button>
          <span className="text-sm">
            {t("orders.page") || "Page"} {currentPage} / {totalPages}
          </span>
          <button
            className="px-3 py-1 rounded border disabled:opacity-50"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            {t("orders.next") || "Next"}
          </button>
        </div>
      )}

      {/* Details modal */}
      {selected && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm z-50"
          onClick={() => setSelected(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* header */}
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-semibold">
                {t("orders.orderDetails") || "Order details"} —{" "}
                <span className="font-mono">{selected.orderNumber}</span>
              </h2>
            </div>

            <button
              onClick={() => setSelected(null)}
              className="absolute top-6 right-6 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition"
              aria-label={t("common.close") || "Close"}
            >
              <XMarkIcon className="w-5 h-5 text-gray-700" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-4">
              <div><strong>{t("orders.email") || "Email"}:</strong> {selected.enteredEmail}</div>
              <div><strong>{t("orders.createdAt") || "Created"}:</strong> {formatDateTime(selected.createdAt, locale)}</div>
              <div><strong>{t("orders.status") || "Status"}:</strong> {statusLabel(selected.status)}</div>
              <div><strong>{t("orders.total") || "Total"}:</strong> {formatPrice(selected.total)}</div>
              <div><strong>{t("orders.delivery") || "Delivery"}:</strong> {selected.delivery ? (t("common.yes") || "Yes") : (t("common.no") || "No")}</div>
              {selected.delivery && (
                <div>
                  <strong>{t("orders.address") || "Address"}:</strong>{" "}
                  {formatAddress(selected.address) || "—"}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-medium mb-2">{t("orders.items") || "Items"}</h3>
              <ul className="list-disc ml-5 space-y-1">
                {selected.items.map((it, i) => (
                  <li key={i} className="font-mono">
                    {it.manufacturingID} × {it.quantity}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
