import { google, type sheets_v4 } from "googleapis";
import {
  InvalidOrderNumberError,
  InvalidStatusError,
  OrderNotFoundError,
  SheetsApiError,
  SheetsConfigError,
  SheetsUnavailableError,
} from "@/lib/errors";
import { normalizeOrderNumber, parseNumber, parseSheetDate } from "@/lib/format";
import { toCanonicalStatus, toSheetStatus, type CanonicalStatus } from "@/lib/status";
import { sheetA1 } from "@/lib/sheets-config";
import { getResolvedSheetsLayout } from "@/lib/workspace-settings";
import type {
  DataSource,
  Expense,
  Order,
  SheetsConfigStatus,
} from "@/lib/types";

const REQUIRED_SECRETS = [
  "GOOGLE_SERVICE_ACCOUNT_EMAIL",
  "GOOGLE_PRIVATE_KEY",
] as const;

type HeaderMap = Record<string, number>;

function normalizeHeader(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function getEnv(name: (typeof REQUIRED_SECRETS)[number]): string {
  return process.env[name]?.trim() ?? "";
}

/**
 * Normalize a service-account PEM for local .env.local and Vercel.
 * Supports quoted values, escaped \n / \\n, CRLF, and single-line keys.
 * Never log the returned value.
 */
function normalizePrivateKey(raw: string): string {
  let key = raw.trim().replace(/^\uFEFF/, "");

  while (
    (key.startsWith('"') && key.endsWith('"') && key.length >= 2) ||
    (key.startsWith("'") && key.endsWith("'") && key.length >= 2)
  ) {
    key = key.slice(1, -1).trim();
  }

  for (let i = 0; i < 4; i += 1) {
    const unescaped = key
      .replace(/\\r\\n/g, "\n")
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\n");
    if (unescaped === key) break;
    key = unescaped;
  }

  key = key.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  const beginMatch = key.match(/-----BEGIN [A-Z ]*PRIVATE KEY-----/);
  const endMatch = key.match(/-----END [A-Z ]*PRIVATE KEY-----/);

  if (beginMatch && endMatch) {
    const header = beginMatch[0];
    const footer = endMatch[0];
    const start = key.indexOf(header) + header.length;
    const end = key.indexOf(footer);
    const body = key.slice(start, end).replace(/\s+/g, "");
    const wrapped = body.match(/.{1,64}/g)?.join("\n") ?? body;
    return `${header}\n${wrapped}\n${footer}\n`;
  }

  return key.endsWith("\n") ? key : `${key}\n`;
}

function assertValidPrivateKey(key: string) {
  const hasBegin = /-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(key);
  const hasEnd = /-----END [A-Z ]*PRIVATE KEY-----/.test(key);
  const hasNewline = key.includes("\n");

  if (!hasBegin || !hasEnd || !hasNewline) {
    throw new SheetsApiError(
      "GOOGLE_PRIVATE_KEY n'est pas un PEM valide. Utilisez une seule ligne avec des sauts de ligne échappés \\n, ou une valeur entre guillemets. La clé doit contenir BEGIN/END PRIVATE KEY.",
    );
  }
}

function publicSheetsErrorMessage(error: unknown, fallback: string): string {
  const message = error instanceof Error ? error.message : String(error ?? "");
  const safe = message.replace(/-----BEGIN[\s\S]*?-----END [A-Z ]*-----/g, "[PEM]");

  if (/DECODER routines|unsupported|PEM_read|ERR_OSSL/i.test(safe)) {
    return "GOOGLE_PRIVATE_KEY est rejeté par OpenSSL (PEM invalide ou sauts de ligne non convertis). Vérifiez les \\n échappés dans .env.local / Vercel.";
  }

  return `${fallback}: ${safe}`;
}

export async function getSheetsConfigStatus(): Promise<SheetsConfigStatus> {
  const layout = await getResolvedSheetsLayout();
  const missing = [
    ...REQUIRED_SECRETS.filter((name) => !getEnv(name)),
    ...(layout.spreadsheetId ? [] : ["GOOGLE_SHEET_ID"]),
  ];
  const allowDemo = process.env.CHIC_ALLOW_DEMO_DATA === "true";

  if (missing.length === 0) {
    return {
      configured: true,
      source: "google-sheets",
      missing: [],
      message: "Connecté à Google Sheets.",
    };
  }

  if (allowDemo) {
    return {
      configured: false,
      source: "demo",
      missing,
      message:
        "Mode démonstration — Google Sheets n'est pas configuré. Les données affichées sont des exemples clairement séparés des données réelles.",
    };
  }

  return {
    configured: false,
    source: "unconfigured",
    missing,
    message: `Google Sheets n'est pas configuré. Variables manquantes: ${missing.join(", ")}.`,
  };
}

async function assertConfigured() {
  const status = await getSheetsConfigStatus();
  if (!status.configured) {
    throw new SheetsConfigError(status.missing);
  }
}

async function getSheetsClient(): Promise<{
  sheets: sheets_v4.Sheets;
  spreadsheetId: string;
}> {
  await assertConfigured();
  const layout = await getResolvedSheetsLayout();

  const privateKey = normalizePrivateKey(getEnv("GOOGLE_PRIVATE_KEY"));
  assertValidPrivateKey(privateKey);

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: getEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL"),
        private_key: privateKey,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    return { sheets, spreadsheetId: layout.spreadsheetId };
  } catch (error) {
    if (error instanceof SheetsApiError) throw error;
    throw new SheetsApiError(publicSheetsErrorMessage(error, "Authentification Google Sheets impossible"));
  }
}

