"use client";

import Link from "next/link";
import { useState } from "react";
import { useOptionalWorkspace } from "@/lib/platform/workspace-context";

export function UserMenu({
  name,
  roleLabel,
  initial,
  onClose,
}: {
  name: string;
  roleLabel: string;
  initial: string;
  onClose?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const workspace = useOptionalWorkspace();
  const canManageTeam = workspace?.hasPermission("team.view") ?? false;
  const canManageOrg = workspace?.hasPermission("organization.manage") ?? false;
  const canViewSub = workspace?.hasPermission("subscription.view") ?? false;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 rounded-2xl px-1 py-1 text-left hover:bg-white/5"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chic-gold text-sm font-semibold text-chic-forest-deep">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{name}</p>
          <p className="text-xs text-white/60">{roleLabel}</p>
        </div>
      </button>

      {open ? (
        <div className="absolute bottom-14 left-0 z-50 w-full overflow-hidden rounded-2xl border border-white/10 bg-chic-forest shadow-xl">
          <MenuLink href="/app/parametres" label="Mon profil" onClick={() => { setOpen(false); onClose?.(); }} />
          {canManageOrg ? (
            <MenuLink href="/app/parametres" label="Mon organisation" onClick={() => { setOpen(false); onClose?.(); }} />
          ) : null}
          {canManageTeam ? (
            <MenuLink href="/app/team" label="Équipe" onClick={() => { setOpen(false); onClose?.(); }} />
          ) : null}
          {canViewSub ? (
            <MenuLink href="/app/premium" label="Abonnement" onClick={() => { setOpen(false); onClose?.(); }} />
          ) : null}
          <MenuLink href="/app/parametres" label="Paramètres" onClick={() => { setOpen(false); onClose?.(); }} />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              void workspace?.logout();
            }}
            className="block w-full px-4 py-2.5 text-left text-sm text-rose-200 hover:bg-white/5"
          >
            Déconnexion
          </button>
        </div>
      ) : null}
    </div>
  );
}

function MenuLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-4 py-2.5 text-sm text-white/85 hover:bg-white/5"
    >
      {label}
    </Link>
  );
}
