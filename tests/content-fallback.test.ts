import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * When Supabase is configured but unreachable, the public site must still
 * render (defaults) rather than throwing — while admin paths stay strict.
 */
vi.mock("@/lib/supabase", () => ({
  supabaseConfigured: () => true,
  getSupabaseAdmin: () => ({
    from: () => ({
      select: () => ({
        in: async () => ({ data: null, error: { message: "connection refused" } }),
      }),
    }),
  }),
}));

const { getPublishedBundle, getDraftBundle } = await import("@/lib/content/store");
const { defaultBundle } = await import("@/lib/content/defaults");

beforeEach(() => {
  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role";
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  process.env.SUPABASE_URL = "";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "";
  vi.restoreAllMocks();
});

describe("published content resilience", () => {
  it("falls back to the shipped defaults when the database is unreachable", async () => {
    const published = await getPublishedBundle();
    expect(published.pages.home.heroTitle).toBe(defaultBundle.pages.home.heroTitle);
    expect(console.error).toHaveBeenCalled();
  });

  it("still surfaces database errors for draft (admin) reads", async () => {
    await expect(getDraftBundle()).rejects.toThrow(/Could not read content/);
  });
});
