import type { DataSource } from "@/lib/types";

export function ConnectionBanner({
  source,
  message,
  missing,
  compact = false,
}: {
  source: DataSource;
  message: string;
  missing: string[];
  compact?: boolean;
}) {
  if (source === "google-sheets") {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold tracking-wide ${
          compact
            ? "border-white/15 bg-white/10 text-white"
            : "border-emerald-200 bg-emerald-50 text-emerald-800"
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span className="status-pulse absolute inset-0 rounded-full bg-emerald-400" />
          <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        GOOGLE SHEETS · Connecté
      </div>
    );
  }

  if (source === "demo") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <strong>Mode démonstration.</strong> Données d’exemple clairement séparées.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-chic-line bg-white px-4 py-3 text-sm text-chic-muted">
      <span className="inline-flex items-center gap-2 font-semibold text-chic-forest-deep">
        <span className="h-2 w-2 rounded-full bg-chic-muted/40" />
        Google Sheets · Connexion requise
      </span>
      <span className="mt-1 block text-xs">
        Configurez les variables dans <code>.env.local</code> puis redémarrez.
      </span>
      {missing.length > 0 ? (
        <span className="mt-1 block text-xs">Manquant: {missing.join(", ")}</span>
      ) : null}
      {!compact && message ? (
        <span className="sr-only">{message}</span>
      ) : null}
    </div>
  );
}
