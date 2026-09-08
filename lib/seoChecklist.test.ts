import { describe, it, expect } from "vitest";
import { analyzeSeo, type SeoCheckInput } from "./seoChecklist";

const LONG_BODY_600_WORDS = Array.from({ length: 600 }, (_, i) => `word${i}`).join(" ");

function baseInput(overrides: Partial<SeoCheckInput> = {}): SeoCheckInput {
  return {
    title: "A Generic Blog Post Title",
    slug: "a-generic-blog-post-title",
    seoDescription: "A generic meta description that does not mention anything special here at all today.",
    bodyMarkdown: LONG_BODY_600_WORDS,
    focusKeyword: "",
    coverImageAlt: "A generic photo",
    ...overrides,
  };
}

function checkById(checks: ReturnType<typeof analyzeSeo>, id: string) {
  const found = checks.find((c) => c.id === id);
  if (!found) throw new Error(`No check with id "${id}"`);
  return found;
}

describe("analyzeSeo — keyword checks with no focus keyword set", () => {
  it("marks every keyword-dependent check as not passed, rather than trivially passing on an empty match", () => {
    const checks = analyzeSeo(baseInput({ focusKeyword: "" }));
    expect(checkById(checks, "keywordInTitle").passed).toBe(false);
    expect(checkById(checks, "keywordInMetaDescription").passed).toBe(false);
    expect(checkById(checks, "keywordInSlug").passed).toBe(false);
    expect(checkById(checks, "keywordInFirstParagraph").passed).toBe(false);
    expect(checkById(checks, "keywordInSubheading").passed).toBe(false);
    expect(checkById(checks, "keywordDensity").passed).toBe(false);
  });
});

describe("analyzeSeo — keywordInTitle", () => {
  it("passes when the title contains the focus keyword, case-insensitively", () => {
    const checks = analyzeSeo(baseInput({ title: "Tree Removal Costs in Canton", focusKeyword: "tree removal" }));
    expect(checkById(checks, "keywordInTitle").passed).toBe(true);
  });

  it("fails when the title does not contain the focus keyword", () => {
    const checks = analyzeSeo(baseInput({ title: "Stump Grinding Tips", focusKeyword: "tree removal" }));
    expect(checkById(checks, "keywordInTitle").passed).toBe(false);
  });
});

describe("analyzeSeo — keywordInMetaDescription", () => {
  it("passes when present", () => {
    const checks = analyzeSeo(
      baseInput({ seoDescription: "Everything about tree removal costs.", focusKeyword: "tree removal" })
    );
    expect(checkById(checks, "keywordInMetaDescription").passed).toBe(true);
  });

  it("fails when absent", () => {
    const checks = analyzeSeo(
      baseInput({ seoDescription: "Everything about stump grinding.", focusKeyword: "tree removal" })
    );
    expect(checkById(checks, "keywordInMetaDescription").passed).toBe(false);
  });
});

describe("analyzeSeo — keywordInSlug", () => {
  it("passes when the slugified keyword appears in the slug", () => {
    const checks = analyzeSeo(baseInput({ slug: "tree-removal-cost-guide", focusKeyword: "tree removal" }));
    expect(checkById(checks, "keywordInSlug").passed).toBe(true);
  });

  it("fails when it doesn't", () => {
    const checks = analyzeSeo(baseInput({ slug: "stump-grinding-guide", focusKeyword: "tree removal" }));
    expect(checkById(checks, "keywordInSlug").passed).toBe(false);
  });
});

describe("analyzeSeo — keywordInFirstParagraph", () => {
  it("passes when the first markdown paragraph contains the keyword", () => {
    const body = `This post is about tree removal and why it matters.\n\nSecond paragraph here.`;
    const checks = analyzeSeo(baseInput({ bodyMarkdown: body, focusKeyword: "tree removal" }));
    expect(checkById(checks, "keywordInFirstParagraph").passed).toBe(true);
  });

  it("fails when only a later paragraph contains the keyword", () => {
    const body = `This post is about trees in general.\n\nLater we discuss tree removal in depth.`;
    const checks = analyzeSeo(baseInput({ bodyMarkdown: body, focusKeyword: "tree removal" }));
    expect(checkById(checks, "keywordInFirstParagraph").passed).toBe(false);
  });
});

describe("analyzeSeo — keywordInSubheading", () => {
  it("passes when an H2 or H3 contains the keyword", () => {
    const body = `Intro paragraph.\n\n## Tree Removal Costs\n\nMore text.`;
    const checks = analyzeSeo(baseInput({ bodyMarkdown: body, focusKeyword: "tree removal" }));
    expect(checkById(checks, "keywordInSubheading").passed).toBe(true);
  });

  it("fails when no heading contains the keyword", () => {
    const body = `Intro paragraph.\n\n## Stump Grinding\n\nMore text.`;
    const checks = analyzeSeo(baseInput({ bodyMarkdown: body, focusKeyword: "tree removal" }));
    expect(checkById(checks, "keywordInSubheading").passed).toBe(false);
  });
});

