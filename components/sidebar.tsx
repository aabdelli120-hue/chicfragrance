"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Tableau de bord", icon: DashboardIcon },
  { href: "/commandes", label: "Commandes", icon: OrdersIcon, badgeKey: "orders" },
  { href: "/depenses", label: "Dépenses", icon: SpendIcon },
  { href: "/rapports", label: "Rapports", icon: ReportsIcon },
  { href: "/produits", label: "Produits", icon: ProductsIcon },
  { href: "/clients", label: "Clients", icon: ClientsIcon },
  { href: "/parametres", label: "Paramètres", icon: SettingsIcon },
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

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/40 lg:hidden ${open ? "block" : "hidden"}`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[272px] flex-col bg-chic-forest-deep text-white transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 pt-6">
          <div className="overflow-hidden rounded-2xl bg-chic-forest">
            <Image
              src="/logo.png"
              alt="Chic Fragrance depuis 1999"
              width={480}
              height={300}
              className="h-auto w-full"
              priority
            />
          </div>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1 px-4">
          {NAV.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition ${
                  active
                    ? "bg-white/12 text-white"
                    : "text-white/75 hover:bg-white/8 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon />
                  {item.label}
                </span>
                {item.badgeKey === "orders" && orderCount > 0 ? (
                  <span className="rounded-full bg-chic-gold px-2 py-0.5 text-[11px] font-semibold text-chic-forest-deep">
                    {orderCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 pb-6">
          <div className="rounded-2xl border border-chic-gold/50 bg-white/5 p-4">
            <p className="text-[11px] tracking-[0.18em] text-chic-gold">
              CHIC FRAGRANCE PREMIUM
            </p>
            <p className="mt-2 text-sm text-white/80">
              Pilotage, rapports et suivi des commandes depuis votre feuille.
            </p>
            <button className="mt-4 w-full rounded-xl bg-chic-gold px-3 py-2 text-sm font-semibold text-chic-forest-deep">
              Découvrir Premium
            </button>
          </div>

          <div className="mt-4 flex items-center gap-3 px-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chic-gold text-sm font-semibold text-chic-forest-deep">
              CF
            </div>
            <div>
              <p className="text-sm font-medium">Chic Fragrance</p>
              <p className="text-xs text-white/60">Administrateur</p>
            </div>
          </div>
        </div>
      </aside>
    </>
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
      <path d="M12 8v8M9.5 10.5c.6-1 1.6-1.5 2.5-1.5 1.6 0 2.5 1 2.5 2s-.9 2-2.5 2-2.5 1-2.5 2 1 2 2.5 2c1 0 1.9-.5 2.5-1.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
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
      <path d="M12 12 20 7.5M12 12v9M12 12 4 7.5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function ClientsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4 19c.6-3 2.6-4.5 5-4.5S13.4 16 14 19" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="17" cy="9" r="2.2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M16 19c.3-2 1.5-3.2 3.2-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 4v2M12 18v2M4 12h2M18 12h2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M17.7 6.3l-1.4 1.4M7.7 16.3l-1.4 1.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
