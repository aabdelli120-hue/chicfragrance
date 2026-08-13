"use client";

import { Fragment, useState } from "react";
import { formatDzd } from "@/lib/format";
import { toUiLabel, type CanonicalStatus } from "@/lib/status";
import type { Order } from "@/lib/types";
import { StatusSelect } from "@/components/status-select";

export function OrdersTable({
  orders,
  updating,
  onStatusChange,
  compact = false,
}: {
  orders: Order[];
  updating: string | null;
  onStatusChange: (
    orderNumber: string,
    status: CanonicalStatus,
    previous: string,
  ) => void;
  compact?: boolean;
}) {
  const [openRow, setOpenRow] = useState<string | null>(null);

  if (orders.length === 0) {
    return (
      <div className="px-6 py-16 text-center text-sm text-chic-muted">
        Aucune commande à afficher pour cette période.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 p-4 md:hidden">
        {orders.map((order) => {
          const isUpdating = updating === order.orderNumber;
          return (
            <article key={order.orderNumber} className="rounded-2xl border border-chic-line bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-chic-muted">N° {order.orderNumber}</p>
                  <p className="mt-1 font-semibold">{order.customerName || "—"}</p>
                  <p className="mt-1 text-sm capitalize text-chic-muted">{order.product || "—"}</p>
                </div>
                <p className="font-semibold">{formatDzd(order.total)}</p>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <StatusSelect
                  value={order.status}
                  disabled={isUpdating}
                  onChange={(status) => onStatusChange(order.orderNumber, status, order.status)}
                />
                <p className="text-xs text-chic-muted">{order.date || "—"}</p>
              </div>
              {isUpdating ? (
                <p className="mt-2 text-[11px] text-chic-muted">Mise à jour Google Sheets…</p>
              ) : null}
            </article>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-chic-line text-xs uppercase tracking-wide text-chic-muted">
              <th className="px-5 py-3 font-medium">N° Commande</th>
              <th className="px-5 py-3 font-medium">Client</th>
              <th className="px-5 py-3 font-medium">Produit</th>
              <th className="px-5 py-3 font-medium">Total</th>
              <th className="px-5 py-3 font-medium">Statut</th>
              <th className="px-5 py-3 font-medium">Date</th>
              {!compact ? <th className="px-5 py-3 font-medium" /> : null}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const isUpdating = updating === order.orderNumber;
              const expanded = openRow === order.orderNumber;
              return (
                <Fragment key={order.orderNumber}>
                  <tr className="border-b border-chic-line/70 last:border-0">
                    <td className="px-5 py-4 font-semibold">{order.orderNumber}</td>
                    <td className="px-5 py-4">{order.customerName || "—"}</td>
                    <td className="px-5 py-4 capitalize text-chic-muted">{order.product || "—"}</td>
                    <td className="px-5 py-4 font-medium">{formatDzd(order.total)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <StatusSelect
                          value={order.status}
                          disabled={isUpdating}
                          onChange={(status) =>
                            onStatusChange(order.orderNumber, status, order.status)
                          }
                        />
                        {isUpdating ? (
                          <span className="text-[11px] text-chic-muted">Mise à jour…</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-chic-muted">{order.date || "—"}</td>
                    {!compact ? (
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => setOpenRow(expanded ? null : order.orderNumber)}
                          className="rounded-full px-2 py-1 text-chic-muted hover:bg-chic-cream"
                          aria-label={`Détails ${toUiLabel(order.status)}`}
                        >
                          ⋮
                        </button>
                      </td>
                    ) : null}
                  </tr>
                  {expanded && !compact ? (
                    <tr className="bg-chic-cream/60">
                      <td colSpan={7} className="px-5 py-3 text-xs text-chic-muted">
                        Téléphone: {order.phone || "—"} · Wilaya: {order.wilaya || "—"} ·
                        Notes: {order.notes || "—"}
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
