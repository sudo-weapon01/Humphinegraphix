import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Hardening tests: rate limiting, upload validation, enquiry triage + CSV,
 * publish history/rollback, optional Turnstile, and the security headers.
 *
 * Everything runs against the local file store (Supabase env vars are blanked in
 * tests/setup.ts), so these exercise the same code paths as a local install.
 */

let sessionToken: string | undefined;

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (name === "hg_staff_session" && sessionToken ? { name, value: sessionToken } : undefined),
  }),
}));

const revalidateTag = vi.fn();
const revalidatePath = vi.fn();
vi.mock("next/cache", () => ({
  revalidateTag: (...args: unknown[]) => revalidateTag(...args),
  revalidatePath: (...args: unknown[]) => revalidatePath(...args),
  unstable_cache: (fn: unknown) => fn,
}));

const { checkRateLimit, resetRateLimit, RATE_LIMITS, rateLimitMessage, clientIpFrom } = await import(
  "@/lib/ratelimit"
);
const { uploadValidationError, MAX_UPLOAD_BYTES } = await import("@/lib/uploads");
const { verifyTurnstileToken, turnstileEnabled } = await import("@/lib/turnstile");
const {
  publishAllDrafts,
  listPublishHistory,
  restorePublishSnapshot,
  getPublishedBundle,
  saveDraftDoc,
} = await import("@/lib/content/store");
const { quoteRequestsToCsv, listQuoteRequests, saveQuoteRequest, setEnquiryStatus } = await import(
  "@/lib/enquiries"
);
const { SESSION_COOKIE, createSessionToken } = await import("@/lib/session");
const { getSessionSecret } = await import("@/lib/auth-config");
const { PATCH: patchEnquiry, GET: getEnquiries } = await import("@/app/api/admin/enquiries/route");
const { POST: rollback } = await import("@/app/api/admin/rollback/route");
const { default: nextConfig } = await import("@/next.config");

let tempDir: string;

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "hg-hardening-"));
  process.env.CONTENT_STORE_DIR = tempDir;
  sessionToken = undefined;
  await resetRateLimit("login", "ip:203.0.113.7");
  await resetRateLimit("quote", "ip:203.0.113.7");
  await resetRateLimit("upload", "staff:studio");
});

afterEach(async () => {
  await fs.rm(tempDir, { recursive: true, force: true });
  delete process.env.CONTENT_STORE_DIR;
});

function request(url: string, init: RequestInit = {}) {
  return new Request(`http://localhost${url}`, {
    ...init,
    headers: { "content-type": "application/json", ...(init.headers ?? {}) },
  });
}

async function signIn() {
  sessionToken = await createSessionToken("studio", getSessionSecret());
  return sessionToken;
}

