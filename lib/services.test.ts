import { describe, it, expect } from "vitest";
import { SERVICES } from "./services";

describe("SERVICES", () => {
  it("has exactly the 5 fixed services", () => {
    expect(SERVICES.map((s) => s.slug).sort()).toEqual(
      [
        "tree-removal",
        "tree-trimming",
        "stump-grinding",
        "lot-clearing",
        "emergency-tree-service",
      ].sort()
    );
  });

  it("every service has a non-empty name, description, and icon", () => {
    for (const s of SERVICES) {
      expect(s.name.length).toBeGreaterThan(0);
      expect(s.shortDescription.length).toBeGreaterThan(0);
      expect(s.icon.length).toBeGreaterThan(0);
    }
  });
});
