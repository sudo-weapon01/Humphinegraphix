import { defaultBundle } from "./defaults";
import type { ContentKey } from "./types";

/**
 * Schema evolution helper.
 *
 * The content documents live in a database, so a deploy that adds a field to the
 * defaults would otherwise leave existing rows without it (and the page render
 * would hit `undefined`). Reading content therefore merges stored values over
 * the shipped defaults:
 *
 *  - keys missing from the stored document fall back to the default
 *  - stored values (including intentionally empty lists) win
 *  - unknown keys in storage are dropped, so nothing leaks into the render path
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function mergeWithDefaults<T>(defaults: T, stored: unknown): T {
  if (isPlainObject(defaults)) {
    const source = isPlainObject(stored) ? stored : {};
    const out: Record<string, unknown> = {};
    for (const [key, defaultValue] of Object.entries(defaults)) {
      out[key] = mergeWithDefaults(defaultValue, source[key]);
    }
    return out as T;
  }

  if (Array.isArray(defaults)) {
    if (!Array.isArray(stored)) return structuredClone(defaults);
    const template = defaults[0];
    // Stored lists are authoritative (a staff member may have emptied one),
    // but each item is still filled in against the default item shape.
    return stored.map((item) =>
      template === undefined ? item : mergeWithDefaults(template, item),
    ) as T;
  }

  if (typeof defaults === "string") {
    return (typeof stored === "string" && stored.trim() ? stored : defaults) as T;
  }

  return (stored === undefined ? defaults : stored) as T;
}

/** Merges a stored content document of any key against that key's defaults. */
export function mergeDocWithDefaults(key: ContentKey, stored: unknown): unknown {
  return mergeWithDefaults(defaultBundle[key], stored);
}
