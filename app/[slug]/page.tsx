// app/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveSlug, builtSlugs, citySlug } from "@/lib/slugs";
import { CITY_CONTENT } from "@/content";
import { GENERAL_SERVICE_CONTENT } from "@/content/generalServices";
import { CityHubTemplate } from "@/components/CityHubTemplate";
import { ServiceCityTemplate } from "@/components/ServiceCityTemplate";
import { GeneralServiceTemplate } from "@/components/GeneralServiceTemplate";
import { getHeroImageUrl } from "@/lib/hero-images";
import { getGoogleReviews } from "@/lib/googleReviews";
import { socialTags } from "@/lib/seo";
import { buildServiceSchema, buildBreadcrumbSchema } from "@/lib/pageSchema";
import { JsonLd } from "@/components/JsonLd";
import { CITIES } from "@/lib/cities";
import { buildHubDescription, buildServiceCityDescription } from "@/lib/metaDescriptions";

const DEFAULT_METADATA: Metadata = {
  title: "MMP Tree Service LLC | North Metro Atlanta Tree Care",
  description:
    "Licensed & insured tree removal, trimming, stump grinding, and 24/7 emergency tree service across North Metro Atlanta.",
};

const TITLE_MAX = 60;
const BRAND_FULL = "MMP Tree Service LLC";
const BRAND_SHORT = "MMP Tree Service";

// Keeps the full brand suffix wherever it fits in 60 chars, drops " LLC"
// if that alone gets it under the limit, and drops the brand suffix
// entirely only for the handful of longest service+city combinations
// where even the shortened suffix doesn't fit.
function buildPageTitle(prefix: string): string {
  const full = `${prefix} | ${BRAND_FULL}`;
  if (full.length <= TITLE_MAX) return full;
  const short = `${prefix} | ${BRAND_SHORT}`;
  if (short.length <= TITLE_MAX) return short;
  return prefix;
}

// Last-resort fallback when no purpose-built description is available —
// cuts at the last full sentence within maxLength, or the last full word
// if no sentence boundary is found, instead of chopping mid-word.
function truncate(text: string, maxLength = 155): string {
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSentence = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  if (lastSentence > maxLength * 0.4) {
    return cut.slice(0, lastSentence + 1).trim();
  }
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : maxLength).trimEnd()}…`;
}


export function generateStaticParams() {
  return builtSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resolved = resolveSlug(slug);

  if (!resolved) {
    return DEFAULT_METADATA;
  }

  if (resolved.type === "generalService") {
    const generalContent = GENERAL_SERVICE_CONTENT[resolved.service.slug];
    const title = buildPageTitle(`${resolved.service.name} in North Georgia`);
    const description = generalContent
      ? generalContent.metaDescription
      : (DEFAULT_METADATA.description as string);
    return {
      title,
      description,
      alternates: { canonical: `/${slug}` },
      ...socialTags(title, description),
    };
  }

  const content = CITY_CONTENT[resolved.city.slug];

  if (!content) {
    return DEFAULT_METADATA;
  }

  if (resolved.type === "hub") {
    const title = buildPageTitle(`Tree Service in ${resolved.city.name}`);
    const description = buildHubDescription(resolved.city.name);
    return {
      title,
      description,
      alternates: { canonical: `/${slug}` },
      ...socialTags(title, description),
    };
  }

  const serviceContent = content.services[resolved.service.slug];
  const title = buildPageTitle(`${resolved.service.name} in ${resolved.city.name}`);
  const description = serviceContent
    ? buildServiceCityDescription(resolved.service.name, resolved.city.name)
    : (DEFAULT_METADATA.description as string);

  return {
    title,
    description,
    alternates: { canonical: `/${slug}` },
    ...socialTags(title, description),
  };
}

export default async function CityOrServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resolved = resolveSlug(slug);

  if (!resolved) {
    notFound();
  }

  if (resolved.type === "generalService") {
    const generalContent = GENERAL_SERVICE_CONTENT[resolved.service.slug];
    if (!generalContent) {
      notFound();
    }
    const reviews = await getGoogleReviews();
    const builtCityNames = CITIES.filter((c) => c.isBuilt).map((c) => c.name);
    const serviceSchema = buildServiceSchema({
      serviceType: resolved.service.name,
      areaServed: builtCityNames,
      path: `/${slug}`,
    });
    const breadcrumbSchema = buildBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: resolved.service.name, path: `/${slug}` },
    ]);
    return (
      <>
        <JsonLd data={serviceSchema} />
        <JsonLd data={breadcrumbSchema} />
        <GeneralServiceTemplate service={resolved.service} content={generalContent} reviews={reviews} />
      </>
    );
  }

  // Defensive: resolveSlug already gates on lib/cities.ts's isBuilt flag, so
  // this should only ever be hit if a city is flipped to isBuilt without a
  // matching CITY_CONTENT entry being added (see content/index.ts). Fail
  // safe (404) rather than silently rendering another city's content.
  const content = CITY_CONTENT[resolved.city.slug];
  if (!content) {
    notFound();
  }

  const heroImageUrl = (await getHeroImageUrl(slug)) ?? undefined;

  if (resolved.type === "hub") {
    const breadcrumbSchema = buildBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Service Areas", path: "/service-areas" },
      { name: resolved.city.name, path: `/${slug}` },
    ]);
    return (
      <>
        <JsonLd data={breadcrumbSchema} />
        <CityHubTemplate city={resolved.city} content={content.hub} heroImageUrl={heroImageUrl} />
      </>
    );
  }

  const serviceSchema = buildServiceSchema({
    serviceType: resolved.service.name,
    areaServed: [resolved.city.name],
    path: `/${slug}`,
  });
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Service Areas", path: "/service-areas" },
    { name: resolved.city.name, path: `/${citySlug(resolved.city)}` },
    { name: resolved.service.name, path: `/${slug}` },
  ]);

  return (
    <>
      <JsonLd data={serviceSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ServiceCityTemplate
        city={resolved.city}
        service={resolved.service}
        content={content.services[resolved.service.slug]}
        heroImageUrl={heroImageUrl}
      />
    </>
  );
}
