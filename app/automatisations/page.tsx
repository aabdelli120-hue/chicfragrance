import { ModuleFrame } from "@/components/premium/module-frame";

const RULES = [
  "Nouvelle commande → mettre à jour le dashboard",
  "Commande livrée → recalculer les revenus",
  "Dépense publicitaire → actualiser les performances",
  "Rapport quotidien → générer automatiquement",
];

export default function AutomationsPage() {
  return (
    <ModuleFrame
      feature="AUTOMATIONS"
      title="Automatisations"
      description="Règles opérationnelles pour synchroniser commandes, dépenses et rapports."
    >
      <div className="card p-5">
        <ul className="space-y-3 text-sm">
          {RULES.map((rule) => (
            <li key={rule} className="flex items-start gap-2 rounded-xl border border-chic-line px-3 py-2.5">
              <span className="mt-0.5 text-chic-emerald">✓</span>
              {rule}
            </li>
          ))}
        </ul>
      </div>
    </ModuleFrame>
  );
}
