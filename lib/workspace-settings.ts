import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  DEFAULT_SHEETS_LAYOUT,
  type SheetsLayout,
} from "@/lib/sheets-config";
import type { PlanId } from "@/lib/plans";

export type WorkspaceSettings = {
  general: {
    storeName: string;
    currency: string;
    timezone: string;
    dateFormat: string;
  };
  sheets: {
    spreadsheetId: string;
    ordersSheet: string;
    ordersRange: string;
    expensesSheet: string;
    expensesRange: string;
  };
  account: {
    name: string;
    email: string;
    role: string;
  };
  subscription: {
    plan: PlanId;
    status: "inactive" | "active" | "past_due";
    startedAt: string | null;
    expiresAt: string | null;
  };
};

const SETTINGS_PATH = path.join(process.cwd(), "data", "workspace-settings.json");

export function defaultWorkspaceSettings(): WorkspaceSettings {
  return {
    general: {
      storeName: "Chic Fragrance",
      currency: "DZD",
      timezone: "Africa/Algiers",
      dateFormat: "DD-MM-YYYY HH:mm",
    },
    sheets: {
      spreadsheetId: process.env.GOOGLE_SHEET_ID?.trim() ?? "",
      ordersSheet: process.env.GOOGLE_ORDERS_SHEET?.trim() || DEFAULT_SHEETS_LAYOUT.ordersSheet,
      ordersRange: process.env.GOOGLE_ORDERS_RANGE?.trim() || DEFAULT_SHEETS_LAYOUT.ordersRange,
      expensesSheet: process.env.GOOGLE_EXPENSES_SHEET?.trim() || DEFAULT_SHEETS_LAYOUT.expensesSheet,
      expensesRange: process.env.GOOGLE_EXPENSES_RANGE?.trim() || DEFAULT_SHEETS_LAYOUT.expensesRange,
    },
    account: {
      name: "Chic Fragrance",
      email: "administrateur@chicfragrance.dz",
      role: "Administrateur",
    },
    subscription: {
      plan: "FREE",
      status: "inactive",
      startedAt: null,
      expiresAt: null,
    },
  };
}

async function readOverlay(): Promise<Partial<WorkspaceSettings>> {
  try {
    const raw = await readFile(SETTINGS_PATH, "utf8");
    return JSON.parse(raw) as Partial<WorkspaceSettings>;
  } catch {
    return {};
  }
}

function mergeSettings(
  base: WorkspaceSettings,
  overlay: Partial<WorkspaceSettings>,
): WorkspaceSettings {
  return {
    general: { ...base.general, ...overlay.general },
    sheets: { ...base.sheets, ...overlay.sheets },
    account: { ...base.account, ...overlay.account },
    subscription: { ...base.subscription, ...overlay.subscription },
  };
}

export async function getWorkspaceSettings(): Promise<WorkspaceSettings> {
  const overlay = await readOverlay();
  return mergeSettings(defaultWorkspaceSettings(), overlay);
}

export async function saveWorkspaceSettings(
  patch: Partial<WorkspaceSettings>,
): Promise<WorkspaceSettings> {
  const current = await getWorkspaceSettings();
  const next = mergeSettings(current, patch);
  await mkdir(path.dirname(SETTINGS_PATH), { recursive: true });
  await writeFile(SETTINGS_PATH, JSON.stringify(next, null, 2), "utf8");
  return next;
}

export async function getResolvedSheetsLayout(): Promise<SheetsLayout> {
  const settings = await getWorkspaceSettings();
  return {
    spreadsheetId:
      settings.sheets.spreadsheetId.trim() ||
      process.env.GOOGLE_SHEET_ID?.trim() ||
      "",
    ordersSheet: settings.sheets.ordersSheet.trim() || DEFAULT_SHEETS_LAYOUT.ordersSheet,
    ordersRange: settings.sheets.ordersRange.trim() || DEFAULT_SHEETS_LAYOUT.ordersRange,
    expensesSheet: settings.sheets.expensesSheet.trim() || DEFAULT_SHEETS_LAYOUT.expensesSheet,
    expensesRange: settings.sheets.expensesRange.trim() || DEFAULT_SHEETS_LAYOUT.expensesRange,
  };
}

export function publicSettingsPayload(settings: WorkspaceSettings) {
  return {
    general: settings.general,
    sheets: {
      spreadsheetId: settings.sheets.spreadsheetId,
      ordersSheet: settings.sheets.ordersSheet,
      ordersRange: settings.sheets.ordersRange,
      expensesSheet: settings.sheets.expensesSheet,
      expensesRange: settings.sheets.expensesRange,
    },
    account: settings.account,
    subscription: settings.subscription,
    secrets: {
      serviceAccountConfigured: Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim()),
      privateKeyConfigured: Boolean(process.env.GOOGLE_PRIVATE_KEY?.trim()),
    },
  };
}
