import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { defaultBundle, defaultPages } from "@/lib/content/defaults";
import {
  discardDrafts,
  getDraftBundle,
  getPublishedBundle,
  getPublishStatus,
  publishAllDrafts,
  resetDocToDefaults,
  saveDraftDoc,
} from "@/lib/content/store";
import { validateContent } from "@/lib/content/validate";
import { flyerTypeOptions } from "@/lib/content/types";

let tempDir: string;

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "hg-content-"));
  process.env.CONTENT_STORE_DIR = tempDir;
  process.env.SUPABASE_URL = "";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "";
});

afterEach(async () => {
  await fs.rm(tempDir, { recursive: true, force: true });
  delete process.env.CONTENT_STORE_DIR;
});

const editedPages = {
  ...defaultPages,
  home: { ...defaultPages.home, heroTitle: "Draft headline that should stay hidden" },
};

describe("content store — drafts vs published", () => {
  it("starts from the shipped defaults on a fresh install", async () => {
    const published = await getPublishedBundle();
    expect(published.pages.home.heroTitle).toBe(defaultBundle.pages.home.heroTitle);
    expect(published.portfolio.length).toBeGreaterThan(0);
    expect(await getPublishStatus()).toMatchObject({
      hasUnpublishedChanges: [],
      storage: "files",
    });
  });

  it("keeps saved drafts off the public site until published", async () => {
    await saveDraftDoc("pages", editedPages);

    const drafts = await getDraftBundle();
    expect(drafts.pages.home.heroTitle).toBe("Draft headline that should stay hidden");

    const published = await getPublishedBundle();
    expect(published.pages.home.heroTitle).toBe(defaultBundle.pages.home.heroTitle);
    expect(published.pages.home.heroTitle).not.toBe(drafts.pages.home.heroTitle);

    expect((await getPublishStatus()).hasUnpublishedChanges).toEqual(["pages"]);
  });

  it("publishes drafts to the live content in one step", async () => {
    await saveDraftDoc("pages", editedPages);
    await saveDraftDoc("services", [
      ...defaultBundle.services,
      {
        id: "new-service",
        name: "Wedding flyers",
        description: "Elegant flyers for wedding celebrations.",
        flyerTypes: ["Wedding or anniversary"],
      },
    ]);

    const { publishedAt } = await publishAllDrafts();
    expect(Date.parse(publishedAt)).not.toBeNaN();

    const published = await getPublishedBundle();
    expect(published.pages.home.heroTitle).toBe("Draft headline that should stay hidden");
    expect(published.services.at(-1)?.name).toBe("Wedding flyers");

    const status = await getPublishStatus();
    expect(status.hasUnpublishedChanges).toEqual([]);
    expect(status.publishedAt).toBe(publishedAt);
  });

  it("publishes new flyer types into the quote form options", async () => {
    await saveDraftDoc("services", [
      {
        id: "workshop-service",
        name: "Workshop flyers",
        description: "Flyers for ticketed workshops.",
        flyerTypes: ["Weekend workshop"],
      },
    ]);
    await publishAllDrafts();

    const published = await getPublishedBundle();
    expect(flyerTypeOptions(published.services)).toContain("Weekend workshop");
  });

  it("discards unpublished work without touching published content", async () => {
    await saveDraftDoc("pages", editedPages);
    await discardDrafts();

    const drafts = await getDraftBundle();
    expect(drafts.pages.home.heroTitle).toBe(defaultBundle.pages.home.heroTitle);
    expect((await getPublishStatus()).hasUnpublishedChanges).toEqual([]);
  });

  it("can reset a document back to the shipped defaults", async () => {
    await saveDraftDoc("portfolio", []);
    await publishAllDrafts();
    expect((await getPublishedBundle()).portfolio).toHaveLength(0);

    await resetDocToDefaults("portfolio");
    expect((await getPublishedBundle()).portfolio.length).toBe(defaultBundle.portfolio.length);
  });
});

describe("content validation", () => {
  it("rejects unknown fields so drafts cannot grow unexpected keys", () => {
    const result = validateContent(defaultBundle.pages, {
      ...editedPages,
      injected: { evil: "payload" },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.injected).toBe("Unknown field.");
  });

  it("rejects empty required copy", () => {
    const result = validateContent(defaultBundle.pages, {
      ...editedPages,
      home: { ...editedPages.home, heroTitle: "   " },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors["home.heroTitle"]).toBeTruthy();
  });

  it("accepts a valid edited document", () => {
    const result = validateContent(defaultBundle.pages, editedPages);
    expect(result.ok).toBe(true);
  });

  it("validates services and portfolio shapes", () => {
    expect(validateContent(defaultBundle.services, defaultBundle.services).ok).toBe(true);
    expect(validateContent(defaultBundle.portfolio, defaultBundle.portfolio).ok).toBe(true);

    const badServices = validateContent(defaultBundle.services, [
      { id: "x", name: "Service", description: "ok", flyerTypes: [""] },
    ]);
    expect(badServices.ok).toBe(false);
  });
});
