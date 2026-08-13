import { eachIsoDay, percentChange, type DateRange } from "@/lib/date-range";
import { isDateInRange } from "@/lib/format";
import {
  CANONICAL_STATUSES,
  hasCanonicalStatus,
  type CanonicalStatus,
} from "@/lib/status";
import type { Expense, Order } from "@/lib/types";

export type { DateRange };

export type DashboardMetrics = {
  revenue: number;
  orderCount: number;
  deliveredCount: number;
  inDeliveryCount: number;
  returnCount: number;
  unreachableCount: number;
  reporterCount: number;
  deliveryRate: number | null;
  returnRate: number | null;
  adSpend: number;
  collected: number;
  netAfterAds: number;
  cpaReel: number | null;
  costPerDelivery: number | null;
  roas: number | null;
  statusCounts: Record<CanonicalStatus, number>;
  dailySeries: Array<{
    date: string;
    collected: number;
    spend: number;
    net: number;
  }>;
  adShare: number;
};

export type MetricDelta = {
  current: number;
  previous: number;
  change: number | null;
};

export type DashboardComparison = {
  revenue: MetricDelta;
  orderCount: MetricDelta;
  deliveredCount: MetricDelta;
  inDeliveryCount: MetricDelta;
  returnCount: MetricDelta;
  unreachableCount: MetricDelta;
  adSpend: MetricDelta;
  netAfterAds: MetricDelta;
  deliveryRate: MetricDelta;
};

function countCanonical(orders: Order[], status: CanonicalStatus) {
  return orders.filter((order) => hasCanonicalStatus(order, status)).length;
}

function ratio(numerator: number, denominator: number): number | null {
  if (!denominator) return null;
  return numerator / denominator;
}

function percent(numerator: number, denominator: number): number | null {
  const value = ratio(numerator, denominator);
  return value === null ? null : value * 100;
}

export function filterOrdersByRange(orders: Order[], range: DateRange) {
  return orders.filter((order) => isDateInRange(order.dateIso, range.from, range.to));
}

export function filterExpensesByRange(expenses: Expense[], range: DateRange) {
  return expenses.filter((expense) =>
    isDateInRange(expense.dateIso, range.from, range.to),
  );
}

export function computeMetrics(
  orders: Order[],
  expenses: Expense[],
  range: DateRange,
): DashboardMetrics {
  const rangedOrders = filterOrdersByRange(orders, range);
  const rangedExpenses = filterExpensesByRange(expenses, range);

  const delivered = rangedOrders.filter((order) => hasCanonicalStatus(order, "LIVRE"));
  const collected = delivered.reduce((sum, order) => sum + (order.total ?? 0), 0);
  const orderCount = rangedOrders.length;
  const deliveredCount = delivered.length;
  const inDeliveryCount = countCanonical(rangedOrders, "EN_LIVRAISON");
  const returnCount = countCanonical(rangedOrders, "RETOUR");
  const unreachableCount = countCanonical(rangedOrders, "INJOIGNABLE");
  const reporterCount = countCanonical(rangedOrders, "REPORTER");
  const adSpend = rangedExpenses.reduce(
    (sum, expense) => sum + (expense.spendDz ?? 0),
    0,
  );

  const statusCounts = Object.fromEntries(
    CANONICAL_STATUSES.map((status) => [status, countCanonical(rangedOrders, status)]),
  ) as Record<CanonicalStatus, number>;

  const byDay = new Map<string, { collected: number; spend: number }>();
  for (const day of eachIsoDay(range)) {
    byDay.set(day, { collected: 0, spend: 0 });
  }
  for (const order of rangedOrders) {
    if (!order.dateIso) continue;
    const current = byDay.get(order.dateIso) ?? { collected: 0, spend: 0 };
    if (hasCanonicalStatus(order, "LIVRE")) {
      current.collected += order.total ?? 0;
    }
    byDay.set(order.dateIso, current);
  }
  for (const expense of rangedExpenses) {
    if (!expense.dateIso) continue;
    const current = byDay.get(expense.dateIso) ?? { collected: 0, spend: 0 };
    current.spend += expense.spendDz ?? 0;
    byDay.set(expense.dateIso, current);
  }

  const dailySeries = [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, values]) => ({
      date,
      collected: values.collected,
      spend: values.spend,
      net: values.collected - values.spend,
    }));

  return {
    revenue: collected,
    orderCount,
    deliveredCount,
    inDeliveryCount,
    returnCount,
    unreachableCount,
    reporterCount,
    deliveryRate: percent(deliveredCount, orderCount),
    returnRate: percent(returnCount, orderCount),
    adSpend,
    collected,
    netAfterAds: collected - adSpend,
    cpaReel: ratio(adSpend, orderCount),
    costPerDelivery: ratio(adSpend, deliveredCount),
    roas: ratio(collected, adSpend),
    statusCounts,
    dailySeries,
    adShare: adSpend > 0 ? 100 : 0,
  };
}

export function computeComparison(
  orders: Order[],
  expenses: Expense[],
  currentRange: DateRange,
  previousRange: DateRange,
): { current: DashboardMetrics; previous: DashboardMetrics; deltas: DashboardComparison } {
  const current = computeMetrics(orders, expenses, currentRange);
  const previous = computeMetrics(orders, expenses, previousRange);

  const delta = (currentValue: number, previousValue: number): MetricDelta => ({
    current: currentValue,
    previous: previousValue,
    change: percentChange(currentValue, previousValue),
  });

  return {
    current,
    previous,
    deltas: {
      revenue: delta(current.collected, previous.collected),
      orderCount: delta(current.orderCount, previous.orderCount),
      deliveredCount: delta(current.deliveredCount, previous.deliveredCount),
      inDeliveryCount: delta(current.inDeliveryCount, previous.inDeliveryCount),
      returnCount: delta(current.returnCount, previous.returnCount),
      unreachableCount: delta(current.unreachableCount, previous.unreachableCount),
      adSpend: delta(current.adSpend, previous.adSpend),
      netAfterAds: delta(current.netAfterAds, previous.netAfterAds),
      deliveryRate: delta(current.deliveryRate ?? 0, previous.deliveryRate ?? 0),
    },
  };
}
