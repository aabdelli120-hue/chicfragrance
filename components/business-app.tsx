"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ConnectionBanner } from "@/components/connection-banner";
import { KpiCards } from "@/components/kpi-cards";
import { OrdersTable } from "@/components/orders-table";
import { PerformanceChart } from "@/components/performance-chart";
import { RightPanels } from "@/components/right-panels";
import { useToast } from "@/components/toast-provider";
import { formatRangeLabel, lastNDaysRange } from "@/lib/format";
import { computeMetrics, filterExpensesByRange, filterOrdersByRange } from "@/lib/metrics";
import type { DataSource, Expense, Order, OrderStatus } from "@/lib/types";

type PageKind = "dashboard" | "orders" | "expenses" | "placeholder";

export function BusinessApp({
  page,
  title,
  placeholder,
}: {
  page: PageKind;
  title?: string;
  placeholder?: string;
}) {
  return (
    <InnerApp page={page} title={title} placeholder={placeholder} />
  );
}

function InnerApp({
  page,
  title,
  placeholder,
}: {
  page: PageKind;
  title?: string;
  placeholder?: string;
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [source, setSource] = useState<DataSource>("unconfigured");
  const [message, setMessage] = useState("Chargement des données…");
  const [missing, setMissing] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [rangeDays, setRangeDays] = useState(7);
  const range = useMemo(() => lastNDaysRange(rangeDays), [rangeDays]);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const [ordersRes, expensesRes] = await Promise.all([
          fetch("/api/orders", { cache: "no-store", signal: controller.signal }),
          fetch("/api/expenses", { cache: "no-store", signal: controller.signal }),
        ]);

        const ordersJson = await ordersRes.json();
        const expensesJson = await expensesRes.json();

        setSource(ordersJson.source ?? "unconfigured");
        setMessage(ordersJson.message ?? ordersJson.error ?? "");
        setMissing(ordersJson.missing ?? []);
        setOrders(ordersJson.orders ?? []);
        setExpenses(expensesJson.expenses ?? []);

        if (!ordersRes.ok && ordersJson.source !== "unconfigured") {
          setError(ordersJson.error ?? "Impossible de lire les commandes.");
        }
      } catch (loadError) {
        if (controller.signal.aborted) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Impossible de joindre l'API locale.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => controller.abort();
  }, []);

  return (
    <AppShell orderCount={orders.length}>
      <DataView
        page={page}
        title={title}
        placeholder={placeholder}
        orders={orders}
        setOrders={setOrders}
        expenses={expenses}
        source={source}
        message={message}
        missing={missing}
        loading={loading}
        error={error}
        updating={updating}
        setUpdating={setUpdating}
        rangeDays={rangeDays}
        setRangeDays={setRangeDays}
        range={range}
      />
    </AppShell>
  );
}

