import type { Metadata } from "next";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { getSiteContent } from "@/lib/content/public";
import { flyerTypeOptions } from "@/lib/content/types";

export const metadata: Metadata = {
  title: "Contact & quote request",
  description:
    "Request a flyer design quote from Humphinegraphix. Tell us about your flyer, your date, and your budget range — we reply within one working day.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const { pages, services } = await getSiteContent();
  const { contact } = pages;
  const flyerTypes = flyerTypeOptions(services);

  return (
    <>
      <header className="border-b border-brand-line bg-brand-surface/60">
        <div className="container-page py-14 md:py-20">
          <p className="eyebrow">Contact</p>
          <h1 className="mt-4 max-w-3xl font-heading text-[clamp(2.1rem,5.4vw,3.6rem)] font-extrabold leading-[1.0] tracking-[-0.04em] text-brand-primary">
            {contact.title}
          </h1>
          <p className="mt-5 max-w-2xl text-[1rem] leading-relaxed text-brand-muted">
            {contact.intro}
          </p>
        </div>
      </header>

      <div className="container-page grid gap-10 py-14 md:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <aside aria-label="Studio contact details" className="space-y-6">
          <div className="rounded-[3px] border border-brand-line bg-brand-paper-deep p-6 md:p-7">
            <h2 className="font-heading text-lg font-bold tracking-[-0.02em] text-brand-primary">
              Studio details
            </h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-brand-muted">
                  Email
                </dt>
                <dd className="mt-1">
                  <a
                    href={`mailto:${contact.email}`}
                    className="font-medium text-brand-primary underline decoration-brand-accent decoration-2 underline-offset-4 hover:text-brand-accent-strong"
                  >
                    {contact.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-brand-muted">
                  Phone
                </dt>
                <dd className="mt-1">
                  <a
                    href={`tel:${contact.phone.replace(/\s+/g, "")}`}
                    className="font-medium text-brand-primary hover:text-brand-accent-strong"
                  >
                    {contact.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-brand-muted">
                  Studio
                </dt>
                <dd className="mt-1 leading-relaxed text-brand-primary/85">{contact.address}</dd>
              </div>
              <div>
                <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-brand-muted">
                  Hours
                </dt>
                <dd className="mt-1 text-brand-primary/85">{contact.hours}</dd>
              </div>
              <div>
                <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-brand-muted">
                  Social
                </dt>
                <dd className="mt-1">
                  <a
                    href={contact.socialUrl}
                    className="font-medium text-brand-primary hover:text-brand-accent-strong"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {contact.socialLabel}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-[3px] border border-brand-line bg-brand-surface p-6">
            <h2 className="font-heading text-base font-bold tracking-[-0.02em] text-brand-primary">
              What happens next
            </h2>
            <ol className="mt-4 space-y-3 text-sm text-brand-muted">
              {[
                "We read your brief and check the deadline.",
                "You get a reply with a fixed quote and delivery date.",
                "You approve, we design, you get print-ready files.",
              ].map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="font-heading text-xs font-bold tabular-nums text-brand-accent-strong">
                    0{index + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-5 border-t border-brand-line pt-4 text-[0.78rem] leading-relaxed text-brand-muted">
              This site collects quote requests only. There is no pricing table, no cart, and no
              online payment — your quote comes by email.
            </p>
          </div>
        </aside>

        <div>
          <QuoteForm flyerTypes={flyerTypes} copy={contact} />
        </div>
      </div>
    </>
  );
}
