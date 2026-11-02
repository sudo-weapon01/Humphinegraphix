import { unstable_cache } from "next/cache";
import { getPublishedBundle } from "./store";
import type { ContentBundle } from "./types";

/**
 * Revalidation tag used by the publish route.
 * Publishing calls revalidateTag(CONTENT_TAG) + revalidatePath("/", "layout"),
 * so new content appears on the public site without a redeploy.
 */
export const CONTENT_TAG = "published-content";

/**
 * Published content, cached and shared across all public pages.
 * Next regenerates it when the tag is revalidated (on publish) or after the
 * fallback window, so visitors get static-speed pages.
 */
export const getSiteContent = unstable_cache(
  async (): Promise<ContentBundle> => getPublishedBundle(),
  ["site-content"],
  { tags: [CONTENT_TAG], revalidate: 3600 },
);
