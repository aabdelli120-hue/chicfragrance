"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import {
  DEFAULT_EMPLOYEE_PERMISSIONS,
  PERMISSION_MATRIX,
  type Permission,
} from "@/lib/platform/permissions";

type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  permissions: Permission[];
};

type Invitation = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  permissions: Permission[];
};

export default function TeamPage() {
  return (
    <AppShell orderCount={0}>
      <main className="px-4 py-6 lg:px-8 lg:py-8">
        <p className="text-sm text-chic-muted">Organisation · Équipe</p>
        <h1 className="mt-2 font-serif text-4xl">Équipe</h1>
        <p className="mt-2 max-w-2xl text-sm text-chic-muted">
          Invitez des collaborateurs et configurez leurs permissions. Aucun mot de passe n’est
          affiché — l’employé définit le sien via l’invitation.
        </p>
        <TeamManager />
      </main>
    </AppShell>
  );
}

function TeamManager() {
  const [users, setUsers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [devInvitePath, setDevInvitePath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "EMPLOYEE" as "MANAGER" | "EMPLOYEE" | "VIEWER",
    permissions: [...DEFAULT_EMPLOYEE_PERMISSIONS] as Permission[],
  });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await fetch("/api/team", { cache: "no-store" });
      const data = await res.json();
      if (cancelled) return;
      if (res.ok) {
        setUsers(data.users || []);
        setInvitations(data.invitations || []);
      } else {
        setError(data.error || "Accès équipe refusé.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function reload() {
    const res = await fetch("/api/team", { cache: "no-store" });
    const data = await res.json();
    if (res.ok) {
      setUsers(data.users || []);
      setInvitations(data.invitations || []);
    } else {
      setError(data.error || "Accès équipe refusé.");
    }
  }

  function togglePermission(permission: Permission) {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setDevInvitePath(null);
    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Création impossible.");
      return;
    }
    if (data.devInvitePath) setDevInvitePath(data.devInvitePath);
    setForm({
      name: "",
      email: "",
      phone: "",
      role: "EMPLOYEE",
      permissions: [...DEFAULT_EMPLOYEE_PERMISSIONS],
    });
    await reload();
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="card p-5">
        <h2 className="font-medium">Membres</h2>
        <div className="mt-4 space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between rounded-2xl border border-chic-line px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">{u.name}</p>
                <p className="text-xs text-chic-muted">
                  {u.email} · {u.role}
                </p>
              </div>
              <StatusBadge status={u.status} />
            </div>
          ))}
          {invitations.map((i) => (
            <div
              key={i.id}
              className="flex items-center justify-between rounded-2xl border border-dashed border-chic-line px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">{i.name}</p>
                <p className="text-xs text-chic-muted">
                  {i.email} · {i.role}
                </p>
              </div>
              <StatusBadge status="invited" />
            </div>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="font-medium">Ajouter un membre</h2>
        <form onSubmit={onCreate} className="mt-4 space-y-3">
          <Input label="Nom" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Input label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <Input label="Téléphone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <div>
            <label className="text-xs text-chic-muted">Rôle</label>
            <select
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value as typeof form.role })
              }
              className="mt-1 w-full rounded-xl border border-chic-line px-3 py-2 text-sm"
            >
              <option value="MANAGER">Manager</option>
              <option value="EMPLOYEE">Employé</option>
              <option value="VIEWER">Viewer</option>
            </select>
          </div>

          {form.role === "EMPLOYEE" ? (
            <div>
              <p className="text-xs text-chic-muted">Permissions</p>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-[420px] text-left text-xs">
                  <thead>
                    <tr className="text-chic-muted">
                      <th className="py-1 font-medium">MODULE</th>
                      <th className="py-1 font-medium">VIEW</th>
                      <th className="py-1 font-medium">CREATE</th>
                      <th className="py-1 font-medium">EDIT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PERMISSION_MATRIX.map((mod) => (
                      <tr key={mod.id} className="border-t border-chic-line/70">
                        <td className="py-2">{mod.label}</td>
                        {mod.actions
                          .filter((a) => ["VIEW", "CREATE", "EDIT"].includes(a.label))
                          .map((action) => (
                            <td key={action.label} className="py-2">
                              {action.permission ? (
                                <input
                                  type="checkbox"
                                  checked={form.permissions.includes(action.permission)}
                                  onChange={() => togglePermission(action.permission!)}
                                />
                              ) : (
                                <span className="text-chic-muted">—</span>
                              )}
                            </td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {error ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          ) : null}
          {devInvitePath ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Invitation créée. Fallback dev :{" "}
              <a className="underline" href={devInvitePath}>
                {devInvitePath}
              </a>
            </p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-xl bg-chic-forest px-4 py-2.5 text-sm font-semibold text-white"
          >
            Créer le compte
          </button>
        </form>
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const label =
    status === "active"
      ? "Actif"
      : status === "invited" || status === "pending"
        ? "Invitation envoyée"
        : status === "suspended"
          ? "Suspendu"
          : status;
  const tone =
    status === "active"
      ? "bg-emerald-50 text-emerald-700"
      : status === "suspended"
        ? "bg-rose-50 text-rose-700"
        : "bg-amber-50 text-amber-800";
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${tone}`}>{label}</span>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs text-chic-muted">{label}</label>
      <input
        required={label !== "Téléphone"}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-chic-line px-3 py-2 text-sm"
      />
    </div>
  );
}
