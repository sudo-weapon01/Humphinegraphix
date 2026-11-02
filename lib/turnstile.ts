/**
 * Cloudflare Turnstile (optional).
 *
 * Enabled only when both keys are configured:
 *   NEXT_PUBLIC_TURNSTILE_SITE_KEY  (browser widget)
 *   TURNSTILE_SECRET_KEY            (server verification)
 *
 * Without keys the check is skipped so local development and previews work
 * unchanged; production should always set both. The honeypot and rate limiting
 * still apply regardless.
 */

import { TURNSTILE_SITE_KEY } from "./turnstile-config";

export function turnstileEnabled(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY && TURNSTILE_SITE_KEY);
}

export async function verifyTurnstileToken(
  token: string | undefined,
  ip: string,
): Promise<{ ok: boolean; reason?: string }> {
  if (!turnstileEnabled()) return { ok: true };
  if (!token) return { ok: false, reason: "Please complete the spam check." };

  try {
    const body = new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET_KEY!,
      response: token,
      remoteip: ip,
    });
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });
    const result = (await response.json()) as { success?: boolean; "error-codes"?: string[] };
    if (result.success) return { ok: true };
    return {
      ok: false,
      reason: "The spam check did not pass. Please refresh and try again.",
    };
  } catch (error) {
    console.error("[turnstile] verification unavailable", error);
    // Never block a genuine enquiry because Cloudflare is unreachable.
    return { ok: true };
  }
}