function buildHeaderMap(headerRow: unknown[]): HeaderMap {
  const map: HeaderMap = {};
  headerRow.forEach((cell, index) => {
    const key = normalizeHeader(String(cell ?? ""));
    if (key) map[key] = index;
  });
  return map;
}

function cell(row: unknown[], headers: HeaderMap, ...keys: string[]): string {
  for (const key of keys) {
    const index = headers[normalizeHeader(key)];
    if (index !== undefined) {
      return String(row[index] ?? "").trim();
    }
  }
  return "";
}

function statusColumnIndex(headers: HeaderMap): number {
  return headers[normalizeHeader("Statut")] ?? headers[normalizeHeader("Status")] ?? 9;
}

function mapOrder(row: unknown[], headers: HeaderMap): Order | null {
  const orderNumber = normalizeOrderNumber(
    cell(row, headers, "N° Commande", "N Commande", "Commande", "orderNumber"),
  );
  if (!orderNumber) return null;

  const rawDate = cell(row, headers, "Date");
  const parsedDate = parseSheetDate(rawDate);
  const statusIndex = statusColumnIndex(headers);
  const namedStatus = cell(row, headers, "Statut", "Status");
  const status = namedStatus || String(row[statusIndex] ?? "").trim();

  return {
    orderNumber,
    date: parsedDate.display || rawDate,
    dateIso: parsedDate.iso,
    customerName: cell(row, headers, "Nom Client", "Client"),
    phone: cell(row, headers, "Téléphone", "Telephone"),
    wilaya: cell(row, headers, "Wilaya"),
    product: cell(row, headers, "Produit"),
    productPrice: parseNumber(cell(row, headers, "Prix Produit")),
    deliveryFee: parseNumber(cell(row, headers, "Livraison")),
    total: parseNumber(cell(row, headers, "Total Commande", "Total")),
    status,
    notes: cell(row, headers, "Notes"),
  };
}

function mapExpense(row: unknown[], headers: HeaderMap): Expense | null {
  const rawDate = cell(row, headers, "Date");
  const parsedDate = parseSheetDate(rawDate);
  const rowNumber = cell(row, headers, "#", "N", "id");

  const hasValue = row.some((value) => String(value ?? "").trim() !== "");
  if (!hasValue) return null;

  return {
    rowNumber,
    date: parsedDate.display || rawDate,
    dateIso: parsedDate.iso,
    spendDollars: parseNumber(cell(row, headers, "Spend Dollars")),
    spendEur: parseNumber(cell(row, headers, "Spend EUR")),
    confirmedOrders: parseNumber(cell(row, headers, "Commandes Confirmées")),
    returns: parseNumber(cell(row, headers, "Retour")),
    delivered: parseNumber(cell(row, headers, "Livré", "Livre")),
    cpaReel: parseNumber(cell(row, headers, "CPA Réel", "CPA Reel")),
    collected: parseNumber(cell(row, headers, "Encaissés", "Encaisses")),
    spendDz: parseNumber(cell(row, headers, "Spend Dz", "Spend DZ")),
    net: parseNumber(cell(row, headers, "Net")),
  };
}

