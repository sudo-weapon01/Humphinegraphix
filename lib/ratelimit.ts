import { getSupabaseAdmin, supabaseConfigured } from "./supabase";

/**
 * Fixed-window rate limiting.
 *
 * Backed by the `rate_limit_hits` table so limits hold across serverless
 * instances; falls back to an in-process map for local development. Fails open
 * (allows the request) if the limiter itself is unavailable — a broken counter
 * must never take sign-in or the quote form down.
 */

const TABLE = "rate_limit_hits";

type Rule = { limit: number; windowSeconds: number };

export const RATE_LIMITS = {
  /** Staff sign-in: brute-force protection. */
  login: { limit: 5, windowSeconds: 15 * 60 },
  /** Public quote form: spam/flood protection per client IP. */
  quote: { limit: 6, windowSeconds: 60 * 60 },
  /** Image uploads from the admin area. */
  upload: { limit: 30, windowSeconds: 60 * 60 },
} satisfies Record<string, Rule>;

export type RateLimitName = keyof typeof RATE_LIMITS;

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

/**
 * In-process counters, keyed by limiter + window. Only used when Supabase is not
 * configured (local development); the bucket in the key makes entries roll over.
 */
const memory = new Map<string, { count: number }>();

/** Start of the current fixed window, in ms — used for both the key and retry-after. */
function windowStart(windowSeconds: number, now = Date.now()): number {
  return Math.floor(now / (windowSeconds * 1000)) * windowSeconds * 1000;
}

function windowKey(name: string, identifier: string, windowSeconds: number): string {
  return `${name}:${identifier}:${windowStart(windowSeconds)}`;
}

function secondsUntilReset(windowSeconds: number, now = Date.now()): number {
  return Math.max(1, Math.ceil((windowStart(windowSeconds, now) + windowSeconds * 1000 - now) / 1000));
}

export function clientIpFrom(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function checkRateLimit(
  name: RateLimitName,
  identifier: string,
): Promise<RateLimitResult> {
  const { limit, windowSeconds } = RATE_LIMITS[name];
  const key = windowKey(name, identifier, windowSeconds);
  const retryAfterSeconds = secondsUntilReset(windowSeconds);

  if (!supabaseConfigured()) {
    const entry = memory.get(key);
    if (!entry) {
      memory.set(key, { count: 1 });
      return { allowed: true, remaining: limit - 1, retryAfterSeconds };
    }
    entry.count += 1;
    return {
      allowed: entry.count <= limit,
      remaining: Math.max(0, limit - entry.count),
      retryAfterSeconds,
    };
  }

  try {
    const { data, error } = await getSupabaseAdmin().rpc("hit_rate_limit", {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });
    if (error) throw error;

    const row = (Array.isArray(data) ? data[0] : data) as
      | { allowed: boolean; current_count: number; retry_after: number }
      | null;
    if (!row) return { allowed: true, remaining: limit, retryAfterSeconds };

    return {
      allowed: row.allowed,
      remaining: Math.max(0, limit - row.current_count),
      retryAfterSeconds: row.retry_after ?? retryAfterSeconds,
    };
  } catch (error) {
    console.error("[ratelimit] limiter unavailable — allowing request", error);
    return { allowed: true, remaining: limit, retryAfterSeconds };
  }
}

/** Clears a counter (e.g. after a successful sign-in). */
export async function resetRateLimit(name: RateLimitName, identifier: string): Promise<void> {
  const { windowSeconds } = RATE_LIMITS[name];
  const key = windowKey(name, identifier, windowSeconds);
  if (!supabaseConfigured()) {
    memory.delete(key);
    return;
  }
  try {
    await getSupabaseAdmin().from(TABLE).delete().eq("key", key);
  } catch {
    // best effort
  }
}

export function rateLimitMessage(retryAfterSeconds: number): string {
  const minutes = Math.ceil(retryAfterSeconds / 60);
  return minutes > 1
    ? `Too many attempts. Please try again in about ${minutes} minutes.`
    : "Too many attempts. Please try again shortly.";
}
