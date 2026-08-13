"use client";

import type { JSX } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FeatureBadge } from "@/components/premium/feature-badge";
import { PlanBadge } from "@/components/premium/plan-badge";
import { UserMenu } from "@/components/user-menu";
import type { FeatureId } from "@/lib/features";
import type { Permission } from "@/lib/platform/permissions";
import { useOptionalWorkspace } from "@/lib/platform/workspace-context";
import { useCurrentPlan } from "@/lib/use-current-plan";

type NavItem = {
  href: string;
  label: string;
  icon: () => JSX.Element;
  badgeKey?: "orders";
  feature?: FeatureId;
  permission?: Permission;
};

const ACTIVITY: NavItem[] = [
  { href: "/app", label: "Tableau de bord", icon: DashboardIcon },
  {
    href: "/app/commandes",
    label: "Commandes",
    icon: OrdersIcon,
    badgeKey: "orders",
    permission: "orders.view",
  },
  {
    href: "/app/depenses",
    label: "Dépenses",
    icon: SpendIcon,
    permission: "expenses.view",
  },
  {
    href: "/app/rapports",
    label: "Rapports",
    icon: ReportsIcon,
    permission: "reports.view",
  },
];

const GROWTH: NavItem[] = [
  {
    href: "/app/produits",
    label: "Produits",
    icon: ProductsIcon,
    permission: "products.view",
  },
  {
    href: "/app/clients",
    label: "Clients",
    icon: ClientsIcon,
    permission: "customers.view",
  },
  {
    href: "/app/landing-pages",
    label: "Landing Pages",
    icon: PageIcon,
    permission: "landing_pages.view",
    feature: "AI_LANDING_PAGE",
  },
  {
    href: "/app/creation-ia",
    label: "Création IA",
    icon: SparkIcon,
    permission: "ai.use",
    feature: "AI_LANDING_PAGE",
  },
];

const PREMIUM: NavItem[] = [
  { href: "/app/premium", label: "Premium", icon: CrownIcon },
  {
    href: "/app/creation-ia/visuels",
    label: "AI Studio",
    icon: StudioIcon,
    feature: "AI_PRODUCT_IMAGES",
    permission: "ai.use",
  },
  {
    href: "/app/creation-ia/creatifs",
    label: "Créatifs",
    icon: AdsIcon,
    feature: "AI_AD_CREATIVES",
    permission: "ai.use",
  },
  {
    href: "/app/automatisations",
    label: "Automatisations",
    icon: BoltIcon,
    feature: "AUTOMATIONS",
  },
  {
    href: "/app/intelligence",
    label: "Intelligence",
    icon: InsightIcon,
    feature: "AI_INSIGHTS",
  },
  {
    href: "/app/boutique",
    label: "Boutique",
    icon: StoreIcon,
    feature: "AI_STORE_BUILDER",
  },
];

