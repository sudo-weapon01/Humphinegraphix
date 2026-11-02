"use client";

import { useEffect, useRef } from "react";

type TurnstileApi = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/**
 * Cloudflare Turnstile widget (optional).
 *
 * Renders nothing unless NEXT_PUBLIC_TURNSTILE_SITE_KEY is set, which keeps local
 * development and tests free of third-party requests. The token is handed to the
 * form, which posts it with the rest of the request for server verification.
 */
export function TurnstileWidget({
  siteKey,
  onToken,
  resetSignal = 0,
}: {
  siteKey: string;
  onToken: (token: string | null) => void;
  resetSignal?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetId = useRef<string | null>(null);
  const callback = useRef(onToken);
  callback.current = onToken;

  useEffect(() => {
    if (!siteKey) return;
    let cancelled = false;

    const render = () => {
      if (cancelled || !window.turnstile || !containerRef.current || widgetId.current) return;
      widgetId.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: "light",
        callback: (token: string) => callback.current(token),
        "expired-callback": () => callback.current(null),
        "error-callback": () => callback.current(null),
      });
    };

    if (window.turnstile) {
      render();
    } else {
      const existing = document.querySelector<HTMLScriptElement>(`script[src^="${SCRIPT_SRC.split("?")[0]}"]`);
      const script = existing ?? document.createElement("script");
      if (!existing) {
        script.src = SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", render);
      return () => {
        cancelled = true;
        script.removeEventListener("load", render);
      };
    }

    return () => {
      cancelled = true;
    };
  }, [siteKey]);

  // Let the parent clear the widget after a failed submission.
  useEffect(() => {
    if (!resetSignal || !widgetId.current || !window.turnstile) return;
    window.turnstile.reset(widgetId.current);
    callback.current(null);
  }, [resetSignal]);

  if (!siteKey) return null;

  return <div ref={containerRef} className="cf-turnstile" data-testid="turnstile-widget" />;
}
