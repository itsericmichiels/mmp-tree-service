// app/[slug]/page.tsx
import { notFound } from "next/navigation";
import { resolveSlug, builtSlugs } from "@/lib/slugs";
import { CANTON_CONTENT } from "@/content/canton";
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

  if (resolved.type === "hub") {
    return <CityHubTemplate city={resolved.city} content={CANTON_CONTENT.hub} />;
  }

  return (
    <ServiceCityTemplate
      city={resolved.city}
      service={resolved.service}
      content={CANTON_CONTENT.services[resolved.service.slug]}
    />
  );
}
