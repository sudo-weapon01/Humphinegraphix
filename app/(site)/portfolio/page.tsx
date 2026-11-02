import type { Metadata } from "next";
import { getSiteContent } from "@/lib/content/public";
import { CtaBand } from "@/components/site/CtaBand";
import { PageHero } from "@/components/site/PageHero";
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
      <PageHero
        index="03"
        label="Selected work"
        title={pages.portfolio.title}
        intro={pages.portfolio.intro}
        aside={
          <p className="max-w-[14rem] border-l-2 border-brand-accent pl-4 text-[0.82rem] leading-relaxed text-brand-muted">
            Filter by flyer type, then open any design to see it larger. Every piece is built for
            print and for a phone screen.
          </p>
        }
      />

      <section aria-label="Flyer designs" className="container-page py-12 md:py-16">
        {portfolio.length > 0 ? (
          <>
            {/* h2 between the page title and the card headings keeps the outline valid. */}
            <h2 className="sr-only">All flyer designs</h2>
            <PortfolioGallery items={portfolio} />
          </>
        ) : (
          <div className="border border-dashed border-brand-line bg-brand-surface p-10 text-center">
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
