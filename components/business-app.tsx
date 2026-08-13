"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ConnectionBanner } from "@/components/connection-banner";
import { DateRangePicker } from "@/components/date-range-picker";
import { DeliveryStage } from "@/components/dashboard-hero";
import { FinancialStrip, AdPerformance } from "@/components/financial-strip";
import { OrderDonut } from "@/components/order-donut";
import { OrderFlow } from "@/components/order-flow";
import { OrdersTable } from "@/components/orders-table";
import { PerformanceChart } from "@/components/performance-chart";
import { PremiumBanner } from "@/components/premium-banner";
import { StatusKpis } from "@/components/status-kpis";
import { useToast } from "@/components/toast-provider";
import {
  previousEquivalentRange,
  resolveDateRange,
  type DateRange,
  type RangePreset,
} from "@/lib/date-range";
import { lastNDaysRange } from "@/lib/format";
import { computeComparison, filterOrdersByRange } from "@/lib/metrics";
import { toSheetStatus, toUiLabel, type CanonicalStatus } from "@/lib/status";
import type { DataSource, Expense, Order } from "@/lib/types";

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
  return <InnerApp page={page} title={title} placeholder={placeholder} />;
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
  const [preset, setPreset] = useState<RangePreset>("7d");
  const [customRange, setCustomRange] = useState<DateRange>(() => lastNDaysRange(7));
  const range = useMemo(
    () => resolveDateRange(preset, customRange),
    [preset, customRange],
  );

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const ordersRes = await fetch("/api/orders", {
          cache: "no-store",
          signal: controller.signal,
        });
        const ordersJson = await ordersRes.json();

        setSource(ordersJson.source ?? "unconfigured");
        setMessage(ordersJson.message ?? ordersJson.error ?? "");
        setMissing(ordersJson.missing ?? []);
        setOrders(ordersJson.orders ?? []);
        setLoading(false);

        if (!ordersRes.ok && ordersJson.source !== "unconfigured") {
          setError(ordersJson.error ?? "Impossible de lire les commandes.");
        }

        const expensesRes = await fetch("/api/expenses", {
          cache: "no-store",
          signal: controller.signal,
        });
        const expensesJson = await expensesRes.json();
        setExpenses(expensesJson.expenses ?? []);
      } catch (loadError) {
        if (controller.signal.aborted) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Impossible de joindre l'API locale.",
        );
        setLoading(false);
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
        preset={preset}
        setPreset={setPreset}
        customRange={customRange}
        setCustomRange={setCustomRange}
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
  preset,
  setPreset,
  customRange,
  setCustomRange,
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
  preset: RangePreset;
  setPreset: (value: RangePreset) => void;
  customRange: DateRange;
  setCustomRange: (value: DateRange) => void;
  range: DateRange;
}) {
  const { notify } = useToast();
  const previousRange = previousEquivalentRange(range);
  const { current: metrics } = computeComparison(
    orders,
    expenses,
    range,
    previousRange,
  );
  const rangedOrders = filterOrdersByRange(orders, range);
  const greeting = title ?? "Bonjour, Sofiane 👋";
  const subtitle = placeholder ?? "Vue d'ensemble de votre activité";

  async function handleStatusChange(
    orderNumber: string,
    status: CanonicalStatus,
    previous: string,
  ) {
    if (toSheetStatus(status) === toSheetStatus(previous)) return;

    const snapshot = orders;
    const sheetValue = toSheetStatus(status);
    setUpdating(orderNumber);
    setOrders((current) =>
      current.map((order) =>
        order.orderNumber === orderNumber ? { ...order, status: sheetValue } : order,
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

      notify("success", `Commande ${orderNumber} → ${toUiLabel(status)}`);
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

  const picker = (
    <DateRangePicker
      preset={preset}
      range={range}
      custom={customRange}
      onPresetChange={setPreset}
      onCustomChange={setCustomRange}
      tone="light"
    />
  );

  const heroPicker = (
    <DateRangePicker
      preset={preset}
      range={range}
      custom={customRange}
      onPresetChange={setPreset}
      onCustomChange={setCustomRange}
      tone="dark"
    />
  );

  return (
    <main className="animate-fade-up px-4 pb-10 pt-4 lg:px-8 lg:pt-7">
      {page === "dashboard" ? (
        <>
          {/* Desktop header */}
          <header className="mb-5 hidden items-end justify-between gap-6 border-b border-chic-line pb-5 lg:flex">
            <div className="min-w-0">
              <div className="mb-4 hidden xl:block">
                <Image
                  src="/logo.png"
                  alt="Chic Fragrance"
                  width={340}
                  height={120}
                  className="h-auto w-[156px] object-contain"
                  priority
                />
                <p className="mt-2 text-[10px] font-semibold tracking-[0.2em] text-chic-muted uppercase">
                  Business Management
                </p>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-chic-forest-deep">
                {greeting}
              </h1>
              <p className="mt-1.5 text-sm text-chic-muted">{subtitle}</p>
              <div className="mt-3">
                {loading ? null : (
                  <ConnectionBanner
                    source={source}
                    message={message}
                    missing={missing}
                  />
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              {picker}
              <button
                type="button"
                onClick={() =>
                  notify(
                    "info",
                    "La création de commande depuis le site n'est pas encore activée.",
                  )
                }
                className="rounded-2xl border border-chic-line bg-white px-4 py-2.5 text-sm font-semibold text-chic-forest-deep shadow-sm"
              >
                + Nouvelle commande
              </button>
            </div>
          </header>

          {/* Mobile intro */}
          <section className="mb-4 lg:hidden">
            <h1 className="text-[28px] font-bold leading-tight text-chic-forest-deep">
              {greeting}
            </h1>
            <p className="mt-1.5 text-sm text-chic-muted">{subtitle}</p>
            <div className="mt-4">{picker}</div>
            <div className="mt-3">
              {loading ? null : (
                <ConnectionBanner source={source} message={message} missing={missing} />
              )}
            </div>
          </section>
        </>
      ) : (
        <header className="mb-5 flex flex-col gap-4 border-b border-chic-line pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-chic-forest-deep">{greeting}</h1>
            <p className="mt-2 max-w-xl text-sm text-chic-muted">{subtitle}</p>
          </div>
          {picker}
        </header>
      )}

      <div className="space-y-4">
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

      {loading ? null : page === "dashboard" ? (
        <div className="mt-5 space-y-5">
          <DeliveryStage metrics={metrics} dateControl={heroPicker} />
          <StatusKpis metrics={metrics} />
          <FinancialStrip metrics={metrics} />
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.9fr)]">
            <PerformanceChart metrics={metrics} />
            <AdPerformance metrics={metrics} />
          </div>
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.85fr)]">
            <article className="card">
              <div className="flex items-center justify-between px-5 py-4">
                <h2 className="text-lg font-semibold text-chic-forest-deep">
                  Commandes récentes
                </h2>
                <Link href="/commandes" className="text-sm font-medium text-chic-emerald">
                  Voir toutes
                </Link>
              </div>
              <OrdersTable
                orders={rangedOrders.slice(0, 8)}
                updating={updating}
                onStatusChange={handleStatusChange}
                compact
              />
            </article>
            <OrderDonut metrics={metrics} />
          </div>
          <div className="hidden lg:block">
            <OrderFlow metrics={metrics} />
          </div>
          <PremiumBanner />
        </div>
      ) : null}

      {loading ? null : page === "orders" ? (
        <article className="card mt-5">
          <div className="px-5 py-4">
            <h2 className="text-lg font-semibold">Toutes les commandes</h2>
            <p className="text-sm text-chic-muted">
              Le statut est enregistré dans l&apos;onglet COMMANDES, ligne identifiée par N°
              Commande.
            </p>
          </div>
          <OrdersTable
            orders={orders}
            updating={updating}
            onStatusChange={handleStatusChange}
          />
        </article>
      ) : null}

      {loading ? null : page === "expenses" ? (
        <article className="card mt-5 overflow-x-auto">
          <div className="px-5 py-4">
            <h2 className="text-lg font-semibold">Dépenses</h2>
            <p className="text-sm text-chic-muted">
              Lecture seule de l&apos;onglet DEPENSES. La structure de la feuille n&apos;est pas
              modifiée.
            </p>
          </div>
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-chic-line text-xs tracking-wide text-chic-muted uppercase">
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
                  <tr
                    key={`${expense.rowNumber}-${index}`}
                    className="border-b border-chic-line/70"
                  >
                    <td className="px-5 py-3 tabular">
                      {expense.rowNumber || index + 1}
                    </td>
                    <td className="px-5 py-3">{expense.date}</td>
                    <td className="px-5 py-3 tabular">{expense.spendDollars ?? "—"}</td>
                    <td className="px-5 py-3 tabular">{expense.spendEur ?? "—"}</td>
                    <td className="px-5 py-3 tabular">{expense.confirmedOrders ?? "—"}</td>
                    <td className="px-5 py-3 tabular">{expense.returns ?? "—"}</td>
                    <td className="px-5 py-3 tabular">{expense.delivered ?? "—"}</td>
                    <td className="px-5 py-3 tabular">{expense.cpaReel ?? "—"}</td>
                    <td className="px-5 py-3 tabular">{expense.collected ?? "—"}</td>
                    <td className="px-5 py-3 tabular">{expense.spendDz ?? "—"}</td>
                    <td className="px-5 py-3 tabular">{expense.net ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </article>
      ) : null}

      {loading ? null : page === "placeholder" ? (
        <article className="card mt-5 p-8">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="mt-3 max-w-2xl text-sm text-chic-muted">{placeholder}</p>
        </article>
      ) : null}
    </main>
  );
}
