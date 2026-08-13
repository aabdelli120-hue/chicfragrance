const MONTHS_FR = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export function parseNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;

  const raw = String(value)
    .replace(/\s/g, "")
    .replace(/DZD|DA|€|\$/gi, "")
    .replace(",", ".");

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatDzd(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  const formatted = new Intl.NumberFormat("fr-DZ", {
    maximumFractionDigits: 0,
  }).format(Math.round(value));

  return `${formatted} DZD`;
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  return `${value.toFixed(1)}%`;
}

export function formatMultiplier(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  return `${value.toFixed(1)}x`;
}

export function parseSheetDate(value: unknown): { display: string; iso: string | null } {
  if (value === null || value === undefined || value === "") {
    return { display: "", iso: null };
  }

  if (typeof value === "number") {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const date = new Date(excelEpoch.getTime() + value * 86400000);
    return {
      display: formatDisplayDate(date),
      iso: toIsoDate(date),
    };
  }

  const raw = String(value).trim();
  const isoMatch = raw.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/,
  );
  if (isoMatch) {
    const date = new Date(
      Number(isoMatch[1]),
      Number(isoMatch[2]) - 1,
      Number(isoMatch[3]),
      Number(isoMatch[4] ?? 0),
      Number(isoMatch[5] ?? 0),
      Number(isoMatch[6] ?? 0),
    );
    return { display: raw, iso: toIsoDate(date) };
  }

  const frMatch = raw.match(
    /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})(?:\s+(\d{1,2}):(\d{2}))?/,
  );
  if (frMatch) {
    const year = Number(frMatch[3].length === 2 ? `20${frMatch[3]}` : frMatch[3]);
    const date = new Date(
      year,
      Number(frMatch[2]) - 1,
      Number(frMatch[1]),
      Number(frMatch[4] ?? 0),
      Number(frMatch[5] ?? 0),
    );
    return { display: raw, iso: toIsoDate(date) };
  }

  const fallback = new Date(raw);
  if (!Number.isNaN(fallback.getTime())) {
    return { display: raw, iso: toIsoDate(fallback) };
  }

  return { display: raw, iso: null };
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}-${month}-${year} ${hours}:${minutes}`;
}

export function formatRangeLabel(from: string, to: string): string {
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return `${from} — ${to}`;
  }

  return `${start.getDate()} ${MONTHS_FR[start.getMonth()]} — ${end.getDate()} ${MONTHS_FR[end.getMonth()]} ${end.getFullYear()}`;
}

export function lastNDaysRange(days: number, now = new Date()) {
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const from = new Date(to);
  from.setDate(to.getDate() - (days - 1));
  return { from: toIsoDate(from), to: toIsoDate(to) };
}

export function isDateInRange(
  iso: string | null,
  from: string,
  to: string,
): boolean {
  if (!iso) return false;
  return iso >= from && iso <= to;
}

export function normalizeOrderNumber(value: unknown): string {
  return String(value ?? "").trim();
}
