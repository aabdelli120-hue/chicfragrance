import { AppShell } from "@/components/app-shell";
import { SettingsCenter } from "@/components/settings/settings-center";

export default function SettingsPage() {
  return (
    <AppShell orderCount={0}>
      <main className="px-4 py-6 lg:px-8 lg:py-8">
        <p className="text-sm text-chic-muted">Chic Fragrance · Depuis 1999</p>
        <h1 className="mt-2 font-serif text-4xl">Paramètres</h1>
        <p className="mt-2 max-w-2xl text-sm text-chic-muted">
          Centre de configuration. Les secrets Google restent côté serveur.
        </p>
        <div className="mt-6">
          <SettingsCenter />
        </div>
      </main>
    </AppShell>
  );
}
