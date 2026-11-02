import type { Metadata, Viewport } from "next";
import "./globals.css";
import { VercelAnalytics } from "@/components/site/VercelAnalytics";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";
import { OG_SIZE, ogImageUrl } from "@/lib/seo";

const OG_IMAGE = {
  url: ogImageUrl("Flyer design studio", "Bold, print-ready flyers for businesses, events, and people."),
  ...OG_SIZE,
  alt: "Humphinegraphix — flyer design studio",
};

/*
 * TODO (brand fonts): the studio's licensed typefaces can be dropped in here
 * with `next/font/local` and referenced by the --font-heading / --font-body
 * tokens in app/globals.css. Until then the site uses system stacks.
 */

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Humphinegraphix designs bold, print-ready flyers for small businesses, event organizers, and individuals. Request a quote and get a flyer that gets read.",
  applicationName: SITE_NAME,
  keywords: [
    "flyer design",
    "flyer designer",
    "event flyer",
    "business flyer",
    "print design",
    "Humphinegraphix",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description:
      "Bold, print-ready flyers for small businesses, event organizers, and individuals. Request a quote from Humphinegraphix.",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: "Bold, print-ready flyers for small businesses, event organizers, and individuals.",
    images: [OG_IMAGE.url],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#10233f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">
        {children}
        <VercelAnalytics />
      </body>
    </html>
  );
}
