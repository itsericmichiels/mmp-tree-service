import { describe, it, expect } from "vitest";
import { CITIES } from "./cities";

describe("CITIES", () => {
  it("has all 27 cities from the live service-area list", () => {
    expect(CITIES).toHaveLength(27);
  });

  it("every slug is unique", () => {
    const slugs = CITIES.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has exactly the built cities that have real content", () => {
    const built = CITIES.filter((c) => c.isBuilt).map((c) => c.slug).sort();
    expect(built).toEqual([
      "alpharetta",
      "atlanta",
      "avondale-estates",
      "buford",
      "canton",
      "duluth",
      "dunwoody",
      "johns-creek",
      "kennesaw",
      "lilburn",
      "marietta",
      "milton",
      "norcross",
      "roswell",
      "sandy-springs",
      "smyrna",
      "suwanee",
      "vinings",
      "woodstock",
    ]);
  });
});
