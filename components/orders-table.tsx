"use client";

import { Fragment, useState } from "react";
import { formatDzd } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types";
import { StatusSelect } from "@/components/status-select";

export function OrdersTable({
  orders,
  updating,
  onStatusChange,
  compact = false,
}: {
  orders: Order[];
  updating: string | null;
  onStatusChange: (orderNumber: string, status: OrderStatus, previous: string) => void;
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
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead>
          <tr className="border-b border-chic-line text-xs uppercase tracking-wide text-chic-muted">
            <th className="px-5 py-3 font-medium">N° Commande</th>
            <th className="px-5 py-3 font-medium">Client</th>
            <th className="px-5 py-3 font-medium">Produit</th>
            <th className="px-5 py-3 font-medium">Total</th>
            <th className="px-5 py-3 font-medium">Statut</th>
            <th className="px-5 py-3 font-medium">Date</th>
            <th className="px-5 py-3 font-medium" />
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
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenRow(expanded ? null : order.orderNumber)
                      }
                      className="rounded-full px-2 py-1 text-chic-muted hover:bg-chic-cream"
                      aria-label="Détails de la commande"
                    >
                      ⋮
                    </button>
                  </td>
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
  );
}
