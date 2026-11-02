import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { getDraftBundle, getPublishStatus } from "@/lib/content/store";
import { requireStaffSession } from "@/lib/auth";
import { flyerTypeOptions } from "@/lib/content/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Draft preview",
  robots: { index: false, follow: false },
};

function formatDate(value: string | null): string {
  if (!value) return "never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "never";
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Draft preview.
 *
 * Renders exactly the content that would go live on the next publish, including
 * unpublished edits. It lives in the admin area behind the staff session rather
 * than as a `?preview=1` flag on the public pages: a query flag would let anyone
 * read unpublished content, and keeping it here means the public pages stay
 * static and cacheable.
 */
export default async function AdminPreviewPage() {
  await requireStaffSession();
  const [drafts, status] = await Promise.all([getDraftBundle(), getPublishStatus()]);
  const pending = status.hasUnpublishedChanges;
  const flyerTypes = flyerTypeOptions(drafts.services);

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-[clamp(1.5rem,3.4vw,2rem)] font-extrabold tracking-[-0.03em] text-brand-primary">
            Draft preview
          </h1>
          <p className="mt-2 max-w-2xl text-[0.88rem] leading-relaxed text-brand-muted">
            Everything below is exactly what the site will show after you press Publish. Unpublished
            documents:{" "}
            <strong className="font-semibold text-brand-primary">
              {pending ? status.hasUnpublishedChanges.join(", ") : "none"}
            </strong>
            . Last published {formatDate(status.publishedAt)}.
          </p>
        </div>
        <Link
          href="/"
          className="rounded-[2px] border border-brand-line px-3 py-2 text-[0.78rem] font-semibold text-brand-primary hover:border-brand-primary"
        >
          Open live site ↗
        </Link>
      </header>

      <div className="space-y-8">
        {/* ------------------------------- Home ------------------------------- */}
        <section
          aria-labelledby="preview-home"
          className="rounded-[3px] border border-brand-line bg-brand-surface p-6 md:p-8"
        >
          <h2 id="preview-home" className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-brand-muted">
            Home
          </h2>
          <p className="mt-3 text-[0.8rem] font-semibold text-brand-accent-strong">
            {drafts.pages.home.heroEyebrow}
          </p>
          <p className="mt-2 font-heading text-3xl font-extrabold leading-tight tracking-[-0.03em] text-brand-primary">
            {drafts.pages.home.heroTitle}{" "}
            <span className="text-brand-accent">{drafts.pages.home.heroHighlight}</span>
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-brand-muted">
            {drafts.pages.home.heroSubtitle}
          </p>
          <Image
            src="/images/hero-flyers.jpg"
            alt={drafts.pages.home.heroImageAlt}
            width={1200}
            height={1200}
            className="mt-5 h-40 w-auto rounded-[2px] border border-brand-line object-cover"
          />
        </section>

        {/* ----------------------------- Portfolio ---------------------------- */}
        <section
          aria-labelledby="preview-portfolio"
          className="rounded-[3px] border border-brand-line bg-brand-surface p-6 md:p-8"
        >
          <h2
            id="preview-portfolio"
            className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-brand-muted"
          >
            Portfolio ({drafts.portfolio.length})
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {drafts.portfolio.map((item) => (
              <li key={item.id} className="rounded-[2px] border border-brand-line p-3">
                {/* eslint-disable-next-line @next/next/no-img-element -- preview only, any URL */}
                <img
                  src={item.image}
                  alt=""
                  className="aspect-[3/4] w-full rounded-[2px] object-cover"
                  loading="lazy"
                />
                <p className="mt-2 text-[0.8rem] font-semibold text-brand-primary">{item.title || "Untitled"}</p>
                <p className="text-[0.7rem] uppercase tracking-[0.1em] text-brand-muted">
                  {item.flyerType}
                </p>
                <p className="mt-1 text-[0.75rem] leading-relaxed text-brand-muted">{item.description}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ------------------------------ Services ---------------------------- */}
        <section
          aria-labelledby="preview-services"
          className="rounded-[3px] border border-brand-line bg-brand-surface p-6 md:p-8"
        >
          <h2
            id="preview-services"
            className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-brand-muted"
          >
            Services ({drafts.services.length} · {flyerTypes.length} flyer types)
          </h2>
          <ul className="mt-4 space-y-3">
            {drafts.services.map((service) => (
              <li key={service.id} className="border-t border-brand-line pt-3 first:border-0 first:pt-0">
                <p className="font-heading text-base font-bold text-brand-primary">{service.name}</p>
                <p className="mt-1 text-[0.82rem] leading-relaxed text-brand-muted">
                  {service.description}
                </p>
                <p className="mt-1.5 text-[0.72rem] text-brand-primary/70">
                  {service.flyerTypes.join(" · ")}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* --------------------------- Copy + extras -------------------------- */}
        <section
          aria-labelledby="preview-copy"
          className="rounded-[3px] border border-brand-line bg-brand-surface p-6 md:p-8"
        >
          <h2
            id="preview-copy"
            className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-brand-muted"
          >
            Page copy
          </h2>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            <div>
              <h3 className="text-[0.78rem] font-semibold text-brand-primary">About</h3>
              <p className="mt-1 text-[0.8rem] leading-relaxed text-brand-muted">
                {drafts.pages.about.intro}
              </p>
            </div>
            <div>
              <h3 className="text-[0.78rem] font-semibold text-brand-primary">Contact</h3>
              <p className="mt-1 text-[0.8rem] leading-relaxed text-brand-muted">
                {drafts.pages.contact.intro}
              </p>
              <p className="mt-2 text-[0.75rem] text-brand-primary/70">
                {drafts.pages.contact.email} · {drafts.pages.contact.phone}
              </p>
            </div>
            <div>
              <h3 className="text-[0.78rem] font-semibold text-brand-primary">
                Testimonials ({drafts.pages.testimonials.length})
              </h3>
              <ul className="mt-1 space-y-2">
                {drafts.pages.testimonials.map((item, index) => (
                  <li key={index} className="text-[0.78rem] leading-relaxed text-brand-muted">
                    “{item.quote}” — <span className="font-semibold text-brand-primary">{item.name}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-[0.78rem] font-semibold text-brand-primary">
                FAQ ({drafts.pages.faq.length})
              </h3>
              <ul className="mt-1 space-y-2">
                {drafts.pages.faq.map((item, index) => (
                  <li key={index} className="text-[0.78rem] leading-relaxed text-brand-muted">
                    <span className="font-semibold text-brand-primary">{item.question}</span> — {item.answer}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
