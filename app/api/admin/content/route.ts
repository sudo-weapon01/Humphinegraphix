import { guardAdminApi, jsonError, jsonOk, readJson } from "@/lib/api";
import { defaultBundle } from "@/lib/content/defaults";
import { getDraftBundle, getPublishStatus, saveDraftDoc } from "@/lib/content/store";
import { isContentKey, type ContentKey } from "@/lib/content/types";
import { validateContent } from "@/lib/content/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Draft content + publish status for the admin editors (staff only). */
export async function GET(request: Request) {
  const guard = await guardAdminApi(request);
  if ("response" in guard) return guard.response;

  try {
    const [drafts, status] = await Promise.all([getDraftBundle(), getPublishStatus()]);
    return jsonOk({ drafts, status });
  } catch (error) {
    console.error("[admin/content] read failed", error);
    return jsonError("Could not load the draft content.", 500);
  }
}

/**
 * Saves one draft document. Nothing reaches the public site until publish.
 * Body: { key: "pages" | "services" | "portfolio", value: unknown }
 */
export async function PUT(request: Request) {
  const guard = await guardAdminApi(request);
  if ("response" in guard) return guard.response;

  const body = (await readJson(request)) as { key?: unknown; value?: unknown } | null;
  if (!body || !isContentKey(body.key)) {
    return jsonError("Unknown content document.", 400);
  }
  const key: ContentKey = body.key;

  const result = validateContent(defaultBundle[key], body.value);
  if (!result.ok) {
    return jsonError("Some fields need attention before this can be saved.", 422, result.errors);
  }

  try {
    await saveDraftDoc(key, result.data);
    const status = await getPublishStatus();
    return jsonOk({ savedAt: new Date().toISOString(), status });
  } catch (error) {
    console.error("[admin/content] save failed", error);
    return jsonError("Could not save your changes. Please try again.", 500);
  }
}
