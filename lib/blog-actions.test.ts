import { describe, it, expect, vi, beforeEach } from "vitest";

const savePost = vi.fn();
const getPostBySlug = vi.fn();
const uniqueSlug = vi.fn();
const addCategory = vi.fn();
const redirect = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});

vi.mock("@/lib/blog", () => ({
  savePost,
  getPostBySlug,
  uniqueSlug,
}));

vi.mock("@/lib/blog-categories", () => ({
  addCategory,
}));

vi.mock("next/navigation", () => ({
  redirect,
}));

function formDataFor(mode: "create" | "edit", slug = "my-post") {
  const formData = new FormData();
  formData.set("mode", mode);
  formData.set("slug", slug);
  formData.set("title", "My Post");
  formData.set("date", "2026-08-24");
  formData.set("excerpt", "An excerpt.");
  formData.set("coverImage", "https://example.com/x.jpg");
  formData.set("seoTitle", "My Post SEO");
  formData.set("seoDescription", "SEO description.");
  formData.set("bodyMarkdown", "Body text here.");
  return formData;
}

describe("savePostAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("saves under a de-duplicated slug when creating a post whose slug already exists", async () => {
    const { savePostAction } = await import("./blog-actions");
    getPostBySlug.mockReturnValue({ slug: "my-post", title: "Existing Post" });
    uniqueSlug.mockReturnValue("my-post-2");

    await expect(savePostAction(formDataFor("create", "my-post"))).rejects.toThrow(
      "REDIRECT:/blog/my-post-2"
    );

    expect(uniqueSlug).toHaveBeenCalledWith("my-post");
    expect(savePost).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "my-post-2" })
    );
  });

  it("does not de-duplicate when creating a post with a new, non-colliding slug", async () => {
    const { savePostAction } = await import("./blog-actions");
    getPostBySlug.mockReturnValue(null);

    await expect(savePostAction(formDataFor("create", "brand-new-slug"))).rejects.toThrow(
      "REDIRECT:/blog/brand-new-slug"
    );

    expect(uniqueSlug).not.toHaveBeenCalled();
    expect(savePost).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "brand-new-slug" })
    );
  });

  it("keeps overwriting the same slug exactly when editing, even though a post already exists there", async () => {
    const { savePostAction } = await import("./blog-actions");
    getPostBySlug.mockReturnValue({ slug: "my-post", title: "Existing Post" });

    await expect(savePostAction(formDataFor("edit", "my-post"))).rejects.toThrow(
      "REDIRECT:/blog/my-post"
    );

    expect(uniqueSlug).not.toHaveBeenCalled();
    expect(savePost).toHaveBeenCalledWith(expect.objectContaining({ slug: "my-post" }));
  });
});
