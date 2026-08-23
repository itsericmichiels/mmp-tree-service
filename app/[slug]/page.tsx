// app/[slug]/page.tsx
import { notFound } from "next/navigation";
import { resolveSlug, builtSlugs } from "@/lib/slugs";
import { CITY_CONTENT } from "@/content";
import { CityHubTemplate } from "@/components/CityHubTemplate";
import { ServiceCityTemplate } from "@/components/ServiceCityTemplate";

export function generateStaticParams() {
  return builtSlugs().map((slug) => ({ slug }));
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

  // Defensive: resolveSlug already gates on lib/cities.ts's isBuilt flag, so
  // this should only ever be hit if a city is flipped to isBuilt without a
  // matching CITY_CONTENT entry being added (see content/index.ts). Fail
  // safe (404) rather than silently rendering another city's content.
  const content = CITY_CONTENT[resolved.city.slug];
  if (!content) {
    notFound();
  }

  if (resolved.type === "hub") {
    return <CityHubTemplate city={resolved.city} content={content.hub} />;
  }

  return (
    <ServiceCityTemplate
      city={resolved.city}
      service={resolved.service}
      content={content.services[resolved.service.slug]}
    />
  );
}
