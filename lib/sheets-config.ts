export type SheetsLayout = {
  spreadsheetId: string;
  ordersSheet: string;
  ordersRange: string;
  expensesSheet: string;
  expensesRange: string;
};

export const DEFAULT_SHEETS_LAYOUT: Omit<SheetsLayout, "spreadsheetId"> = {
  ordersSheet: "COMMANDES",
  ordersRange: "A:K",
  expensesSheet: "DEPENSES",
  expensesRange: "A:K",
};

const RANGE_PATTERN = /^[A-Z]{1,3}[0-9]*:[A-Z]{1,3}[0-9]*$/i;

export function isValidA1Range(value: string): boolean {
  return RANGE_PATTERN.test(value.trim());
}

export function isValidSheetName(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length > 0 && !trimmed.includes("!") && !trimmed.includes("'");
}

export function sheetA1(sheet: string, range: string): string {
  return `${sheet.trim()}!${range.trim().toUpperCase()}`;
}

export function validateSheetsLayoutInput(input: {
  spreadsheetId?: string;
  ordersSheet?: string;
  ordersRange?: string;
  expensesSheet?: string;
  expensesRange?: string;
}): string[] {
  const errors: string[] = [];
  if (input.spreadsheetId !== undefined && !input.spreadsheetId.trim()) {
    errors.push("L'identifiant du classeur est requis.");
  }
  if (input.ordersSheet !== undefined && !isValidSheetName(input.ordersSheet)) {
    errors.push("Le nom de l'onglet COMMANDES est invalide.");
  }
  if (input.expensesSheet !== undefined && !isValidSheetName(input.expensesSheet)) {
    errors.push("Le nom de l'onglet DEPENSES est invalide.");
  }
  if (input.ordersRange !== undefined && !isValidA1Range(input.ordersRange)) {
    errors.push("La plage COMMANDES est invalide. Exemple: A:K");
  }
  if (input.expensesRange !== undefined && !isValidA1Range(input.expensesRange)) {
    errors.push("La plage DEPENSES est invalide. Exemple: A:K");
  }
  return errors;
}
