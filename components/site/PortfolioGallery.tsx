"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PortfolioItem } from "@/lib/content/types";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";

const ALL = "All";

/**
 * Filterable portfolio grid with a keyboard-accessible lightbox.
 *
 * Filters are underline tabs (no routing), so filtering never costs a request
 * and every flyer type stays reachable for keyboard and screen-reader users. The
 * lightbox is a real dialog: it traps Tab, closes on Escape or backdrop click,
 * and returns focus to the card that opened it.
 */
export function PortfolioGallery({ items }: { items: PortfolioItem[] }) {
  const [filter, setFilter] = useState<string>(ALL);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const flyerTypes = useMemo(() => {
    const seen = new Set<string>();
    for (const item of items) if (item.flyerType) seen.add(item.flyerType);
    return [ALL, ...Array.from(seen).sort((a, b) => a.localeCompare(b))];
  }, [items]);

  const visible = useMemo(
    () => (filter === ALL ? items : items.filter((item) => item.flyerType === filter)),
    [items, filter],
  );

  const close = useCallback(() => {
    setOpenIndex(null);
    triggerRef.current?.focus();
  }, []);

  // Escape to close, arrow keys to move, Tab kept inside the dialog.
  useEffect(() => {
    if (openIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key === "ArrowRight") {
        setOpenIndex((current) =>
          current === null ? current : (current + 1) % visible.length,
        );
        return;
      }
      if (event.key === "ArrowLeft") {
        setOpenIndex((current) =>
          current === null ? current : (current - 1 + visible.length) % visible.length,
        );
        return;
      }
      if (event.key === "Tab") {
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], [tabindex]:not([tabindex="-1"])',
        );
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [openIndex, visible.length, close]);

  if (items.length === 0) return null;

  const active = openIndex === null ? null : visible[openIndex];

  return (
    <div>
      {/* ------------------------------ Filters ------------------------------ */}
      <div className="flex flex-col gap-3 border-b border-brand-line pb-3 lg:flex-row lg:items-end lg:justify-between">
        <div role="group" aria-label="Filter portfolio by flyer type" className="flex flex-wrap gap-x-5 gap-y-2">
          {flyerTypes.map((type) => {
            const isActive = type === filter;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setFilter(type)}
                aria-pressed={isActive}
                className={`group relative pb-1.5 font-mono text-[0.66rem] uppercase tracking-[0.14em] transition-colors ${
                  isActive ? "text-brand-primary" : "text-brand-muted hover:text-brand-primary"
                }`}
              >
                {type}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 -bottom-[0.9rem] h-[2px] origin-left bg-brand-accent transition-transform duration-200 ${
                    isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </button>
            );
          })}
        </div>
        <p aria-live="polite" className="index text-brand-muted">
          {String(visible.length).padStart(2, "0")} {visible.length === 1 ? "flyer" : "flyers"}
          {filter === ALL ? " · all types" : ` · ${filter}`}
        </p>
      </div>

      {/* ------------------------------- Grid -------------------------------- */}
      <ul className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((item, index) => (
          <li key={item.id}>
            <article className="group">
              <button
                type="button"
                ref={index === 0 ? triggerRef : undefined}
                onClick={(event) => {
                  triggerRef.current = event.currentTarget;
                  setOpenIndex(index);
                  track(ANALYTICS_EVENTS.portfolioOpened, { title: item.title });
                }}
                className="relative block w-full overflow-hidden border border-brand-line bg-brand-surface p-1.5 text-left transition-colors duration-300 hover:border-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
                aria-label={`Enlarge ${item.title} flyer`}
              >
                <span className="block aspect-[3/4] overflow-hidden bg-brand-paper-deep">
                  <Image
                    src={item.image}
                    alt={item.imageAlt || `${item.title} flyer design`}
                    width={800}
                    height={1067}
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                </span>
                <span className="absolute left-3 top-3 bg-brand-paper/95 px-2 py-1 font-mono text-[0.55rem] uppercase tracking-[0.16em] text-brand-primary backdrop-blur">
                  {item.flyerType}
                </span>
                <span
                  aria-hidden="true"
                  className="absolute bottom-3 right-3 grid h-8 w-8 place-items-center bg-brand-primary text-brand-paper opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 9V4h5M20 15v5h-5M20 9V4h-5M4 15v5h5" strokeLinecap="round" />
                  </svg>
                </span>
                <span
                  aria-hidden="true"
                  className="absolute bottom-3 left-3 bg-brand-primary/85 px-1.5 py-0.5 font-mono text-[0.55rem] tracking-[0.16em] text-brand-paper backdrop-blur"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
              </button>
              <div className="mt-4 border-t border-brand-line pt-3">
                <h3 className="font-heading text-[1.05rem] font-extrabold tracking-[-0.025em] text-brand-primary">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-[0.85rem] leading-relaxed text-brand-muted">{item.description}</p>
              </div>
            </article>
          </li>
        ))}
      </ul>

      {visible.length === 0 ? (
        <p className="mt-8 border border-dashed border-brand-line p-6 text-sm text-brand-muted">
          No flyers in this category yet. Choose another category or{" "}
          <button type="button" className="font-semibold text-brand-primary underline" onClick={() => setFilter(ALL)}>
            show all flyers
          </button>
          .
        </p>
      ) : null}

      {/* ------------------------------ Lightbox ----------------------------- */}
      {active ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-brand-primary/95 p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="lightbox-title"
            aria-describedby="lightbox-description"
            className="relative flex max-h-[92dvh] w-full max-w-5xl flex-col overflow-y-auto border border-brand-paper/20 bg-brand-paper md:flex-row"
          >
            <div className="relative w-full bg-brand-paper-deep md:w-[58%]">
              <Image
                src={active.image}
                alt={active.imageAlt || `${active.title} flyer design`}
                width={1000}
                height={1333}
                sizes="(min-width: 768px) 55vw, 100vw"
                className="h-full max-h-[60dvh] w-full object-contain md:max-h-[92dvh]"
              />
            </div>

            <div className="flex flex-1 flex-col p-6 md:p-8">
              <div className="flex items-center justify-between gap-3">
                <span className="border border-brand-line px-2 py-1 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-brand-muted">
                  {active.flyerType}
                </span>
                <span aria-hidden="true" className="index text-brand-line">
                  {String((openIndex ?? 0) + 1).padStart(2, "0")} / {String(visible.length).padStart(2, "0")}
                </span>
              </div>
              <h2
                id="lightbox-title"
                className="mt-5 display text-[clamp(1.7rem,3.6vw,2.6rem)] text-brand-primary"
              >
                {active.title}
              </h2>
              <p id="lightbox-description" className="mt-4 text-[0.9rem] leading-relaxed text-brand-muted">
                {active.description}
              </p>

              <p className="mt-6 border-t border-brand-line pt-4 text-[0.82rem] leading-relaxed text-brand-muted">
                Want a flyer like this? Send the brief and the studio will reply with a full quote.
              </p>

              <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
                <button
                  type="button"
                  onClick={() =>
                    setOpenIndex((current) =>
                      current === null ? current : (current - 1 + visible.length) % visible.length,
                    )
                  }
                  className="border border-brand-line px-3 py-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-brand-primary transition-colors hover:border-brand-primary"
                >
                  ← Prev
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setOpenIndex((current) => (current === null ? current : (current + 1) % visible.length))
                  }
                  className="border border-brand-line px-3 py-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-brand-primary transition-colors hover:border-brand-primary"
                >
                  Next →
                </button>
              </div>
            </div>

            <button
              type="button"
              ref={closeRef}
              onClick={close}
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center border border-brand-line bg-brand-paper text-brand-primary transition-colors hover:bg-brand-primary hover:text-brand-paper"
            >
              <span className="sr-only">Close enlarged flyer</span>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
