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
  tone = "light",
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
    <div ref={rootRef} className="relative w-full sm:w-auto">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={fullLabel}
        className={`inline-flex w-full max-w-full items-center gap-2 rounded-2xl px-3.5 py-2.5 text-xs font-semibold transition sm:w-auto ${
          dark
            ? "border border-white/15 bg-white/10 text-white hover:bg-white/15"
            : "border border-chic-line bg-white text-chic-forest-deep shadow-sm hover:border-chic-emerald/35"
        }`}
      >
        <CalendarIcon />
        <span className="min-w-0 flex-1 text-left">
          <span className="block truncate">{presetShortLabel(preset)}</span>
          <span
            className={`mt-0.5 block truncate text-[11px] font-medium ${
              dark ? "text-white/55" : "text-chic-muted"
            }`}
          >
            {formatRangeLabel(range.from, range.to)}
          </span>
        </span>
      </button>

      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-[min(94vw,380px)] rounded-2xl border border-chic-line bg-white p-4 text-foreground shadow-xl">
          <p className="mb-3 text-[11px] font-semibold tracking-[0.16em] text-chic-muted uppercase">
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
                className={`rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                  preset === item.id
                    ? "bg-chic-forest-deep text-white"
                    : "bg-chic-mint/50 hover:bg-chic-mint"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {preset === "custom" ? (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="text-xs font-medium text-chic-muted">
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
                <label className="text-xs font-medium text-chic-muted">
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
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full rounded-xl bg-chic-forest-deep px-3 py-2.5 text-sm font-semibold text-white"
              >
                Appliquer
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="5" width="16" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
