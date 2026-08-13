/**
 * Private Chic Fragrance dashboard mode.
 * Auth / multi-tenant is paused until CHIC_AUTH_ENABLED=true.
 */
export function isAuthEnabled(): boolean {
  return process.env.CHIC_AUTH_ENABLED === "true";
}
