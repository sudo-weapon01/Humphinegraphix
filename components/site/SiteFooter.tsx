import Link from "next/link";
import type { SitePages } from "@/lib/content/types";
import { NAV_LINKS } from "@/lib/site";
import { WhatsAppButton } from "./WhatsAppButton";
import { Wordmark } from "./Wordmark";

export function SiteFooter({ pages }: { pages: SitePages }) {
  const { contact, footer } = pages;
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 bg-brand-primary text-brand-paper">
      <div className="container-page py-14 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Wordmark tone="light" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-brand-paper/70">
              {footer.tagline}
            </p>
            <p className="mt-6 font-heading text-[clamp(1.6rem,4vw,2.4rem)] font-extrabold leading-[0.95] tracking-[-0.03em] text-brand-paper/15">
              Humphinegraphix
            </p>
          </div>

          <nav aria-label="Footer">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-gold">
              Pages
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link className="text-brand-paper/75 transition-colors hover:text-brand-paper" href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link className="text-brand-paper/75 transition-colors hover:text-brand-paper" href="/privacy">
                  Privacy
                </Link>
              </li>
              <li>
                <Link className="text-brand-paper/75 transition-colors hover:text-brand-paper" href="/admin">
                  Studio sign in
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-gold">
              Get in touch
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm text-brand-paper/75">
              <li>
                <a className="transition-colors hover:text-brand-paper" href={`mailto:${contact.email}`}>
                  {contact.email}
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-brand-paper" href={`tel:${contact.phone.replace(/\s+/g, "")}`}>
                  {contact.phone}
                </a>
              </li>
              <li className="max-w-[16rem] leading-relaxed">{contact.address}</li>
              <li>{contact.hours}</li>
            </ul>
            <div className="mt-5">
              <WhatsAppButton source="footer" variant="ghost" />
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-brand-paper/15 pt-6 text-xs text-brand-paper/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Humphinegraphix. All rights reserved.</p>
          <p>
            <Link href="/privacy" className="underline underline-offset-4 hover:text-brand-paper">
              Privacy notice
            </Link>
          </p>
          <p>Flyer design studio · {contact.socialLabel}</p>
        </div>
      </div>
    </footer>
  );
}
