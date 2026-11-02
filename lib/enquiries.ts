import { promises as fs } from "node:fs";
import path from "node:path";
import { getSupabaseAdmin, supabaseConfigured } from "./supabase";
import { isEnquiryStatus, type EnquiryStatus, type QuoteRequest } from "./quote";

/**
 * Storage for quote requests.
 *
 * Supabase `quote_requests` when configured, otherwise .data/enquiries.json.
 * The admin area can only change the triage status (new / replied / archived) —
 * this project deliberately has no order, pricing, or payment handling.
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

type StoredEnquiry = QuoteRequest & { status?: EnquiryStatus };

async function readFileEnquiries(): Promise<StoredEnquiry[]> {
  try {
    const raw = await fs.readFile(filePath(), "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredEnquiry[]) : [];
  } catch {
    return [];
  }
}

async function writeFileEnquiries(records: StoredEnquiry[]): Promise<void> {
  await fs.mkdir(dataDir(), { recursive: true });
  await fs.writeFile(filePath(), JSON.stringify(records.slice(0, 500), null, 2), "utf8");
}

export async function saveQuoteRequest(request: QuoteRequest): Promise<void> {
  if (!supabaseConfigured()) {
    const existing = await readFileEnquiries();
    return writeFileEnquiries([request, ...existing]);
  }

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
    status: request.status,
  });
  if (error) throw new Error(`Could not save quote request: ${error.message}`);
}

export async function listQuoteRequests(limit = 50): Promise<QuoteRequest[]> {
  if (!supabaseConfigured()) {
    const records = await readFileEnquiries();
    return records.slice(0, limit).map((record) => ({
      ...record,
      status: isEnquiryStatus(record.status) ? record.status : "new",
    }));
  }

  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select("id, name, email, phone, flyer_type, event_date, budget_range, deadline, message, submitted_at, status")
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
    status: isEnquiryStatus(row.status) ? row.status : "new",
  }));
}

/** Updates triage state. Returns false when the enquiry does not exist. */
export async function setEnquiryStatus(id: string, status: EnquiryStatus): Promise<boolean> {
  if (!supabaseConfigured()) {
    const records = await readFileEnquiries();
    const index = records.findIndex((record) => record.id === id);
    if (index === -1) return false;
    records[index] = { ...records[index], status };
    await writeFileEnquiries(records);
    return true;
  }

  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .update({ status })
    .eq("id", id)
    .select("id");
  if (error) throw new Error(`Could not update that request: ${error.message}`);
  return (data ?? []).length > 0;
}

const CSV_COLUMNS = [
  "id",
  "submitted_at",
  "status",
  "name",
  "email",
  "phone",
  "flyer_type",
  "event_date",
  "deadline",
  "budget_range",
  "message",
] as const;

/** Escapes one CSV cell, neutralising spreadsheet formula injection. */
function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function quoteRequestsToCsv(limit = 500): Promise<string> {
  const rows = await listQuoteRequests(limit);
  const header = CSV_COLUMNS.join(",");
  const body = rows.map((row) => {
    const record: Record<string, unknown> = {
      id: row.id,
      submitted_at: row.submittedAt,
      status: row.status,
      name: row.name,
      email: row.email,
      phone: row.phone,
      flyer_type: row.flyerType,
      event_date: row.eventDate,
      deadline: row.deadline,
      budget_range: row.budgetRange,
      message: row.message,
    };
    return CSV_COLUMNS.map((column) => csvCell(record[column])).join(",");
  });
  return [header, ...body].join("\r\n");
}