async function readSheet(range: string): Promise<unknown[][]> {
  const { sheets, spreadsheetId } = await getSheetsClient();

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
      valueRenderOption: "UNFORMATTED_VALUE",
      dateTimeRenderOption: "FORMATTED_STRING",
    });

    return (response.data.values ?? []) as unknown[][];
  } catch (error) {
    if (error instanceof SheetsApiError) throw error;

    const message =
      error instanceof Error
        ? error.message
        : "Erreur inconnue lors de la lecture Google Sheets.";

    if (/ENOTFOUND|ECONNRESET|ETIMEDOUT|network/i.test(message)) {
      throw new SheetsUnavailableError();
    }

    throw new SheetsApiError(
      publicSheetsErrorMessage(error, `Impossible de lire la plage ${range}`),
    );
  }
}

export async function readOrders(): Promise<Order[]> {
  const layout = await getResolvedSheetsLayout();
  const rows = await readSheet(sheetA1(layout.ordersSheet, layout.ordersRange));
  if (rows.length === 0) return [];

  const headers = buildHeaderMap(rows[0] ?? []);
  return rows
    .slice(1)
    .map((row) => mapOrder(row, headers))
    .filter((order): order is Order => order !== null);
}

export async function readExpenses(): Promise<Expense[]> {
  const layout = await getResolvedSheetsLayout();
  const rows = await readSheet(sheetA1(layout.expensesSheet, layout.expensesRange));
  if (rows.length === 0) return [];

  const headers = buildHeaderMap(rows[0] ?? []);
  return rows
    .slice(1)
    .map((row) => mapExpense(row, headers))
    .filter((expense): expense is Expense => expense !== null && Boolean(expense.dateIso));
}

export async function findOrderRowByNumber(orderNumber: string): Promise<{
  order: Order;
  rowNumber: number;
  statusColumn: number;
}> {
  const normalized = normalizeOrderNumber(orderNumber);
  if (!normalized) {
    throw new InvalidOrderNumberError(orderNumber);
  }

  const layout = await getResolvedSheetsLayout();
  const rows = await readSheet(sheetA1(layout.ordersSheet, layout.ordersRange));
  if (rows.length === 0) {
    throw new OrderNotFoundError(normalized);
  }

  const headers = buildHeaderMap(rows[0] ?? []);
  const orderNumberColumn =
    headers[normalizeHeader("N° Commande")] ??
    headers[normalizeHeader("N Commande")] ??
    1;
  const statusColumn = statusColumnIndex(headers);

  for (let index = 1; index < rows.length; index += 1) {
    const row = rows[index] ?? [];
    const current = normalizeOrderNumber(row[orderNumberColumn]);
    if (current === normalized) {
      const order = mapOrder(row, headers);
      if (!order) continue;
      return {
        order,
        rowNumber: index + 1,
        statusColumn,
      };
    }
  }

  throw new OrderNotFoundError(normalized);
}

export async function findOrderByNumber(orderNumber: string): Promise<Order> {
  const { order } = await findOrderRowByNumber(orderNumber);
  return order;
}

export async function updateOrderStatus(
  orderNumber: string,
  status: string,
): Promise<Order> {
  const canonical = toCanonicalStatus(status);
  if (!canonical) {
    throw new InvalidStatusError(status);
  }

  const sheetValue = toSheetStatus(canonical);
  const layout = await getResolvedSheetsLayout();
  const { rowNumber, statusColumn } = await findOrderRowByNumber(orderNumber);
  const { sheets, spreadsheetId } = await getSheetsClient();
  const columnLetter = String.fromCharCode(65 + statusColumn);

  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${layout.ordersSheet}!${columnLetter}${rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[sheetValue]],
      },
    });
  } catch (error) {
    throw new SheetsApiError(
      publicSheetsErrorMessage(
        error,
        `Impossible de mettre à jour le statut de la commande ${orderNumber}`,
      ),
    );
  }

  return findOrderByNumber(orderNumber);
}

export async function getPublicSource(): Promise<DataSource> {
  return (await getSheetsConfigStatus()).source;
}

export async function testSheetsConnection() {
  const layout = await getResolvedSheetsLayout();
  const orders = await readOrders();
  const expenses = await readExpenses();
  return {
    ok: true as const,
    layout: {
      ordersSheet: layout.ordersSheet,
      ordersRange: layout.ordersRange,
      expensesSheet: layout.expensesSheet,
      expensesRange: layout.expensesRange,
    },
    orders: orders.length,
    expenses: expenses.length,
  };
}

export type { CanonicalStatus };
