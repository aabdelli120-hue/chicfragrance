import { formatRangeLabel, toIsoDate } from "@/lib/format";

export type DateRange = {
  from: string;
  to: string;
};

export type RangePreset =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "week"
  | "month"
  | "lastMonth"
  | "custom";

export const RANGE_PRESETS: Array<{ id: RangePreset; label: string }> = [
  { id: "today", label: "Aujourd'hui" },
  { id: "yesterday", label: "Hier" },
  { id: "7d", label: "Les 7 derniers jours" },
  { id: "30d", label: "Les 30 derniers jours" },
  { id: "week", label: "Cette semaine" },
  { id: "month", label: "Ce mois" },
  { id: "lastMonth", label: "Mois précédent" },
  { id: "custom", label: "Personnalisé" },
];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return startOfDay(next);
}

function startOfWeekMonday(date: Date) {
  const day = date.getDay();
  const offset = day === 0 ? 6 : day - 1;
  return addDays(startOfDay(date), -offset);
}

export function resolveDateRange(
  preset: RangePreset,
  custom: DateRange,
  now = new Date(),
): DateRange {
  const today = startOfDay(now);

  switch (preset) {
    case "today":
      return { from: toIsoDate(today), to: toIsoDate(today) };
    case "yesterday": {
      const yesterday = addDays(today, -1);
      return { from: toIsoDate(yesterday), to: toIsoDate(yesterday) };
    }
    case "7d":
      return { from: toIsoDate(addDays(today, -6)), to: toIsoDate(today) };
    case "30d":
      return { from: toIsoDate(addDays(today, -29)), to: toIsoDate(today) };
    case "week":
      return { from: toIsoDate(startOfWeekMonday(today)), to: toIsoDate(today) };
    case "month":
      return {
        from: toIsoDate(new Date(today.getFullYear(), today.getMonth(), 1)),
        to: toIsoDate(today),
      };
    case "lastMonth": {
      const from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const to = new Date(today.getFullYear(), today.getMonth(), 0);
      return { from: toIsoDate(from), to: toIsoDate(to) };
    }
    case "custom":
      return custom.from && custom.to
        ? custom.from <= custom.to
          ? custom
          : { from: custom.to, to: custom.from }
        : { from: toIsoDate(addDays(today, -6)), to: toIsoDate(today) };
    default:
      return { from: toIsoDate(addDays(today, -6)), to: toIsoDate(today) };
  }
}

export function previousEquivalentRange(range: DateRange): DateRange {
  const from = startOfDay(new Date(`${range.from}T00:00:00`));
  const to = startOfDay(new Date(`${range.to}T00:00:00`));
  const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86400000) + 1);
  const previousTo = addDays(from, -1);
  const previousFrom = addDays(previousTo, -(days - 1));
  return { from: toIsoDate(previousFrom), to: toIsoDate(previousTo) };
}

export function eachIsoDay(range: DateRange): string[] {
  const days: string[] = [];
  let cursor = startOfDay(new Date(`${range.from}T00:00:00`));
  const end = startOfDay(new Date(`${range.to}T00:00:00`));
  if (Number.isNaN(cursor.getTime()) || Number.isNaN(end.getTime())) return days;

  while (cursor.getTime() <= end.getTime()) {
    days.push(toIsoDate(cursor));
    cursor = addDays(cursor, 1);
  }
  return days;
}

export function presetShortLabel(preset: RangePreset): string {
  switch (preset) {
    case "today":
      return "Aujourd'hui";
    case "yesterday":
      return "Hier";
    case "7d":
      return "7 derniers jours";
    case "30d":
      return "30 derniers jours";
    case "week":
      return "Cette semaine";
    case "month":
      return "Ce mois";
    case "lastMonth":
      return "Mois précédent";
    case "custom":
      return "Période personnalisée";
    default:
      return "Période";
  }
}

export function formatSelectedRange(preset: RangePreset, range: DateRange): string {
  return `${presetShortLabel(preset)} · ${formatRangeLabel(range.from, range.to)}`;
}

export function percentChange(current: number, previous: number): number | null {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) return null;
  if (previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}
