import { describe, it, expect } from "vitest";
import { buildHubDescription, buildServiceCityDescription } from "./metaDescriptions";
import { CITIES } from "./cities";
import { SERVICES } from "./services";

const BUILT_CITY_NAMES = CITIES.filter((c) => c.isBuilt).map((c) => c.name);

describe("buildHubDescription", () => {
  it("stays within 120-155 characters for every built city", () => {
    for (const name of BUILT_CITY_NAMES) {
      const desc = buildHubDescription(name);
      expect(desc.length, `"${desc}" (${desc.length} chars) for ${name}`).toBeGreaterThanOrEqual(120);
      expect(desc.length, `"${desc}" (${desc.length} chars) for ${name}`).toBeLessThanOrEqual(155);
    }
  });

  it("includes the city name and phone number", () => {
    const desc = buildHubDescription("Canton, GA");
    expect(desc).toContain("Canton, GA");
    expect(desc).toContain("(470) 403-0215");
  });
});

describe("buildServiceCityDescription", () => {
  it("stays at or under 155 characters for every built city and service", () => {
    for (const service of SERVICES) {
      for (const cityName of BUILT_CITY_NAMES) {
        const desc = buildServiceCityDescription(service.name, cityName);
        expect(
          desc.length,
          `"${desc}" (${desc.length} chars) for ${service.name} / ${cityName}`
        ).toBeLessThanOrEqual(155);
      }
    }
  });

  it("includes the service name, city name, and phone number", () => {
    const desc = buildServiceCityDescription("Tree Removal", "Canton, GA");
    expect(desc).toContain("Tree Removal");
    expect(desc).toContain("Canton, GA");
    expect(desc).toContain("(470) 403-0215");
  });
});
