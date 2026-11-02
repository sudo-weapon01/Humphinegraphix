import type { Metadata } from "next";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "./site";

/**
 * Per-page metadata helper.
 *
 * Social cards are rendered by app/og/route.tsx so every page gets a correctly
 * sized 1200x630 image with its own headline, instead of scaling a square asset.
 */
export const OG_SIZE = { width: 1200, height: 630 } as const;

export function ogImageUrl(title: string, subtitle?: string): string {
  const params = new URLSearchParams({ title });
  if (subtitle) params.set("subtitle", subtitle);
  return `/og?${params.toString()}`;
}

export function pageMetadata({
  title,
  description,
  path,
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
}): Metadata {
  const url = `${SITE_URL}${path}`;
  const image = ogImageUrl(title, description);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      images: [{ url: image, ...OG_SIZE, alt: `${title} — ${SITE_NAME}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [image],
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

export const HOME_METADATA_TITLE = `${SITE_NAME} — ${SITE_TAGLINE}`;
