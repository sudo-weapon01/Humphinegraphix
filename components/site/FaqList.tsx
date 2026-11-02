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
    <section aria-labelledby="faq-heading" className="container-page py-16 md:py-24">
      <SectionHeading id="faq-heading" index="06" eyebrow={eyebrow} title={title} intro={intro} />

      <div className="mt-10 border-t border-brand-line">
        {usable.map((item, index) => (
          <details key={`${item.question}-${index}`} className="group border-b border-brand-line">
            <summary className="flex cursor-pointer list-none items-start gap-4 py-5">
              <span aria-hidden="true" className="index mt-1.5 shrink-0 text-brand-line group-open:text-brand-accent-strong">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 font-heading text-[1.05rem] font-extrabold leading-snug tracking-[-0.025em] text-brand-primary">
                {item.question}
              </span>
              <span
                aria-hidden="true"
                className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center border border-brand-line text-brand-primary transition-colors group-hover:border-brand-primary group-open:border-brand-primary group-open:bg-brand-primary group-open:text-brand-paper"
              >
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path
                    d="M12 5v14M5 12h14"
                    strokeLinecap="round"
                    className="origin-center transition-transform duration-200 group-open:rotate-45"
                  />
                </svg>
              </span>
            </summary>
            <p className="max-w-2xl pb-6 pl-10 pr-8 text-[0.92rem] leading-relaxed text-brand-muted">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
