import { AppShell } from "@/components/app-shell";
import { PremiumWorkspace } from "@/components/premium/premium-workspace";

export default function AppPremiumPage() {
  return (
    <AppShell orderCount={0}>
      <main className="px-4 py-6 lg:px-8 lg:py-8">
        <PremiumWorkspace />
      </main>
    </AppShell>
  );
}
