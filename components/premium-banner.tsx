import Link from "next/link";

export function PremiumBanner() {
  return (
    <section className="card flex flex-col items-start justify-between gap-4 p-5 lg:flex-row lg:items-center">
      <div>
        <p className="text-[11px] tracking-[0.16em] text-chic-gold">PREMIUM</p>
        <h2 className="mt-1 text-base font-semibold">Débloquez plus d’outils</h2>
        <p className="mt-1 max-w-xl text-sm text-chic-muted">
          Une suite d’outils pour gérer, analyser, automatiser et développer votre activité e-commerce.
        </p>
      </div>
      <Link
        href="/premium"
        className="rounded-xl bg-chic-emerald px-4 py-2.5 text-sm font-semibold text-white transition duration-300 hover:bg-chic-forest"
      >
        Voir les plans
      </Link>
    </section>
  );
}
