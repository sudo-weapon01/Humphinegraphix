/**
 * Shared content types.
 *
 * The public site is rendered from "published" documents; the admin area edits
 * "draft" documents. Both are plain JSON objects so they can live in a single
 * `content_docs` table (or the local JSON fallback) without migrations per field.
 */

export const CONTENT_KEYS = ["pages", "services", "portfolio"] as const;
export type ContentKey = (typeof CONTENT_KEYS)[number];

export type ValuePair = {
  title: string;
  body: string;
};

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type SitePages = {
  home: {
    heroEyebrow: string;
    heroTitle: string;
    heroHighlight: string;
    heroSubtitle: string;
    heroPrimaryCta: string;
    heroSecondaryCta: string;
    heroImageAlt: string;
    audiencesTitle: string;
    audiencesIntro: string;
    processTitle: string;
    processIntro: string;
    featuredTitle: string;
    featuredIntro: string;
    ctaTitle: string;
    ctaBody: string;
    ctaLabel: string;
  };
  services: {
    title: string;
    intro: string;
    turnaroundNote: string;
    closingTitle: string;
    closingBody: string;
  };
  portfolio: {
    title: string;
    intro: string;
    emptyState: string;
  };
  about: {
    title: string;
    intro: string;
    storyTitle: string;
    storyParagraphs: string[];
    values: ValuePair[];
    studioNote: string;
  };
  contact: {
    title: string;
    intro: string;
    formTitle: string;
    formNote: string;
    successTitle: string;
    successBody: string;
    email: string;
    phone: string;
    address: string;
    hours: string;
    socialLabel: string;
    socialUrl: string;
  };
  privacy: {
    title: string;
    intro: string;
    updated: string;
    sections: ValuePair[];
  };
  testimonials: Testimonial[];
  faq: FaqItem[];
  footer: {
    tagline: string;
  };
};

export type Service = {
  id: string;
  name: string;
  description: string;
  /** Flyer types offered for this service — also feeds the quote form dropdown. */
  flyerTypes: string[];
};

export type PortfolioItem = {
  id: string;
  title: string;
  flyerType: string;
  description: string;
  /** Path under /public or an absolute https URL. */
  image: string;
  imageAlt: string;
};

export type ContentBundle = {
  pages: SitePages;
  services: Service[];
  portfolio: PortfolioItem[];
};

export type ContentDoc<T> = {
  key: ContentKey;
  draft: T;
  published: T;
  updatedAt: string;
  publishedAt: string | null;
};

export type PublishStatus = {
  storage: "supabase" | "files";
  hasUnpublishedChanges: ContentKey[];
  updatedAt: string | null;
  publishedAt: string | null;
};

/** Collected from every service so the quote dropdown always matches Services. */
export function flyerTypeOptions(services: Service[]): string[] {
  const seen = new Set<string>();
  for (const service of services) {
    for (const type of service.flyerTypes) {
      const trimmed = type.trim();
      if (trimmed) seen.add(trimmed);
    }
  }
  return [...seen];
}

export function isContentKey(value: unknown): value is ContentKey {
  return typeof value === "string" && (CONTENT_KEYS as readonly string[]).includes(value);
}
