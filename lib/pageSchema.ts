// lib/pageSchema.ts
// Per-page Service and BreadcrumbList JSON-LD, referencing the site-wide
// LocalBusiness entity (lib/localBusinessSchema.ts) by @id rather than
// repeating it on every page.
import { SITE_URL, absoluteUrl } from "./site";

const BUSINESS_ID = `${SITE_URL}/#business`;

export function buildServiceSchema(options: {
  serviceType: string;
  areaServed: string[];
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: options.serviceType,
    provider: { "@id": BUSINESS_ID },
    areaServed: options.areaServed.map((name) => ({ "@type": "City", name })),
    url: absoluteUrl(options.path),
  };
}

export function buildBreadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
