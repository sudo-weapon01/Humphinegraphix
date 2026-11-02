import type { Metadata } from "next";
import Link from "next/link";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { PageHero } from "@/components/site/PageHero";
import { Testimonials } from "@/components/site/Testimonials";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { getSiteContent } from "@/lib/content/public";
import { flyerTypeOptions } from "@/lib/content/types";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact & quote request",
  description:
    "Request a flyer design quote from Humphinegraphix. Tell us about your flyer, your date, and your budget range — we reply within one working day.",
  path: "/contact",
});

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-brand-line py-4 last:border-0">
      <dt className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-brand-muted">{label}</dt>
      <dd className="mt-1.5 text-[0.92rem] leading-relaxed text-brand-primary/85">{children}</dd>
    </div>
  );
}

export default async function ContactPage() {
  const { pages, services } = await getSiteContent();
  const { contact } = pages;
  const flyerTypes = flyerTypeOptions(services);

  return (
    <>
      <PageHero index="05" label="Contact" title={contact.title} intro={contact.intro} />

      <div className="container-page grid gap-10 py-12 md:py-16 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
        <aside id="studio-details" aria-label="Studio contact details" className="scroll-mt-24 space-y-8">
          <div>
            <h2 className="label text-brand-muted">Studio details</h2>
            <dl className="mt-3 border-t border-brand-line">
              <Detail label="Email">
                <a
                  href={`mailto:${contact.email}`}
                  className="link-draw font-medium text-brand-primary hover:text-brand-accent-strong"
                >
                  {contact.email}
                </a>
              </Detail>
              <Detail label="Phone">
                <a
                  href={`tel:${contact.phone.replace(/\s+/g, "")}`}
                  className="link-draw font-medium text-brand-primary hover:text-brand-accent-strong"
                >
                  {contact.phone}
                </a>
              </Detail>
              <Detail label="Studio">{contact.address}</Detail>
              <Detail label="Hours">{contact.hours}</Detail>
              <Detail label="Social">
                <a
                  href={contact.socialUrl}
                  className="link-draw font-medium text-brand-primary hover:text-brand-accent-strong"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {contact.socialLabel}
                </a>
              </Detail>
            </dl>
          </div>

          <div className="border border-brand-line bg-brand-surface p-5">
            <h2 className="font-heading text-[1.02rem] font-extrabold tracking-[-0.02em] text-brand-primary">
              Prefer to chat?
            </h2>
            <p className="mt-2 text-[0.85rem] leading-relaxed text-brand-muted">
              Send a message on WhatsApp with your date and what the flyer is for — the studio replies
              during working hours.
            </p>
            <div className="mt-4">
              <WhatsAppButton source="contact-sidebar" label="Message on WhatsApp" variant="inline" />
            </div>
          </div>

          <div>
            <h2 className="label text-brand-muted">What happens next</h2>
            <ol className="mt-3 border-t border-brand-line">
              {[
                "We read your brief and check the deadline.",
                "You get a reply with a fixed quote and delivery date.",
                "You approve, we design, you get print-ready files.",
              ].map((step, index) => (
                <li key={step} className="flex gap-4 border-b border-brand-line py-3">
                  <span aria-hidden="true" className="index text-brand-accent-strong">
                    0{index + 1}
                  </span>
                  <span className="text-[0.85rem] leading-relaxed text-brand-primary/80">{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-5 text-[0.78rem] leading-relaxed text-brand-muted">
              This site collects quote requests only. There is no pricing table, no cart, and no
              online payment — your quote comes by email. We use the details you send to prepare that
              quote, as described in our{" "}
              <Link
                href="/privacy"
                className="font-semibold text-brand-primary underline decoration-brand-accent decoration-2 underline-offset-4"
              >
                privacy notice
              </Link>
              .
            </p>
          </div>
        </aside>

        <div>
          <QuoteForm flyerTypes={flyerTypes} copy={contact} />
        </div>
      </div>

      <Testimonials
        items={pages.testimonials.slice(0, 3)}
        tone="surface"
        eyebrow="Client feedback"
        title="People who sent the same form"
        intro="A few words from recent clients, so you know what to expect after you submit."
      />
    </>
  );
}
