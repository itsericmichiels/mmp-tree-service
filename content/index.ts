// content/index.ts
// Registry mapping a city's slug to its content. Add a new entry here
// whenever a city's isBuilt flag (lib/cities.ts) flips to true — the
// dynamic route (app/[slug]/page.tsx) looks content up by city slug and
// 404s if no entry exists, rather than silently falling back to another
// city's copy.
import type { CityContent } from "./types";
import { CANTON_CONTENT } from "./canton";
import { MARIETTA_CONTENT } from "./marietta";
import { WOODSTOCK_CONTENT } from "./woodstock";
import { ALPHARETTA_CONTENT } from "./alpharetta";
import { ROSWELL_CONTENT } from "./roswell";
import { SANDY_SPRINGS_CONTENT } from "./sandy-springs";
import { KENNESAW_CONTENT } from "./kennesaw";

export const CITY_CONTENT: Record<string, CityContent> = {
  canton: CANTON_CONTENT,
  marietta: MARIETTA_CONTENT,
  woodstock: WOODSTOCK_CONTENT,
  alpharetta: ALPHARETTA_CONTENT,
  roswell: ROSWELL_CONTENT,
  "sandy-springs": SANDY_SPRINGS_CONTENT,
  kennesaw: KENNESAW_CONTENT,
};
