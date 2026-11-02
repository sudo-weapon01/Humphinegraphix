/** Static, non-editable site configuration. */

// PLACEHOLDER_SITE_URL — used for canonical URLs, sitemap, and metadata.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://humphinegraphix.com";

export const SITE_NAME = "Humphinegraphix";
export const SITE_TAGLINE = "Flyer design studio";

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const ADMIN_URL = "/admin";
export const QUOTE_URL = "/contact";

/** Design facts shown on the home page — edit if the studio's terms change. */
export const STUDIO_FACTS = [
  { value: "3–5 days", label: "Standard turnaround" },
  { value: "Print + social", label: "Files for every format" },
  { value: "One round", label: "Of revisions included" },
] as const;

export const PROCESS_STEPS = [
  {
    title: "Tell us the basics",
    body: "Send the quote form with what the flyer is for, your date, and a budget range. Two minutes, no account needed.",
  },
  {
    title: "We confirm the brief",
    body: "You get a reply with the approach, the full quote, and a delivery date. You approve it in writing before any design starts.",
  },
  {
    title: "We design the flyer",
    body: "You receive a first proof to review, with one revision round included to tighten the wording or the layout.",
  },
  {
    title: "You get the files",
    body: "Final print-ready PDF with bleed, plus PNG/JPG crops for social and messaging. Ready to send straight to your printer.",
  },
] as const;

export const AUDIENCE_CARDS = [
  {
    title: "Small businesses",
    body: "Opening a shop, launching a service, or running a promotion? Get a flyer that makes a small budget look deliberate — and tells people exactly where to find you.",
    points: ["Openings & promotions", "Service announcements", "Neighbourhood distribution"],
    audience: "business" as const,
  },
  {
    title: "Event organizers",
    body: "Concerts, markets, conferences, fundraisers. Your flyer needs to carry a date, a venue, and a reason to show up — with nothing lost at phone-screen size.",
    points: ["Date & venue that read instantly", "Print and social versions", "Fast turnaround before the date"],
    audience: "event" as const,
  },
  {
    title: "Individuals",
    body: "Birthdays, graduations, weddings, memorials, community notices. Considered design for the moments you are inviting people to share.",
    points: ["Celebrations & invitations", "Memorial & community notices", "Friendly, personal design"],
    audience: "personal" as const,
  },
] as const;