function DataView({
  page,
  title,
  placeholder,
  orders,
  setOrders,
  expenses,
  source,
  message,
  missing,
  loading,
  error,
  updating,
  setUpdating,
  rangeDays,
  setRangeDays,
  range,
}: {
  page: PageKind;
  title?: string;
  placeholder?: string;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  expenses: Expense[];
  source: DataSource;
  message: string;
  missing: string[];
  loading: boolean;
  error: string | null;
  updating: string | null;
  setUpdating: (value: string | null) => void;
  rangeDays: number;
  setRangeDays: (value: number) => void;
  range: { from: string; to: string };
}) {
  const { notify } = useToast();
  const rangedOrders = filterOrdersByRange(orders, range);
  const rangedExpenses = filterExpensesByRange(expenses, range);
  const visibleOrders = rangedOrders.length > 0 || orders.length === 0 ? rangedOrders : orders;
  const metrics = computeMetrics(
    visibleOrders === orders && rangedOrders.length === 0 ? orders : rangedOrders,
    rangedExpenses.length > 0 ? rangedExpenses : expenses,
    rangedOrders.length > 0
      ? range
      : {
          from: orders.at(-1)?.dateIso ?? range.from,
          to: orders[0]?.dateIso ?? range.to,
        },
  );

  async function handleStatusChange(
    orderNumber: string,
    status: OrderStatus,
    previous: string,
  ) {
    if (status === previous) return;

    const snapshot = orders;
    setUpdating(orderNumber);
    setOrders((current) =>
      current.map((order) =>
        order.orderNumber === orderNumber ? { ...order, status } : order,
      ),
    );

    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Mise à jour impossible.");
      }

      if (payload.order) {
        setOrders((current) =>
          current.map((order) =>
            order.orderNumber === orderNumber ? payload.order : order,
          ),
        );
      }

      notify("success", `Commande ${orderNumber} → ${status}`);
    } catch (updateError) {
      setOrders(snapshot);
      notify(
        "error",
        updateError instanceof Error
          ? updateError.message
          : "Le statut n'a pas pu être enregistré dans Google Sheets.",
      );
    } finally {
      setUpdating(null);
    }
  }

  return (
    <main className="px-4 py-5 lg:px-8 lg:py-7">
      <header className="silk-hero relative overflow-hidden rounded-[28px] px-6 py-7 text-white lg:px-8">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm text-white/70">Chic Fragrance · Depuis 1999</p>
            <h1 className="mt-2 font-serif text-3xl lg:text-4xl">
              {title ?? "Bonjour, Chic Fragrance 👋"}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-white/80">
              {placeholder ??
                "Voici un aperçu de votre activité. Google Sheets reste la source de vérité."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="rounded-2xl bg-white/12 px-4 py-3 text-sm">
              <span className="mb-1 block text-[11px] uppercase tracking-wide text-white/60">
                Période
              </span>
              <select
                value={rangeDays}
                onChange={(event) => setRangeDays(Number(event.target.value))}
                className="bg-transparent outline-none"
              >
                <option value={7} className="text-foreground">
                  7 derniers jours · {formatRangeLabel(range.from, range.to)}
                </option>
                <option value={14} className="text-foreground">
                  14 derniers jours
                </option>
                <option value={30} className="text-foreground">
                  30 derniers jours
                </option>
              </select>
            </label>
            <button
              type="button"
              onClick={() =>
                notify("info", "La création de commande depuis le site n'est pas encore activée.")
              }
              className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-chic-forest"
            >
              + Nouvelle commande
            </button>
          </div>
        </div>
      </header>

      <div className="mt-5 space-y-4">
        <ConnectionBanner source={source} message={message} missing={missing} />
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}
        {loading ? (
          <div className="card px-5 py-8 text-sm text-chic-muted">
            Chargement des données…
          </div>
        ) : null}
      </div>

      {page === "dashboard" ? (
        <div className="mt-5 space-y-5">
          <KpiCards metrics={metrics} />
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
            <div className="space-y-5">
              <PerformanceChart metrics={metrics} />
              <article className="card">
                <div className="flex items-center justify-between px-5 py-4">
                  <h2 className="font-serif text-xl">Commandes récentes</h2>
                  <Link href="/commandes" className="text-sm text-chic-emerald">
                    Voir toutes les commandes
                  </Link>
                </div>
                <OrdersTable
                  orders={visibleOrders.slice(0, 8)}
                  updating={updating}
                  onStatusChange={handleStatusChange}
                  compact
                />
              </article>
            </div>
            <RightPanels metrics={metrics} />
          </div>
        </div>
      ) : null}

      {page === "orders" ? (
        <article className="card mt-5">
          <div className="px-5 py-4">
            <h2 className="font-serif text-xl">Toutes les commandes</h2>
            <p className="text-sm text-chic-muted">
              Le statut est enregistré dans l&apos;onglet COMMANDES, ligne identifiée par N° Commande.
            </p>
          </div>
          <OrdersTable
            orders={orders}
            updating={updating}
            onStatusChange={handleStatusChange}
          />
        </article>
      ) : null}

      {page === "expenses" ? (
        <article className="card mt-5 overflow-x-auto">
          <div className="px-5 py-4">
            <h2 className="font-serif text-xl">Dépenses</h2>
            <p className="text-sm text-chic-muted">
              Lecture seule de l&apos;onglet DEPENSES. La structure de la feuille n&apos;est pas modifiée.
            </p>
          </div>
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-chic-line text-xs uppercase tracking-wide text-chic-muted">
                <th className="px-5 py-3 font-medium">#</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Spend $</th>
                <th className="px-5 py-3 font-medium">Spend EUR</th>
                <th className="px-5 py-3 font-medium">Confirmées</th>
                <th className="px-5 py-3 font-medium">Retour</th>
                <th className="px-5 py-3 font-medium">Livré</th>
                <th className="px-5 py-3 font-medium">CPA réel</th>
                <th className="px-5 py-3 font-medium">Encaissés</th>
                <th className="px-5 py-3 font-medium">Spend Dz</th>
                <th className="px-5 py-3 font-medium">Net</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-5 py-12 text-center text-chic-muted">
                    Aucune dépense à afficher.
                  </td>
                </tr>
              ) : (
                expenses.map((expense, index) => (
                  <tr key={`${expense.rowNumber}-${index}`} className="border-b border-chic-line/70">
                    <td className="px-5 py-3">{expense.rowNumber || index + 1}</td>
                    <td className="px-5 py-3">{expense.date}</td>
                    <td className="px-5 py-3">{expense.spendDollars ?? "—"}</td>
                    <td className="px-5 py-3">{expense.spendEur ?? "—"}</td>
                    <td className="px-5 py-3">{expense.confirmedOrders ?? "—"}</td>
                    <td className="px-5 py-3">{expense.returns ?? "—"}</td>
                    <td className="px-5 py-3">{expense.delivered ?? "—"}</td>
                    <td className="px-5 py-3">{expense.cpaReel ?? "—"}</td>
                    <td className="px-5 py-3">{expense.collected ?? "—"}</td>
                    <td className="px-5 py-3">{expense.spendDz ?? "—"}</td>
                    <td className="px-5 py-3">{expense.net ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </article>
      ) : null}

      {page === "placeholder" ? (
        <article className="card mt-5 p-8">
          <h2 className="font-serif text-2xl">{title}</h2>
          <p className="mt-3 max-w-2xl text-sm text-chic-muted">{placeholder}</p>
        </article>
      ) : null}
    </main>
  );
}
