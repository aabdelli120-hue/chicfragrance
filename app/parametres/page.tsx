import { BusinessApp } from "@/components/business-app";

export default function SettingsPage() {
  return (
    <BusinessApp
      page="placeholder"
      title="Paramètres"
      placeholder="Configurez GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY et GOOGLE_SHEET_ID dans .env.local. Partagez la feuille avec l'email du compte de service."
    />
  );
}
