import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthShell
      title="Connexion"
      subtitle="Accédez à votre espace organisation ou à la console plateforme."
    >
      <LoginForm />
    </AuthShell>
  );
}
