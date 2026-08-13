type NodeSpec = { id: string; label: string; sub?: string; accent?: boolean };

function Nodes({ items }: { items: NodeSpec[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((item, index) => (
        <div key={item.id} className="flex items-center gap-2">
          {index > 0 ? <FlowArrow /> : null}
          <div
            className={`relative rounded-xl border px-3 py-2 ${
              item.accent
                ? "border-chic-emerald/30 bg-chic-mint/70"
                : "border-chic-line bg-white"
            }`}
          >
            <span className="absolute left-2 top-2 h-1 w-1 rounded-full bg-chic-emerald status-pulse" />
            <p className="pl-3 text-[11px] font-semibold tracking-[0.08em] uppercase">{item.label}</p>
            {item.sub ? <p className="pl-3 text-[10px] text-chic-muted">{item.sub}</p> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function FlowArrow() {
  return (
    <svg width="28" height="12" viewBox="0 0 28 12" className="text-chic-emerald/50">
      <path
        d="M1 6h24M21 2l5 4-5 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        className="conn-line"
      />
    </svg>
  );
}

export function DataArchitecture() {
  return (
    <section className="card overflow-hidden p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-chic-muted">Architecture données</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">Tout est connecté</h2>
        </div>
        <span className="rounded-full bg-chic-mint px-2.5 py-1 text-[10px] font-medium text-chic-emerald">
          Source unique
        </span>
      </div>
      <div className="mt-5 space-y-3">
        <Nodes items={[{ id: "sheets", label: "Google Sheets", sub: "Source de vérité" }]} />
        <div className="ml-4 h-6 w-px bg-gradient-to-b from-chic-emerald/50 to-chic-emerald/10" />
        <Nodes items={[{ id: "core", label: "Chic Fragrance", sub: "Système de gestion", accent: true }]} />
        <div className="ml-4 h-6 w-px bg-gradient-to-b from-chic-emerald/40 to-transparent" />
        <Nodes
          items={[
            { id: "orders", label: "Orders" },
            { id: "analytics", label: "Analytics" },
            { id: "ai", label: "AI" },
            { id: "reports", label: "Reports" },
          ]}
        />
        <div className="ml-4 h-6 w-px bg-gradient-to-b from-chic-emerald/30 to-transparent" />
        <Nodes items={[{ id: "decisions", label: "Business decisions" }]} />
      </div>
    </section>
  );
}

export function EcosystemFlow() {
  return (
    <section id="ecosysteme" className="card p-5">
      <p className="text-[11px] uppercase tracking-[0.16em] text-chic-muted">Écosystème</p>
      <h2 className="mt-1 text-lg font-semibold tracking-tight">
        Votre activité, connectée en un seul endroit
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-chic-muted">
        Une suite d’outils pour gérer, analyser, automatiser et développer votre activité e-commerce.
      </p>
      <div className="mt-5">
        <Nodes
          items={[
            { id: "sheets", label: "Google Sheets" },
            { id: "orders", label: "Orders" },
            { id: "analytics", label: "Analytics" },
            { id: "ai", label: "AI" },
            { id: "marketing", label: "Marketing" },
            { id: "store", label: "Store" },
          ]}
        />
      </div>
    </section>
  );
}

export function Workflow({
  steps,
  orientation = "auto",
}: {
  steps: string[];
  orientation?: "auto" | "vertical";
}) {
  const vertical = orientation === "vertical";
  return (
    <div className={`flex ${vertical ? "flex-col" : "flex-col sm:flex-row sm:flex-wrap sm:items-center"} gap-2`}>
      {steps.map((step, index) => (
        <div key={step} className={`flex ${vertical ? "flex-col" : "flex-col sm:flex-row"} items-start sm:items-center gap-2`}>
          <div className="rounded-lg border border-chic-line bg-white px-3 py-2 text-xs font-medium tracking-wide">
            {step}
          </div>
          {index < steps.length - 1 ? (
            <span className={`text-chic-emerald/50 ${vertical ? "ml-4 rotate-90" : "hidden sm:inline"}`}>
              <FlowArrow />
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
