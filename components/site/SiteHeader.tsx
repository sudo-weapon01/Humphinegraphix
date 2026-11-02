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

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-50 border-b border-brand-line bg-brand-paper/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4 md:h-[4.5rem]">
        <Wordmark />

        <nav aria-label="Primary" className="hidden items-stretch self-stretch lg:flex">
          {NAV_LINKS.map((link, index) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`group relative flex items-center gap-2 border-l border-brand-line px-4 font-mono text-[0.68rem] uppercase tracking-[0.16em] transition-colors lg:px-5 ${
                  active ? "text-brand-primary" : "text-brand-muted hover:text-brand-primary"
                }`}
              >
                <span aria-hidden="true" className={`index transition-colors ${active ? "text-brand-accent-strong" : "text-brand-line group-hover:text-brand-accent-strong"}`}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                {link.label}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 bottom-0 h-[2px] origin-left bg-brand-accent transition-transform duration-200 ${
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <WhatsAppButton
            source="header"
            label="WhatsApp"
            className="hidden border border-brand-line px-3 py-2.5 text-[0.62rem] text-brand-primary hover:border-brand-primary hover:bg-brand-primary hover:text-brand-paper xl:inline-flex"
          />

          <Link
            href={QUOTE_URL}
            className="hidden items-center gap-2 bg-brand-primary px-4 py-2.5 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-brand-paper transition-colors hover:bg-brand-accent hover:text-white sm:inline-flex"
          >
            Request a quote
            <span aria-hidden="true" className="arrow">
              →
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="grid h-10 w-10 place-items-center border border-brand-line text-brand-primary transition-colors hover:border-brand-primary lg:hidden"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M3 7h18M3 12h18M3 17h18" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <div id="mobile-nav" className="border-t border-brand-line bg-brand-paper lg:hidden">
          <nav aria-label="Mobile" className="container-page flex flex-col py-2">
            {NAV_LINKS.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className="flex items-baseline gap-4 border-b border-brand-line py-4 text-brand-primary last:border-0"
              >
                <span aria-hidden="true" className="index text-brand-accent-strong">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="display text-[1.6rem] leading-none">{link.label}</span>
              </Link>
            ))}
            <div className="flex flex-col gap-2 py-4">
              <Link
                href={QUOTE_URL}
                className="inline-flex items-center justify-center gap-2 bg-brand-primary px-4 py-4 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-brand-paper"
              >
                Request a quote <span aria-hidden="true">→</span>
              </Link>
              <WhatsAppButton
                source="mobile-menu"
                label="Chat on WhatsApp"
                className="justify-center bg-[#128c7e] px-4 py-4 text-center text-[0.7rem] uppercase tracking-[0.16em] text-white hover:bg-[#0f7a6d]"
              />
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