describe("rate limiting", () => {
  it("allows requests up to the limit, then blocks with a retry hint", async () => {
    const { limit } = RATE_LIMITS.login;
    for (let attempt = 0; attempt < limit; attempt += 1) {
      const result = await checkRateLimit("login", "ip:203.0.113.7");
      expect(result.allowed).toBe(true);
    }

    const blocked = await checkRateLimit("login", "ip:203.0.113.7");
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("keys counters per client so one visitor cannot lock out another", async () => {
    for (let attempt = 0; attempt < RATE_LIMITS.login.limit; attempt += 1) {
      await checkRateLimit("login", "ip:203.0.113.7");
    }
    expect((await checkRateLimit("login", "ip:203.0.113.7")).allowed).toBe(false);
    expect((await checkRateLimit("login", "ip:198.51.100.9")).allowed).toBe(true);
  });

  it("resetRateLimit clears a counter after a successful sign-in", async () => {
    for (let attempt = 0; attempt < RATE_LIMITS.login.limit; attempt += 1) {
      await checkRateLimit("login", "ip:203.0.113.7");
    }
    await resetRateLimit("login", "ip:203.0.113.7");
    expect((await checkRateLimit("login", "ip:203.0.113.7")).allowed).toBe(true);
  });

  it("derives the client IP from proxy headers", () => {
    expect(clientIpFrom(request("/", { headers: { "x-forwarded-for": "1.2.3.4, 10.0.0.1" } }))).toBe(
      "1.2.3.4",
    );
    expect(clientIpFrom(request("/", { headers: { "x-real-ip": "5.6.7.8" } }))).toBe("5.6.7.8");
  });

  it("phrases the retry message in minutes", () => {
    expect(rateLimitMessage(900)).toMatch(/15 minutes/);
    expect(rateLimitMessage(30)).toMatch(/shortly/);
  });
});

describe("upload validation", () => {
  function fileOf(name: string, type: string, size: number) {
    return new File([new Uint8Array(size)], name, { type });
  }

  it("accepts a JPEG within the size limit", () => {
    expect(uploadValidationError(fileOf("flyer.jpg", "image/jpeg", 1024))).toBeNull();
  });

  it("rejects a non-image", () => {
    expect(uploadValidationError(fileOf("notes.pdf", "application/pdf", 1024))).toMatch(/JPEG, PNG, or WebP/);
  });

  it("rejects an oversized image", () => {
    const big = fileOf("poster.jpg", "image/jpeg", MAX_UPLOAD_BYTES + 1);
    expect(uploadValidationError(big)).toMatch(/larger than 5 MB/);
  });

  it("rejects a missing file", () => {
    expect(uploadValidationError(null)).toMatch(/Choose an image/);
  });
});

describe("enquiry triage", () => {
  const base = {
    id: "q-1",
    name: "Ama Mensah",
    email: "ama@example.com",
    phone: null,
    flyerType: "Event flyer",
    eventDate: null,
    budgetRange: "GHS 500 – 1,000",
    deadline: null,
    message: 'Need a flyer for "Afro Night"',
    submittedAt: "2026-10-01T10:00:00.000Z",
    status: "new" as const,
  };

  it("defaults new enquiries to the `new` status", async () => {
    await saveQuoteRequest(base);
    const [enquiry] = await listQuoteRequests();
    expect(enquiry.status).toBe("new");
  });

  it("updates the status and reports a missing enquiry", async () => {
    await saveQuoteRequest(base);
    await expect(setEnquiryStatus("q-1", "replied")).resolves.toBe(true);
    expect((await listQuoteRequests())[0].status).toBe("replied");
    await expect(setEnquiryStatus("nope", "archived")).resolves.toBe(false);
  });

  it("exports CSV with quoted cells and no formula injection", async () => {
    await saveQuoteRequest(base);
    await saveQuoteRequest({ ...base, id: "q-2", message: '=HYPERLINK("http://evil")' });
    const csv = await quoteRequestsToCsv();
    const [header, ...rows] = csv.split("\r\n");

    expect(header).toContain("submitted_at");
    expect(header).toContain("status");
    expect(rows.join("\n")).toContain('"Ama Mensah"');
    // Embedded quotes are doubled, not dropped.
    expect(rows.join("\n")).toContain(`""Afro Night""`);
    // A leading "=" is neutralised so a spreadsheet will not execute the cell.
    expect(rows.join("\n")).toContain(`"'=HYPERLINK(""http://evil"")"`);
  });

  it("requires an authenticated session to change a status", async () => {
    await saveQuoteRequest(base);
    const anonymous = await patchEnquiry(
      request("/api/admin/enquiries", { method: "PATCH", body: JSON.stringify({ id: "q-1", status: "replied" }) }),
    );
    expect(anonymous.status).toBe(401);

    await signIn();
    const authorised = await patchEnquiry(
      request("/api/admin/enquiries", { method: "PATCH", body: JSON.stringify({ id: "q-1", status: "replied" }) }),
    );
    expect(authorised.status).toBe(200);
  });

  it("rejects an unknown status", async () => {
    await saveQuoteRequest(base);
    await signIn();
    const response = await patchEnquiry(
      request("/api/admin/enquiries", { method: "PATCH", body: JSON.stringify({ id: "q-1", status: "paid" }) }),
    );
    expect(response.status).toBe(400);
  });

  it("serves a CSV download to staff only", async () => {
    await saveQuoteRequest(base);
    expect((await getEnquiries(request("/api/admin/enquiries?format=csv"))).status).toBe(401);

    await signIn();
    const response = await getEnquiries(request("/api/admin/enquiries?format=csv"));
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/csv");
    expect(response.headers.get("content-disposition")).toContain("attachment");
  });
});

describe("publish history and rollback", () => {
  it("records every publish and can restore an earlier one", async () => {
    await saveDraftDoc("pages", {
      ...(await getPublishedBundle()).pages,
      footer: { tagline: "First published tagline" },
    });
    const first = await publishAllDrafts("studio");

    await saveDraftDoc("pages", {
      ...(await getPublishedBundle()).pages,
      footer: { tagline: "Second published tagline" },
    });
    await publishAllDrafts("studio");
    expect((await getPublishedBundle()).pages.footer.tagline).toBe("Second published tagline");

    const history = await listPublishHistory(10);
    expect(history.length).toBeGreaterThanOrEqual(2);
    expect(history[0].publishedBy).toBe("studio");

    const restored = await restorePublishSnapshot(first.historyId!, "studio");
    expect(restored.pages.footer.tagline).toBe("First published tagline");
    expect((await getPublishedBundle()).pages.footer.tagline).toBe("First published tagline");
  });

  it("requires a session and a valid snapshot id to roll back", async () => {
    const anonymous = await rollback(
      request("/api/admin/rollback", { method: "POST", body: JSON.stringify({ id: "x" }) }),
    );
    expect(anonymous.status).toBe(401);

    await signIn();
    const missing = await rollback(
      request("/api/admin/rollback", { method: "POST", body: JSON.stringify({ id: "does-not-exist" }) }),
    );
    expect(missing.status).toBe(500);
  });

  it("revalidates the public site after a rollback", async () => {
    await saveDraftDoc("pages", (await getPublishedBundle()).pages);
    const { historyId } = await publishAllDrafts("studio");
    await signIn();

    const response = await rollback(
      request("/api/admin/rollback", { method: "POST", body: JSON.stringify({ id: historyId }) }),
    );
    expect(response.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledWith("published-content");
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });
});

describe("turnstile", () => {
  it("is skipped when no keys are configured", async () => {
    expect(turnstileEnabled()).toBe(false);
    await expect(verifyTurnstileToken(undefined, "1.2.3.4")).resolves.toEqual({ ok: true });
  });
});

describe("security headers", () => {
  it("sets a CSP, HSTS, and clickjacking protection on every path", async () => {
    const groups = await nextConfig.headers!();
    const global = groups.find((group) => group.source === "/:path*");
    expect(global).toBeDefined();

    const headers = Object.fromEntries(global!.headers.map((header) => [header.key, header.value]));
    expect(headers["Content-Security-Policy"]).toContain("default-src 'self'");
    expect(headers["Content-Security-Policy"]).toContain("object-src 'none'");
    expect(headers["Strict-Transport-Security"]).toContain("max-age=");
    expect(headers["X-Frame-Options"]).toBe("SAMEORIGIN");
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
  });

  it("keeps the admin area out of search results", async () => {
    const groups = await nextConfig.headers!();
    const admin = groups.find((group) => group.source === "/admin/:path*");
    expect(admin?.headers).toContainEqual({ key: "X-Robots-Tag", value: "noindex, nofollow" });
  });
});

describe("session cookie name", () => {
  it("matches the guard's expectation", () => {
    expect(SESSION_COOKIE).toBe("hg_staff_session");
  });
});

describe("social card renderer", () => {
  it("returns a 1200x630 PNG and reports a successful render", async () => {
    const { GET } = await import("@/app/og/route");

    const health = await GET(
      new Request("http://localhost/og?format=json&title=Smoke%20test&subtitle=Checking%20the%20card"),
    );
    expect(health.status).toBe(200);
    const payload = (await health.json()) as { ok: boolean; width: number; height: number };
    expect(payload).toMatchObject({ ok: true, width: 1200, height: 630 });

    const image = await GET(new Request("http://localhost/og?title=Smoke%20test"));
    expect(image.headers.get("content-type")).toContain("image/png");
    expect((await image.arrayBuffer()).byteLength).toBeGreaterThan(1000);
  });
});
