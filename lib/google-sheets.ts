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
import {
  isOrderStatus,
  type DataSource,
  type Expense,
  type Order,
  type OrderStatus,
  type SheetsConfigStatus,
} from "@/lib/types";

const COMMANDES_SHEET = "COMMANDES";
const DEPENSES_SHEET = "DEPENSES";

const REQUIRED_ENV = [
  "GOOGLE_SERVICE_ACCOUNT_EMAIL",
  "GOOGLE_PRIVATE_KEY",
  "GOOGLE_SHEET_ID",
] as const;

type HeaderMap = Record<string, number>;

function normalizeHeader(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function getEnv(name: (typeof REQUIRED_ENV)[number]): string {
  return process.env[name]?.trim() ?? "";
}

function normalizePrivateKey(raw: string): string {
  return raw
    .replace(/^"|"$/g, "")
    .replace(/\\n/g, "\n")
    .trim();
}

export function getSheetsConfigStatus(): SheetsConfigStatus {
  const missing = REQUIRED_ENV.filter((name) => !getEnv(name));
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

function assertConfigured() {
  const status = getSheetsConfigStatus();
  if (!status.configured) {
    throw new SheetsConfigError(status.missing);
  }
}

async function getSheetsClient(): Promise<{
  sheets: sheets_v4.Sheets;
  spreadsheetId: string;
}> {
  assertConfigured();

  try {
    const auth = new google.auth.JWT({
      email: getEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL"),
      key: normalizePrivateKey(getEnv("GOOGLE_PRIVATE_KEY")),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    return { sheets, spreadsheetId: getEnv("GOOGLE_SHEET_ID") };
  } catch (error) {
    throw new SheetsUnavailableError(error);
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

function mapOrder(row: unknown[], headers: HeaderMap): Order | null {
  const orderNumber = normalizeOrderNumber(
    cell(row, headers, "N° Commande", "N Commande", "Commande", "orderNumber"),
  );
  if (!orderNumber) return null;

  const rawDate = cell(row, headers, "Date");
  const parsedDate = parseSheetDate(rawDate);

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
    status: cell(row, headers, "Statut", "Status"),
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
    const message =
      error instanceof Error
        ? error.message
        : "Erreur inconnue lors de la lecture Google Sheets.";

    if (/ENOTFOUND|ECONNRESET|ETIMEDOUT|network/i.test(message)) {
      throw new SheetsUnavailableError(error);
    }

    throw new SheetsApiError(
      `Impossible de lire la plage ${range}: ${message}`,
      error,
    );
  }
}

export async function readOrders(): Promise<Order[]> {
  const rows = await readSheet(`${COMMANDES_SHEET}!A:K`);
  if (rows.length === 0) return [];

  const headers = buildHeaderMap(rows[0] ?? []);
  return rows
    .slice(1)
    .map((row) => mapOrder(row, headers))
    .filter((order): order is Order => order !== null);
}

export async function readExpenses(): Promise<Expense[]> {
  const rows = await readSheet(`${DEPENSES_SHEET}!A:K`);
  if (rows.length === 0) return [];

  const headers = buildHeaderMap(rows[0] ?? []);
  return rows
    .slice(1)
    .map((row) => mapExpense(row, headers))
    .filter((expense): expense is Expense => expense !== null);
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

  const rows = await readSheet(`${COMMANDES_SHEET}!A:K`);
  if (rows.length === 0) {
    throw new OrderNotFoundError(normalized);
  }

  const headers = buildHeaderMap(rows[0] ?? []);
  const orderNumberColumn =
    headers[normalizeHeader("N° Commande")] ??
    headers[normalizeHeader("N Commande")] ??
    1;
  const statusColumn = headers[normalizeHeader("Statut")] ?? 9;

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
  if (!isOrderStatus(status)) {
    throw new InvalidStatusError(status);
  }

  const { rowNumber, statusColumn } = await findOrderRowByNumber(orderNumber);
  const { sheets, spreadsheetId } = await getSheetsClient();
  const columnLetter = String.fromCharCode(65 + statusColumn);

  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${COMMANDES_SHEET}!${columnLetter}${rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[status]],
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur inconnue lors de la mise à jour Google Sheets.";
    throw new SheetsApiError(
      `Impossible de mettre à jour le statut de la commande ${orderNumber}: ${message}`,
      error,
    );
  }

  return findOrderByNumber(orderNumber);
}

export function getPublicSource(): DataSource {
  return getSheetsConfigStatus().source;
}

export type { OrderStatus };
