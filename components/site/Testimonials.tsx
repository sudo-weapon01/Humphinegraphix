import type { Testimonial } from "@/lib/content/types";
import { SectionHeading } from "./SectionHeading";

/**
 * Client quotes.
 *
 * Rendered as semantic blockquotes with <cite>. Content is edited in the admin
 * area (pages → testimonials); the defaults ship marked PLACEHOLDER so the
 * studio replaces them with real, permission-granted quotes before launch.
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
      className={`border-y border-brand-line ${tone === "surface" ? "bg-brand-surface/60" : "bg-brand-paper-deep/50"}`}
    >
      <div className="container-page py-16 md:py-20">
        <SectionHeading id="testimonials-heading" eyebrow={eyebrow} title={title} intro={intro} />

        <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {usable.map((item, index) => (
            <li key={`${item.name}-${index}`}>
              <figure className="flex h-full flex-col rounded-[3px] border border-brand-line bg-brand-surface p-6">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-6 w-6 fill-brand-accent/30"
                  focusable="false"
                >
                  <path d="M9.5 5C6.5 6.6 5 9 5 12v7h6v-7H8c0-2 .5-3.4 2.6-4.6L9.5 5Zm9 0C15.5 6.6 14 9 14 12v7h6v-7h-3c0-2 .5-3.4 2.6-4.6L18.5 5Z" />
                </svg>
                <blockquote className="mt-4 flex-1">
                  <p className="text-[0.95rem] leading-relaxed text-brand-primary/85">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </blockquote>
                <figcaption className="mt-5 border-t border-brand-line pt-4 text-sm">
                  <cite className="font-heading font-bold not-italic text-brand-primary">
                    {item.name}
                  </cite>
                  {item.role ? (
                    <span className="mt-0.5 block text-[0.78rem] text-brand-muted">{item.role}</span>
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
