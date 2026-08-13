"use client";

import { ORDER_STATUSES, type OrderStatus } from "@/lib/types";
import { statusClassName } from "@/lib/status-styles";

export function StatusSelect({
  value,
  disabled,
  onChange,
}: {
  value: string;
  disabled?: boolean;
  onChange: (status: OrderStatus) => void;
}) {
  return (
    <select
      value={ORDER_STATUSES.includes(value as OrderStatus) ? value : value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value as OrderStatus)}
      className={`min-w-[148px] rounded-full border-0 px-3 py-1.5 text-xs font-semibold outline-none ${statusClassName(value)} ${
        disabled ? "opacity-60" : "cursor-pointer"
      }`}
    >
      {!ORDER_STATUSES.includes(value as OrderStatus) && value ? (
        <option value={value}>{value}</option>
      ) : null}
      {ORDER_STATUSES.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  );
}
