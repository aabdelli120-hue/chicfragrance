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
    if (compact) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-medium text-emerald-100">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
          Connecté à Google Sheets
        </span>
      );
    }
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        {message}
      </div>
    );
  }

  if (source === "demo") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <strong>Mode démonstration.</strong> {message}
        {missing.length > 0 ? (
          <span className="mt-1 block text-xs">À fournir: {missing.join(", ")}</span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      <strong>Google Sheets non connecté.</strong> {message}
      <span className="mt-1 block text-xs">
        Ajoutez les variables dans <code>.env.local</code> puis redémarrez le serveur.
      </span>
    </div>
  );
}
