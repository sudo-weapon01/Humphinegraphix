import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

type WordmarkProps = {
  tone?: "dark" | "light";
  className?: string;
};

/**
 * The brand name is spelled out in full wherever a logo would normally sit, so
 * "Humphinegraphix" stays the loudest word on every page. The mark is a squared
 * stamp — no rounding — with the name set tight against it.
 */
export function Wordmark({ tone = "dark", className = "" }: WordmarkProps) {
  const text = tone === "light" ? "text-brand-paper" : "text-brand-primary";
  const accent = tone === "light" ? "text-brand-gold" : "text-brand-accent-strong";

  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-3 ${text} ${className}`}
      aria-label={`${SITE_NAME} — home`}
    >
      <span
        aria-hidden="true"
        className="grid h-8 w-8 shrink-0 place-items-center bg-brand-accent font-heading text-[0.8rem] font-extrabold tracking-tight text-brand-primary transition-transform duration-300 group-hover:-rotate-6"
      >
        HG
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-heading text-[1.02rem] font-extrabold tracking-[-0.045em] sm:text-[1.15rem]">
          Humphine<span className={accent}>graphix</span>
        </span>
        <span
          className={`mt-1 font-mono text-[0.5rem] uppercase tracking-[0.24em] ${
            tone === "light" ? "text-brand-paper/70" : "text-brand-muted"
          }`}
        >
          Flyer design studio
        </span>
      </span>
    </Link>
  );
}
