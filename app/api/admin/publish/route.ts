import { revalidatePath, revalidateTag } from "next/cache";
import { guardAdminApi, jsonError, jsonOk } from "@/lib/api";
import { CONTENT_TAG } from "@/lib/content/public";
import { getPublishStatus, publishAllDrafts } from "@/lib/content/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Publishes every saved draft to the live site.
 *
 * The public pages read cached *published* content, so the cache tag is
 * revalidated here; the routes are revalidated too so the change is visible
 * immediately rather than on the next visitor. No redeploy involved.
 */
export async function POST(request: Request) {
  const guard = await guardAdminApi(request);
  if ("response" in guard) return guard.response;

  try {
    const { publishedAt } = await publishAllDrafts();
    revalidateTag(CONTENT_TAG);
    revalidatePath("/", "layout");

    const status = await getPublishStatus();
    return jsonOk({ publishedAt, status });
  } catch (error) {
    console.error("[admin/publish] failed", error);
    return jsonError("Could not publish. Your drafts are safe — please try again.", 500);
  }
}
