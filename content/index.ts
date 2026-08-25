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
import { DUNWOODY_CONTENT } from "./dunwoody";
import { SMYRNA_CONTENT } from "./smyrna";
import { MILTON_CONTENT } from "./milton";
import { NORCROSS_CONTENT } from "./norcross";
import { LILBURN_CONTENT } from "./lilburn";
import { DULUTH_CONTENT } from "./duluth";
import { VININGS_CONTENT } from "./vinings";
import { ATLANTA_CONTENT } from "./atlanta";
import { AVONDALE_ESTATES_CONTENT } from "./avondale-estates";
import { BUFORD_CONTENT } from "./buford";
import { SUWANEE_CONTENT } from "./suwanee";
import { JOHNS_CREEK_CONTENT } from "./johns-creek";

export const CITY_CONTENT: Record<string, CityContent> = {
  canton: CANTON_CONTENT,
  marietta: MARIETTA_CONTENT,
  woodstock: WOODSTOCK_CONTENT,
  alpharetta: ALPHARETTA_CONTENT,
  roswell: ROSWELL_CONTENT,
  "sandy-springs": SANDY_SPRINGS_CONTENT,
  kennesaw: KENNESAW_CONTENT,
  dunwoody: DUNWOODY_CONTENT,
  smyrna: SMYRNA_CONTENT,
  milton: MILTON_CONTENT,
  norcross: NORCROSS_CONTENT,
  lilburn: LILBURN_CONTENT,
  duluth: DULUTH_CONTENT,
  vinings: VININGS_CONTENT,
  atlanta: ATLANTA_CONTENT,
  "avondale-estates": AVONDALE_ESTATES_CONTENT,
  buford: BUFORD_CONTENT,
  suwanee: SUWANEE_CONTENT,
  "johns-creek": JOHNS_CREEK_CONTENT,
};
