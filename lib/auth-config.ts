/**
 * Admin credential configuration.
 *
 * TODO / PLACEHOLDER_ADMIN_CREDENTIALS:
 *   Set ADMIN_USERNAME, ADMIN_PASSWORD, and ADMIN_SESSION_SECRET in `.env.local`
 *   (and in the host's environment settings) before going live.
 *
 * Behaviour:
 *  - Credentials come from env vars when both are set.
 *  - In development, a documented demo login is available so the project runs
 *    out of the box. It is disabled in production.
 *  - With no credentials in production, the sign-in page refuses to authenticate
 *    anyone rather than falling back to a default password.
 */

export type StaffCredentials = {
  username: string;
  password: string;
  source: "env" | "development-default";
};

export const DEVELOPMENT_CREDENTIALS = {
  username: "studio",
  password: "humphine-demo",
} as const;

export function getStaffCredentials(): StaffCredentials | null {
  const username = process.env.ADMIN_USERNAME?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (username && password) {
    return { username, password, source: "env" };
  }
  if (process.env.NODE_ENV !== "production") {
    return { ...DEVELOPMENT_CREDENTIALS, source: "development-default" };
  }
  return null;
}

export function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (secret && secret.length >= 16) return secret;

  const password = process.env.ADMIN_PASSWORD;
  if (password) return `humphinegraphix::session::${password}`;

  // Development-only fallback. Never reached in production because sign-in is
  // disabled there without configured credentials.
  return "humphinegraphix::development::session-secret";
}

/** True when staff sign-in is possible at all. */
export function adminConfigured(): boolean {
  return getStaffCredentials() !== null;
}
