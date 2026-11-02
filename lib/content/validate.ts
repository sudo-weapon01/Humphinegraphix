import type { Result } from "../validation";
import { isRecord } from "../validation";

/**
 * Validates editor input for the content documents.
 *
 * Rather than hand-writing a schema per field, input is validated against the
 * shape of the current defaults: same keys, same primitive types, no unknown
 * keys, sensible length caps. That keeps the admin area honest (nobody can
 * smuggle extra fields into the published JSON) with very little code.
 */

const MAX_MEDIUM = 400;
const MAX_LONG = 4000;

type Shape = string | Shape[] | { [key: string]: Shape };

function shapeOf(value: unknown): Shape | null {
  if (typeof value === "string") return "";
  if (Array.isArray(value)) return value.length > 0 ? [shapeOf(value[0]) ?? ""] : [];
  if (isRecord(value)) {
    const out: { [key: string]: Shape } = {};
    for (const [key, child] of Object.entries(value)) {
      out[key] = shapeOf(child) ?? "";
    }
    return out;
  }
  return null;
}

function limitFor(path: string): number {
  if (path.endsWith("Paragraphs") || path.includes("description") || path.includes("Body")) {
    return MAX_LONG;
  }
  if (path.startsWith("story") || path.includes(".intro")) return MAX_LONG;
  return MAX_MEDIUM;
}

function validateAgainst(
  template: Shape,
  input: unknown,
  path: string,
  errors: Record<string, string>,
): unknown {
  if (typeof template === "string") {
    if (typeof input !== "string") {
      errors[path] = "This field must be text.";
      return undefined;
    }
    const trimmed = input.trim();
    if (!trimmed) {
      errors[path] = "This field cannot be empty.";
      return undefined;
    }
    const max = limitFor(path);
    if (trimmed.length > max) {
      errors[path] = `Please keep this under ${max} characters.`;
      return undefined;
    }
    return trimmed;
  }

  if (Array.isArray(template)) {
    if (!Array.isArray(input)) {
      errors[path] = "This field must be a list.";
      return undefined;
    }
    if (input.length > 24) {
      errors[path] = "This list is too long.";
      return undefined;
    }
    const itemShape = template[0];
    if (itemShape === undefined) {
      errors[path] = "This list cannot be empty.";
      return undefined;
    }
    const items = input.map((item, index) => {
      const value = validateAgainst(itemShape, item, `${path}[${index}]`, errors);
      return value;
    });
    if (Object.keys(errors).some((key) => key === path || key.startsWith(`${path}[`))) {
      return undefined;
    }
    return items;
  }

  if (!isRecord(input)) {
    errors[path] = "This section is missing.";
    return undefined;
  }

  const out: Record<string, unknown> = {};
  for (const [key, childShape] of Object.entries(template)) {
    const childPath = path ? `${path}.${key}` : key;
    const value = validateAgainst(childShape, input[key], childPath, errors);
    if (value !== undefined) out[key] = value;
  }
  for (const key of Object.keys(input)) {
    if (!(key in template)) {
      errors[path ? `${path}.${key}` : key] = "Unknown field.";
    }
  }
  return out;
}

/** Validates a draft document against the shape of the reference document. */
export function validateContent<T>(reference: T, input: unknown): Result<T> {
  const errors: Record<string, string> = {};
  const shape = shapeOf(reference);
  if (!shape || typeof shape === "string") {
    return { ok: false, errors: { _: "Content template is invalid." } };
  }
  const data = validateAgainst(shape, input, "", errors) as T;
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data };
}

const ID_PATTERN = /^[a-z0-9][a-z0-9-]{1,48}$/;

export function makeId(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base || "item"}-${suffix}`;
}

export function isValidId(value: string): boolean {
  return ID_PATTERN.test(value);
}
