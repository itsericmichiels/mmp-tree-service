import { describe, it, expect } from "vitest";
import { buildPostFromFormData } from "./blogFormData";

describe("buildPostFromFormData", () => {
  it("builds a BlogPost from form fields", () => {
    const formData = new FormData();
    formData.set("slug", "test-post");
    formData.set("title", "Test Post");
    formData.set("date", "2026-08-24");
    formData.set("excerpt", "An excerpt.");
    formData.set("coverImage", "https://example.com/x.jpg");
    formData.set("seoTitle", "Test Post SEO");
    formData.set("seoDescription", "SEO description.");
    formData.set("bodyMarkdown", "Body text here.");

    const post = buildPostFromFormData(formData);

    expect(post).toEqual({
      slug: "test-post",
      title: "Test Post",
      date: "2026-08-24",
      excerpt: "An excerpt.",
      coverImage: "https://example.com/x.jpg",
      coverImageAlt: "",
      category: "",
      tags: [],
      seoTitle: "Test Post SEO",
      seoDescription: "SEO description.",
      bodyMarkdown: "Body text here.",
      focusKeyword: "",
      status: "published",
    });
  });

  it("defaults missing fields to empty strings", () => {
    const formData = new FormData();
    formData.set("slug", "minimal-post");
    const post = buildPostFromFormData(formData);
    expect(post.title).toBe("");
    expect(post.bodyMarkdown).toBe("");
  });

  it("defaults status to published when not set", () => {
    const formData = new FormData();
    formData.set("slug", "minimal-post");
    expect(buildPostFromFormData(formData).status).toBe("published");
  });

  it("reads status as draft when explicitly set to draft", () => {
    const formData = new FormData();
    formData.set("slug", "minimal-post");
    formData.set("status", "draft");
    expect(buildPostFromFormData(formData).status).toBe("draft");
  });
});
