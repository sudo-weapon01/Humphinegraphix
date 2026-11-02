import { Fragment } from "react";

/**
 * Scrolling strip of studio capabilities.
 *
 * Purely decorative: the content is repeated and hidden from assistive tech, so
 * nothing is lost when the animation is off (reduced motion) or never runs.
 */
export function Marquee({
  items,
  tone = "ink",
}: {
  items: string[];
  tone?: "ink" | "paper";
}) {
  const strip = [...items, ...items];
  const styles =
    tone === "ink"
      ? "bg-brand-primary text-brand-paper border-y border-brand-primary"
      : "bg-brand-paper-deep text-brand-primary border-y border-brand-line";

  return (
    <div className={`overflow-hidden py-3 ${styles}`} aria-hidden="true">
      <div className="marquee-track">
        {[0, 1].map((copy) => (
          <Fragment key={copy}>
            {strip.map((item, index) => (
              <span
                key={`${copy}-${item}-${index}`}
                className="flex shrink-0 items-center gap-6 whitespace-nowrap pr-6 font-mono text-[0.66rem] uppercase tracking-[0.22em]"
              >
                {item}
                <span className="text-brand-accent">✳</span>
              </span>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
