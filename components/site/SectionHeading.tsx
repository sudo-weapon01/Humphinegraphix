import type { ReactNode } from "react";

type SectionHeadingProps = {
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  intro?: string;
  align?: "left" | "center";
  action?: ReactNode;
  tone?: "dark" | "light";
};

export function SectionHeading({
  id,
  eyebrow,
  title,
  intro,
  align = "left",
  action,
  tone = "dark",
}: SectionHeadingProps) {
  const centered = align === "center";
  return (
    <div
      className={`flex flex-col gap-5 ${
        centered ? "items-center text-center" : "md:flex-row md:items-end md:justify-between"
      }`}
    >
      <div className={centered ? "max-w-2xl" : "max-w-2xl"}>
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h2
          id={id}
          className={`mt-3 font-heading text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold leading-[1.05] tracking-[-0.03em] ${
            tone === "light" ? "text-brand-paper" : "text-brand-primary"
          }`}
        >
          {title}
        </h2>
        {intro ? (
          <p
            className={`mt-4 text-[0.975rem] leading-relaxed ${
              tone === "light" ? "text-brand-paper/70" : "text-brand-muted"
            }`}
          >
            {intro}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
