import { describe, it, expect } from "vitest";
import { countLinks } from "./linkCount";

describe("countLinks", () => {
  it("counts internal links starting with a slash", () => {
    const { internal, external } = countLinks(
      "[Tree Removal](/tree-removal-canton-ga) and [Trimming](/tree-trimming-canton-ga)"
    );
    expect(internal).toBe(2);
    expect(external).toBe(0);
  });

  it("counts links containing the site domain as internal", () => {
    const { internal } = countLinks("[Home](https://mmptreeservice.com/)");
    expect(internal).toBe(1);
  });

  it("counts other links as external", () => {
    const { external } = countLinks("[ISA](https://www.isa-arbor.com/)");
    expect(external).toBe(1);
  });

  it("returns zero counts for markdown with no links", () => {
    expect(countLinks("No links here.")).toEqual({ internal: 0, external: 0 });
  });

  it("counts a mix of internal and external links correctly", () => {
    const counts = countLinks(
      "[A](/a) [B](/b) [C](https://external.com) [D](https://mmptreeservice.com/d)"
    );
    expect(counts).toEqual({ internal: 3, external: 1 });
  });
});
