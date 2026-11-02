"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { QUOTE_URL, whatsappUrl } from "@/lib/site";

/**
 * Sticky action bar for phones.
 *
 * Hidden until the visitor scrolls past the header, so it never covers the
 * page's own call to action at the top. Sits above the footer and respects the
 * device safe area. Desktop keeps the header CTA instead.
 */
export function StickyCtaBar() {
  const [visible, setVisible] = useState(false);
  const hasWhatsApp = Boolean(whatsappUrl());

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-opacity duration-300 md:hidden ${
        visible ? "pointer-events-auto opacity-100" : "opacity-0"
      }`}
      // Hidden from assistive tech until it is actually usable.
      aria-hidden={!visible}
    >
      <div className="flex items-center gap-2 border border-brand-primary bg-brand-paper/95 p-2 shadow-[0_10px_30px_-12px_rgba(19,18,17,0.55)] backdrop-blur">
        <Link
          href={QUOTE_URL}
          className="flex-1 bg-brand-primary px-4 py-3 text-center font-mono text-[0.68rem] uppercase tracking-[0.16em] text-brand-paper"
          tabIndex={visible ? 0 : -1}
        >
          Request a quote
        </Link>
        {hasWhatsApp ? (
          <a
            href={whatsappUrl() ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#128c7e] px-4 py-3 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-white"
            tabIndex={visible ? 0 : -1}
          >
            WhatsApp
          </a>
        ) : (
          <a
            href="#studio-details"
            className="border border-brand-line px-4 py-3 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-brand-primary"
            tabIndex={visible ? 0 : -1}
          >
            Contact
          </a>
        )}
      </div>
    </div>
  );
}
