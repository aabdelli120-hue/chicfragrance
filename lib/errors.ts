export class AppError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly details?: unknown;

  constructor(
    code: string,
    message: string,
    statusCode: number,
    details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class SheetsConfigError extends AppError {
  constructor(missing: string[]) {
    super(
      "SHEETS_NOT_CONFIGURED",
      `Variables d'environnement manquantes: ${missing.join(", ")}`,
      503,
      { missing },
    );
    this.name = "SheetsConfigError";
  }
}

export class SheetsUnavailableError extends AppError {
  constructor(cause?: unknown) {
    super(
      "SHEETS_UNAVAILABLE",
      "Google Sheets est indisponible pour le moment.",
      503,
      cause,
    );
    this.name = "SheetsUnavailableError";
  }
}

export class SheetsApiError extends AppError {
  constructor(message: string, cause?: unknown) {
    super("SHEETS_API_ERROR", message, 502, cause);
    this.name = "SheetsApiError";
  }
}

export class InvalidOrderNumberError extends AppError {
  constructor(orderNumber: string) {
    super(
      "INVALID_ORDER_NUMBER",
      `Numéro de commande invalide: "${orderNumber}".`,
      400,
    );
    this.name = "InvalidOrderNumberError";
  }
}

export class OrderNotFoundError extends AppError {
  constructor(orderNumber: string) {
    super(
      "ORDER_NOT_FOUND",
      `Aucune commande trouvée avec le N° ${orderNumber}.`,
      404,
    );
    this.name = "OrderNotFoundError";
  }
}

export class InvalidStatusError extends AppError {
  constructor(status: string) {
    super(
      "INVALID_STATUS",
      `Statut invalide: "${status}".`,
      400,
    );
    this.name = "InvalidStatusError";
  }
}

export function toErrorPayload(error: unknown) {
  if (error instanceof AppError) {
    const details =
      error.details &&
      typeof error.details === "object" &&
      !Array.isArray(error.details) &&
      !(error.details instanceof Error) &&
      Object.keys(error.details as object).every((key) => key === "missing")
        ? error.details
        : null;

    return {
      ok: false as const,
      code: error.code,
      error: error.message,
      details,
      statusCode: error.statusCode,
    };
  }

  const message =
    error instanceof Error
      ? error.message
      : "Une erreur inattendue s'est produite.";

  return {
    ok: false as const,
    code: "INTERNAL_ERROR",
    error: message,
    details: null,
    statusCode: 500,
  };
}
