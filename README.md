# Chic Fragrance — Pilotage

Interface ERP connectée à Google Sheets. La feuille reste la source de vérité. Le site ne crée pas de base de commandes séparée.

## Démarrage

```bash
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) (ou le port indiqué dans le terminal).

## Connexion Google Sheets

Créez un fichier `.env.local` à partir de `.env.example` :

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
GOOGLE_SHEET_ID=
CHIC_ALLOW_DEMO_DATA=false
```

1. Créez un projet Google Cloud et activez **Google Sheets API**.
2. Créez un **compte de service** et téléchargez la clé JSON.
3. Copiez `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`.
4. Copiez `private_key` → `GOOGLE_PRIVATE_KEY` (gardez les `\n`, ou collez la clé complète entre guillemets).
5. Copiez l’ID de la feuille (dans l’URL `https://docs.google.com/spreadsheets/d/<ID>/edit`) → `GOOGLE_SHEET_ID`.
6. Partagez la feuille avec l’email du compte de service, droit **Éditeur**.
7. Redémarrez `npm run dev`.

Sans ces variables, le site peut afficher un mode démonstration clairement libellé si `CHIC_ALLOW_DEMO_DATA=true`. Ce mode n’écrit jamais dans Google Sheets.

## API

- `GET /api/orders` — lecture COMMANDES
- `GET /api/expenses` — lecture DEPENSES
- `PATCH /api/orders/[orderNumber]` — met à jour le Statut de la ligne identifiée par **N° Commande**
