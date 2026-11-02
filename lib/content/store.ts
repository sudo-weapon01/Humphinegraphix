import { promises as fs } from "node:fs";
import path from "node:path";
import { getSupabaseAdmin, supabaseConfigured } from "../supabase";
import { defaultBundle } from "./defaults";
import { mergeDocWithDefaults } from "./merge";
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
        seeded[key] = {
          ...seeded[key],
          ...doc,
          key,
          // Tolerate documents written before a field was added.
          draft: mergeDocWithDefaults(key, doc.draft),
          published: mergeDocWithDefaults(key, doc.published),
        };
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
      draft: mergeDocWithDefaults(key, row.draft ?? defaultsFor(key)),
      published: mergeDocWithDefaults(key, row.published ?? defaultsFor(key)),
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

/**
 * Copies every draft onto its published copy, and records a snapshot so the
 * publish can be rolled back. Returns the publish timestamp.
 */
export async function publishAllDrafts(
  publishedBy: string | null = null,
): Promise<{ publishedAt: string; historyId: string | null }> {
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
  const historyId = await recordHistory(bundleFrom(docs, "published"), publishedBy, null);
  return { publishedAt, historyId };
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

/* -------------------------------------------------------------------------- */
/* Publish history / rollback                                                 */
/* -------------------------------------------------------------------------- */

const HISTORY_TABLE = "content_history";
const HISTORY_LIMIT = 20;

export type PublishHistoryEntry = {
  id: string;
  publishedAt: string;
  publishedBy: string | null;
  note: string | null;
};

type HistoryRecord = PublishHistoryEntry & { snapshot: ContentBundle };

function historyPath(): string {
  return path.join(dataDir(), "history.json");
}

async function readHistoryFile(): Promise<HistoryRecord[]> {
  try {
    const raw = await fs.readFile(historyPath(), "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as HistoryRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeHistoryFile(records: HistoryRecord[]): Promise<void> {
  await fs.mkdir(dataDir(), { recursive: true });
  const tmp = `${historyPath()}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(records.slice(0, HISTORY_LIMIT), null, 2), "utf8");
  await fs.rename(tmp, historyPath());
}

async function recordHistory(
  bundle: ContentBundle,
  publishedBy: string | null,
  note: string | null,
): Promise<string | null> {
  try {
    if (storageBackend() === "files") {
      const records = await readHistoryFile();
      const id = `h_${Date.now().toString(36)}`;
      records.unshift({
        id,
        publishedAt: new Date().toISOString(),
        publishedBy,
        note,
        snapshot: structuredClone(bundle),
      });
      await writeHistoryFile(records);
      return id;
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from(HISTORY_TABLE)
      .insert({ snapshot: bundle, published_by: publishedBy, note })
      .select("id")
      .single();
    if (error) throw error;

    // Keep the table small: newest 20 snapshots only.
    const { data: keep } = await supabase
      .from(HISTORY_TABLE)
      .select("id")
      .order("published_at", { ascending: false })
      .limit(HISTORY_LIMIT);
    const keepIds = (keep ?? []).map((row) => row.id);
    if (keepIds.length === HISTORY_LIMIT) {
      const { data: all } = await supabase.from(HISTORY_TABLE).select("id");
      const stale = (all ?? [])
        .map((row) => row.id)
        .filter((id) => !keepIds.includes(id));
      if (stale.length > 0) await supabase.from(HISTORY_TABLE).delete().in("id", stale);
    }
    return String(data.id);
  } catch (error) {
    // History is a convenience; never fail a publish because of it.
    console.error("[content] could not record publish history", error);
    return null;
  }
}

export async function listPublishHistory(limit = 10): Promise<PublishHistoryEntry[]> {
  if (storageBackend() === "files") {
    const records = await readHistoryFile();
    return records.slice(0, limit).map(({ snapshot: _snapshot, ...entry }) => entry);
  }
  const { data, error } = await getSupabaseAdmin()
    .from(HISTORY_TABLE)
    .select("id, published_at, published_by, note")
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Could not load publish history: ${error.message}`);
  return (data ?? []).map((row) => ({
    id: String(row.id),
    publishedAt: row.published_at as string,
    publishedBy: (row.published_by as string) ?? null,
    note: (row.note as string) ?? null,
  }));
}

async function getHistorySnapshot(id: string): Promise<ContentBundle | null> {
  if (storageBackend() === "files") {
    const records = await readHistoryFile();
    return records.find((record) => record.id === id)?.snapshot ?? null;
  }
  const { data, error } = await getSupabaseAdmin()
    .from(HISTORY_TABLE)
    .select("snapshot")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Could not load that snapshot: ${error.message}`);
  return (data?.snapshot as ContentBundle) ?? null;
}

/**
 * Rolls the live content back to a previous snapshot.
 * Both draft and published are set, so the admin area matches the site again.
 */
export async function restorePublishSnapshot(
  id: string,
  restoredBy: string | null = null,
): Promise<ContentBundle> {
  const snapshot = await getHistorySnapshot(id);
  if (!snapshot) throw new Error("That snapshot no longer exists.");

  const docs = await readDocs();
  const now = new Date().toISOString();
  for (const key of CONTENT_KEYS) {
    const value = mergeDocWithDefaults(key, snapshot[key]);
    docs[key] = {
      ...docs[key],
      draft: structuredClone(value),
      published: value,
      updatedAt: now,
      publishedAt: now,
    };
  }
  await writeDocs(docs);
  const restored = bundleFrom(docs, "published");
  await recordHistory(restored, restoredBy, `restored ${id}`);
  return restored;
}
