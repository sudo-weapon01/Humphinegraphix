import { revalidatePath, revalidateTag } from "next/cache";
import { guardAdminApi, jsonError, jsonOk, readJson } from "@/lib/api";
import { CONTENT_TAG } from "@/lib/content/public";
import { getPublishStatus, listPublishHistory, restorePublishSnapshot } from "@/lib/content/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Restores the live site to a previous published snapshot. */
export async function GET(request: Request) {
  const guard = await guardAdminApi(request);
  if ("response" in guard) return guard.response;
  try {
    return jsonOk({ history: await listPublishHistory(10) });
  } catch (error) {
    console.error("[admin/rollback] history failed", error);
    return jsonError("Could not load the publish history.", 500);
  }
}

export async function POST(request: Request) {
  const guard = await guardAdminApi(request);
  if ("response" in guard) return guard.response;

  const body = (await readJson(request)) as { id?: unknown } | null;
  if (!body || typeof body.id !== "string" || !body.id) {
    return jsonError("Choose a version to restore.", 400);
  }

  try {
    await restorePublishSnapshot(body.id, guard.session.sub);
    revalidateTag(CONTENT_TAG);
    revalidatePath("/", "layout");
    const status = await getPublishStatus();
    return jsonOk({ status });
  } catch (error) {
    console.error("[admin/rollback] failed", error);
    const message =
      error instanceof Error && error.message.includes("no longer exists")
        ? "That version is no longer available."
        : "Could not restore that version. Please try again.";
    return jsonError(message, 500);
  }
}
