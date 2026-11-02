import type { FaqItem } from "@/lib/content/types";
import { SectionHeading } from "./SectionHeading";

/**
 * Frequently asked questions.
 *
 * Uses native <details>/<summary>: keyboard-operable and screen-reader friendly
 * with no JavaScript, and the answers stay in the DOM for search engines.
 */
export function FaqList({
  items,
  eyebrow = "Questions",
  title = "Before you ask",
  intro,
}: {
  items: FaqItem[];
  eyebrow?: string;
  title?: string;
  intro?: string;
}) {
  const usable = items.filter((item) => item.question.trim() && item.answer.trim());
  if (usable.length === 0) return null;

  return (
    <section aria-labelledby="faq-heading" className="container-page py-16 md:py-20">
      <SectionHeading id="faq-heading" eyebrow={eyebrow} title={title} intro={intro} />

      <div className="mt-9 max-w-3xl divide-y divide-brand-line border-y border-brand-line">
        {usable.map((item, index) => (
          <details key={`${item.question}-${index}`} className="group py-1">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-4 text-left">
              <span className="font-heading text-[1.02rem] font-bold tracking-[-0.01em] text-brand-primary">
                {item.question}
              </span>
              <span
                aria-hidden="true"
                className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-brand-line text-brand-primary transition-transform duration-200 group-open:rotate-45"
              >
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
              </span>
            </summary>
            <p className="max-w-2xl pb-5 pr-8 text-[0.925rem] leading-relaxed text-brand-muted">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
