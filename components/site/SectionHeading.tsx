import type { ReactNode } from "react";

type SectionHeadingProps = {
  id?: string;
  eyebrow?: string;
  index?: string;
  title: ReactNode;
  intro?: string;
  align?: "left" | "center";
  action?: ReactNode;
  tone?: "dark" | "light";
};

/**
 * Editorial section heading: a mono index, a hairline, then a poster-scale
 * headline. The rule across the top is what gives each block its printed-page
 * structure.
 */
export function SectionHeading({
  id,
  eyebrow,
  index,
  title,
  intro,
  align = "left",
  action,
  tone = "dark",
}: SectionHeadingProps) {
  const centered = align === "center";
  const ruleColor = tone === "light" ? "border-brand-paper/25" : "border-brand-line";

  return (
    <div className={`border-t ${ruleColor} pt-5`}>
      <div
        className={`flex flex-col gap-5 ${
          centered ? "items-center text-center" : "md:flex-row md:items-start md:justify-between"
        }`}
      >
        <div className="max-w-3xl">
          <div className={`flex items-center gap-3 ${centered ? "justify-center" : ""}`}>
            {index ? (
              <span
                aria-hidden="true"
                className={`index ${tone === "light" ? "text-brand-gold" : "text-brand-accent-strong"}`}
              >
                {index}
              </span>
            ) : null}
            {eyebrow ? (
              <span
                className={`label ${tone === "light" ? "text-brand-paper/60" : "text-brand-muted"}`}
              >
                {eyebrow}
              </span>
            ) : null}
          </div>
          <h2
            id={id}
            className={`mt-4 display text-[clamp(1.9rem,4.6vw,3.4rem)] ${
              tone === "light" ? "text-brand-paper" : "text-brand-primary"
            }`}
          >
            {title}
          </h2>
          {intro ? (
            <p
              className={`mt-4 max-w-xl text-[0.975rem] leading-relaxed ${
                tone === "light" ? "text-brand-paper/70" : "text-brand-muted"
              }`}
            >
              {intro}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0 md:pt-1">{action}</div> : null}
      </div>
    </div>
  );
}
