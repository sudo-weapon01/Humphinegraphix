import type { ContentBundle, PortfolioItem, Service, SitePages } from "./types";

/**
 * Default content — the baseline the site ships with.
 *
 * Everything here is editable from the admin area once published, so this is
 * only the seed/first-publish state. Contact details below are placeholder
 * values and are marked as such.
 */

export const defaultPages: SitePages = {
  home: {
    heroEyebrow: "Flyer design studio",
    heroTitle: "Flyers that get read —",
    heroHighlight: "and get people through the door.",
    heroSubtitle:
      "Humphinegraphix designs bold, print-ready flyers for small businesses with something to launch, event organizers with a date to fill, and individuals with a moment worth celebrating. One clear design, delivered fast, made to look like you meant it.",
    heroPrimaryCta: "Request a quote",
    heroSecondaryCta: "See the work",
    heroImageAlt: "A set of printed Humphinegraphix flyer designs laid out on a warm paper surface",
    audiencesTitle: "One studio, three kinds of flyer",
    audiencesIntro:
      "Different clients, different deadlines, same standard: a flyer that looks considered and reads clearly from across the room.",
    processTitle: "From brief to print file in four steps",
    processIntro:
      "No drawn-out agency process. You tell us what the flyer is for, and we get on with the design.",
    featuredTitle: "Recent work",
    featuredIntro:
      "A selection of flyers designed for launches, events, and personal milestones. Every piece is built for both print and screen.",
    ctaTitle: "Tell us about your flyer",
    ctaBody:
      "Share the basics — what the flyer is for, your date, and your budget range — and we'll come back with a plan and a quote. No obligation, no sales calls.",
    ctaLabel: "Start a quote request",
  },
  services: {
    title: "Flyer design services",
    intro:
      "Humphinegraphix designs single flyers and short flyer sets, delivered as print-ready PDFs plus web-friendly image files. Every project includes layout, typography, imagery direction, and one round of revisions.",
    turnaroundNote:
      "Standard turnaround is 3–5 working days from approved brief. Need it sooner? Mention your date in your quote request and we'll tell you honestly whether it's possible.",
    closingTitle: "Not sure which flyer you need?",
    closingBody:
      "Describe the occasion in the quote form and we'll recommend the right format. Not every job needs a full campaign — sometimes one well-designed flyer is exactly enough.",
  },
  portfolio: {
    title: "Portfolio",
    intro:
      "Sample flyers from the studio. Each one is designed around a single clear message and built to hold up in print, on a phone screen, and on a noticeboard.",
    emptyState:
      "New work is being added to the portfolio. In the meantime, get in touch and we'll send recent samples for your type of event.",
  },
  about: {
    title: "About the studio",
    intro:
      "Humphinegraphix is a small, independent design studio focused on one thing done well: the flyer.",
    storyTitle: "Design that takes the flyer seriously",
    storyParagraphs: [
      "Humphinegraphix started with a simple frustration. Flyers are often the first, and sometimes the only, thing a customer sees about a business or an event — and they are usually designed last, in a hurry, by whoever has access to a template.",
      "We do it the other way round. We treat the flyer as a piece of design work: a clear hierarchy, confident type, a real image choice, and information laid out so a passer-by understands it in three seconds.",
      "That approach works the same whether you're a small business announcing a new location, an event organizer with a venue to fill, or someone planning a celebration and wanting the invitation to feel like it belongs to the occasion.",
    ],
    values: [
      {
        title: "One message, made obvious",
        body: "Every flyer leads with the thing you most need people to know. Supporting details stay in the background where they belong.",
      },
      {
        title: "Print-ready, not print-adjacent",
        body: "Files are prepared with correct bleed, margins, colour, and resolution, so your printer has nothing to query.",
      },
      {
        title: "Fast, without the guesswork",
        body: "Clear timings and one revision round as standard. You always know what happens next and when you'll have the files.",
      },
    ],
    studioNote:
      "Based in Tarkwa, Western Region, and working with clients anywhere. Most of the studio's work happens over email and shared files, with clear updates at every stage.",
  },
  contact: {
    title: "Request a quote",
    intro:
      "Tell us about the flyer you need and we'll reply with a plan, a timeline, and a quote. There's no form-to-payment here — this is a conversation, not a checkout.",
    formTitle: "Quote request",
    formNote:
      "Fields marked with an asterisk are required. We usually reply within one working day.",
    successTitle: "Request received",
    successBody:
      "Thanks — your quote request is in. We'll review the details and reply by email, usually within one working day.",
    // PLACEHOLDER_CONTACT_DETAILS — replace with the studio's real details.
    email: "hello@humphinegraphix.com",
    phone: "+233 00 000 0000",
    address: "PLACEHOLDER: Studio address, Tarkwa, Western Region, Ghana",
    hours: "Monday to Friday, 9:00–17:00",
    socialLabel: "@humphinegraphix",
    socialUrl: "https://instagram.com/",
  },
  // PLACEHOLDER_PRIVACY — have this reviewed against the studio's obligations
  // under Ghana's Data Protection Act (2012) before going live.
  privacy: {
    title: "Privacy notice",
    intro:
      "Humphinegraphix collects only the details you send through the quote form, and only in order to reply to your request.",
    updated: "PLACEHOLDER: last updated 2 November 2026",
    sections: [
      {
        title: "What we collect",
        body:
          "When you send a quote request we store your name, email address, and — if you provide them — your phone number, event date, deadline, budget range, and the message you write. We also record the date the request was sent.",
      },
      {
        title: "Why we collect it",
        body:
          "Your details are used to reply to your enquiry, prepare a quote, and follow up about the project you described. We do not sell your data and we do not send marketing emails unless you ask us to.",
      },
      {
        title: "How long we keep it",
        body:
          "Quote requests are kept for up to 24 months so we have a record of the conversation, then deleted. If you become a client, project files and correspondence are kept for the period required for our records.",
      },
      {
        title: "Where it is stored",
        body:
          "Form submissions are stored in a managed database (Supabase) and are only accessible to studio staff through a password-protected admin area. The website itself is hosted by Vercel and does not set advertising cookies.",
      },
      {
        title: "Your choices",
        body:
          "You can ask us to correct or delete your details at any time by replying to our email or writing to the studio address on the contact page. We will action requests within 30 days.",
      },
    ],
  },

  testimonials: [
    {
      quote:
        "The flyer did exactly what we needed: people turned up, and several mentioned seeing it in the shop window. Clear, fast, no back-and-forth.",
      name: "PLACEHOLDER: client name",
      role: "Owner, neighbourhood retail shop",
    },
    {
      quote:
        "We had three weeks to fill a venue. Humphinegraphix turned the brief around in two days and the social crops meant we could post the same design everywhere.",
      name: "PLACEHOLDER: client name",
      role: "Event organizer",
    },
    {
      quote:
        "It was for a family celebration, so I wanted it to feel considered rather than templated. It did, and the printer had no questions about the files.",
      name: "PLACEHOLDER: client name",
      role: "Private commission",
    },
  ],

  faq: [
    {
      question: "How quickly can I get a flyer?",
      answer:
        "Standard turnaround is 3–5 working days from an approved brief. If your date is closer than that, say so in the quote request — we will tell you straight away whether it is possible.",
    },
    {
      question: "Do you print the flyers, or only design them?",
      answer:
        "We design and prepare print-ready files. You can take them to any printer, and we can recommend local printers if you do not have one. We do not take printing payments through this site.",
    },
    {
      question: "What do I need to send you?",
      answer:
        "The essentials: what the flyer is for, the date and venue (or business name and address), the key details people must know, and any logo or image you want used. If you have no imagery, we will work with type and layout.",
    },
    {
      question: "How many changes are included?",
      answer:
        "One revision round is included as standard, covering wording and layout tweaks. Larger changes of direction are quoted separately before any extra work starts.",
    },
    {
      question: "What files will I receive?",
      answer:
        "A print-ready PDF with correct bleed and margins, plus PNG/JPG exports sized for social feeds and messaging apps. You get full usage rights to the design.",
    },
    {
      question: "How does the quote work?",
      answer:
        "You pick a budget range in the form, and we reply by email with a fixed quote and a delivery date. Nothing is charged online and there is no cart or checkout — this is a conversation.",
    },
  ],

  footer: {
    tagline:
      "A flyer design studio for small businesses, event organizers, and individuals who need print that earns a second look.",
  },
};

