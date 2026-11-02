/**
 * Funnel events for the quote form.
 *
 * Uses Vercel Web Analytics' queue API (`window.va`), which is provided by the
 * first-party script in components/site/VercelAnalytics.tsx. Every helper is a
 * no-op outside Vercel or when analytics is blocked, so it is safe to call
 * unconditionally from client components.
 */

type EventData = Record<string, string | number | boolean | null>;

declare global {
  interface Window {
    va?: (event: "event" | "pageview", payload: { name?: string } & EventData) => void;
  }
}

export function track(event: string, data: EventData = {}): void {
  if (typeof window === "undefined") return;
  try {
    window.va?.("event", { name: event, ...data });
  } catch {
    // Analytics must never break the form.
  }
}

export const ANALYTICS_EVENTS = {
  quoteStarted: "quote_form_started",
  quoteSubmitted: "quote_form_submitted",
  quoteSucceeded: "quote_form_succeeded",
  quoteFailed: "quote_form_failed",
  whatsappClicked: "whatsapp_clicked",
  portfolioOpened: "portfolio_item_opened",
} as const;
