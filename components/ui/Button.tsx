import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "accent" | "outline" | "light" | "quiet" | "ghost";
type Size = "md" | "lg";

/*
 * Square, uppercase, widely tracked buttons — the studio's buttons read like a
 * stamped label rather than an app control.
 */
const base =
  "inline-flex items-center justify-center gap-2 border border-transparent rounded-none font-mono text-[0.7rem] font-medium uppercase tracking-[0.16em] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-brand-primary text-brand-paper hover:bg-brand-accent hover:text-brand-primary",
  accent: "bg-brand-accent text-brand-primary hover:bg-brand-accent-strong hover:text-white",
  outline:
    "border-brand-primary/25 bg-transparent text-brand-primary hover:border-brand-primary hover:bg-brand-primary hover:text-brand-paper",
  light: "bg-brand-paper text-brand-primary hover:bg-brand-accent hover:text-brand-primary",
  quiet: "bg-brand-paper-deep text-brand-primary hover:bg-brand-line",
  ghost: "border-brand-paper/30 bg-transparent text-brand-paper hover:bg-brand-paper hover:text-brand-primary",
};

const sizes: Record<Size, string> = {
  md: "px-4 py-2.5",
  lg: "px-6 py-4 text-[0.72rem]",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md") {
  return `${base} ${variants[variant]} ${sizes[size]}`;
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export function ButtonLink({ variant = "primary", size = "md", className = "", children, ...props }: ButtonLinkProps) {
  return (
    <Link className={`${buttonClasses(variant, size)} ${className}`} {...props}>
      {children}
    </Link>
  );
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
};

export function Button({ variant = "primary", size = "md", className = "", children, ...props }: ButtonProps) {
  return (
    <button className={`${buttonClasses(variant, size)} ${className}`} {...props}>
      {children}
    </button>
  );
}
