"use client";

import {
  CANONICAL_STATUSES,
  toCanonicalStatus,
  toUiLabel,
  type CanonicalStatus,
} from "@/lib/status";
import { statusClassName } from "@/lib/status-styles";

export function StatusSelect({
  value,
  disabled,
  onChange,
}: {
  value: string;
  disabled?: boolean;
  onChange: (status: CanonicalStatus) => void;
}) {
  const canonical = toCanonicalStatus(value);
  const selected = canonical ?? "";

  return (
    <select
      value={selected}
      disabled={disabled}
      onChange={(event) => {
        const next = toCanonicalStatus(event.target.value);
        if (next) onChange(next);
      }}
      className={`min-w-[148px] rounded-full border-0 px-3 py-1.5 text-xs font-semibold outline-none transition ${statusClassName(value)} ${
        disabled ? "opacity-60" : "cursor-pointer"
      }`}
    >
      {!canonical && value ? (
        <option value="">{value}</option>
      ) : null}
      {CANONICAL_STATUSES.map((status) => (
        <option key={status} value={status}>
          {toUiLabel(status)}
        </option>
      ))}
    </select>
  );
}
