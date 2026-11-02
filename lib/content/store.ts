import { promises as fs } from "node:fs";
import path from "node:path";
import { getSupabaseAdmin, supabaseConfigured } from "../supabase";
import { defaultBundle } from "./defaults";
import {
  CONTENT_KEYS,
  type ContentBundle,
  type ContentKey,
  type PublishStatus,
} from "./types";

/**
 * Content store.
 *
 * Three documents — `pages`, `services`, `portfolio` — each with a `draft` and a
 * `published` copy. The public site only ever reads `published`; the admin area
 * edits `draft` and publishes explicitly.
 *
 * Two interchangeable backends:
 *   1. Supabase (`content_docs` table) when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY exist.
 *   2. A local JSON file at .data/content.json otherwise (dev, tests, previews).
 */

type StoredDoc = {
  key: ContentKey;
  draft: unknown;
  published: unknown;
  updatedAt: string;
  publishedAt: string | null;
};

type DocMap = Record<ContentKey, StoredDoc>;

const TABLE = "content_docs";

/** Resolved per call so tests (and previews) can point at a throwaway directory. */
function dataDir(): string {
  return process.env.CONTENT_STORE_DIR
    ? path.resolve(process.env.CONTENT_STORE_DIR)
    : path.join(process.cwd(), ".data");
}

function filePath(): string {
  return path.join(dataDir(), "content.json");
}

export function storageBackend(): "supabase" | "files" {
  return supabaseConfigured() ? "supabase" : "files";
}

function defaultsFor(key: ContentKey): unknown {
  return structuredClone(defaultBundle[key]);
}

function seedDoc(key: ContentKey): StoredDoc {
  const now = new Date(0).toISOString();
  const value = defaultsFor(key);
  return {
    key,
    draft: structuredClone(value),
    published: value,
    updatedAt: now,
    publishedAt: now,
  };
}

function seedAll(): DocMap {
  return {
    pages: seedDoc("pages"),
    services: seedDoc("services"),
    portfolio: seedDoc("portfolio"),
  };
}

/* -------------------------------------------------------------------------- */
/* File backend                                                               */
/* -------------------------------------------------------------------------- */

async function readFileDocs(): Promise<DocMap> {
  try {
    const raw = await fs.readFile(filePath(), "utf8");
    const parsed = JSON.parse(raw) as Partial<Record<ContentKey, StoredDoc>>;
    const seeded = seedAll();
    for (const key of CONTENT_KEYS) {
      const doc = parsed?.[key];
      if (doc && typeof doc === "object" && "draft" in doc && "published" in doc) {
        seeded[key] = { ...seeded[key], ...doc, key };
      }
    }
    return seeded;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return seedAll();
    if (error instanceof SyntaxError) return seedAll(); // corrupt file: fall back to defaults
    throw error;
  }
}

