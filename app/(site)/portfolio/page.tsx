import type { Metadata } from "next";
import { getSiteContent } from "@/lib/content/public";
import { CtaBand } from "@/components/site/CtaBand";
import { PortfolioGallery } from "@/components/site/PortfolioGallery";
import { ButtonLink } from "@/components/ui/Button";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Portfolio",
  description:
    "Selected flyer design work from Humphinegraphix: event flyers, business promotions, and personal celebrations.",
  path: "/portfolio",
});

export default async function PortfolioPage() {
  const { pages, portfolio } = await getSiteContent();

  return (
    <>
      <header className="border-b border-brand-line bg-brand-surface/60">
        <div className="container-page py-14 md:py-20">
          <p className="eyebrow">Selected work</p>
          <h1 className="mt-4 font-heading text-[clamp(2.1rem,5.4vw,3.6rem)] font-extrabold leading-[1.0] tracking-[-0.04em] text-brand-primary">
            {pages.portfolio.title}
          </h1>
          <p className="mt-5 max-w-2xl text-[1rem] leading-relaxed text-brand-muted">
            {pages.portfolio.intro}
          </p>
        </div>
      </header>

      <section aria-label="Flyer designs" className="container-page py-14 md:py-20">
        {portfolio.length > 0 ? (
          <>
            {/* h2 between the page title and the card headings keeps the outline valid. */}
            <h2 className="sr-only">All flyer designs</h2>
            <p className="mb-6 max-w-2xl text-sm leading-relaxed text-brand-muted">
              Filter by flyer type, then open any design to see it larger.
            </p>
            <PortfolioGallery items={portfolio} />
          </>
        ) : (
          <div className="rounded-[3px] border border-dashed border-brand-line bg-brand-surface p-10 text-center">
            <p className="mx-auto max-w-md text-sm leading-relaxed text-brand-muted">
              {pages.portfolio.emptyState}
            </p>
            <ButtonLink href="/contact" className="mt-6">
              Ask for samples
            </ButtonLink>
          </div>
        )}
      </section>

      <CtaBand home={pages.home} />
    </>
  );
}
