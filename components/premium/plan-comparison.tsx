import { FEATURE_CATEGORIES, FEATURES } from "@/lib/features";
import { comparisonValue } from "@/lib/entitlements";
import { PLANS } from "@/lib/plans";

export function PlanComparison() {
  return (
    <section id="comparer">
      <p className="text-[11px] uppercase tracking-[0.16em] text-chic-muted">Comparaison</p>
      <h2 className="mt-1 text-lg font-semibold tracking-tight">Couverture par catégorie</h2>

      <div className="mt-4 hidden overflow-hidden rounded-2xl border border-chic-line bg-white md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-chic-line bg-chic-cream/50 text-[11px] uppercase tracking-[0.12em] text-chic-muted">
              <th className="px-4 py-3 font-medium">Fonction</th>
              {PLANS.map((plan) => (
                <th key={plan.id} className="px-4 py-3 font-medium">
                  {plan.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FEATURE_CATEGORIES.map((category) => {
              const rows = FEATURES.filter((feature) => feature.category === category);
              return (
                <CategoryRows key={category} category={category} rows={rows} />
              );
            })}
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
                    {PLANS.map((plan) => (
                      <div key={plan.id} className="rounded-lg bg-chic-cream/80 py-1">
                        <p className="text-chic-muted">{plan.name}</p>
                        <p>{mark(comparisonValue(plan.id, feature.id))}</p>
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
  rows: typeof FEATURES;
}) {
  return (
    <>
      <tr className="bg-chic-mint/40">
        <td colSpan={4} className="px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-chic-emerald">
          {category}
        </td>
      </tr>
      {rows.map((feature) => (
        <tr key={feature.id} className="border-t border-chic-line/70">
          <td className="px-4 py-2.5">{feature.label}</td>
          {PLANS.map((plan) => (
            <td key={plan.id} className="px-4 py-2.5 text-chic-muted">
              {mark(comparisonValue(plan.id, feature.id))}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function mark(value: "yes" | "no" | "soon") {
  if (value === "yes") return "✓";
  if (value === "soon") return "Bientôt";
  return "—";
}
