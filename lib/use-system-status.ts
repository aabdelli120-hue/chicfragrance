"use client";

import { useEffect, useState } from "react";
import type { PlanId } from "@/lib/plans";
import type { DataSource } from "@/lib/types";

export function useSystemStatus() {
  const [plan, setPlan] = useState<PlanId>("FREE");
  const [connected, setConnected] = useState(false);
  const [source, setSource] = useState<DataSource>("unconfigured");
  const [orderCount, setOrderCount] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    async function load() {
      try {
        const [billingRes, settingsRes, ordersRes] = await Promise.all([
          fetch("/api/billing", { cache: "no-store", signal: controller.signal }),
          fetch("/api/settings", { cache: "no-store", signal: controller.signal }),
          fetch("/api/orders", { cache: "no-store", signal: controller.signal }),
        ]);
        const billing = await billingRes.json().catch(() => null);
        const settings = await settingsRes.json().catch(() => null);
        const orders = await ordersRes.json().catch(() => null);
        if (cancelled) return;

        if (billing?.plan) setPlan(billing.plan);
        setConnected(Boolean(settings?.connection?.configured));
        const nextSource = (orders?.source ?? settings?.connection?.source ?? "unconfigured") as DataSource;
        setSource(nextSource);
        if (nextSource === "google-sheets" && Array.isArray(orders?.orders)) {
          setOrderCount(orders.orders.length);
        } else {
          setOrderCount(null);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }

    void load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  return { plan, connected, source, orderCount, loaded };
}
