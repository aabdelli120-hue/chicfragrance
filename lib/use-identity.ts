"use client";

import { useEffect, useState } from "react";

export type Identity = {
  ownerName: string;
  storeName: string;
  role: string;
};

/** Store owner identity, read from workspace settings. Never hardcoded in components. */
export function useIdentity() {
  const [identity, setIdentity] = useState<Identity | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    fetch("/api/premium", { cache: "no-store", signal: controller.signal })
      .then((response) => response.json())
      .then((payload) => {
        if (cancelled || !payload?.identity) return;
        setIdentity(payload.identity);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  return identity;
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