async function writeFileDocs(docs: DocMap): Promise<void> {
  await fs.mkdir(dataDir(), { recursive: true });
  const tmp = `${filePath()}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(docs, null, 2), "utf8");
  await fs.rename(tmp, filePath());
}

/* -------------------------------------------------------------------------- */
/* Supabase backend                                                           */
/* -------------------------------------------------------------------------- */

type DocRow = {
  key: string;
  draft: unknown;
  published: unknown;
  updated_at: string;
  published_at: string | null;
};

async function readSupabaseDocs(): Promise<DocMap> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("key, draft, published, updated_at, published_at")
    .in("key", [...CONTENT_KEYS]);

  if (error) throw new Error(`Could not read content: ${error.message}`);

  const seeded = seedAll();
  for (const row of (data ?? []) as DocRow[]) {
    if (!(CONTENT_KEYS as readonly string[]).includes(row.key)) continue;
    const key = row.key as ContentKey;
    seeded[key] = {
      key,
      draft: row.draft ?? defaultsFor(key),
      published: row.published ?? defaultsFor(key),
      updatedAt: row.updated_at,
      publishedAt: row.published_at,
    };
  }
  return seeded;
}

async function writeSupabaseDocs(docs: DocMap): Promise<void> {
  const supabase = getSupabaseAdmin();
  const rows = CONTENT_KEYS.map((key) => ({
    key,
    draft: docs[key].draft,
    published: docs[key].published,
    updated_at: docs[key].updatedAt,
    published_at: docs[key].publishedAt,
  }));
  const { error } = await supabase.from(TABLE).upsert(rows, { onConflict: "key" });
  if (error) throw new Error(`Could not save content: ${error.message}`);
}

/* -------------------------------------------------------------------------- */
/* Public store API                                                           */
/* -------------------------------------------------------------------------- */

async function readDocs(): Promise<DocMap> {
  return storageBackend() === "supabase" ? readSupabaseDocs() : readFileDocs();
}

async function writeDocs(docs: DocMap): Promise<void> {
  return storageBackend() === "supabase"
    ? writeSupabaseDocs(docs)
    : writeFileDocs(docs);
}

function bundleFrom(docs: DocMap, field: "draft" | "published"): ContentBundle {
  return {
    pages: docs.pages[field] as ContentBundle["pages"],
    services: docs.services[field] as ContentBundle["services"],
    portfolio: docs.portfolio[field] as ContentBundle["portfolio"],
  };
}

/**
 * Content the public site renders.
 *
 * If the Supabase backend is briefly unavailable (outage, cold start, bad
 * credentials) the marketing site still renders the shipped defaults rather
 * than failing, while the error is logged for follow-up. Admin reads/writes
 * deliberately do NOT fall back, so edits never silently land in the wrong place.
 */
export async function getPublishedBundle(): Promise<ContentBundle> {
  try {
    return bundleFrom(await readDocs(), "published");
  } catch (error) {
    if (storageBackend() === "files") throw error;
    console.error("[content] published content unavailable — serving shipped defaults", error);
    return structuredClone(defaultBundle);
  }
}

/** Content the admin area edits (includes unpublished changes). */
export async function getDraftBundle(): Promise<ContentBundle> {
  return bundleFrom(await readDocs(), "draft");
}

/** Replaces the draft of one document. Validation happens in the route handler. */
export async function saveDraftDoc(key: ContentKey, value: unknown): Promise<void> {
  const docs = await readDocs();
  docs[key] = { ...docs[key], draft: value, updatedAt: new Date().toISOString() };
  await writeDocs(docs);
}

/** Copies every draft onto its published copy. Returns the publish timestamp. */
export async function publishAllDrafts(): Promise<{ publishedAt: string }> {
  const docs = await readDocs();
  const publishedAt = new Date().toISOString();
  for (const key of CONTENT_KEYS) {
    docs[key] = {
      ...docs[key],
      published: structuredClone(docs[key].draft),
      publishedAt,
      updatedAt: publishedAt,
    };
  }
  await writeDocs(docs);
  return { publishedAt };
}

/** Throws away unpublished edits by resetting drafts to the published copies. */
export async function discardDrafts(): Promise<void> {
  const docs = await readDocs();
  const now = new Date().toISOString();
  for (const key of CONTENT_KEYS) {
    docs[key] = { ...docs[key], draft: structuredClone(docs[key].published), updatedAt: now };
  }
  await writeDocs(docs);
}

export async function getPublishStatus(): Promise<PublishStatus> {
  const docs = await readDocs();
  const changed = CONTENT_KEYS.filter(
    (key) => JSON.stringify(docs[key].draft) !== JSON.stringify(docs[key].published),
  );
  const timestamps = CONTENT_KEYS.map((key) => docs[key].updatedAt).sort();
  const publishedTimestamps = CONTENT_KEYS.map((key) => docs[key].publishedAt)
    .filter((value): value is string => Boolean(value))
    .sort();

  return {
    storage: storageBackend(),
    hasUnpublishedChanges: changed,
    updatedAt: timestamps[timestamps.length - 1] ?? null,
    publishedAt: publishedTimestamps[publishedTimestamps.length - 1] ?? null,
  };
}

/** Resets one document (draft and published) back to the shipped defaults. */
export async function resetDocToDefaults(key: ContentKey): Promise<void> {
  const docs = await readDocs();
  const now = new Date().toISOString();
  const value = defaultsFor(key);
  docs[key] = {
    key,
    draft: structuredClone(value),
    published: value,
    updatedAt: now,
    publishedAt: now,
  };
  await writeDocs(docs);
}
