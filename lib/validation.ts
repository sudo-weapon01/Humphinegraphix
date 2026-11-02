/** Small, dependency-free validation helpers shared by client and server code. */

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; errors: Record<string, string> };

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Deliberately practical, not RFC-5322-complete. */
export function isValidEmail(value: string): boolean {
  if (value.length > 254) return false;
  return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(value);
}

/**
 * Phone numbers are optional but must look like a real number when supplied:
 * digits, spaces, dashes, parentheses, and a leading + only.
 */
export function isValidPhone(value: string): boolean {
  if (!/^\+?[0-9][0-9\s\-().]{5,24}$/.test(value)) return false;
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 20;
}

export function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

/** Today's date in UTC, as `YYYY-MM-DD`. */
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isValidUrl(value: string): boolean {
  if (!value.startsWith("https://") && !value.startsWith("/")) return false;
  try {
    if (value.startsWith("/")) return !value.startsWith("//");
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

