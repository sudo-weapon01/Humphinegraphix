import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client.
 *
 * Uses the service-role key because all writes go through the authenticated
 * admin routes. Never import this from a client component — the public site
 * never talks to Supabase directly.
 *
 * When the env vars are absent the app falls back to a local JSON store
 * (see lib/content/store.ts) so `npm run dev` works without any infrastructure.
 */
let cached: SupabaseClient | null = null;

export function supabaseConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  if (!cached) {
    cached = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { headers: { "X-Client-Info": "humphinegraphix-site" } },
      },
    );
  }
  return cached;
}
