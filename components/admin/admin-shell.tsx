"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/organizations", label: "Organizations" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/subscriptions", label: "Subscriptions" },
  { href: "/admin/plans", label: "Plans" },
  { href: "/admin/landing-pages", label: "Landing Pages" },
  { href: "/admin/ai-usage", label: "AI Usage" },
  { href: "/admin/integrations", label: "Integrations" },
  { href: "/admin/logs", label: "System Logs" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (cancelled) return;
      if (!data.ok || data.user?.role !== "PLATFORM_ADMIN") {
        router.replace("/login");
        return;
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-chic-muted">
        Chargement console admin…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f3f6f4_0%,#eef3f0_100%)] lg:flex">
      <aside className="w-full border-b border-chic-line bg-chic-forest-deep text-white lg:w-64 lg:border-b-0 lg:border-r lg:border-white/10">
        <div className="px-5 py-5">
          <p className="font-serif text-xl">Platform Admin</p>
          <p className="mt-1 text-[10px] tracking-[0.2em] text-white/45">CHIC FRAGRANCE OS</p>
        </div>
        <nav className="space-y-1 px-3 pb-6">
          {NAV.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-xl px-3 py-2 text-sm ${
                  active ? "bg-white/12 text-white" : "text-white/70 hover:bg-white/8 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => void logout()}
            className="mt-4 block w-full rounded-xl px-3 py-2 text-left text-sm text-rose-200 hover:bg-white/8"
          >
            Déconnexion
          </button>
        </nav>
      </aside>
      <div className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</div>
    </div>
  );
}
