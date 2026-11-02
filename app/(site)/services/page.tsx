import type { Metadata } from "next";
import { getSiteContent } from "@/lib/content/public";
import { CtaBand } from "@/components/site/CtaBand";
import { FaqList } from "@/components/site/FaqList";
import { Marquee } from "@/components/site/Marquee";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { WhatYouGet } from "@/components/site/WhatYouGet";
import { ButtonLink } from "@/components/ui/Button";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Services",
  description:
    "Flyer design for small businesses, events, and personal celebrations: print-ready PDFs, social crops, and one revision round included.",
  path: "/services",
});

export default async function ServicesPage() {
  const { pages, services } = await getSiteContent();

  return (
    <>
      <PageHero
        index="02"
        label="Services"
        title={pages.services.title}
        intro={pages.services.intro}
        aside={
          <div className="flex flex-col gap-2">
            <ButtonLink href="/contact" size="lg" className="justify-between">
              Request a quote <span aria-hidden="true" className="arrow">→</span>
            </ButtonLink>
            <ButtonLink href="/portfolio" size="lg" variant="outline" className="justify-between">
              See the portfolio
            </ButtonLink>
          </div>
        }
      />

      <section aria-label="Flyer services" className="container-page py-16 md:py-24">
        <ul className="border-t border-brand-line">
          {services.map((service, index) => (
            <li
              key={service.id}
              className="group grid gap-6 border-b border-brand-line py-9 md:grid-cols-[7rem_1fr_1fr] md:items-start md:gap-10"
            >
              <div className="flex items-center gap-3 md:block">
                <span aria-hidden="true" className="display text-[2.4rem] leading-none text-brand-line transition-colors duration-300 group-hover:text-brand-accent-strong">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <div>
                <h2 className="font-heading text-[1.3rem] font-extrabold tracking-[-0.03em] text-brand-primary md:text-[1.5rem]">
                  {service.name}
                </h2>
                <p className="mt-3 max-w-md text-[0.9rem] leading-relaxed text-brand-muted">
                  {service.description}
                </p>
              </div>

              {service.flyerTypes.length > 0 ? (
                <div className="md:border-l md:border-brand-line md:pl-10">
                  <h3 className="label text-brand-muted">Flyer types</h3>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {service.flyerTypes.map((type) => (
                      <li
                        key={type}
                        className="border border-brand-line bg-brand-surface px-2.5 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-brand-primary/80 transition-colors group-hover:border-brand-primary/30"
                      >
                        {type}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <Marquee
        tone="paper"
        items={["Fixed quote before design", "Print-ready files", "Social crops", "One revision round", "No online payment"]}
      />

      <section aria-label="Turnaround and inclusions" className="container-page py-16 md:py-24">
        <div className="grid gap-10 border border-brand-line bg-brand-surface p-7 md:grid-cols-[1.3fr_1fr] md:p-10">
          <div>
            <span aria-hidden="true" className="index text-brand-accent-strong">
              03.1
            </span>
            <h2 className="mt-4 display text-[clamp(1.6rem,3.6vw,2.5rem)] text-brand-primary">
              Turnaround &amp; what&apos;s included
            </h2>
            <p className="mt-4 max-w-lg text-[0.95rem] leading-relaxed text-brand-muted">
              {pages.services.turnaroundNote}
            </p>
          </div>
          <ul className="space-y-3 md:border-l md:border-brand-line md:pl-10">
            {[
              "Print-ready PDF with correct bleed",
              "PNG/JPG exports for social and messaging",
              "One revision round included",
              "Full usage rights for your flyer",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 border-b border-brand-line pb-3 last:border-0 last:pb-0">
                <span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-brand-accent" />
                <span className="text-[0.88rem] leading-relaxed text-brand-primary/85">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="border-t border-brand-line">
        <WhatYouGet />
      </div>

      <FaqList
        items={pages.faq}
        intro="Straight answers about turnaround, files, and how quotes work."
      />

      <section aria-labelledby="choosing-heading" className="container-page pb-16 md:pb-24">
        <div className="max-w-3xl border-t border-brand-line pt-7">
          <h2
            id="choosing-heading"
            className="display text-[clamp(1.7rem,3.9vw,2.6rem)] text-brand-primary"
          >
            {pages.services.closingTitle}
          </h2>
          <p className="mt-4 text-[0.975rem] leading-relaxed text-brand-muted">
            {pages.services.closingBody}
          </p>
        </div>
      </section>

      <CtaBand home={pages.home} />
    </>
  );
}
