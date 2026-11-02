import type { Metadata } from "next";
import { getSiteContent } from "@/lib/content/public";
import { CtaBand } from "@/components/site/CtaBand";
import { PortfolioCard } from "@/components/site/PortfolioCard";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Selected flyer design work from Humphinegraphix: event flyers, business promotions, and personal celebrations.",
  alternates: { canonical: "/portfolio" },
};

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
          <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {portfolio.map((item, index) => (
              <li key={item.id}>
                <PortfolioCard item={item} priority={index < 3} />
              </li>
            ))}
          </ul>
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
