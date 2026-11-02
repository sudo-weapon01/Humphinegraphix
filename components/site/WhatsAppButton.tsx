"use client";

import { ANALYTICS_EVENTS, track } from "@/lib/analytics";
import { whatsappUrl } from "@/lib/site";

/**
 * WhatsApp click-to-chat.
 *
 * Renders nothing when NEXT_PUBLIC_WHATSAPP_NUMBER is not configured, so the
 * site never shows a dead contact link. `source` is only used for analytics so
 * the studio can see which placement people actually use.
 */
export function WhatsAppButton({
  source,
  variant = "solid",
  className = "",
  label = "Chat on WhatsApp",
}: {
  source: string;
  variant?: "solid" | "ghost" | "inline";
  className?: string;
  label?: string;
}) {
  const href = whatsappUrl();
  if (!href) return null;

  const styles: Record<typeof variant, string> = {
    solid:
      "inline-flex items-center justify-center gap-2.5 rounded-none bg-[#128c7e] px-4 py-2.5 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#0f7a6d]",
    ghost:
      "inline-flex items-center justify-center gap-2.5 rounded-none border border-brand-paper/30 px-4 py-2.5 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-brand-paper transition-colors hover:bg-brand-paper hover:text-brand-primary",
    inline:
      "inline-flex items-center gap-2 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-brand-primary underline decoration-brand-accent decoration-2 underline-offset-4 hover:text-brand-accent-strong",
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${styles[variant]} ${className}`}
      onClick={() => track(ANALYTICS_EVENTS.whatsappClicked, { source })}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-4 w-4 fill-current"
        focusable="false"
      >
        <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.39a9.86 9.86 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.44 9.9-9.9 0-2.64-1.03-5.13-2.9-7A9.82 9.82 0 0 0 12.04 2Zm0 18.02h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.36c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.26.86 5.82 2.41a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.39.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29Z" />
      </svg>
      {label}
      <span className="sr-only"> (opens WhatsApp in a new tab)</span>
    </a>
  );
}
