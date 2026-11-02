/**
 * Minimal path helpers for the auto-generated page-copy editor.
 * Supports `home.heroTitle`, `values[0].title`, and `storyParagraphs[1]`.
 */

export type PathSegment = string | number;

export function parsePath(path: string): PathSegment[] {
  if (!path) return [];
  const segments: PathSegment[] = [];
  for (const part of path.split(".")) {
    const match = /^([^[\]]*)((?:\[\d+\])*)$/.exec(part);
    if (!match) {
      segments.push(part);
      continue;
    }
    if (match[1]) segments.push(match[1]);
    for (const index of match[2].match(/\d+/g) ?? []) segments.push(Number(index));
  }
  return segments;
}

export function getAtPath(root: unknown, path: string): unknown {
  let current: unknown = root;
  for (const segment of parsePath(path)) {
    if (current === null || typeof current !== "object") return undefined;
    current = (current as Record<PathSegment, unknown>)[segment];
  }
  return current;
}

/** Immutably sets a value at `path`; arrays are replaced by reference-safe copies. */
export function setAtPath<T>(root: T, path: string, value: unknown): T {
  const segments = parsePath(path);
  if (segments.length === 0) return value as T;

  const clone = (node: unknown): unknown => {
    if (Array.isArray(node)) return [...node];
    if (node !== null && typeof node === "object") return { ...(node as object) };
    return node;
  };

  const rootCopy = clone(root) as Record<PathSegment, unknown>;
  let current = rootCopy;
  for (let i = 0; i < segments.length - 1; i += 1) {
    const segment = segments[i];
    const child = clone(current[segment]);
    current[segment] = child;
    current = child as Record<PathSegment, unknown>;
  }
  current[segments[segments.length - 1]] = value;
  return rootCopy as T;
}

/** Turns `home.heroTitle` / `values[0].title` into a readable form label. */
export function labelForPath(path: string): string {
  const cleaned = path.replace(/\./g, " › ").replace(/\[(\d+)\]/g, " $1");
  const last = cleaned.split(" › ").pop() ?? cleaned;
  const text = last
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}
