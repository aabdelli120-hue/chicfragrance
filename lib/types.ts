import { UI_STATUS_OPTIONS, isOrderStatus, type OrderStatus } from "@/lib/status";

export const ORDER_STATUSES = UI_STATUS_OPTIONS;
export type { CanonicalStatus, OrderStatus } from "@/lib/status";
export { isOrderStatus };

export type DataSource = "google-sheets" | "demo" | "unconfigured";

export type Order = {
  orderNumber: string;
  date: string;
  dateIso: string | null;
  customerName: string;
  phone: string;
  wilaya: string;
  product: string;
  productPrice: number | null;
  deliveryFee: number | null;
  total: number | null;
  status: OrderStatus | string;
  notes: string;
};

export type Expense = {
  rowNumber: string;
  date: string;
  dateIso: string | null;
  spendDollars: number | null;
  spendEur: number | null;
  confirmedOrders: number | null;
  returns: number | null;
  delivered: number | null;
  cpaReel: number | null;
  collected: number | null;
  spendDz: number | null;
  net: number | null;
};

export type SheetsConfigStatus = {
  configured: boolean;
  source: DataSource;
  missing: string[];
  message: string;
};
