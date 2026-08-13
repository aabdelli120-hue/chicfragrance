import { ModuleFrame } from "@/components/premium/module-frame";

export default function AppCreationIaPage() {
  return (
    <ModuleFrame
      feature="AI_LANDING_PAGE"
      title="Création IA"
      description="Hub créatif — landing pages, visuels, contenus et créatifs."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <HubCard href="/app/landing-pages" title="Landing Page Studio" text="Créer et publier des pages de vente." />
        <HubCard href="/app/creation-ia/visuels" title="Visuels" text="Studio produit IA." />
        <HubCard href="/app/creation-ia/creatifs" title="Créatifs" text="Publicités et variations." />
        <HubCard href="/app/creation-ia/contenus" title="Contenus" text="Textes marketing." />
      </div>
    </ModuleFrame>
  );
}

function HubCard({ href, title, text }: { href: string; title: string; text: string }) {
  return (
    <a href={href} className="card block p-5 transition hover:border-chic-emerald/40">
      <p className="font-medium text-chic-forest-deep">{title}</p>
      <p className="mt-1 text-sm text-chic-muted">{text}</p>
    </a>
  );
}
