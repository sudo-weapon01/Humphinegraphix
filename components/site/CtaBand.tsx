import { ButtonLink } from "@/components/ui/Button";
import type { SitePages } from "@/lib/content/types";

/**
 * Closing call-to-action: a full-bleed ink block with the studio's name set as
 * an oversized watermark, so every page ends on the brand.
 */
export function CtaBand({ home }: { home: SitePages["home"] }) {
  return (
    <section aria-labelledby="cta-heading" className="mt-20 md:mt-28">
      <div className="relative overflow-hidden bg-brand-primary text-brand-paper">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[26px] border-brand-accent/25"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 right-10 hidden h-full w-px bg-brand-paper/10 md:block"
        />
        <p
          aria-hidden="true"
          className="display display-cond pointer-events-none absolute -bottom-6 right-4 select-none text-[clamp(4rem,16vw,13rem)] text-brand-paper/[0.06]"
        >
          HG
        </p>

        <div className="container-page relative grid gap-10 py-14 md:grid-cols-[1.25fr_0.75fr] md:items-end md:py-20">
          <div>
            <span className="eyebrow text-brand-gold">Next step</span>
            <h2
              id="cta-heading"
              className="mt-5 display text-[clamp(2.1rem,5.6vw,4rem)] text-brand-paper"
            >
              {home.ctaTitle}
            </h2>
            <p className="mt-5 max-w-lg text-[0.975rem] leading-relaxed text-brand-paper/70">
              {home.ctaBody}
            </p>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            <ButtonLink href="/contact" size="lg" variant="light" className="w-full justify-between md:w-auto">
              {home.ctaLabel}
              <span aria-hidden="true" className="arrow">
                →
              </span>
            </ButtonLink>
            <ButtonLink href="/portfolio" size="lg" variant="ghost" className="w-full justify-between md:w-auto">
              View the portfolio
            </ButtonLink>
            <p className="mt-2 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-brand-paper/65 md:text-right">
              No cart · No payment online · Reply by email
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
