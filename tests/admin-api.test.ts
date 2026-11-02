import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defaultBundle, defaultPages } from "@/lib/content/defaults";
import { getPublishedBundle, saveDraftDoc } from "@/lib/content/store";
import { getSessionSecret } from "@/lib/auth-config";
import { SESSION_COOKIE, createSessionToken } from "@/lib/session";

/**
 * Route-handler tests for the admin API. `next/headers` is mocked with a small
 * cookie jar so authentication is exercised through the real guard code.
 */
let sessionToken: string | undefined;

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === SESSION_COOKIE && sessionToken ? { name, value: sessionToken } : undefined,
  }),
}));

const revalidateTag = vi.fn();
const revalidatePath = vi.fn();
vi.mock("next/cache", () => ({
  revalidateTag: (...args: unknown[]) => revalidateTag(...args),
  revalidatePath: (...args: unknown[]) => revalidatePath(...args),
  unstable_cache: (fn: unknown) => fn,
}));

const { PUT: putContent, GET: getContent } = await import("@/app/api/admin/content/route");
const { POST: publish } = await import("@/app/api/admin/publish/route");
const { POST: discard } = await import("@/app/api/admin/discard/route");
const { POST: login } = await import("@/app/api/admin/login/route");
const { POST: quote } = await import("@/app/api/quote/route");
const { listQuoteRequests } = await import("@/lib/enquiries");

let tempDir: string;

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "hg-api-"));
  process.env.CONTENT_STORE_DIR = tempDir;
  sessionToken = undefined;
  revalidateTag.mockReset();
  revalidatePath.mockReset();
});

afterEach(async () => {
  await fs.rm(tempDir, { recursive: true, force: true });
  delete process.env.CONTENT_STORE_DIR;
});

