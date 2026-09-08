import { describe, it, expect } from "vitest";
import { parseDraftPayload } from "./blogDraftIngest";

function validPayload(overrides: Record<string, unknown> = {}) {
  return {
    title: "Tree Removal Cost Guide for North Georgia Homeowners",
    excerpt: "What tree removal actually costs across North Georgia, and what drives the price up or down.",
    coverImage: "https://example.com/photo.jpg",
    coverImageAlt: "A crew removing a large oak tree",
    category: "Tree Care Tips",
    tags: ["tree removal", "cost"],
    seoTitle: "Tree Removal Cost Guide for North Georgia Homeowners",
    seoDescription:
      "See what tree removal really costs in North Georgia and the factors that move the price up or down for your yard.",
    bodyMarkdown: "Full body markdown content here.",
    focusKeyword: "tree removal cost",
    ...overrides,
  };
}

describe("parseDraftPayload", () => {
  it("accepts a fully-formed payload and forces status to draft", () => {
    const result = parseDraftPayload(validPayload());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.post.status).toBe("draft");
      expect(result.post.title).toBe(validPayload().title);
      expect(result.post.tags).toEqual(["tree removal", "cost"]);
    }
  });

  it("generates a slug from the title when no slug is provided", () => {
    const result = parseDraftPayload(validPayload({ title: "Stump Grinding vs Removal" }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.post.slug).toBe("stump-grinding-vs-removal");
  });

  it("uses a provided slug as-is when given", () => {
    const result = parseDraftPayload(validPayload({ slug: "custom-slug-here" }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.post.slug).toBe("custom-slug-here");
  });

  it("fills in today's date when no date is provided", () => {
    const result = parseDraftPayload(validPayload());
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.post.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("rejects a payload that isn't an object", () => {
    expect(parseDraftPayload(null).ok).toBe(false);
    expect(parseDraftPayload("a string").ok).toBe(false);
    expect(parseDraftPayload([1, 2, 3]).ok).toBe(false);
  });

  it("rejects when a required field is missing", () => {
    for (const field of [
      "title",
      "excerpt",
      "coverImage",
      "coverImageAlt",
      "category",
      "seoTitle",
      "seoDescription",
      "bodyMarkdown",
      "focusKeyword",
    ]) {
      const payload = validPayload({ [field]: undefined });
      const result = parseDraftPayload(payload);
      expect(result.ok, `expected rejection when "${field}" is missing`).toBe(false);
    }
  });

  it("rejects when a required field is blank", () => {
    const result = parseDraftPayload(validPayload({ title: "   " }));
    expect(result.ok).toBe(false);
  });

  it("defaults tags to an empty array when omitted", () => {
    const result = parseDraftPayload(validPayload({ tags: undefined }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.post.tags).toEqual([]);
  });

  it("rejects a non-array tags field", () => {
    const result = parseDraftPayload(validPayload({ tags: "not-an-array" }));
    expect(result.ok).toBe(false);
  });

  it("ignores any status field the caller supplies — always forces draft", () => {
    const result = parseDraftPayload(validPayload({ status: "published" }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.post.status).toBe("draft");
  });
});
