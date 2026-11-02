"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/portfolio", label: "Portfolio" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/pages", label: "Page copy" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/preview", label: "Preview drafts" },
];

export function AdminNav({ user }: { user: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  return (
    <nav
      aria-label="Admin sections"
      className="container-page flex flex-wrap items-center justify-between gap-4 py-3"
    >
      <div className="flex flex-wrap items-center gap-1">
        {LINKS.map((link) => {
          const active =
            link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`rounded-[2px] px-3 py-1.5 text-[0.82rem] font-medium transition-colors ${
                active
                  ? "bg-brand-primary text-brand-paper"
                  : "text-brand-muted hover:bg-brand-paper-deep hover:text-brand-primary"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-3 text-[0.78rem]">
        <Link href="/" className="font-semibold text-brand-primary hover:text-brand-accent-strong" target="_blank">
          View site ↗
        </Link>
        <span className="hidden text-brand-muted sm:inline">Signed in as {user}</span>
        <button
          type="button"
          onClick={() => void signOut()}
          disabled={signingOut}
          className="rounded-[2px] border border-brand-line px-2.5 py-1.5 font-semibold text-brand-primary hover:bg-brand-paper-deep disabled:opacity-60"
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </nav>
  );
}
