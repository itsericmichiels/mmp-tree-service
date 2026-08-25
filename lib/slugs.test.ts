import { describe, it, expect } from "vitest";
import { CITIES } from "./cities";
import { SERVICES } from "./services";
import { citySlug, serviceCitySlug, resolveSlug, builtSlugs } from "./slugs";

const canton = CITIES.find((c) => c.slug === "canton")!;
const treeRemoval = SERVICES.find((s) => s.slug === "tree-removal")!;

describe("citySlug", () => {
  it("builds the hub slug", () => {
    expect(citySlug(canton)).toBe("tree-service-canton-ga");
  });
});

describe("serviceCitySlug", () => {
  it("builds the service+city slug", () => {
    expect(serviceCitySlug(treeRemoval, canton)).toBe(
      "tree-removal-canton-ga"
    );
  });
});

describe("resolveSlug", () => {
  it("resolves a built hub slug", () => {
    const resolved = resolveSlug("tree-service-canton-ga");
    expect(resolved).toEqual({ type: "hub", city: canton });
  });

  it("resolves a built service+city slug", () => {
    const resolved = resolveSlug("tree-removal-canton-ga");
    expect(resolved).toEqual({ type: "service", service: treeRemoval, city: canton });
  });

  it("returns null for an un-built city", () => {
    expect(resolveSlug("tree-service-acworth-ga")).toBeNull();
    expect(resolveSlug("tree-removal-acworth-ga")).toBeNull();
  });

  it("returns null for garbage input", () => {
    expect(resolveSlug("not-a-real-slug")).toBeNull();
  });
});

describe("builtSlugs", () => {
  it("returns exactly one hub slug + one service slug per built city per service", () => {
    const builtCities = CITIES.filter((c) => c.isBuilt);
    const expected = builtCities.flatMap((city) => [
      citySlug(city),
      ...SERVICES.map((service) => serviceCitySlug(service, city)),
    ]);
    expect(builtSlugs().sort()).toEqual(expected.sort());
    expect(builtSlugs()).toHaveLength(builtCities.length * (SERVICES.length + 1));
  });

  it("includes Canton's hub and service slugs", () => {
    expect(builtSlugs()).toContain("tree-service-canton-ga");
    expect(builtSlugs()).toContain("tree-removal-canton-ga");
  });
});
