import type { Metadata } from "next";
import { getSiteContent } from "@/lib/content/public";
import { CtaBand } from "@/components/site/CtaBand";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Flyer design for small businesses, events, and personal celebrations: print-ready PDFs, social crops, and one revision round included.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  const { pages, services } = await getSiteContent();

  return (
    <>
      <header className="border-b border-brand-line bg-brand-surface/60">
        <div className="container-page py-14 md:py-20">
          <p className="eyebrow">Services</p>
          <h1 className="mt-4 max-w-3xl font-heading text-[clamp(2.1rem,5.4vw,3.6rem)] font-extrabold leading-[1.0] tracking-[-0.04em] text-brand-primary">
            {pages.services.title}
          </h1>
          <p className="mt-5 max-w-2xl text-[1rem] leading-relaxed text-brand-muted">
            {pages.services.intro}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/contact" size="lg">
              Request a quote <span aria-hidden="true">→</span>
            </ButtonLink>
            <ButtonLink href="/portfolio" size="lg" variant="outline">
              See the portfolio
            </ButtonLink>
          </div>
        </div>
      </header>

      <section aria-label="Flyer services" className="container-page py-16 md:py-20">
        <ul className="grid gap-5 md:grid-cols-2">
          {services.map((service, index) => (
            <li
              key={service.id}
              className="flex flex-col rounded-[3px] border border-brand-line bg-brand-surface p-6 md:p-8"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-heading text-xl font-bold tracking-[-0.025em] text-brand-primary md:text-2xl">
                  {service.name}
                </h2>
                <span aria-hidden="true" className="font-heading text-sm font-bold tabular-nums text-brand-line">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-muted">
                {service.description}
              </p>
              {service.flyerTypes.length > 0 ? (
                <>
                  <h3 className="mt-6 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-brand-primary/60">
                    Flyer types
                  </h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {service.flyerTypes.map((type) => (
                      <li
                        key={type}
                        className="rounded-full border border-brand-line bg-brand-paper px-3 py-1 text-[0.75rem] text-brand-primary/80"
                      >
                        {type}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Turnaround and inclusions" className="container-page">
        <div className="grid gap-6 rounded-[3px] border border-brand-line bg-brand-paper-deep p-7 md:grid-cols-[1.4fr_1fr] md:p-10">
          <div>
            <h2 className="font-heading text-xl font-bold tracking-[-0.02em] text-brand-primary">
              Turnaround &amp; what&apos;s included
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-brand-primary/75">
              {pages.services.turnaroundNote}
            </p>
          </div>
          <ul className="space-y-2.5 border-brand-line text-sm text-brand-primary/80 md:border-l md:pl-8">
            {[
              "Print-ready PDF with correct bleed",
              "PNG/JPG exports for social and messaging",
              "One revision round included",
              "Full usage rights for your flyer",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-1.5 h-1 w-1 shrink-0 bg-brand-accent" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-label="Choosing a flyer" className="container-page mt-16">
        <div className="max-w-2xl">
          <h2 className="font-heading text-2xl font-extrabold tracking-[-0.03em] text-brand-primary">
            {pages.services.closingTitle}
          </h2>
          <p className="mt-3 text-[0.975rem] leading-relaxed text-brand-muted">
            {pages.services.closingBody}
          </p>
        </div>
      </section>

      <CtaBand home={pages.home} />
    </>
  );
}
