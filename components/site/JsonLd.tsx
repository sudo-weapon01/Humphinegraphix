import type { SitePages } from "@/lib/content/types";
import { SITE_NAME, SITE_URL } from "@/lib/site";

/**
 * Structured data for local search results.
 *
 * Deliberately omits `priceRange` and offers: this site publishes no prices.
 */
export function JsonLd({ contact, services }: { contact: SitePages["contact"]; services: string[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE_URL}/#studio`,
    name: SITE_NAME,
    description:
      "Flyer design studio creating print-ready flyers for small businesses, event organizers, and individuals.",
    url: SITE_URL,
    email: contact.email,
    telephone: contact.phone,
    image: `${SITE_URL}/images/og-cover.jpg`,
    address: {
      "@type": "PostalAddress",
      streetAddress: contact.address,
      addressLocality: "Tarkwa",
      addressRegion: "Western Region",
      addressCountry: "GH",
    },
    areaServed: { "@type": "Country", name: "Ghana" },
    openingHours: contact.hours,
    sameAs: [contact.socialUrl],
    knowsAbout: services,
    makesOffer: services.map((name) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name },
    })),
  };

  return (
    <script
      type="application/ld+json"
      // Static, trusted object built from published content.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
