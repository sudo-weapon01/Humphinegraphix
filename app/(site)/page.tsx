import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSiteContent } from "@/lib/content/public";
import { CtaBand } from "@/components/site/CtaBand";
import { Marquee } from "@/components/site/Marquee";
import { PortfolioCard } from "@/components/site/PortfolioCard";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Testimonials } from "@/components/site/Testimonials";
import { ButtonLink } from "@/components/ui/Button";
import { AUDIENCE_CARDS, PROCESS_STEPS, STUDIO_FACTS } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Flyer design studio",
  description:
    "Humphinegraphix designs bold, print-ready flyers for small businesses, event organizers, and individuals. Clear design, fast turnaround, quote on request.",
  path: "/",
});

const HERO_KEYWORDS = [
  "Flyers",
  "Print-ready PDF",
  "Social crops",
  "One revision round",
  "Business launches",
  "Events",
  "Celebrations",
];

export default async function HomePage() {
  const { pages, portfolio, services } = await getSiteContent();
  const { home } = pages;
  const featured = portfolio.slice(0, 3);
  const flyerTypeCount = services.reduce((total, service) => total + service.flyerTypes.length, 0);

  return (
    <>
      {/* ------------------------------- Hero ------------------------------- */}
      <section className="relative overflow-hidden border-b border-brand-line">
        <div className="rails container-page grid gap-12 py-12 md:py-16 lg:grid-cols-[1.08fr_0.92fr] lg:items-end lg:gap-14">
          <div className="relative">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="label text-brand-accent-strong">{home.heroEyebrow}</span>
              <span aria-hidden="true" className="h-px w-10 bg-brand-line" />
              <span className="index text-brand-muted">Tarkwa · Ghana</span>
            </div>

            <h1 className="mt-7 display display-tight text-[clamp(2.6rem,7.4vw,5.6rem)] text-brand-primary">
              {home.heroTitle}
              <span className="mt-1 block text-brand-accent">{home.heroHighlight}</span>
            </h1>

            <p className="mt-7 max-w-xl text-[1.02rem] leading-relaxed text-brand-muted">
              {home.heroSubtitle}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <ButtonLink href="/contact" size="lg">
                {home.heroPrimaryCta}
                <span aria-hidden="true" className="arrow">
                  →
                </span>
              </ButtonLink>
              <ButtonLink href="/portfolio" size="lg" variant="outline">
                {home.heroSecondaryCta}
              </ButtonLink>
            </div>

            <dl className="mt-12 grid max-w-lg grid-cols-3 border-t border-brand-line pt-5">
              {STUDIO_FACTS.map((fact) => (
                <div key={fact.label} className="flex flex-col-reverse border-l border-brand-line pl-4 first:border-0 first:pl-0">
                  <dt className="mt-2 max-w-[8rem] font-mono text-[0.58rem] uppercase leading-relaxed tracking-[0.14em] text-brand-muted">
                    {fact.label}
                  </dt>
                  <dd className="font-heading text-base font-extrabold tracking-[-0.03em] text-brand-primary sm:text-lg">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Poster composition: framed flyer sheet with an offset accent block. */}
          <div className="relative lg:pb-6">
            <div aria-hidden="true" className="absolute -bottom-3 -left-3 h-24 w-24 bg-brand-accent sm:h-32 sm:w-32" />
            <div className="relative border border-brand-primary bg-brand-surface p-2 shadow-lift">
              <Image
                src="/images/hero-flyers.jpg"
                alt={home.heroImageAlt}
                width={1200}
                height={1200}
                priority
                sizes="(min-width: 1024px) 44vw, 92vw"
                className="aspect-[4/3] w-full object-cover lg:aspect-[5/6]"
              />
              <div className="flex items-center justify-between gap-3 px-1 pb-1 pt-3">
                <span className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-brand-muted">
                  Selected flyers · Vol. 01
                </span>
                <span aria-hidden="true" className="font-mono text-[0.58rem] tracking-[0.18em] text-brand-accent-strong">
                  ↗
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-brand-line pt-3">
              <p className="font-mono text-[0.58rem] uppercase leading-relaxed tracking-[0.16em] text-brand-muted">
                {services.length} service lines <span className="text-brand-accent-strong">/</span>{" "}
                {flyerTypeCount} flyer types
              </p>
              <Link
                href="/portfolio"
                className="link-draw font-mono text-[0.58rem] uppercase tracking-[0.16em] text-brand-primary"
              >
                See all work
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Marquee items={HERO_KEYWORDS} />

      {/* ----------------------------- Audiences ---------------------------- */}
      <section aria-labelledby="audiences-heading" className="container-page py-16 md:py-24">
        <SectionHeading
          id="audiences-heading"
          index="01"
          eyebrow="Who we design for"
          title={home.audiencesTitle}
          intro={home.audiencesIntro}
        />
        <ul className="mt-12 grid border-t border-brand-line md:grid-cols-3">
          {AUDIENCE_CARDS.map((card, index) => (
            <li
              key={card.audience}
              className="group flex flex-col border-b border-brand-line px-0 py-8 transition-colors duration-300 md:border-b-0 md:border-r md:px-7 md:last:border-r-0 md:first:pl-0"
            >
              <div className="flex items-baseline justify-between gap-4">
                <span aria-hidden="true" className="index text-brand-accent-strong">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  aria-hidden="true"
                  className="h-px flex-1 bg-brand-line transition-colors duration-300 group-hover:bg-brand-accent"
                />
              </div>
              <h3 className="mt-5 font-heading text-[1.35rem] font-extrabold tracking-[-0.03em] text-brand-primary">
                {card.title}
              </h3>
              <p className="mt-3 flex-1 text-[0.9rem] leading-relaxed text-brand-muted">{card.body}</p>
              <ul className="mt-6 space-y-2">
                {card.points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 font-mono text-[0.66rem] uppercase leading-relaxed tracking-[0.1em] text-brand-primary/75">
                    <span aria-hidden="true" className="mt-[0.45rem] h-px w-3 shrink-0 bg-brand-accent" />
                    {point}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      {/* --------------------------- Featured work -------------------------- */}
      <section aria-labelledby="featured-heading" className="bg-brand-paper-deep/60">
        <div className="container-page py-16 md:py-24">
          <SectionHeading
            id="featured-heading"
            index="02"
            eyebrow="Portfolio"
            title={home.featuredTitle}
            intro={home.featuredIntro}
            action={
              <ButtonLink href="/portfolio" variant="outline">
                All work <span aria-hidden="true" className="arrow">→</span>
              </ButtonLink>
            }
          />
          {featured.length > 0 ? (
            <ul className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((item, index) => (
                <li key={item.id}>
                  <PortfolioCard item={item} index={index + 1} priority={index === 0} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-8 max-w-xl text-brand-muted">{pages.portfolio.emptyState}</p>
          )}
        </div>
      </section>

      {/* ------------------------------ Process ----------------------------- */}
      <section aria-labelledby="process-heading" className="container-page py-16 md:py-24">
        <SectionHeading
          id="process-heading"
          index="03"
          eyebrow="How it works"
          title={home.processTitle}
          intro={home.processIntro}
        />
        <ol className="mt-12 grid border-t border-brand-line md:grid-cols-2">
          {PROCESS_STEPS.map((step, index) => (
            <li
              key={step.title}
              className="flex gap-6 border-b border-brand-line py-7 md:px-7 md:[&:nth-child(odd)]:border-r md:[&:nth-child(odd)]:pl-0"
            >
              <span aria-hidden="true" className="display text-[2.2rem] leading-none text-brand-line">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-heading text-[1.1rem] font-extrabold tracking-[-0.03em] text-brand-primary">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-md text-[0.9rem] leading-relaxed text-brand-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-10 max-w-2xl border-l-2 border-brand-accent pl-4 text-sm leading-relaxed text-brand-muted">
          Need it for a date that is already close?{" "}
          <Link
            href="/contact"
            className="font-semibold text-brand-primary underline decoration-brand-accent decoration-2 underline-offset-4"
          >
            Send the quote form
          </Link>{" "}
          with your deadline and we&apos;ll tell you straight away whether it&apos;s possible.
        </p>
      </section>

      {/* ---------------------------- Testimonials -------------------------- */}
      <Testimonials
        items={pages.testimonials}
        intro="Quotes from the businesses and organizers the studio has designed for."
      />

      <CtaBand home={home} />
    </>
  );
}
