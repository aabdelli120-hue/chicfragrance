"use client";

import Link from "next/link";
import { FEATURE_GRID } from "@/lib/features";
import { PlanBadge } from "@/components/premium/plan-badge";

const ICONS: Record<string, string> = {
  chart: "M4 18V9M9 18V5M14 18v-6M19 18V8",
  spark: "M12 3v4M12 17v4M4 12h4M16 12h4",
  link: "M9 12h6M8 8h.01M16 16h.01",
  bolt: "M13 3 6 14h6l-1 7 7-11h-6l1-7Z",
  store: "M4 9h16l-1 11H5L4 9ZM8 9V7a4 4 0 0 1 8 0v2",
  trend: "M4 16l5-5 4 3 7-8",
  report: "M7 4h7l4 4v12H7V4ZM8 12h8M8 16h5",
  users: "M9 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM4 20v-1a5 5 0 0 1 10 0v1",
};

export function FeatureGrid() {
  return (
    <section id="modules">
      <p className="text-[11px] uppercase tracking-[0.16em] text-chic-muted">Modules</p>
      <h2 className="mt-1 text-lg font-semibold tracking-tight">
        Tout ce que votre activité peut connecter
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {FEATURE_GRID.map((item) => (
          <article
            key={item.id}
            className="card group p-4 transition duration-300 hover:-translate-y-0.5 hover:border-chic-emerald/30"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-chic-mint text-chic-emerald">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d={ICONS[item.icon]}
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <PlanBadge plan={item.badge} />
            </div>
            <h3 className="mt-3 text-sm font-semibold">{item.name}</h3>
            <p className="mt-1 text-sm text-chic-muted">{item.description}</p>
            <p className="mt-2 text-xs text-chic-muted/80">{item.detail}</p>
          </article>
        ))}
      </div>
      <div className="mt-3 text-xs text-chic-muted">
        Les modules IA et Store restent marqués bientôt disponibles.{" "}
        <Link href="#plans" className="text-chic-emerald">
          Voir les plans
        </Link>
      </div>
    </section>
  );
}
