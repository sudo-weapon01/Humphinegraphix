import Link from "next/link";
import type { SitePages } from "@/lib/content/types";
import { NAV_LINKS, SITE_NAME } from "@/lib/site";
import { WhatsAppButton } from "./WhatsAppButton";
import { Wordmark } from "./Wordmark";

export function SiteFooter({ pages }: { pages: SitePages }) {
  const { contact, footer } = pages;
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 bg-brand-primary text-brand-paper">
      <div className="container-page pt-14 md:pt-20">
        <div className="grid gap-12 border-b border-brand-paper/15 pb-14 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Wordmark tone="light" />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-brand-paper/70">{footer.tagline}</p>
            <div className="mt-7">
              <WhatsAppButton source="footer" variant="ghost" />
            </div>
          </div>

          <nav aria-label="Footer">
            <h2 className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-brand-gold">Pages</h2>
            <ul className="mt-5 space-y-3 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link className="link-draw text-brand-paper/75 transition-colors hover:text-brand-paper" href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link className="link-draw text-brand-paper/75 transition-colors hover:text-brand-paper" href="/privacy">
                  Privacy
                </Link>
              </li>
              <li>
                <Link className="link-draw text-brand-paper/75 transition-colors hover:text-brand-paper" href="/admin">
                  Studio sign in
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-brand-gold">Get in touch</h2>
            <ul className="mt-5 space-y-3 text-sm text-brand-paper/75">
              <li>
                <a className="link-draw transition-colors hover:text-brand-paper" href={`mailto:${contact.email}`}>
                  {contact.email}
                </a>
              </li>
              <li>
                <a
                  className="link-draw transition-colors hover:text-brand-paper"
                  href={`tel:${contact.phone.replace(/\s+/g, "")}`}
                >
                  {contact.phone}
                </a>
              </li>
              <li className="max-w-[16rem] leading-relaxed">{contact.address}</li>
              <li className="leading-relaxed">{contact.hours}</li>
            </ul>
          </div>
        </div>

        {/* Oversized masthead: the last thing you see is the studio's name. */}
        <div aria-hidden="true" className="overflow-hidden py-8 md:py-10">
          <p className="display display-cond select-none text-center text-[clamp(2.6rem,13vw,11rem)] text-brand-paper/10">
            {SITE_NAME}
          </p>
        </div>

        <div className="flex flex-col gap-3 border-t border-brand-paper/15 py-6 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-brand-paper/65 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {SITE_NAME}
          </p>
          <p className="flex items-center gap-4">
            <Link href="/privacy" className="transition-colors hover:text-brand-paper">
              Privacy notice
            </Link>
            <span aria-hidden="true">·</span>
            <span>{contact.socialLabel}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
