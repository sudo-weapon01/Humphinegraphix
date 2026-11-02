import { ButtonLink } from "@/components/ui/Button";
import type { SitePages } from "@/lib/content/types";

/** Closing call-to-action used at the bottom of every public page. */
export function CtaBand({ home }: { home: SitePages["home"] }) {
  return (
    <section aria-labelledby="cta-heading" className="container-page mt-24">
      <div className="relative overflow-hidden rounded-[4px] bg-brand-primary px-6 py-12 text-brand-paper sm:px-10 md:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[28px] border-brand-accent/20"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rotate-12 rounded-[3px] bg-brand-gold/10"
        />
        <div className="relative max-w-2xl">
          <span className="eyebrow text-brand-gold">Next step</span>
          <h2
            id="cta-heading"
            className="mt-3 font-heading text-[clamp(1.8rem,4.4vw,2.9rem)] font-extrabold leading-[1.03] tracking-[-0.03em]"
          >
            {home.ctaTitle}
          </h2>
          <p className="mt-4 max-w-xl text-[0.975rem] leading-relaxed text-brand-paper/75">
            {home.ctaBody}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <ButtonLink href="/contact" size="lg" variant="light">
              {home.ctaLabel}
              <span aria-hidden="true">→</span>
            </ButtonLink>
            <ButtonLink href="/portfolio" size="lg" variant="ghost">
              View the portfolio
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
