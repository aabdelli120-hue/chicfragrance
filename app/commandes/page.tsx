import { BusinessApp } from "@/components/business-app";

export default function OrdersPage() {
  return (
    <BusinessApp
      page="orders"
      title="Commandes"
      placeholder="Modifiez le statut d'une commande ici. La ligne correspondante est mise à jour dans Google Sheets via N° Commande."
    />
  );
}
