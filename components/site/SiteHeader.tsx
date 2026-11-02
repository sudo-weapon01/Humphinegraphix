"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_LINKS, QUOTE_URL } from "@/lib/site";
import { WhatsAppButton } from "./WhatsAppButton";
import { Wordmark } from "./Wordmark";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile panel whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape closes the mobile panel, as users expect from a disclosure menu.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-line/80 bg-brand-paper/90 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4 md:h-20">
        <Wordmark />

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative rounded-[2px] px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "text-brand-primary"
                    : "text-brand-muted hover:text-brand-primary"
                }`}
              >
                {link.label}
                {active ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3 -bottom-0.5 h-0.5 bg-brand-accent"
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={QUOTE_URL}
            className="hidden items-center gap-2 rounded-[2px] bg-brand-primary px-4 py-2.5 text-sm font-semibold text-brand-paper transition-colors hover:bg-brand-primary-soft sm:inline-flex"
          >
            Request a quote
            <span aria-hidden="true">→</span>
          </Link>

          <WhatsAppButton
            source="header"
            label="WhatsApp"
            className="hidden rounded-[2px] border border-brand-line px-3 py-2.5 text-xs text-brand-primary hover:border-brand-primary md:inline-flex lg:text-sm"
          />

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="grid h-10 w-10 place-items-center rounded-[2px] border border-brand-line text-brand-primary md:hidden"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <div id="mobile-nav" className="border-t border-brand-line bg-brand-paper md:hidden">
          <nav aria-label="Mobile" className="container-page flex flex-col py-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="border-b border-brand-line/70 py-3 text-base font-medium text-brand-primary last:border-0"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={QUOTE_URL}
              className="my-3 inline-flex items-center justify-center gap-2 rounded-[2px] bg-brand-primary px-4 py-3 text-sm font-semibold text-brand-paper"
            >
              Request a quote <span aria-hidden="true">→</span>
            </Link>
            <WhatsAppButton
              source="mobile-menu"
              label="Chat on WhatsApp"
              className="mb-3 rounded-[2px] bg-[#128c7e] px-4 py-3 text-center text-sm font-semibold text-white hover:bg-[#0f7a6d]"
            />
          </nav>
        </div>
      ) : null}
    </header>
  );
}
