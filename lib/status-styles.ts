import { toCanonicalStatus, toUiLabel, type CanonicalStatus } from "@/lib/status";

export const STATUS_BAR_COLORS: Record<CanonicalStatus, string> = {
  EN_LIVRAISON: "#c9a227",
  LIVRE: "#1b6e4e",
  INJOIGNABLE: "#c2783a",
  RETOUR: "#b42318",
  REPORTER: "#6b7c93",
};

export function statusClassName(status: string) {
  const canonical = toCanonicalStatus(status);
  if (!canonical) return "status-unknown";
  return `status-${canonical.toLowerCase().replaceAll("_", "-")}`;
}

export function statusLabel(status: string) {
  return toUiLabel(status);
}
