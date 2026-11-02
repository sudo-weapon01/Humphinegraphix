/**
 * Signed staff session tokens.
 *
 * Web Crypto only (no Node APIs) so the same code runs in middleware (edge),
 * route handlers, and server components. The token is an HMAC-SHA256 signature
 * over a small JSON payload — no database table needed for sessions.
 */

export const SESSION_COOKIE = "hg_staff_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

export type StaffSession = {
  sub: string;
  exp: number;
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function base64url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64url(value: string): Uint8Array | null {
  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

async function hmac(secret: string, payload: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return new Uint8Array(signature);
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function createSessionToken(
  username: string,
  secret: string,
  ttlSeconds: number = SESSION_TTL_SECONDS,
  now: number = Date.now(),
): Promise<string> {
  const payload: StaffSession = {
    sub: username,
    exp: Math.floor(now / 1000) + ttlSeconds,
  };
  const body = base64url(encoder.encode(JSON.stringify(payload)));
  const signature = base64url(await hmac(secret, body));
  return `${body}.${signature}`;
}

export async function verifySessionToken(
  token: string | undefined | null,
  secret: string,
  now: number = Date.now(),
): Promise<StaffSession | null> {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const providedSignature = fromBase64url(signature);
  if (!providedSignature) return null;

  const expected = await hmac(secret, body);
  if (!timingSafeEqual(expected, providedSignature)) return null;

  const payloadBytes = fromBase64url(body);
  if (!payloadBytes) return null;

  try {
    const parsed = JSON.parse(decoder.decode(payloadBytes)) as StaffSession;
    if (typeof parsed?.sub !== "string" || typeof parsed?.exp !== "number") return null;
    if (parsed.exp * 1000 <= now) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Constant-time string comparison used for credentials. */
export async function safeStringEqual(a: string, b: string): Promise<boolean> {
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(a)),
    crypto.subtle.digest("SHA-256", encoder.encode(b)),
  ]);
  return timingSafeEqual(new Uint8Array(ha), new Uint8Array(hb));
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
};
