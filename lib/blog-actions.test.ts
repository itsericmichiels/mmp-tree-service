import { describe, it, expect, vi, beforeEach } from "vitest";

const savePost = vi.fn();
const getPostBySlug = vi.fn();
const uniqueSlug = vi.fn();
const publishPost = vi.fn();
const unpublishPost = vi.fn();
const addCategory = vi.fn();
const redirect = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});
const revalidatePath = vi.fn();

vi.mock("@/lib/blog", () => ({
  savePost,
  getPostBySlug,
  uniqueSlug,
  publishPost,
  unpublishPost,
}));

vi.mock("@/lib/blog-categories", () => ({
  addCategory,
}));

vi.mock("next/navigation", () => ({
  redirect,
}));

vi.mock("next/cache", () => ({
  revalidatePath,
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

  it("redirects to /admin/blog instead of the public post when saving a draft", async () => {
    const { savePostAction } = await import("./blog-actions");
    getPostBySlug.mockReturnValue(null);
    const formData = formDataFor("create", "draft-post");
    formData.set("status", "draft");

    await expect(savePostAction(formData)).rejects.toThrow("REDIRECT:/admin/blog");

    expect(savePost).toHaveBeenCalledWith(expect.objectContaining({ status: "draft" }));
  });
});

describe("approvePostAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("publishes the post, revalidates its paths, and redirects to /admin/blog", async () => {
    const { approvePostAction } = await import("./blog-actions");
    const formData = new FormData();
    formData.set("slug", "pending-post");

    await expect(approvePostAction(formData)).rejects.toThrow("REDIRECT:/admin/blog");

    expect(publishPost).toHaveBeenCalledWith("pending-post");
    expect(revalidatePath).toHaveBeenCalledWith("/blog");
    expect(revalidatePath).toHaveBeenCalledWith("/blog/pending-post");
  });

  it("does nothing and still redirects when no slug is provided", async () => {
    const { approvePostAction } = await import("./blog-actions");
    const formData = new FormData();

    await expect(approvePostAction(formData)).rejects.toThrow("REDIRECT:/admin/blog");

    expect(publishPost).not.toHaveBeenCalled();
  });
});

describe("unpublishPostAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("unpublishes the post, revalidates its paths, and redirects to /admin/blog", async () => {
    const { unpublishPostAction } = await import("./blog-actions");
    const formData = new FormData();
    formData.set("slug", "live-post");

    await expect(unpublishPostAction(formData)).rejects.toThrow("REDIRECT:/admin/blog");

    expect(unpublishPost).toHaveBeenCalledWith("live-post");
    expect(revalidatePath).toHaveBeenCalledWith("/blog");
    expect(revalidatePath).toHaveBeenCalledWith("/blog/live-post");
  });

  it("does nothing and still redirects when no slug is provided", async () => {
    const { unpublishPostAction } = await import("./blog-actions");
    const formData = new FormData();

    await expect(unpublishPostAction(formData)).rejects.toThrow("REDIRECT:/admin/blog");

    expect(unpublishPost).not.toHaveBeenCalled();
  });
});
