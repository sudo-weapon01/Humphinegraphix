import { SectionHeading } from "./SectionHeading";

/**
 * "What you get" — the deliverables, shown as visual blocks rather than a
 * paragraph, so the value is legible at a glance. No prices appear here.
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
      icon: (
        <path d="M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6" strokeLinecap="round" strokeLinejoin="round" />
      ),
      title: "Print-ready PDF",
      body: "CMYK artwork at 300 dpi with bleed and crop marks — the file your printer actually wants.",
    },
    {
      icon: <path d="M4 5h16v11H4zM9 20h6M12 16v4" strokeLinecap="round" strokeLinejoin="round" />,
      title: "Social crops",
      body: "Square and vertical PNG/JPG exports sized for Instagram, WhatsApp status, and Facebook.",
    },
    {
      icon: <path d="M12 4v6m0 4v6M8 8h8M7 14h10" strokeLinecap="round" />,
      title: "Editable text proof",
      body: "A final proof with the wording locked in, so you can reuse the layout next season.",
    },
    {
      icon: <path d="M12 3l3 6 6 1-4.5 4.5L18 21l-6-3-6 3 1.5-6.5L3 10l6-1z" strokeLinejoin="round" />,
      title: "One revision round",
      body: "Swap a date, tighten a headline, adjust the photo — included before final export.",
    },
  ];

  return (
    <section aria-labelledby="whatyouget-heading" className="container-page py-16 md:py-20">
      <SectionHeading id="whatyouget-heading" eyebrow={eyebrow} title={title} intro={intro} />

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {blocks.map((block, index) => (
          <li
            key={block.title}
            className="flex flex-col rounded-[3px] border border-brand-line bg-brand-surface p-6"
          >
            <span
              aria-hidden="true"
              className="grid h-11 w-11 place-items-center rounded-[3px] bg-brand-accent-soft text-brand-accent-strong"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                {block.icon}
              </svg>
            </span>
            <h3 className="mt-4 font-heading text-base font-bold tracking-[-0.015em] text-brand-primary">
              <span className="mr-1.5 tabular-nums text-brand-accent-strong" aria-hidden="true">
                0{index + 1}
              </span>
              {block.title}
            </h3>
            <p className="mt-2 text-[0.875rem] leading-relaxed text-brand-muted">{block.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
