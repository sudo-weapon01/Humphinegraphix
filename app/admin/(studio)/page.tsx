import Link from "next/link";
import { getDraftBundle, getPublishStatus } from "@/lib/content/store";
import { listQuoteRequests } from "@/lib/enquiries";
import { flyerTypeOptions } from "@/lib/content/types";
import { ButtonLink } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

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

export default async function AdminOverviewPage() {
  const [drafts, status] = await Promise.all([getDraftBundle(), getPublishStatus()]);
  const enquiries = await listQuoteRequests(5);
  const pending = status.hasUnpublishedChanges;

  const cards = [
    {
      href: "/admin/portfolio",
      label: "Portfolio",
      value: `${drafts.portfolio.length} item${drafts.portfolio.length === 1 ? "" : "s"}`,
      detail: "Images, titles, flyer types, and descriptions.",
    },
    {
      href: "/admin/services",
      label: "Services",
      value: `${drafts.services.length} service${drafts.services.length === 1 ? "" : "s"}`,
      detail: `${flyerTypeOptions(drafts.services).length} flyer types feed the quote form.`,
    },
    {
      href: "/admin/pages",
      label: "Page copy",
      value: "6 sections",
      detail: "Headlines, body copy, and contact details.",
    },
    {
      href: "/admin/enquiries",
      label: "Quote requests",
      value: `${enquiries.length}${enquiries.length === 5 ? "+" : ""}`,
      detail: "Read-only list of incoming leads.",
    },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-heading text-[clamp(1.6rem,3.6vw,2.2rem)] font-extrabold tracking-[-0.03em] text-brand-primary">
          Studio content
        </h1>
        <p className="mt-2 max-w-2xl text-[0.9rem] leading-relaxed text-brand-muted">
          Edit the copy and work shown on the public site. Changes save as drafts and go live only
          when you publish.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-[3px] border border-brand-line bg-brand-surface p-5 transition-shadow hover:shadow-card"
          >
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-brand-muted">
              {card.label}
            </p>
            <p className="mt-2 font-heading text-2xl font-extrabold tracking-[-0.03em] text-brand-primary">
              {card.value}
            </p>
            <p className="mt-2 text-[0.78rem] leading-relaxed text-brand-muted">{card.detail}</p>
            <span className="mt-4 inline-block text-[0.78rem] font-semibold text-brand-accent-strong group-hover:underline">
              Open →
            </span>
          </Link>
        ))}
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[3px] border border-brand-line bg-brand-surface p-6">
          <h2 className="font-heading text-lg font-bold tracking-[-0.02em] text-brand-primary">
            Publishing
          </h2>
          <dl className="mt-4 space-y-3 text-[0.85rem]">
            <div className="flex justify-between gap-4">
              <dt className="text-brand-muted">Status</dt>
              <dd className="text-right font-semibold text-brand-primary">
                {pending ? `Unpublished: ${status.hasUnpublishedChanges.join(", ")}` : "All published"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-brand-muted">Last published</dt>
              <dd className="text-right text-brand-primary">{formatDate(status.publishedAt)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-brand-muted">Last draft saved</dt>
              <dd className="text-right text-brand-primary">{formatDate(status.updatedAt)}</dd>
            </div>
          </dl>
          <p className="mt-4 border-t border-brand-line pt-4 text-[0.78rem] leading-relaxed text-brand-muted">
            Publishing refreshes the public pages straight away — no redeploy, no developer needed.
          </p>
        </div>

        <div className="rounded-[3px] border border-brand-line bg-brand-surface p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-lg font-bold tracking-[-0.02em] text-brand-primary">
              Latest quote requests
            </h2>
            <ButtonLink href="/admin/enquiries" variant="quiet">
              View all
            </ButtonLink>
          </div>
          {enquiries.length === 0 ? (
            <p className="mt-4 text-[0.85rem] text-brand-muted">
              No quote requests yet. Submissions from the contact form appear here.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {enquiries.slice(0, 5).map((enquiry) => (
                <li key={enquiry.id} className="border-b border-brand-line pb-2 last:border-0">
                  <p className="text-[0.85rem] font-semibold text-brand-primary">
                    {enquiry.name} · {enquiry.flyerType}
                  </p>
                  <p className="text-[0.75rem] text-brand-muted">
                    {formatDate(enquiry.submittedAt)} · {enquiry.budgetRange}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="rounded-[3px] border border-dashed border-brand-line bg-brand-paper-deep/60 p-5 text-[0.8rem] leading-relaxed text-brand-muted">
        <strong className="text-brand-primary">Placeholders to replace:</strong> brand colours and
        fonts live in <code>app/globals.css</code>; contact details are edited in{" "}
        <Link href="/admin/pages" className="font-semibold text-brand-primary underline underline-offset-2">
          Page copy → Contact
        </Link>
        ; budget ranges are defined in <code>lib/quote.ts</code>.
      </section>
    </div>
  );
}
