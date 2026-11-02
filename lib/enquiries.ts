import { promises as fs } from "node:fs";
import path from "node:path";
import { getSupabaseAdmin, supabaseConfigured } from "./supabase";
import type { QuoteRequest } from "./quote";

/**
 * Storage for quote requests.
 *
 * Supabase `quote_requests` when configured, otherwise .data/enquiries.json.
 * Read-only in the admin area — this project deliberately has no order,
 * pricing, or payment handling.
 */

const TABLE = "quote_requests";

function dataDir(): string {
  return process.env.CONTENT_STORE_DIR
    ? path.resolve(process.env.CONTENT_STORE_DIR)
    : path.join(process.cwd(), ".data");
}

function filePath(): string {
  return path.join(dataDir(), "enquiries.json");
}

async function saveToFile(request: QuoteRequest): Promise<void> {
  await fs.mkdir(dataDir(), { recursive: true });
  let existing: QuoteRequest[] = [];
  try {
    const raw = await fs.readFile(filePath(), "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) existing = parsed as QuoteRequest[];
  } catch {
    existing = [];
  }
  existing.unshift(request);
  await fs.writeFile(filePath(), JSON.stringify(existing.slice(0, 500), null, 2), "utf8");
}

export async function saveQuoteRequest(request: QuoteRequest): Promise<void> {
  if (!supabaseConfigured()) return saveToFile(request);

  const { error } = await getSupabaseAdmin().from(TABLE).insert({
    id: request.id,
    name: request.name,
    email: request.email,
    phone: request.phone,
    flyer_type: request.flyerType,
    event_date: request.eventDate,
    budget_range: request.budgetRange,
    deadline: request.deadline,
    message: request.message,
    submitted_at: request.submittedAt,
  });
  if (error) throw new Error(`Could not save quote request: ${error.message}`);
}

export async function listQuoteRequests(limit = 50): Promise<QuoteRequest[]> {
  if (!supabaseConfigured()) {
    try {
      const raw = await fs.readFile(filePath(), "utf8");
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as QuoteRequest[]).slice(0, limit) : [];
    } catch {
      return [];
    }
  }

  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select("id, name, email, phone, flyer_type, event_date, budget_range, deadline, message, submitted_at")
    .order("submitted_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Could not load quote requests: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    phone: (row.phone as string) ?? null,
    flyerType: row.flyer_type as string,
    eventDate: (row.event_date as string) ?? null,
    budgetRange: row.budget_range as string,
    deadline: (row.deadline as string) ?? null,
    message: row.message as string,
    submittedAt: row.submitted_at as string,
  }));
}
