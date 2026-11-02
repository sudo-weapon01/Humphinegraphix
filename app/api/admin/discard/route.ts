import { guardAdminApi, jsonError, jsonOk } from "@/lib/api";
import { discardDrafts, getPublishStatus } from "@/lib/content/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Throws away unpublished edits by resetting drafts to the published copies. */
export async function POST(request: Request) {
  const guard = await guardAdminApi(request);
  if ("response" in guard) return guard.response;

  try {
    await discardDrafts();
    const status = await getPublishStatus();
    return jsonOk({ status });
  } catch (error) {
    console.error("[admin/discard] failed", error);
    return jsonError("Could not discard changes. Please try again.", 500);
  }
}
