import "server-only";

import { DEFAULT_SHEETS_LAYOUT, type SheetsLayout } from "@/lib/sheets-config";
import { ensurePlatformSeeded } from "@/lib/platform/seed";
import { readDatabase, updateDatabase } from "@/lib/platform/store";
import { createId, nowIso } from "@/lib/platform/ids";
import { getWorkspaceSettings } from "@/lib/workspace-settings";

/**
 * Resolve Sheets layout for an organization.
 * Prefer org integration config; fall back to legacy workspace-settings + env
 * for the seeded Chic Fragrance tenant (safe migration path).
 */
export async function getOrgSheetsLayout(
  organizationId: string,
): Promise<SheetsLayout> {
  await ensurePlatformSeeded();
  const db = await readDatabase();
  const integration = db.integrations.find(
    (i) =>
      i.organizationId === organizationId && i.provider === "google_sheets",
  );

  const cfg = integration?.configuration ?? {};
  const spreadsheetId =
    (cfg.spreadsheetId || "").trim() ||
    (await legacySpreadsheetFallback(organizationId));

  return {
    spreadsheetId,
    ordersSheet: (cfg.ordersSheet || "").trim() || DEFAULT_SHEETS_LAYOUT.ordersSheet,
    ordersRange: (cfg.ordersRange || "").trim() || DEFAULT_SHEETS_LAYOUT.ordersRange,
    expensesSheet:
      (cfg.expensesSheet || "").trim() || DEFAULT_SHEETS_LAYOUT.expensesSheet,
    expensesRange:
      (cfg.expensesRange || "").trim() || DEFAULT_SHEETS_LAYOUT.expensesRange,
  };
}

async function legacySpreadsheetFallback(organizationId: string): Promise<string> {
  const db = await readDatabase();
  const org = db.organizations.find((o) => o.id === organizationId);
  // Only the first/seeded tenant may use global env GOOGLE_SHEET_ID.
  if (org?.slug === "chic-fragrance") {
    const settings = await getWorkspaceSettings();
    return (
      settings.sheets.spreadsheetId.trim() ||
      process.env.GOOGLE_SHEET_ID?.trim() ||
      ""
    );
  }
  return "";
}

export async function updateOrgSheetsIntegration(
  organizationId: string,
  patch: Partial<{
    spreadsheetId: string;
    ordersSheet: string;
    ordersRange: string;
    expensesSheet: string;
    expensesRange: string;
  }>,
): Promise<void> {
  await updateDatabase((db) => {
    let integration = db.integrations.find(
      (i) =>
        i.organizationId === organizationId && i.provider === "google_sheets",
    );
    const timestamp = nowIso();
    if (!integration) {
      integration = {
        id: createId("int"),
        organizationId,
        provider: "google_sheets",
        type: "orders_expenses",
        configuration: {
          spreadsheetId: "",
          ordersSheet: DEFAULT_SHEETS_LAYOUT.ordersSheet,
          ordersRange: DEFAULT_SHEETS_LAYOUT.ordersRange,
          expensesSheet: DEFAULT_SHEETS_LAYOUT.expensesSheet,
          expensesRange: DEFAULT_SHEETS_LAYOUT.expensesRange,
        },
        status: "disconnected",
        lastSyncAt: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      db.integrations.push(integration);
    }

    integration.configuration = {
      ...integration.configuration,
      ...Object.fromEntries(
        Object.entries(patch).filter(([, v]) => typeof v === "string"),
      ),
    };
    integration.status = integration.configuration.spreadsheetId?.trim()
      ? "connected"
      : "disconnected";
    integration.updatedAt = timestamp;
  });
}

export async function touchOrgSheetsSync(organizationId: string): Promise<void> {
  await updateDatabase((db) => {
    const integration = db.integrations.find(
      (i) =>
        i.organizationId === organizationId && i.provider === "google_sheets",
    );
    if (integration) {
      integration.lastSyncAt = nowIso();
      integration.updatedAt = nowIso();
    }
  });
}
