"use client";

import { ContentNode } from "./ContentNode";
import { SaveBar } from "./SaveBar";
import { useDraftEditor } from "./useDraftEditor";
import { defaultPages } from "@/lib/content/defaults";
import type { SitePages } from "@/lib/content/types";
import { setAtPath } from "@/lib/content/path";

const SECTION_LABELS: Record<keyof SitePages, string> = {
  home: "Home page",
  services: "Services page",
  portfolio: "Portfolio page",
  about: "About page",
  contact: "Contact page & details",
  privacy: "Privacy notice",
  testimonials: "Client testimonials",
  faq: "FAQ",
  footer: "Footer",
};

const SECTION_HINTS: Partial<Record<keyof SitePages, string>> = {
  contact: "Email, phone, and address are placeholder values until the studio supplies the real ones.",
  home: "The hero headline and call-to-action labels for the front page.",
  testimonials: "Shown on the home page. Replace the placeholder client names with real, permitted quotes.",
  faq: "Shown on the Services and Contact pages. Keep answers honest about turnaround and what is included.",
  privacy: "A plain-language notice. Have it checked against Ghana's Data Protection Act before launch.",
};

export function PagesEditor({ initial }: { initial: SitePages }) {
  const editor = useDraftEditor<SitePages>("pages", initial, defaultPages);
  const sections = Object.keys(editor.value) as (keyof SitePages)[];

  return (
    <div>
      <SaveBar
        dirty={editor.dirty}
        saving={editor.saving}
        errorCount={Object.keys(editor.errors).length}
        message={editor.message}
        onSave={() => void editor.save()}
        onReset={editor.reset}
      />

      <div className="space-y-10">
        {sections.map((section) => (
          <section
            key={section}
            aria-labelledby={`section-${section}`}
            className="rounded-none border border-brand-line bg-brand-surface p-5 md:p-6"
          >
            <header className="mb-5 border-b border-brand-line pb-3">
              <h2
                id={`section-${section}`}
                className="font-heading text-lg font-bold tracking-[-0.02em] text-brand-primary"
              >
                {SECTION_LABELS[section]}
              </h2>
              {SECTION_HINTS[section] ? (
                <p className="mt-1 text-[0.78rem] text-brand-muted">{SECTION_HINTS[section]}</p>
              ) : null}
            </header>
            <div className="grid gap-4 sm:grid-cols-2">
              <ContentNode
                path={section}
                value={editor.value[section]}
                errors={editor.errors}
                onChange={(path, value) => editor.setValue((current) => setAtPath(current, path, value))}
              />
            </div>
          </section>
        ))}
      </div>

      <div className="mt-8 rounded-none border border-dashed border-brand-line p-5 text-[0.8rem] leading-relaxed text-brand-muted">
        Changes are saved as a <strong className="text-brand-primary">draft</strong> and stay off the
        public site until you press <strong className="text-brand-primary">Publish</strong> in the
        bar at the top of the admin area.
      </div>
    </div>
  );
}
