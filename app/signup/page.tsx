import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <AuthShell
      title="Créer une organisation"
      subtitle="Onboarding en quelques étapes — votre boutique devient un tenant de la plateforme."
    >
      <SignupForm />
    </AuthShell>
  );
}
