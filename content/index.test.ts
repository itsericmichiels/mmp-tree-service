import { describe, it, expect } from "vitest";
import { CITIES } from "@/lib/cities";
import { SERVICES } from "@/lib/services";
import { CITY_CONTENT } from "./index";

describe("CITY_CONTENT registry", () => {
  it("has a content entry for every built city", () => {
    const builtCities = CITIES.filter((c) => c.isBuilt);
    for (const city of builtCities) {
      expect(
        CITY_CONTENT[city.slug],
        `expected CITY_CONTENT["${city.slug}"] to exist for built city "${city.name}"`
      ).toBeDefined();
    }
  });

  it("has content for every service on every registered city", () => {
    for (const [citySlug, content] of Object.entries(CITY_CONTENT)) {
      for (const service of SERVICES) {
        expect(
          content.services[service.slug],
          `expected CITY_CONTENT["${citySlug}"].services["${service.slug}"] to exist`
        ).toBeDefined();
      }
    }
  });

  it("does not have a content entry for un-built cities (nothing to leak)", () => {
    const unbuiltCities = CITIES.filter((c) => !c.isBuilt);
    for (const city of unbuiltCities) {
      expect(CITY_CONTENT[city.slug]).toBeUndefined();
    }
  });
});
