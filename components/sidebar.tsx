"use client";

import type { JSX } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { initialsOf, useIdentity } from "@/lib/use-identity";

type NavItem = {
  href: string;
  label: string;
  icon: () => JSX.Element;
  badgeKey?: "orders";
};

const ACTIVITY: NavItem[] = [
  { href: "/", label: "Tableau de bord", icon: DashboardIcon },
  { href: "/commandes", label: "Commandes", icon: OrdersIcon, badgeKey: "orders" },
  { href: "/depenses", label: "Dépenses", icon: SpendIcon },
  { href: "/rapports", label: "Rapports", icon: ReportsIcon },
];

const GROWTH: NavItem[] = [
  { href: "/produits", label: "Produits", icon: ProductsIcon },
  { href: "/clients", label: "Clients", icon: ClientsIcon },
];

export function Sidebar({
  orderCount,
  open,
  onClose,
}: {
  orderCount: number;
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const identity = useIdentity();
  const ownerName = identity?.ownerName?.trim() || "Compte";
  const initial = initialsOf(ownerName);

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/35 lg:hidden ${open ? "block" : "hidden"}`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-chic-line bg-white transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-chic-line px-5 py-5">
          <Image
            src="/logo.png"
            alt="Chic Fragrance"
            width={320}
            height={120}
            className="h-auto w-[150px] object-contain"
            priority
          />
          <p className="mt-3 text-[10px] font-medium tracking-[0.2em] text-chic-muted uppercase">
            Business Management
          </p>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
          <NavGroup
            title="Activité"
            items={ACTIVITY}
            pathname={pathname}
            orderCount={orderCount}
            onClose={onClose}
          />
          <NavGroup
            title="Croissance"
            items={GROWTH}
            pathname={pathname}
            orderCount={orderCount}
            onClose={onClose}
          />
          <div>
            <p className="px-3 pb-2 text-[10px] font-medium tracking-[0.18em] text-chic-muted">
              SYSTÈME
            </p>
            <Link
              href="/parametres"
              onClick={onClose}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium ${
                pathname === "/parametres"
                  ? "nav-active"
                  : "text-chic-forest-deep/75 hover:bg-chic-mint/70 hover:text-chic-forest-deep"
              }`}
            >
              <SettingsIcon />
              Paramètres
            </Link>
            <Link
              href="/premium"
              onClick={onClose}
              className={`mt-1 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium ${
                pathname === "/premium"
                  ? "nav-active"
                  : "text-chic-forest-deep/75 hover:bg-chic-mint/70 hover:text-chic-forest-deep"
              }`}
            >
              <CrownIcon />
              Premium
            </Link>
          </div>
        </nav>

        <div className="border-t border-chic-line px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chic-gold/20 text-sm font-semibold text-chic-forest-deep">
              {initial}
            </div>
            <div>
              <p className="text-sm font-semibold text-chic-forest-deep">{ownerName}</p>
              <p className="text-xs text-chic-muted">{identity?.role || "Propriétaire"}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function NavGroup({
  title,
  items,
  pathname,
  orderCount,
  onClose,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
  orderCount: number;
  onClose: () => void;
}) {
  return (
    <div>
      <p className="px-3 pb-2 text-[10px] font-medium tracking-[0.18em] text-chic-muted">
        {title.toUpperCase()}
      </p>
      <div className="space-y-1">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`relative flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "nav-active"
                  : "text-chic-forest-deep/75 hover:bg-chic-mint/70 hover:text-chic-forest-deep"
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon />
                {item.label}
              </span>
              {item.badgeKey === "orders" && orderCount > 0 ? (
                <span className="rounded-full bg-chic-forest-deep px-2 py-0.5 text-[11px] font-semibold tabular text-white">
                  {orderCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function DashboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <rect x="13" y="3" width="8" height="5" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <rect x="13" y="10" width="8" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
function OrdersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M7 7h10M7 12h10M7 17h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
function SpendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
function ReportsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M5 19V9M10 19V5M15 19v-7M20 19V8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
function ProductsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 3 20 7.5v9L12 21 4 16.5v-9L12 3Z" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
function ClientsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4 19c0-2.5 2.5-4 5-4s5 1.5 5 4" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
function CrownIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 16 7 8l5 4 5-4 3 8H4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}
