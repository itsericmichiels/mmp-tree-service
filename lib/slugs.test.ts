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

  it("resolves a general (non-city) service page slug", () => {
    const resolved = resolveSlug("tree-removal");
    expect(resolved).toEqual({ type: "generalService", service: treeRemoval });
  });

  it("resolves every service's general page slug now that all 5 have one", () => {
    for (const service of SERVICES) {
      expect(resolveSlug(service.slug)).toEqual({ type: "generalService", service });
    }
  });

  it("returns null for a slug that doesn't match any service or city", () => {
    expect(resolveSlug("pressure-washing")).toBeNull();
  });

  it("returns null for a city not in the service area list", () => {
    // All 27 real cities are built out now, so this uses a well-formed but
    // fictional city slug rather than a real, currently-unbuilt one.
    expect(resolveSlug("tree-service-hometown-ga")).toBeNull();
    expect(resolveSlug("tree-removal-hometown-ga")).toBeNull();
  });

  it("returns null for garbage input", () => {
    expect(resolveSlug("not-a-real-slug")).toBeNull();
  });
});

describe("builtSlugs", () => {
  it("returns one general-service slug per service with a general page, plus one hub slug + one service slug per built city per service", () => {
    const builtCities = CITIES.filter((c) => c.isBuilt);
    const generalServiceSlugs = SERVICES.filter((s) => s.hasGeneralPage).map((s) => s.slug);
    const expected = [
      ...generalServiceSlugs,
      ...builtCities.flatMap((city) => [
        citySlug(city),
        ...SERVICES.map((service) => serviceCitySlug(service, city)),
      ]),
    ];
    expect(builtSlugs().sort()).toEqual(expected.sort());
    expect(builtSlugs()).toHaveLength(
      generalServiceSlugs.length + builtCities.length * (SERVICES.length + 1)
    );
  });

  it("includes Canton's hub and service slugs", () => {
    expect(builtSlugs()).toContain("tree-service-canton-ga");
    expect(builtSlugs()).toContain("tree-removal-canton-ga");
  });

  it("includes Tree Removal's general (non-city) page slug", () => {
    expect(builtSlugs()).toContain("tree-removal");
  });
});
