import type { ReactNode } from "react";
import Link from "next/link";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,_#e7f4ee_0%,_#f3f6f4_45%,_#f7f4ee_100%)]">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-chic-emerald/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-chic-gold/15 blur-3xl" />
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
        <Link href="/login" className="mb-8 text-center">
          <p className="font-serif text-3xl text-chic-forest-deep">Chic Fragrance</p>
          <p className="mt-1 text-[11px] tracking-[0.22em] text-chic-muted">PLATFORM</p>
        </Link>
        <div className="rounded-3xl border border-chic-line/80 bg-white/90 p-6 shadow-[0_20px_60px_-30px_rgba(19,78,58,0.35)] backdrop-blur">
          <h1 className="font-serif text-2xl text-chic-forest-deep">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm text-chic-muted">{subtitle}</p> : null}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
