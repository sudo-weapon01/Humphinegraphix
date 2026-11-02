import type { Testimonial } from "@/lib/content/types";
import { SectionHeading } from "./SectionHeading";

/**
 * Client quotes, set like pull-quotes in a printed brochure: oversized quote
 * glyph, hairline grid, name and role in mono.
 *
 * Content is edited in the admin area (pages → testimonials); the defaults ship
 * marked PLACEHOLDER so the studio replaces them with real, permission-granted
 * quotes before launch.
 */
export function Testimonials({
  items,
  eyebrow = "Client feedback",
  title = "What clients say",
  intro,
  tone = "paper",
}: {
  items: Testimonial[];
  eyebrow?: string;
  title?: string;
  intro?: string;
  tone?: "paper" | "surface";
}) {
  const usable = items.filter((item) => item.quote.trim().length > 0);
  if (usable.length === 0) return null;

  return (
    <section
      aria-labelledby="testimonials-heading"
      className={`border-b border-brand-line ${tone === "surface" ? "bg-brand-surface/70" : "bg-brand-paper"}`}
    >
      <div className="container-page py-16 md:py-24">
        <SectionHeading id="testimonials-heading" index="04" eyebrow={eyebrow} title={title} intro={intro} />

        <ul className="mt-12 grid border-t border-brand-line md:grid-cols-2 lg:grid-cols-3">
          {usable.map((item, index) => (
            <li
              key={`${item.name}-${index}`}
              className="border-b border-brand-line py-8 md:px-7 md:[&:not(:last-child)]:border-r"
            >
              <figure className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-3">
                  <span
                    aria-hidden="true"
                    className="font-heading text-[2.6rem] leading-[0.6] text-brand-accent"
                  >
                    &ldquo;
                  </span>
                  <span aria-hidden="true" className="index text-brand-line">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <blockquote className="mt-5 flex-1">
                  <p className="text-[0.95rem] leading-relaxed text-brand-primary/85">{item.quote}</p>
                </blockquote>
                <figcaption className="mt-6 border-t border-brand-line pt-4">
                  <cite className="font-heading text-[0.95rem] font-extrabold not-italic tracking-[-0.02em] text-brand-primary">
                    {item.name}
                  </cite>
                  {item.role ? (
                    <span className="mt-1 block font-mono text-[0.58rem] uppercase tracking-[0.16em] text-brand-muted">
                      {item.role}
                    </span>
                  ) : null}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
