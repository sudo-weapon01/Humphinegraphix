import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Content Security Policy.
 *
 * Next.js injects inline bootstrap/streaming scripts, so 'unsafe-inline' stays
 * for scripts and styles; everything else is locked to first-party origins plus
 * the two third parties this site actually uses (Cloudflare Turnstile and
 * Supabase storage on the admin side).
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' https://*.supabase.co https://challenges.cloudflare.com${
    isDev ? " ws: http://localhost:*" : ""
  }`,
  "frame-src https://challenges.cloudflare.com",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  {
    key: "Strict-Transport-Security",
    // Only meaningful over HTTPS; harmless on localhost, enforced on Vercel.
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Portfolio images saved by staff can point at an external URL or at /public.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  // `next/og` reads its bundled font at runtime; make sure the tracing step keeps
  // it in the server bundle for the social-card route.
  outputFileTracingIncludes: {
    "/og": [
      "./node_modules/next/dist/compiled/@vercel/og/noto-sans-v27-latin-regular.ttf",
      "./node_modules/next/dist/compiled/@vercel/og/resvg.wasm",
      "./node_modules/next/dist/compiled/@vercel/og/yoga.wasm",
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Uploaded artwork never changes once written, so cache it hard.
        source: "/uploads/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