describe("analyzeSeo — keywordDensity", () => {
  it("passes when density is within 0.5%-2.5%", () => {
    const words = Array.from({ length: 200 }, (_, i) => (i % 40 === 0 ? "removal" : `word${i}`));
    const body = words.join(" ");
    const checks = analyzeSeo(baseInput({ bodyMarkdown: body, focusKeyword: "removal" }));
    expect(checkById(checks, "keywordDensity").passed).toBe(true);
  });

  it("fails when the keyword never appears in the body", () => {
    const checks = analyzeSeo(baseInput({ bodyMarkdown: LONG_BODY_600_WORDS, focusKeyword: "removal" }));
    expect(checkById(checks, "keywordDensity").passed).toBe(false);
  });

  it("fails when the keyword is stuffed far above 2.5% density", () => {
    const words = Array.from({ length: 100 }, () => "removal");
    const checks = analyzeSeo(baseInput({ bodyMarkdown: words.join(" "), focusKeyword: "removal" }));
    expect(checkById(checks, "keywordDensity").passed).toBe(false);
  });
});

describe("analyzeSeo — titleLength", () => {
  it("passes for a title between 50 and 60 characters", () => {
    const title = "A".repeat(55);
    const checks = analyzeSeo(baseInput({ title }));
    expect(checkById(checks, "titleLength").passed).toBe(true);
  });

  it("fails for a title under 50 characters", () => {
    const checks = analyzeSeo(baseInput({ title: "Short Title" }));
    expect(checkById(checks, "titleLength").passed).toBe(false);
  });

  it("fails for a title over 60 characters", () => {
    const checks = analyzeSeo(baseInput({ title: "A".repeat(70) }));
    expect(checkById(checks, "titleLength").passed).toBe(false);
  });
});

describe("analyzeSeo — metaDescriptionLength", () => {
  it("passes for a description between 120 and 160 characters", () => {
    const checks = analyzeSeo(baseInput({ seoDescription: "A".repeat(140) }));
    expect(checkById(checks, "metaDescriptionLength").passed).toBe(true);
  });

  it("fails when too short", () => {
    const checks = analyzeSeo(baseInput({ seoDescription: "Too short." }));
    expect(checkById(checks, "metaDescriptionLength").passed).toBe(false);
  });

  it("fails when too long", () => {
    const checks = analyzeSeo(baseInput({ seoDescription: "A".repeat(200) }));
    expect(checkById(checks, "metaDescriptionLength").passed).toBe(false);
  });
});

describe("analyzeSeo — contentLength", () => {
  it("passes at 600 words or more", () => {
    const checks = analyzeSeo(baseInput({ bodyMarkdown: LONG_BODY_600_WORDS }));
    expect(checkById(checks, "contentLength").passed).toBe(true);
  });

  it("fails under 600 words", () => {
    const shortBody = Array.from({ length: 50 }, (_, i) => `word${i}`).join(" ");
    const checks = analyzeSeo(baseInput({ bodyMarkdown: shortBody }));
    expect(checkById(checks, "contentLength").passed).toBe(false);
  });
});

describe("analyzeSeo — internalLinks / externalLinks", () => {
  it("passes internalLinks at 5 or more internal markdown links", () => {
    const body = Array.from({ length: 5 }, (_, i) => `[link${i}](/page-${i})`).join(" ");
    const checks = analyzeSeo(baseInput({ bodyMarkdown: body }));
    expect(checkById(checks, "internalLinks").passed).toBe(true);
  });

  it("fails internalLinks under 5", () => {
    const body = `[link](/page)`;
    const checks = analyzeSeo(baseInput({ bodyMarkdown: body }));
    expect(checkById(checks, "internalLinks").passed).toBe(false);
  });

  it("passes externalLinks at 5 or more external markdown links", () => {
    const body = Array.from({ length: 5 }, (_, i) => `[link${i}](https://example${i}.com)`).join(" ");
    const checks = analyzeSeo(baseInput({ bodyMarkdown: body }));
    expect(checkById(checks, "externalLinks").passed).toBe(true);
  });

  it("fails externalLinks under 5", () => {
    const body = `[link](https://example.com)`;
    const checks = analyzeSeo(baseInput({ bodyMarkdown: body }));
    expect(checkById(checks, "externalLinks").passed).toBe(false);
  });
});

describe("analyzeSeo — altText", () => {
  it("passes when cover image alt text is filled in", () => {
    const checks = analyzeSeo(baseInput({ coverImageAlt: "A crew removing a tree" }));
    expect(checkById(checks, "altText").passed).toBe(true);
  });

  it("fails when cover image alt text is blank", () => {
    const checks = analyzeSeo(baseInput({ coverImageAlt: "   " }));
    expect(checkById(checks, "altText").passed).toBe(false);
  });
});
