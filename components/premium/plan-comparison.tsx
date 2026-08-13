import { FEATURE_CATEGORIES, FEATURES, type FeatureDefinition } from "@/lib/features";
import { comparisonCell, type ComparisonCell } from "@/lib/entitlements";
import { PLAN_DISPLAY_NAME, TIER_IDS } from "@/lib/plans";

export function PlanComparison() {
  return (
    <section id="comparer" className="scroll-mt-6">
      <p className="text-[11px] uppercase tracking-[0.16em] text-chic-muted">Comparaison</p>
      <h2 className="mt-1 text-lg font-semibold tracking-tight">Comparez les capacités</h2>
      <p className="mt-1 text-sm text-chic-muted">
        ✓ inclus · GROW / ELITE indique l’offre qui débloque la capacité · Bientôt pour les modules
        en préparation.
      </p>

      <div className="mt-4 hidden overflow-hidden rounded-2xl border border-chic-line bg-white md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-chic-line bg-chic-cream/60 text-[11px] uppercase tracking-[0.12em] text-chic-muted">
              <th className="px-4 py-2.5 font-medium">Capacité</th>
              {TIER_IDS.map((tier) => (
                <th key={tier} className="w-[130px] px-4 py-2.5 font-medium">
                  {PLAN_DISPLAY_NAME[tier]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FEATURE_CATEGORIES.map((category) => (
              <CategoryRows
                key={category}
                category={category}
                rows={FEATURES.filter((feature) => feature.category === category)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 space-y-2 md:hidden">
        {FEATURE_CATEGORIES.map((category) => (
          <details key={category} className="card p-4">
            <summary className="cursor-pointer text-sm font-semibold">{category}</summary>
            <div className="mt-3 space-y-3">
              {FEATURES.filter((feature) => feature.category === category).map((feature) => (
                <div key={feature.id}>
                  <p className="text-sm">{feature.label}</p>
                  <div className="mt-1 grid grid-cols-3 gap-1 text-center text-[11px]">
                    {TIER_IDS.map((tier) => (
                      <div key={tier} className="rounded-lg bg-chic-cream/80 py-1">
                        <p className="text-chic-muted">{PLAN_DISPLAY_NAME[tier]}</p>
                        <Mark cell={comparisonCell(tier, feature.id)} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

function CategoryRows({
  category,
  rows,
}: {
  category: string;
  rows: FeatureDefinition[];
}) {
  return (
    <>
      <tr className="bg-chic-mint/40">
        <td
          colSpan={TIER_IDS.length + 1}
          className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-chic-emerald"
        >
          {category}
        </td>
      </tr>
      {rows.map((feature) => (
        <tr key={feature.id} className="border-t border-chic-line/70">
          <td className="px-4 py-2">{feature.label}</td>
          {TIER_IDS.map((tier) => (
            <td key={tier} className="px-4 py-2">
              <Mark cell={comparisonCell(tier, feature.id)} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function Mark({ cell }: { cell: ComparisonCell }) {
  if (cell.kind === "included") {
    return <span className="text-chic-emerald">✓</span>;
  }
  if (cell.kind === "soon") {
    return <span className="text-[11px] text-chic-gold">Bientôt</span>;
  }
  return (
    <span className="text-[11px] uppercase tracking-[0.1em] text-chic-muted">
      {PLAN_DISPLAY_NAME[cell.plan]}
    </span>
  );
}