function jsonRequest(url: string, method: string, body?: unknown) {
  return new Request(`http://localhost${url}`, {
    method,
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

const editedPages = {
  ...defaultPages,
  home: { ...defaultPages.home, heroTitle: "Published from the admin area" },
};

describe("admin API authentication", () => {
  it("refuses to return drafts without a session", async () => {
    const response = await getContent(jsonRequest("/api/admin/content", "GET"));
    expect(response.status).toBe(401);
    expect((await response.json()).ok).toBe(false);
  });

  it("refuses to save drafts without a session", async () => {
    const response = await putContent(
      jsonRequest("/api/admin/content", "PUT", { key: "pages", value: editedPages }),
    );
    expect(response.status).toBe(401);
    expect((await getPublishedBundle()).pages.home.heroTitle).toBe(defaultBundle.pages.home.heroTitle);
  });

  it("refuses to publish without a session", async () => {
    const response = await publish(jsonRequest("/api/admin/publish", "POST"));
    expect(response.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("rejects a forged session cookie", async () => {
    sessionToken = "forged.token";
    const response = await getContent(jsonRequest("/api/admin/content", "GET"));
    expect(response.status).toBe(401);
  });
});

describe("admin sign-in", () => {
  it("rejects incorrect credentials", async () => {
    const response = await login(
      jsonRequest("/api/admin/login", "POST", { username: "studio", password: "wrong" }),
    );
    expect(response.status).toBe(401);
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("issues an httpOnly session cookie for correct credentials", async () => {
    const response = await login(
      jsonRequest("/api/admin/login", "POST", { username: "studio", password: "test-password" }),
    );
    expect(response.status).toBe(200);
    const cookie = response.headers.get("set-cookie") ?? "";
    expect(cookie).toContain(`${SESSION_COOKIE}=`);
    expect(cookie.toLowerCase()).toContain("httponly");
    expect(cookie.toLowerCase()).toContain("samesite=lax");
  });

  it("requires both fields", async () => {
    const response = await login(jsonRequest("/api/admin/login", "POST", {}));
    expect(response.status).toBe(400);
  });

  it("blocks cross-origin sign-in attempts", async () => {
    const request = new Request("http://localhost/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://evil.example" },
      body: JSON.stringify({ username: "studio", password: "test-password" }),
    });
    const response = await login(request);
    expect(response.status).toBe(403);
  });
});

describe("admin editing and publishing", () => {
  beforeEach(async () => {
    sessionToken = await createSessionToken("studio", getSessionSecret());
  });

  it("saves a draft, publishes it, and revalidates the public site", async () => {
    const save = await putContent(
      jsonRequest("/api/admin/content", "PUT", { key: "pages", value: editedPages }),
    );
    expect(save.status).toBe(200);
    const saved = await save.json();
    expect(saved.status.hasUnpublishedChanges).toEqual(["pages"]);

    // Drafts are not public yet.
    expect((await getPublishedBundle()).pages.home.heroTitle).toBe(
      defaultBundle.pages.home.heroTitle,
    );

    const response = await publish(jsonRequest("/api/admin/publish", "POST"));
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.ok).toBe(true);
    expect(payload.status.hasUnpublishedChanges).toEqual([]);

    // Content is now public, and caches were invalidated — no redeploy.
    expect((await getPublishedBundle()).pages.home.heroTitle).toBe(
      "Published from the admin area",
    );
    expect(revalidateTag).toHaveBeenCalledWith("published-content");
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("rejects invalid content documents", async () => {
    const response = await putContent(
      jsonRequest("/api/admin/content", "PUT", {
        key: "pages",
        value: { ...editedPages, home: { ...editedPages.home, heroTitle: "" } },
      }),
    );
    expect(response.status).toBe(422);
    const payload = await response.json();
    expect(payload.errors["home.heroTitle"]).toBeTruthy();
  });

  it("rejects unknown content documents", async () => {
    const response = await putContent(
      jsonRequest("/api/admin/content", "PUT", { key: "pricing", value: {} }),
    );
    expect(response.status).toBe(400);
  });

  it("discards drafts back to the published version", async () => {
    await saveDraftDoc("pages", editedPages);
    const response = await discard(jsonRequest("/api/admin/discard", "POST"));
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.status.hasUnpublishedChanges).toEqual([]);
  });
});

describe("public quote endpoint", () => {
  const validQuote = {
    name: "Kwame Boateng",
    email: "kwame@example.com",
    phone: "+233 24 000 0000",
    flyerType: "Live music or concert",
    eventDate: "2030-08-01",
    budgetRange: "GHS 600 – 1,000",
    deadline: "2030-07-20",
    message: "We are organising a live music night and need an A5 flyer plus a social crop.",
  };

  it("stores a valid request", async () => {
    const response = await quote(jsonRequest("/api/quote", "POST", validQuote));
    expect(response.status).toBe(201);

    const stored = await listQuoteRequests(10);
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({
      name: "Kwame Boateng",
      email: "kwame@example.com",
      flyerType: "Live music or concert",
    });
  });

  it("returns field errors for invalid requests", async () => {
    const response = await quote(
      jsonRequest("/api/quote", "POST", { ...validQuote, email: "nope", message: "" }),
    );
    expect(response.status).toBe(422);
    const payload = await response.json();
    expect(payload.errors.email).toBeTruthy();
    expect(payload.errors.message).toBeTruthy();
    expect(await listQuoteRequests(10)).toHaveLength(0);
  });

  it("rejects flyer types that are not on the Services page", async () => {
    const response = await quote(
      jsonRequest("/api/quote", "POST", { ...validQuote, flyerType: "Something else" }),
    );
    expect(response.status).toBe(422);
    const payload = await response.json();
    expect(payload.errors.flyerType).toBeTruthy();
  });

  it("quietly absorbs honeypot submissions", async () => {
    const response = await quote(
      jsonRequest("/api/quote", "POST", { ...validQuote, company: "Spam Ltd" }),
    );
    expect(response.status).toBe(200);
    expect(await listQuoteRequests(10)).toHaveLength(0);
  });
});
