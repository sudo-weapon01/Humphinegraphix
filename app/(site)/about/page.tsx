import type { Metadata } from "next";
import Image from "next/image";
import { getSiteContent } from "@/lib/content/public";
import { CtaBand } from "@/components/site/CtaBand";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description:
    "Humphinegraphix is an independent flyer design studio. The flyer is often the first thing a customer sees — we design it like it matters.",
  path: "/about",
});

export default async function AboutPage() {
  const { pages } = await getSiteContent();
  const { about } = pages;

  return (
    <>
      <PageHero
        index="04"
        label="The studio"
        title={about.title}
        intro={about.intro}
        aside={
          <dl className="grid grid-cols-2 gap-px bg-brand-line md:w-56 md:grid-cols-1">
            {[
              { k: "Based in", v: "Tarkwa, GH" },
              { k: "Working", v: "Nationwide" },
              { k: "Format", v: "Print + screen" },
            ].map((row) => (
              <div key={row.k} className="bg-brand-paper px-3 py-2.5">
                <dt className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-brand-muted">{row.k}</dt>
                <dd className="mt-1 font-heading text-[0.85rem] font-extrabold tracking-[-0.02em] text-brand-primary">
                  {row.v}
                </dd>
              </div>
            ))}
          </dl>
        }
      />

      <section aria-labelledby="story-heading" className="container-page py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:gap-16">
          <div>
            <span aria-hidden="true" className="index text-brand-accent-strong">
              04.1
            </span>
            <h2
              id="story-heading"
              className="mt-4 display text-[clamp(1.8rem,4.2vw,3rem)] text-brand-primary"
            >
              {about.storyTitle}
            </h2>
            <div className="mt-7 space-y-4 border-t border-brand-line pt-7">
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

          <div className="relative">
            <div aria-hidden="true" className="absolute -bottom-4 -right-4 h-24 w-24 bg-brand-accent" />
            <div className="relative border border-brand-primary bg-brand-surface p-2">
              <Image
                src="/images/hero-flyers.jpg"
                alt="A selection of printed Humphinegraphix flyers on a paper surface"
                width={900}
                height={900}
                sizes="(min-width: 1024px) 45vw, 92vw"
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="flex items-center justify-between gap-3 px-1 pb-1 pt-3">
                <span className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-brand-muted">
                  Studio work — flyers in print
                </span>
                <span aria-hidden="true" className="font-mono text-[0.58rem] tracking-[0.18em] text-brand-accent-strong">
                  ✳
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="values-heading" className="border-y border-brand-line bg-brand-paper-deep/60">
        <div className="container-page py-16 md:py-24">
          <SectionHeading
            id="values-heading"
            index="04.2"
            eyebrow="How we work"
            title="Three standards, every flyer"
          />
          <ul className="mt-12 grid border-t border-brand-line md:grid-cols-3">
            {about.values.map((value, index) => (
              <li
                key={index}
                className="border-b border-brand-line py-7 md:border-b-0 md:border-r md:px-7 md:last:border-r-0 md:first:pl-0"
              >
                <span aria-hidden="true" className="display text-[2rem] leading-none text-brand-line">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 font-heading text-[1.15rem] font-extrabold tracking-[-0.03em] text-brand-primary">
                  {value.title}
                </h3>
                <p className="mt-2 text-[0.9rem] leading-relaxed text-brand-muted">{value.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand home={pages.home} />
    </>
  );
}
