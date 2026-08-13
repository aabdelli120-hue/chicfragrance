export const CANONICAL_STATUSES = [
  "EN_LIVRAISON",
  "LIVRE",
  "INJOIGNABLE",
  "RETOUR",
  "REPORTER",
] as const;

export type CanonicalStatus = (typeof CANONICAL_STATUSES)[number];

/** Exact Google Sheets dropdown values. Never rename these. */
export const SHEET_STATUS: Record<CanonicalStatus, string> = {
  EN_LIVRAISON: "En Livraison",
  LIVRE: "Livré",
  INJOIGNABLE: "injoignable",
  RETOUR: "Retour",
  REPORTER: "REPORTER",
};

export const UI_STATUS: Record<CanonicalStatus, string> = {
  EN_LIVRAISON: "En livraison",
  LIVRE: "Livrée",
  INJOIGNABLE: "Injoignable",
  RETOUR: "Retour",
  REPORTER: "Reporter",
};

export const UI_STATUS_OPTIONS = CANONICAL_STATUSES.map(
  (status) => UI_STATUS[status],
) as [string, ...string[]];

export type OrderStatus = (typeof UI_STATUS_OPTIONS)[number];

function foldStatus(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

const ALIASES: Record<string, CanonicalStatus> = {
  livre: "LIVRE",
  livree: "LIVRE",
  enlivraison: "EN_LIVRAISON",
  injoignable: "INJOIGNABLE",
  retour: "RETOUR",
  reporter: "REPORTER",
};

for (const canonical of CANONICAL_STATUSES) {
  ALIASES[foldStatus(canonical)] = canonical;
  ALIASES[foldStatus(SHEET_STATUS[canonical])] = canonical;
  ALIASES[foldStatus(UI_STATUS[canonical])] = canonical;
}

export function toCanonicalStatus(value: string | null | undefined): CanonicalStatus | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if ((CANONICAL_STATUSES as readonly string[]).includes(trimmed)) {
    return trimmed as CanonicalStatus;
  }
  return ALIASES[foldStatus(trimmed)] ?? null;
}

export function toSheetStatus(status: CanonicalStatus | string): string {
  const canonical = toCanonicalStatus(status);
  if (!canonical) return status;
  return SHEET_STATUS[canonical];
}

export function toUiLabel(status: CanonicalStatus | string): string {
  const canonical = toCanonicalStatus(status);
  if (!canonical) return status;
  return UI_STATUS[canonical];
}

export function isOrderStatus(value: string): boolean {
  return toCanonicalStatus(value) !== null;
}

export function hasCanonicalStatus(order: { status: string }, expected: CanonicalStatus) {
  return toCanonicalStatus(order.status) === expected;
}
