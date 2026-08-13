"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  RANGE_PRESETS,
  formatSelectedRange,
  presetShortLabel,
  type DateRange,
  type RangePreset,
} from "@/lib/date-range";
import { formatRangeLabel } from "@/lib/format";

export function DateRangePicker({
  preset,
  range,
  custom,
  onPresetChange,
  onCustomChange,
  tone = "dark",
}: {
  preset: RangePreset;
  range: DateRange;
  custom: DateRange;
  onPresetChange: (preset: RangePreset) => void;
  onCustomChange: (range: DateRange) => void;
  tone?: "dark" | "light";
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const fullLabel = useMemo(() => formatSelectedRange(preset, range), [preset, range]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  const dark = tone === "dark";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={fullLabel}
        className={`inline-flex max-w-full items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition ${
          dark
            ? "bg-white/12 text-white hover:bg-white/18"
            : "border border-chic-line bg-white text-chic-forest shadow-sm hover:border-chic-emerald/40"
        }`}
      >
        <CalendarIcon />
        <span className="truncate">{presetShortLabel(preset)}</span>
        <span className={`hidden truncate lg:inline ${dark ? "text-white/55" : "text-chic-muted"}`}>
          · {formatRangeLabel(range.from, range.to)}
        </span>
      </button>

      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-[min(92vw,360px)] rounded-2xl border border-chic-line bg-white p-4 text-foreground shadow-xl">
          <p className="mb-3 text-[11px] uppercase tracking-[0.16em] text-chic-muted">
            Période
          </p>
          <div className="grid grid-cols-2 gap-2">
            {RANGE_PRESETS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onPresetChange(item.id);
                  if (item.id !== "custom") setOpen(false);
                }}
                className={`rounded-xl px-3 py-2 text-left text-sm transition ${
                  preset === item.id
                    ? "bg-chic-forest text-white"
                    : "bg-chic-cream/80 hover:bg-chic-cream"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {preset === "custom" ? (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="text-xs text-chic-muted">
                Date début
                <input
                  type="date"
                  value={custom.from}
                  onChange={(event) => {
                    onPresetChange("custom");
                    onCustomChange({ ...custom, from: event.target.value });
                  }}
                  className="mt-1 w-full rounded-xl border border-chic-line px-3 py-2 text-sm text-foreground"
                />
              </label>
              <label className="text-xs text-chic-muted">
                Date fin
                <input
                  type="date"
                  value={custom.to}
                  onChange={(event) => {
                    onPresetChange("custom");
                    onCustomChange({ ...custom, to: event.target.value });
                  }}
                  className="mt-1 w-full rounded-xl border border-chic-line px-3 py-2 text-sm text-foreground"
                />
              </label>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="5" width="16" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
