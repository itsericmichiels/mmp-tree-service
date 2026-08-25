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
      "acworth",
      "alpharetta",
      "atlanta",
      "avondale-estates",
      "brookhaven",
      "buckhead",
      "buford",
      "canton",
      "cumming",
      "decatur",
      "duluth",
      "dunwoody",
      "east-point",
      "johns-creek",
      "kennesaw",
      "lawrenceville",
      "lilburn",
      "marietta",
      "milton",
      "norcross",
      "powder-springs",
      "roswell",
      "sandy-springs",
      "smyrna",
      "suwanee",
      "vinings",
      "woodstock",
    ]);
  });

  it("all 27 cities are now built out", () => {
    // The service-area list is complete: every city has a real content
    // registry entry. If a 28th city is ever added to CITY_NAMES, it should
    // start with isBuilt: false until its content exists, which will make
    // this test fail as a reminder to update it deliberately.
    expect(CITIES.every((c) => c.isBuilt)).toBe(true);
  });
});
