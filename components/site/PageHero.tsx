import type { ReactNode } from "react";

/**
 * Inner-page masthead.
 *
 * Shared shell for Services, Portfolio, About, Contact and Privacy so those
 * pages open with the same editorial rhythm as the home page: index, label,
 * poster headline, intro, and a right-hand column for facts or actions.
 */
export function PageHero({
  index,
  label,
  title,
  intro,
  aside,
}: {
  index: string;
  label: string;
  title: string;
  intro?: string;
  aside?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden border-b border-brand-line">
      <div className="rails container-page grid gap-10 py-12 md:grid-cols-[1.55fr_0.45fr] md:items-end md:py-16">
        <div>
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="index text-brand-accent-strong">
              {index}
            </span>
            <span aria-hidden="true" className="h-px w-8 bg-brand-line" />
            <span className="label text-brand-muted">{label}</span>
          </div>
          <h1 className="mt-5 display text-[clamp(2.3rem,6.4vw,4.6rem)] text-brand-primary">
            {title}
          </h1>
          {intro ? (
            <p className="mt-5 max-w-xl text-[1rem] leading-relaxed text-brand-muted">{intro}</p>
          ) : null}
        </div>
        {aside ? <div className="md:justify-self-end">{aside}</div> : null}
      </div>
    </header>
  );
}
