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

const DEFAULT_METADATA: Metadata = {
  title: "MMP Tree Service LLC | North Metro Atlanta Tree Care",
  description:
    "Licensed & insured tree removal, trimming, stump grinding, and 24/7 emergency tree service across North Metro Atlanta.",
};

function truncate(text: string, maxLength = 160): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
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
    const title = `${resolved.service.name} in North Georgia | MMP Tree Service LLC`;
    const description = generalContent
      ? truncate(generalContent.intro)
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
    const title = `Tree Service in ${resolved.city.name} | MMP Tree Service LLC`;
    const description = truncate(content.hub.intro);
    return {
      title,
      description,
      alternates: { canonical: `/${slug}` },
      ...socialTags(title, description),
    };
  }

  const serviceContent = content.services[resolved.service.slug];
  const title = `${resolved.service.name} in ${resolved.city.name} | MMP Tree Service LLC`;
  const description = serviceContent
    ? truncate(serviceContent.intro)
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
