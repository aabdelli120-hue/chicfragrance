import Link from "next/link";

export function PremiumBanner() {
  return (
    <section className="premium-hero flex flex-col items-start justify-between gap-5 rounded-[24px] px-6 py-6 text-white lg:flex-row lg:items-center lg:px-8">
      <div>
        <p className="text-[11px] tracking-[0.2em] text-chic-gold">CHIC FRAGRANCE PREMIUM</p>
        <h2 className="mt-2 font-serif text-2xl">Accélérez votre croissance</h2>
        <p className="mt-2 max-w-xl text-sm text-white/75">
          Développez votre activité avec des outils intelligents, sans quitter votre tableau de bord.
        </p>
      </div>
      <Link
        href="/premium"
        className="rounded-full bg-gradient-to-r from-[#e6c56a] to-[#c9a227] px-5 py-2.5 text-sm font-semibold text-chic-forest-deep transition hover:brightness-105"
      >
        Découvrir Premium →
      </Link>
    </section>
  );
}
