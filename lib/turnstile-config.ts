/**
 * Public half of the Turnstile configuration.
 *
 * Kept in its own module so client components can read the site key without
 * pulling in the server-side verification code.
 */
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export function turnstileConfigured(): boolean {
  return TURNSTILE_SITE_KEY.length > 0;
}
