export type City = {
  slug: string;
  name: string;
  isBuilt: boolean;
};

const CITY_NAMES: string[] = [
  "Canton",
  "Norcross",
  "Lilburn",
  "Duluth",
  "Woodstock",
  "Vinings",
  "Marietta",
  "Atlanta",
  "Avondale Estates",
  "Buford",
  "Suwanee",
  "Johns Creek",
  "East Point",
  "Buckhead",
  "Roswell",
  "Dunwoody",
  "Cumming",
  "Decatur",
  "Kennesaw",
  "Lawrenceville",
  "Sandy Springs",
  "Smyrna",
  "Brookhaven",
  "Acworth",
  "Milton",
  "Powder Springs",
  "Alpharetta",
];

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

const BUILT_CITY_NAMES = new Set([
  "Canton",
  "Marietta",
  "Woodstock",
  "Alpharetta",
  "Roswell",
  "Sandy Springs",
  "Kennesaw",
]);

export const CITIES: City[] = CITY_NAMES.map((name) => ({
  slug: slugify(name),
  name: `${name}, GA`,
  isBuilt: BUILT_CITY_NAMES.has(name),
}));
