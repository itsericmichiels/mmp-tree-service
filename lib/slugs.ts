import { CITIES, type City } from "./cities";
import { SERVICES, type Service } from "./services";

export function citySlug(city: City): string {
  return `tree-service-${city.slug}-ga`;
}

export function serviceCitySlug(service: Service, city: City): string {
  return `${service.slug}-${city.slug}-ga`;
}

export type ResolvedSlug =
  | { type: "hub"; city: City }
  | { type: "service"; service: Service; city: City };

export function resolveSlug(slug: string): ResolvedSlug | null {
  const builtCities = CITIES.filter((c) => c.isBuilt);

  for (const city of builtCities) {
    if (slug === citySlug(city)) {
      return { type: "hub", city };
    }
    for (const service of SERVICES) {
      if (slug === serviceCitySlug(service, city)) {
        return { type: "service", service, city };
      }
    }
  }

  return null;
}

export function builtSlugs(): string[] {
  const builtCities = CITIES.filter((c) => c.isBuilt);
  const slugs: string[] = [];
  for (const city of builtCities) {
    slugs.push(citySlug(city));
    for (const service of SERVICES) {
      slugs.push(serviceCitySlug(service, city));
    }
  }
  return slugs;
}