export const defaultServices: Service[] = [
  {
    id: "business-flyers",
    name: "Small business flyers",
    description:
      "Launches, openings, promotions, and service announcements. Designed to explain what you do and where to find you, without a wall of text.",
    flyerTypes: ["Business promotion", "Grand opening", "Product or service launch", "Seasonal offer"],
  },
  {
    id: "event-flyers",
    name: "Event flyers",
    description:
      "Concerts, markets, conferences, workshops, and fundraisers. Built to carry the date, the venue, and the reason to show up, in that order.",
    flyerTypes: ["Live music or concert", "Market or festival", "Conference or workshop", "Fundraiser or community event"],
  },
  {
    id: "personal-flyers",
    name: "Personal & celebration flyers",
    description:
      "Birthdays, graduations, weddings, memorials, and community notices. Considered design for moments where the details matter to people.",
    flyerTypes: ["Celebration or party", "Wedding or anniversary", "Graduation", "Memorial or community notice"],
  },
  {
    id: "print-and-digital",
    name: "Print + digital flyer sets",
    description:
      "One design, delivered for every place it needs to work: A5 and A4 print files, an A6 handbill, plus square and story crops for social.",
    flyerTypes: ["Multi-format flyer set", "Social media adaptation"],
  },
];

export const defaultPortfolio: PortfolioItem[] = [
  {
    id: "night-market",
    title: "Night Market",
    flyerType: "Market or festival",
    description:
      "A weekend street-food market with 150+ vendors. The design leans on a single high-contrast headline and a warm gold palette to stay legible at A5 and on a phone screen.",
    image: "/images/portfolio/night-market.jpg",
    imageAlt: "Night Market flyer with bold cream typography on a midnight navy background",
  },
  {
    id: "grand-opening",
    title: "Grand Opening",
    flyerType: "Grand opening",
    description:
      "Opening announcement for a neighbourhood shop. Warm rust and cream, arched shapes, and the address set large enough to read from the pavement.",
    image: "/images/portfolio/grand-opening.jpg",
    imageAlt: "Grand opening flyer in terracotta and cream with arched geometric shapes",
  },
  {
    id: "live-music",
    title: "Live Sessions",
    flyerType: "Live music or concert",
    description:
      "A late-night live music series. Distorted type and fluorescent accents give the flyer the energy of the room, while the date and venue stay perfectly clear.",
    image: "/images/portfolio/live-music.jpg",
    imageAlt: "Live music flyer with lime and purple accents on a charcoal background",
  },
  {
    id: "summit",
    title: "Founders Summit",
    flyerType: "Conference or workshop",
    description:
      "A one-day business conference. Deep green and sand, a restrained serif pairing, and a speaker list that reads as a schedule rather than a paragraph.",
    image: "/images/portfolio/conference.jpg",
    imageAlt: "Conference flyer in forest green and sand tones with a speaker list",
  },
  {
    id: "bootcamp",
    title: "Morning Bootcamp",
    flyerType: "Business promotion",
    description:
      "An outdoor training programme promoting a new early class. Condensed type, diagonal accents, and a badge-style schedule for fast reading.",
    image: "/images/portfolio/fitness.jpg",
    imageAlt: "Fitness bootcamp flyer with bold yellow typography on a dark background",
  },
  {
    id: "community-day",
    title: "Community Day",
    flyerType: "Fundraiser or community event",
    description:
      "A church fundraiser and family day. Hand-drawn illustration and a warm palette keep the tone welcoming while the times and location stay prominent.",
    image: "/images/portfolio/community.jpg",
    imageAlt: "Community day flyer in rust orange, brown, and cream with illustrated bunting",
  },
  {
    id: "celebration",
    title: "Golden Anniversary",
    flyerType: "Celebration or party",
    description:
      "A private anniversary celebration. Plum and blush with fine gold rules — an invitation that feels formal without becoming a wedding template.",
    image: "/images/portfolio/celebration.jpg",
    imageAlt: "Anniversary celebration flyer in plum and blush with gold line ornaments",
  },
];

export const defaultBundle: ContentBundle = {
  pages: defaultPages,
  services: defaultServices,
  portfolio: defaultPortfolio,
};
