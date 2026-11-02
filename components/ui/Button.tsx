import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "accent" | "outline" | "light" | "quiet" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[2px] font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary: "bg-brand-primary text-brand-paper hover:bg-brand-primary-soft",
  accent: "bg-brand-accent text-white hover:bg-[#c4551f]",
  outline:
    "border border-brand-primary/25 bg-transparent text-brand-primary hover:border-brand-primary hover:bg-brand-primary hover:text-brand-paper",
  light: "bg-brand-paper text-brand-primary hover:bg-white",
  quiet: "bg-brand-paper-deep text-brand-primary hover:bg-brand-line",
  ghost: "border border-brand-paper/30 bg-transparent text-brand-paper hover:bg-brand-paper/10",
};

const sizes: Record<Size, string> = {
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-[0.95rem]",
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
