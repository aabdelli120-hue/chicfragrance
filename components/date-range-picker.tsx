"use client";

import { useEffect, useMemo, useState } from "react";
import {
  RANGE_PRESETS,
  formatSelectedRange,
  type DateRange,
  type RangePreset,
} from "@/lib/date-range";

export function DateRangePicker({
  preset,
  range,
  custom,
  onPresetChange,
  onCustomChange,
}: {
  preset: RangePreset;
  range: DateRange;
  custom: DateRange;
  onPresetChange: (preset: RangePreset) => void;
  onCustomChange: (range: DateRange) => void;
}) {
  const [open, setOpen] = useState(false);
  const label = useMemo(() => formatSelectedRange(preset, range), [preset, range]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="min-w-[240px] rounded-2xl bg-white/12 px-4 py-3 text-left text-sm"
      >
        <span className="mb-1 block text-[11px] uppercase tracking-wide text-white/60">
          Période
        </span>
        <span>{label}</span>
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-[min(92vw,360px)] rounded-2xl border border-chic-line bg-white p-4 text-foreground shadow-xl">
          <div className="grid grid-cols-2 gap-2">
            {RANGE_PRESETS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onPresetChange(item.id);
                  if (item.id !== "custom") setOpen(false);
                }}
                className={`rounded-xl px-3 py-2 text-left text-sm ${
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
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="text-xs text-chic-muted">
                Date de début
                <input
                  type="date"
                  value={custom.from}
                  onChange={(event) =>
                    onCustomChange({ ...custom, from: event.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-chic-line px-3 py-2 text-sm text-foreground"
                />
              </label>
              <label className="text-xs text-chic-muted">
                Date de fin
                <input
                  type="date"
                  value={custom.to}
                  onChange={(event) =>
                    onCustomChange({ ...custom, to: event.target.value })
                  }
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
