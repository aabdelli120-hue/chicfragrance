"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";

type Overview = {
  totalOrganizations: number;
  activeOrganizations: number;
  newOrganizations: number;
  activeSubscriptions: number;
  mrr: number;
  landingPagesTotal: number;
  landingPagesPublished: number;
  landingPagesDrafts: number;
  organizationsUsingLandingPages: number;
  aiUsage: number;
  recentActivity: Array<{ id: string; action: string; createdAt: string }>;
};

export default function AdminOverviewPage() {
  const [overview, setOverview] = useState<Overview | null>(null);

  useEffect(() => {
    fetch("/api/admin?view=overview")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setOverview(data.overview);
      });
  }, []);

  return (
    <AdminShell>
      <p className="text-sm text-chic-muted">Console plateforme</p>
      <h1 className="mt-2 font-serif text-4xl">Overview</h1>
      <p className="mt-2 text-sm text-chic-muted">
        Pilotage global — sans exposer inutilement les données métier des clients.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Organisations" value={overview?.totalOrganizations ?? "—"} />
        <Metric label="Actives" value={overview?.activeOrganizations ?? "—"} />
        <Metric label="Nouvelles (7j)" value={overview?.newOrganizations ?? "—"} />
        <Metric label="Abonnements actifs" value={overview?.activeSubscriptions ?? "—"} />
        <Metric label="MRR (DZD)" value={overview?.mrr ?? "—"} />
        <Metric label="Landing pages" value={overview?.landingPagesTotal ?? "—"} />
        <Metric label="Publiées" value={overview?.landingPagesPublished ?? "—"} />
        <Metric label="Usage AI" value={overview?.aiUsage ?? 0} />
      </div>

      <section className="card mt-8 p-5">
        <h2 className="font-medium">Activité système</h2>
        <div className="mt-4 space-y-2">
          {(overview?.recentActivity || []).map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between rounded-xl border border-chic-line px-3 py-2 text-sm"
            >
              <span>{log.action}</span>
              <span className="text-xs text-chic-muted">
                {new Date(log.createdAt).toLocaleString("fr-DZ")}
              </span>
            </div>
          ))}
          {!overview?.recentActivity?.length ? (
            <p className="text-sm text-chic-muted">Aucune activité récente.</p>
          ) : null}
        </div>
      </section>
    </AdminShell>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card p-4">
      <p className="text-[11px] tracking-[0.14em] text-chic-muted">{label.toUpperCase()}</p>
      <p className="mt-2 font-serif text-3xl text-chic-forest-deep">{value}</p>
    </div>
  );
}
