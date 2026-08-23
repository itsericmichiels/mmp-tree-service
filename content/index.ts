// content/index.ts
// Registry mapping a city's slug to its content. Add a new entry here
// whenever a city's isBuilt flag (lib/cities.ts) flips to true — the
// dynamic route (app/[slug]/page.tsx) looks content up by city slug and
// 404s if no entry exists, rather than silently falling back to another
// city's copy.
import type { CityContent } from "./types";
import { CANTON_CONTENT } from "./canton";

export const CITY_CONTENT: Record<string, CityContent> = {
  canton: CANTON_CONTENT,
};
