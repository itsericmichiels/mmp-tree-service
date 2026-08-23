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

  it("only Canton is built", () => {
    const built = CITIES.filter((c) => c.isBuilt).map((c) => c.slug);
    expect(built).toEqual(["canton"]);
  });
});
