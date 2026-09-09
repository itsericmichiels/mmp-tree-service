// lib/localBusinessSchema.ts
// LocalBusiness JSON-LD for the whole site. Address, phone, geo, and the
// Google Maps link are pulled directly from the business's verified Google
// Places record (see the "Place ID" note in lib/googleReviews.ts) — do not
// hand-edit these without re-verifying against that source.
import { CITIES } from "./cities";
import { SITE_URL, absoluteUrl } from "./site";
import { DEFAULT_OG_IMAGE } from "./seo";

export function buildLocalBusinessSchema(rating?: number, reviewCount?: number) {
  const areaServed = CITIES.filter((c) => c.isBuilt).map((c) => ({
    "@type": "City",
    name: c.name,
  }));

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": `${SITE_URL}/#business`,
    name: "MMP Tree Service LLC",
    url: SITE_URL,
    image: absoluteUrl(DEFAULT_OG_IMAGE),
    telephone: "+14704030215",
    address: {
      "@type": "PostalAddress",
      streetAddress: "3330 Cobb Pkwy NW Ste 324",
      addressLocality: "Acworth",
      addressRegion: "GA",
      postalCode: "30101",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 34.0361336,
      longitude: -84.6766207,
    },
    areaServed,
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "00:00",
      closes: "23:59",
    },
    sameAs: ["https://maps.google.com/?cid=957250085103345817"],
  };

  if (rating && reviewCount) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating,
      reviewCount,
    };
  }

  return schema;
}
