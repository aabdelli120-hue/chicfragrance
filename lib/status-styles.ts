import type { OrderStatus } from "@/lib/types";

export const STATUS_BAR_COLORS: Record<string, string> = {
  Confirmée: "#3b82f6",
  "En préparation": "#8b5cf6",
  "En livraison": "#f59e0b",
  Livrée: "#16a34a",
  Retour: "#dc2626",
  Annulée: "#9ca3af",
};

export function statusClassName(status: string) {
  return `status-${status.toLowerCase().replace(/\s+/g, "-")}`;
}

export function statusLabel(status: OrderStatus | string) {
  return status;
}
