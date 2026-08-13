"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";

type OrgRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  plan: string;
  ownerName: string;
  ownerEmail: string;
  users: number;
  createdAt: string;
  lastActivityAt: string;
};

export default function AdminOrganizationsPage() {
  const [organizations, setOrganizations] = useState<OrgRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await fetch("/api/admin?view=organizations");
      const data = await res.json();
      if (cancelled) return;
      if (data.ok) setOrganizations(data.organizations);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function reload() {
    const res = await fetch("/api/admin?view=organizations");
    const data = await res.json();
    if (data.ok) setOrganizations(data.organizations);
  }

  async function patch(organizationId: string, body: Record<string, string>) {
    setMessage(null);
    const res = await fetch("/api/admin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId, ...body }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Action impossible.");
      return;
    }
    setMessage("Mis à jour.");
    await reload();
  }

  return (
    <AdminShell>
      <h1 className="font-serif text-4xl">Organizations</h1>
      <p className="mt-2 text-sm text-chic-muted">
        Gestion plateforme. “View” n’ouvre pas le frontend client avec tous les droits.
      </p>
      {message ? <p className="mt-4 text-sm text-chic-emerald">{message}</p> : null}

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-chic-line text-xs tracking-wide text-chic-muted">
            <tr>
              <th className="px-4 py-3">Organization</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Users</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Last activity</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {organizations.map((org) => (
              <tr key={org.id} className="border-b border-chic-line/70">
                <td className="px-4 py-3">
                  <p className="font-medium">{org.name}</p>
                  <p className="text-xs text-chic-muted">{org.slug}</p>
                </td>
                <td className="px-4 py-3">
                  <p>{org.ownerName}</p>
                  <p className="text-xs text-chic-muted">{org.ownerEmail}</p>
                </td>
                <td className="px-4 py-3">{org.plan}</td>
                <td className="px-4 py-3">{org.status}</td>
                <td className="px-4 py-3">{org.users}</td>
                <td className="px-4 py-3 text-xs">
                  {new Date(org.createdAt).toLocaleDateString("fr-DZ")}
                </td>
                <td className="px-4 py-3 text-xs">
                  {new Date(org.lastActivityAt).toLocaleString("fr-DZ")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      className="rounded-lg border border-chic-line px-2 py-1 text-xs"
                      onClick={() =>
                        setMessage(
                          `Inspect ${org.name} (${org.id}) — données métier non exposées ici.`,
                        )
                      }
                    >
                      View
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-chic-line px-2 py-1 text-xs"
                      onClick={() => void patch(org.id, { plan: "PRO" })}
                    >
                      Manage
                    </button>
                    {org.status === "suspended" ? (
                      <button
                        type="button"
                        className="rounded-lg border border-chic-line px-2 py-1 text-xs"
                        onClick={() => void patch(org.id, { status: "active" })}
                      >
                        Activate
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="rounded-lg border border-rose-200 px-2 py-1 text-xs text-rose-700"
                        onClick={() => void patch(org.id, { status: "suspended" })}
                      >
                        Suspend
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
