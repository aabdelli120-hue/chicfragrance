import Image from "next/image";
import { PricingSection } from "@/components/premium/pricing-section";
import { AppShell } from "@/components/app-shell";

export default function PremiumPage() {
  return (
    <AppShell orderCount={0}>
      <div className="premium-hero min-h-screen px-4 py-8 lg:px-10 lg:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex justify-center">
            <div className="w-48 overflow-hidden rounded-2xl">
              <Image src="/logo.png" alt="Chic Fragrance depuis 1999" width={320} height={200} priority />
            </div>
          </div>
          <p className="mt-8 text-center text-xs tracking-[0.24em] text-chic-gold">CHIC FRAGRANCE PREMIUM</p>
          <h1 className="mt-4 text-center font-serif text-4xl text-white lg:text-5xl">
            Développez votre activité avec Chic Fragrance Premium
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-center text-white/75">
            Des outils intelligents pour créer, analyser et développer votre commerce.
          </p>
          <div className="mt-12">
            <PricingSection />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
