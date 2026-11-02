import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";

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
    images: [{ url: "/images/hero-flyers.jpg", width: 1200, height: 1200, alt: "Humphinegraphix flyer designs" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: "Bold, print-ready flyers for small businesses, event organizers, and individuals.",
    images: ["/images/hero-flyers.jpg"],
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
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
