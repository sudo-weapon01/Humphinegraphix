import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

type WordmarkProps = {
  tone?: "dark" | "light";
  className?: string;
};

/**
 * The brand name is intentionally spelled out in full wherever the logo would
 * normally sit, so "Humphinegraphix" is the loudest word on every page.
 */
export function Wordmark({ tone = "dark", className = "" }: WordmarkProps) {
  const text = tone === "light" ? "text-brand-paper" : "text-brand-primary";
  const accent = tone === "light" ? "text-brand-gold" : "text-brand-accent";

  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 ${text} ${className}`}
      aria-label={`${SITE_NAME} — home`}
    >
      <span
        aria-hidden="true"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-[2px] bg-brand-accent font-heading text-[0.95rem] font-extrabold tracking-tight text-white transition-transform duration-300 group-hover:-rotate-3"
      >
        HG
      </span>
      <span className="font-heading text-[1.05rem] font-extrabold leading-none tracking-[-0.03em] sm:text-[1.15rem]">
        Humphine<span className={accent}>graphix</span>
      </span>
    </Link>
  );
}
