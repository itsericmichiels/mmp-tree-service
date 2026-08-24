import { describe, it, expect } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it("converts a title into a URL-safe slug", () => {
    expect(
      slugify("Storm Damage Tree Removal in Acworth & Sandy Springs, GA")
    ).toBe("storm-damage-tree-removal-in-acworth-sandy-springs-ga");
  });

  it("collapses multiple spaces and dashes", () => {
    expect(slugify("Hello   World -- Test")).toBe("hello-world-test");
  });
});