const ROLE_LABEL: Record<string, string> = {
  OWNER: "Owner",
  MANAGER: "Manager",
  EMPLOYEE: "Employé",
  VIEWER: "Viewer",
  PLATFORM_ADMIN: "Platform Admin",
};

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
  const { plan } = useCurrentPlan();
  const workspace = useOptionalWorkspace();
  const org = workspace?.session?.organization;
  const user = workspace?.session?.user;
  const hasPermission = workspace?.hasPermission ?? (() => true);

  const orgName = org?.name || "Espace client";
  const logoSrc = org?.logoUrl || "/logo.png";
  const initial = (user?.name || orgName).slice(0, 1).toUpperCase();

  function filterItems(items: NavItem[]) {
    return items.filter((item) => {
      if (!item.permission) return true;
      return hasPermission(item.permission);
    });
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/40 lg:hidden ${open ? "block" : "hidden"}`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col bg-chic-forest-deep text-white transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-5 pt-5">
          <div className="overflow-hidden rounded-2xl bg-chic-forest">
            <Image
              src={logoSrc}
              alt={orgName}
              width={512}
              height={320}
              className="h-auto w-full object-contain"
              priority
            />
          </div>
          <p className="mt-3 px-1 text-sm font-medium">{orgName}</p>
          <p className="px-1 text-[10px] tracking-[0.18em] text-white/40">WORKSPACE</p>
        </div>

        <nav className="mt-6 flex-1 space-y-5 overflow-y-auto px-3 pb-4">
          <NavGroup
            title="Activité"
            items={filterItems(ACTIVITY)}
            pathname={pathname}
            orderCount={orderCount}
            onClose={onClose}
          />
          <NavGroup
            title="Croissance"
            items={filterItems(GROWTH)}
            pathname={pathname}
            orderCount={orderCount}
            onClose={onClose}
          />
          <NavGroup
            title="Premium"
            items={filterItems(PREMIUM)}
            pathname={pathname}
            orderCount={orderCount}
            onClose={onClose}
            planBadge={plan === "PRO" || plan === "ELITE" ? plan : undefined}
          />
          <div>
            <p className="px-3 pb-2 text-[10px] tracking-[0.18em] text-white/35">SYSTÈME</p>
            {hasPermission("team.view") ? (
              <Link
                href="/app/team"
                onClick={onClose}
                className={`mb-1 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm ${
                  pathname.startsWith("/app/team")
                    ? "nav-active text-white"
                    : "text-white/75 hover:bg-white/8 hover:text-white"
                }`}
              >
                <ClientsIcon />
                Équipe
              </Link>
            ) : null}
            {hasPermission("settings.view") ? (
              <Link
                href="/app/parametres"
                onClick={onClose}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm ${
                  pathname.startsWith("/app/parametres")
                    ? "nav-active text-white"
                    : "text-white/75 hover:bg-white/8 hover:text-white"
                }`}
              >
                <SettingsIcon />
                Paramètres
              </Link>
            ) : null}
          </div>
        </nav>

        <div className="px-3 pb-5">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-[11px] tracking-[0.16em] text-chic-gold">Premium</p>
            <p className="mt-2 text-sm text-white/75">Débloquez plus d’outils</p>
            <Link
              href="/app/premium"
              onClick={onClose}
              className="mt-4 block rounded-xl bg-chic-emerald px-3 py-2 text-center text-sm font-semibold text-white"
            >
              Voir les plans
            </Link>
          </div>
          <div className="mt-4">
            <UserMenu
              name={user?.name || "Utilisateur"}
              roleLabel={ROLE_LABEL[user?.role || ""] || user?.role || ""}
              initial={initial}
              onClose={onClose}
            />
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
  planBadge,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
  orderCount: number;
  onClose: () => void;
  planBadge?: "PRO" | "ELITE";
}) {
  return (
    <div>
      <p className="px-3 pb-2 text-[10px] tracking-[0.18em] text-white/35">
        {title.toUpperCase()}
      </p>
      <div className="space-y-1">
        {items.map((item) => {
          const active =
            item.href === "/app"
              ? pathname === "/app"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`relative flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm transition ${
                active ? "nav-active text-white" : "text-white/75 hover:bg-white/8 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon />
                {item.label}
              </span>
              {item.badgeKey === "orders" && orderCount > 0 ? (
                <span className="rounded-full bg-chic-emerald px-2 py-0.5 text-[11px] font-semibold text-white">
                  {orderCount}
                </span>
              ) : item.href === "/app/premium" ? (
                <PlanBadge plan={planBadge ?? "PRO"} />
              ) : item.feature ? (
                <FeatureBadge feature={item.feature} />
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
      <circle cx="17" cy="9" r="2.2" stroke="currentColor" strokeWidth="1.7" />
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
function SparkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3v4M12 17v4M4 12h4M16 12h4M6.5 6.5l2.5 2.5M15 15l2.5 2.5M17.5 6.5 15 9M9 15l-2.5 2.5"
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
function StudioIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
function PageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M7 3h7l5 5v13H7V3Z" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
function AdsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 8h10l6-3v14l-6-3H4V8Z" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
function StoreIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 9h16l-1 11H5L4 9Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 9V7a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
function BoltIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M13 3 6 14h6l-1 7 7-11h-6l1-7Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}
function InsightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 19V9l6 4 5-7 5 5v8H4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}
