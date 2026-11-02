import Link from "next/link";
import type { Metadata } from "next";
import { getSiteContent } from "@/lib/content/public";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy notice",
  description:
    "How Humphinegraphix handles the details you send through the quote request form: what is collected, why, how long it is kept, and how to have it removed.",
  path: "/privacy",
});

export default async function PrivacyPage() {
  const { pages } = await getSiteContent();
  const { privacy, contact } = pages;
  const sections = privacy.sections.filter((section) => section.title || section.body);

  return (
    <article className="container-page py-14 md:py-20">
      <nav aria-label="Breadcrumb" className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-brand-muted">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-brand-primary">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <span aria-current="page">Privacy</span>
          </li>
        </ol>
      </nav>

      <header className="mt-8 max-w-3xl border-t border-brand-line pt-6">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="index text-brand-accent-strong">
            06
          </span>
          <span className="label text-brand-muted">Legal</span>
        </div>
        <h1 className="mt-5 display text-[clamp(2.2rem,5.6vw,3.8rem)] text-brand-primary">
          {privacy.title}
        </h1>
        <p className="mt-5 text-[1rem] leading-relaxed text-brand-muted">{privacy.intro}</p>
        {privacy.updated ? (
          <p className="mt-5 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-brand-muted">
            Updated <span className="text-brand-primary">{privacy.updated}</span>
          </p>
        ) : null}
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[0.32fr_0.68fr]">
        <nav aria-label="Privacy sections" className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="label text-brand-muted">On this page</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {sections.map((section, index) => (
              <li key={`${section.title}-${index}`}>
                <a
                  href={`#section-${index + 1}`}
                  className="link-draw text-brand-primary/80 hover:text-brand-accent-strong"
                >
                  {section.title || `Section ${index + 1}`}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-9">
          {sections.map((section, index) => (
            <section
              key={`${section.title}-${index}`}
              id={`section-${index + 1}`}
              aria-labelledby={`section-${index + 1}-heading`}
              className="scroll-mt-24 border-t border-brand-line pt-6"
            >
              <h2
                id={`section-${index + 1}-heading`}
                className="font-heading text-[1.25rem] font-extrabold tracking-[-0.03em] text-brand-primary"
              >
                {section.title}
              </h2>
              {section.body.split("\n").map((paragraph, paragraphIndex) => (
                <p
                  key={paragraphIndex}
                  className="mt-3 text-[0.95rem] leading-relaxed text-brand-primary/80"
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}

          <section aria-labelledby="privacy-contact-heading" className="border-t border-brand-line pt-6">
            <h2
              id="privacy-contact-heading"
              className="font-heading text-[1.25rem] font-extrabold tracking-[-0.03em] text-brand-primary"
            >
              Questions or removal requests
            </h2>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-brand-primary/80">
              Email{" "}
              <a
                href={`mailto:${contact.email}`}
                className="font-medium underline decoration-brand-accent decoration-2 underline-offset-4 hover:text-brand-accent-strong"
              >
                {contact.email}
              </a>{" "}
              with the email address or name you used and the studio will delete your quote request.
            </p>
          </section>
        </div>
      </div>
    </article>
  );
}
