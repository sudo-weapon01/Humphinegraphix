import { SectionHeading } from "./SectionHeading";

/**
 * "What you get" — the deliverables, shown as a numbered file list rather than
 * paragraphs, so the value is legible at a glance. No prices appear here.
 */
export function WhatYouGet({
  eyebrow = "Deliverables",
  title = "What lands in your inbox",
  intro = "Every flyer project is delivered as a set of files you can send straight to a printer or post online.",
}: {
  eyebrow?: string;
  title?: string;
  intro?: string;
}) {
  const blocks = [
    {
      tag: "PDF",
      title: "Print-ready PDF",
      body: "CMYK artwork at 300 dpi with bleed and crop marks — the file your printer actually wants.",
    },
    {
      tag: "PNG",
      title: "Social crops",
      body: "Square and vertical exports sized for Instagram, WhatsApp status, and Facebook.",
    },
    {
      tag: "PROOF",
      title: "Final text proof",
      body: "A signed-off proof with the wording locked in, so you can reuse the layout next season.",
    },
    {
      tag: "EDIT",
      title: "One revision round",
      body: "Swap a date, tighten a headline, adjust the photo — included before final export.",
    },
  ];

  return (
    <section aria-labelledby="whatyouget-heading" className="container-page py-16 md:py-24">
      <SectionHeading id="whatyouget-heading" index="05" eyebrow={eyebrow} title={title} intro={intro} />

      <ul className="mt-12 grid border-t border-brand-line sm:grid-cols-2">
        {blocks.map((block, index) => (
          <li
            key={block.title}
            className="group border-b border-brand-line py-7 sm:px-7 sm:[&:nth-child(odd)]:border-r sm:[&:nth-child(odd)]:pl-0"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="index text-brand-accent-strong">{String(index + 1).padStart(2, "0")}</span>
              <span className="border border-brand-line px-2 py-1 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-brand-muted transition-colors group-hover:border-brand-primary group-hover:text-brand-primary">
                {block.tag}
              </span>
            </div>
            <h3 className="mt-5 font-heading text-[1.15rem] font-extrabold tracking-[-0.03em] text-brand-primary">
              {block.title}
            </h3>
            <p className="mt-2 max-w-sm text-[0.9rem] leading-relaxed text-brand-muted">{block.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
