import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSiteContent } from "@/lib/content/public";
import { CtaBand } from "@/components/site/CtaBand";
import { PortfolioCard } from "@/components/site/PortfolioCard";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { AUDIENCE_CARDS, PROCESS_STEPS, STUDIO_FACTS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Flyer design studio",
  description:
    "Humphinegraphix designs bold, print-ready flyers for small businesses, event organizers, and individuals. Clear design, fast turnaround, quote on request.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const { pages, portfolio, services } = await getSiteContent();
  const { home } = pages;
  const featured = portfolio.slice(0, 3);
  const flyerTypeCount = services.reduce((total, service) => total + service.flyerTypes.length, 0);

  return (
    <>
      {/* ------------------------------- Hero ------------------------------- */}
      <section className="relative overflow-hidden border-b border-brand-line">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 top-0 hidden h-[34rem] w-[34rem] rounded-full border-[1px] border-brand-line lg:block"
        />
        <div className="container-page relative grid gap-12 py-14 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:py-24">
          <div>
            <p className="eyebrow">{home.heroEyebrow}</p>
            <h1 className="mt-5 font-heading text-[clamp(2.45rem,6.2vw,4.35rem)] font-extrabold leading-[0.96] tracking-[-0.045em] text-brand-primary">
              {home.heroTitle}
              <span className="mt-2 block text-brand-accent">{home.heroHighlight}</span>
            </h1>
            <p className="mt-6 max-w-xl text-[1.02rem] leading-relaxed text-brand-muted">
              {home.heroSubtitle}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href="/contact" size="lg">
                {home.heroPrimaryCta}
                <span aria-hidden="true">→</span>
              </ButtonLink>
              <ButtonLink href="/portfolio" size="lg" variant="outline">
                {home.heroSecondaryCta}
              </ButtonLink>
            </div>

            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-brand-line pt-6">
              {STUDIO_FACTS.map((fact) => (
                <div key={fact.label} className="flex flex-col-reverse">
                  <dt className="mt-1 text-[0.7rem] uppercase tracking-[0.1em] text-brand-muted">
                    {fact.label}
                  </dt>
                  <dd className="font-heading text-base font-bold tracking-[-0.02em] text-brand-primary sm:text-lg">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -bottom-4 -left-4 h-32 w-32 bg-brand-accent-soft sm:h-44 sm:w-44"
            />
            <div className="relative overflow-hidden rounded-[3px] border border-brand-line bg-brand-paper-deep shadow-lift">
              <Image
                src="/images/hero-flyers.jpg"
                alt={home.heroImageAlt}
                width={1200}
                height={1200}
                priority
                sizes="(min-width: 1024px) 46vw, 92vw"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-5 right-4 rounded-[2px] bg-brand-primary px-4 py-3 text-brand-paper shadow-card sm:right-6">
              <p className="font-heading text-sm font-bold tracking-[-0.02em]">
                {services.length} service lines
              </p>
              <p className="text-[0.7rem] uppercase tracking-[0.12em] text-brand-paper/60">
                {flyerTypeCount} flyer types
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------- Audiences ---------------------------- */}
      <section aria-labelledby="audiences-heading" className="container-page py-16 md:py-24">
        <SectionHeading
          id="audiences-heading"
          eyebrow="Who we design for"
          title={home.audiencesTitle}
          intro={home.audiencesIntro}
          align="center"
        />
        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {AUDIENCE_CARDS.map((card, index) => (
            <li
              key={card.audience}
              className="group flex flex-col rounded-[3px] border border-brand-line bg-brand-surface p-6 transition-shadow duration-300 hover:shadow-card md:p-7"
            >
              <span className="font-heading text-sm font-bold tabular-nums text-brand-accent-strong">
                0{index + 1}
              </span>
              <h3 className="mt-4 font-heading text-xl font-bold tracking-[-0.02em] text-brand-primary">
                {card.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-muted">{card.body}</p>
              <ul className="mt-6 space-y-2 border-t border-brand-line pt-4">
                {card.points.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-[0.82rem] text-brand-primary/80">
                    <span aria-hidden="true" className="mt-1.5 h-1 w-1 shrink-0 bg-brand-accent" />
                    {point}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      {/* --------------------------- Featured work -------------------------- */}
      <section aria-labelledby="featured-heading" className="border-y border-brand-line bg-brand-surface/60">
        <div className="container-page py-16 md:py-24">
          <SectionHeading
            id="featured-heading"
            eyebrow="Portfolio"
            title={home.featuredTitle}
            intro={home.featuredIntro}
            action={
              <ButtonLink href="/portfolio" variant="outline">
                All work <span aria-hidden="true">→</span>
              </ButtonLink>
            }
          />
          {featured.length > 0 ? (
            <ul className="mt-11 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((item, index) => (
                <li key={item.id}>
                  <PortfolioCard item={item} priority={index === 0} />
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
          eyebrow="How it works"
          title={home.processTitle}
          intro={home.processIntro}
        />
        <ol className="mt-11 grid gap-x-10 gap-y-8 md:grid-cols-2">
          {PROCESS_STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-5 border-t border-brand-line pt-5">
              <span
                aria-hidden="true"
                className="font-heading text-2xl font-extrabold tabular-nums leading-none text-brand-accent-strong/80"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-heading text-lg font-bold tracking-[-0.02em] text-brand-primary">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-10 max-w-2xl border-l-2 border-brand-accent pl-4 text-sm leading-relaxed text-brand-muted">
          Need it for a date that is already close?{" "}
          <Link href="/contact" className="font-semibold text-brand-primary underline decoration-brand-accent decoration-2 underline-offset-4">
            Send the quote form
          </Link>{" "}
          with your deadline and we&apos;ll tell you straight away whether it&apos;s possible.
        </p>
      </section>

      <CtaBand home={home} />
    </>
  );
}
