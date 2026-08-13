"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminLandingPagesPage() {
  const [stats, setStats] = useState<{
    total: number;
    published: number;
    drafts: number;
    organizationsUsing: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/admin?view=landing-pages")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setStats(data.stats);
      });
  }, []);

  return (
    <AdminShell>
      <h1 className="font-serif text-4xl">Landing Pages</h1>
      <p className="mt-2 text-sm text-chic-muted">
        Statistiques agrégées — contenu des pages non exposé.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <Card label="Total" value={stats?.total ?? "—"} />
        <Card label="Published" value={stats?.published ?? "—"} />
        <Card label="Drafts" value={stats?.drafts ?? "—"} />
        <Card label="Orgs using" value={stats?.organizationsUsing ?? "—"} />
      </div>
    </AdminShell>
  );
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card p-4">
      <p className="text-[11px] tracking-[0.14em] text-chic-muted">{label.toUpperCase()}</p>
      <p className="mt-2 font-serif text-3xl">{value}</p>
    </div>
  );
}
