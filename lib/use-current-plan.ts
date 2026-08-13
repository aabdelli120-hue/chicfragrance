"use client";

import { useEffect, useState } from "react";
import type { PlanId } from "@/lib/plans";

export function useCurrentPlan() {
  const [plan, setPlan] = useState<PlanId>("FREE");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/billing", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        if (!cancelled && payload.plan) setPlan(payload.plan);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { plan, loaded };
}
