import { isDateInRange } from "@/lib/format";
import type { Expense, Order, OrderStatus } from "@/lib/types";

export type DateRange = {
  from: string;
  to: string;
};

export type DashboardMetrics = {
  revenue: number;
  orderCount: number;
  deliveredCount: number;
  inDeliveryCount: number;
  returnCount: number;
  cancelledCount: number;
  confirmedCount: number;
  preparingCount: number;
  deliveryRate: number;
  returnRate: number;
  adSpend: number;
  collected: number;
  sheetNet: number | null;
  cpaReel: number | null;
  costPerDelivery: number | null;
  roas: number | null;
  statusCounts: Record<OrderStatus | string, number>;
  dailySeries: Array<{
    date: string;
    collected: number;
    spend: number;
    net: number;
  }>;
};

function countStatus(orders: Order[], status: string) {
  return orders.filter((order) => order.status === status).length;
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

  const delivered = rangedOrders.filter((order) => order.status === "Livrée");
  const revenue = delivered.reduce((sum, order) => sum + (order.total ?? 0), 0);
  const orderCount = rangedOrders.length;
  const deliveredCount = delivered.length;
  const inDeliveryCount = countStatus(rangedOrders, "En livraison");
  const returnCount = countStatus(rangedOrders, "Retour");
  const cancelledCount = countStatus(rangedOrders, "Annulée");
  const confirmedCount = countStatus(rangedOrders, "Confirmée");
  const preparingCount = countStatus(rangedOrders, "En préparation");

  const adSpend = rangedExpenses.reduce(
    (sum, expense) => sum + (expense.spendDz ?? 0),
    0,
  );
  const collectedFromSheet = rangedExpenses.reduce(
    (sum, expense) => sum + (expense.collected ?? 0),
    0,
  );
  const collected = collectedFromSheet > 0 ? collectedFromSheet : revenue;
  const sheetNetValues = rangedExpenses
    .map((expense) => expense.net)
    .filter((value): value is number => value !== null);
  const sheetNet =
    sheetNetValues.length > 0
      ? sheetNetValues.reduce((sum, value) => sum + value, 0)
      : collected - adSpend;

  const latestExpense = [...rangedExpenses].reverse()[0];
  const cpaReel = latestExpense?.cpaReel ?? (orderCount ? adSpend / orderCount : null);
  const costPerDelivery = deliveredCount ? adSpend / deliveredCount : null;
  const roas = adSpend > 0 ? collected / adSpend : null;

  const statusCounts: Record<string, number> = {
    Confirmée: confirmedCount,
    "En préparation": preparingCount,
    "En livraison": inDeliveryCount,
    Livrée: deliveredCount,
    Retour: returnCount,
    Annulée: cancelledCount,
  };

  const byDay = new Map<string, { collected: number; spend: number }>();
  for (const order of rangedOrders) {
    if (!order.dateIso) continue;
    const current = byDay.get(order.dateIso) ?? { collected: 0, spend: 0 };
    if (order.status === "Livrée") {
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
    revenue,
    orderCount,
    deliveredCount,
    inDeliveryCount,
    returnCount,
    cancelledCount,
    confirmedCount,
    preparingCount,
    deliveryRate: orderCount ? (deliveredCount / orderCount) * 100 : 0,
    returnRate: orderCount ? (returnCount / orderCount) * 100 : 0,
    adSpend,
    collected,
    sheetNet,
    cpaReel,
    costPerDelivery,
    roas,
    statusCounts,
    dailySeries,
  };
}
