import type { Metadata } from "next";
import Image from "next/image";
import { getSiteContent } from "@/lib/content/public";
import { CtaBand } from "@/components/site/CtaBand";
import { SectionHeading } from "@/components/site/SectionHeading";

export const metadata: Metadata = {
  title: "About",
  description:
    "Humphinegraphix is an independent flyer design studio. The flyer is often the first thing a customer sees — we design it like it matters.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const { pages } = await getSiteContent();
  const { about } = pages;

  return (
    <>
      <header className="border-b border-brand-line bg-brand-surface/60">
        <div className="container-page py-14 md:py-20">
          <p className="eyebrow">The studio</p>
          <h1 className="mt-4 max-w-3xl font-heading text-[clamp(2.1rem,5.4vw,3.6rem)] font-extrabold leading-[1.0] tracking-[-0.04em] text-brand-primary">
            {about.title}
          </h1>
          <p className="mt-5 max-w-2xl text-[1rem] leading-relaxed text-brand-muted">{about.intro}</p>
        </div>
      </header>

      <section aria-labelledby="story-heading" className="container-page py-14 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-start lg:gap-16">
          <div>
            <h2
              id="story-heading"
              className="font-heading text-[clamp(1.6rem,3.6vw,2.4rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-brand-primary"
            >
              {about.storyTitle}
            </h2>
            <div className="mt-6 space-y-4">
              {about.storyParagraphs.map((paragraph, index) => (
                <p key={index} className="text-[0.975rem] leading-relaxed text-brand-muted">
                  {paragraph}
                </p>
              ))}
            </div>
            <p className="mt-8 border-l-2 border-brand-accent pl-4 text-sm leading-relaxed text-brand-primary/80">
              {about.studioNote}
            </p>
          </div>

          <div className="relative lg:pt-6">
            <div
              aria-hidden="true"
              className="absolute -right-3 -top-2 h-24 w-24 bg-brand-gold/25 lg:right-6"
            />
            <div className="relative overflow-hidden rounded-[3px] border border-brand-line bg-brand-paper-deep shadow-card">
              <Image
                src="/images/hero-flyers.jpg"
                alt="A selection of printed Humphinegraphix flyers on a paper surface"
                width={900}
                height={900}
                sizes="(min-width: 1024px) 40vw, 92vw"
                className="h-full w-full object-cover"
              />
            </div>
            <p className="mt-4 text-xs uppercase tracking-[0.14em] text-brand-muted">
              Studio work — flyers in print
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="values-heading" className="border-y border-brand-line bg-brand-surface/60">
        <div className="container-page py-14 md:py-20">
          <SectionHeading id="values-heading" eyebrow="How we work" title="Three standards, every flyer" />
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {about.values.map((value, index) => (
              <li key={index} className="border-t-2 border-brand-primary pt-5">
                <span aria-hidden="true" className="font-heading text-xs font-bold tabular-nums text-brand-accent">
                  0{index + 1}
                </span>
                <h3 className="mt-2 font-heading text-lg font-bold tracking-[-0.02em] text-brand-primary">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-muted">{value.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand home={pages.home} />
    </>
  );
}
