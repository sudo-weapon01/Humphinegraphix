import Script from "next/script";

/**
 * Vercel Web Analytics, loaded via the first-party script Vercel serves on its
 * own deployments. Using the script (rather than the npm package) avoids
 * pulling framework-specific peers into this build.
 *
 * `/_vercel/insights/script.js` only exists on Vercel; elsewhere `window.va`
 * calls stay no-ops (see lib/analytics.ts), so nothing else changes.
 */
export function VercelAnalytics() {
  if (!process.env.VERCEL) return null;
  return (
    <>
      <Script id="vercel-web-analytics" strategy="afterInteractive">
        {`window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };`}
      </Script>
      <Script defer src="/_vercel/insights/script.js" strategy="afterInteractive" />
    </>
  );
}
