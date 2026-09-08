import { describe, it, expect, vi, beforeEach } from "vitest";
import { createFakeSupabase } from "./test-utils/fakeSupabase";
import type { BlogPost } from "./blog";

const fakeSupabase = createFakeSupabase();
vi.mock("./supabase", () => ({ supabase: fakeSupabase, MEDIA_BUCKET: "media" }));

beforeEach(() => {
  for (const key of Object.keys(fakeSupabase.__tables)) delete fakeSupabase.__tables[key];
});

function makePost(overrides: Partial<BlogPost> = {}): BlogPost {
  return {
    slug: "some-post",
    title: "Some Post",
    date: "2026-08-24",
    excerpt: "An excerpt.",
    coverImage: "https://example.com/x.jpg",
    coverImageAlt: "Alt text",
    category: "Tree Care Tips",
    tags: [],
    seoTitle: "SEO Title",
    seoDescription: "SEO description",
    bodyMarkdown: "Body text.",
    focusKeyword: "",
    status: "published",
    ...overrides,
  };
}

describe("getAllPosts", () => {
  it("returns an empty array when there are no posts yet", async () => {
    const { getAllPosts } = await import("./blog");
    expect(await getAllPosts()).toEqual([]);
  });

  it("returns all posts sorted newest first", async () => {
    const { savePost, getAllPosts } = await import("./blog");
    await savePost(makePost({ slug: "older-post", date: "2026-01-01" }));
    await savePost(makePost({ slug: "newer-post", date: "2026-06-01" }));

    const posts = await getAllPosts();
    expect(posts.map((p) => p.slug)).toEqual(["newer-post", "older-post"]);
  });
});

describe("getPostBySlug", () => {
  it("returns the matching post, including category and tags", async () => {
    const { savePost, getPostBySlug } = await import("./blog");
    await savePost(
      makePost({ slug: "older-post", title: "Older Post", category: "Tree Care Tips", tags: ["oak", "pruning"] })
    );

    const post = await getPostBySlug("older-post");
    expect(post?.title).toBe("Older Post");
    expect(post?.category).toBe("Tree Care Tips");
    expect(post?.tags).toEqual(["oak", "pruning"]);
  });

  it("returns null for a missing slug", async () => {
    const { getPostBySlug } = await import("./blog");
    expect(await getPostBySlug("does-not-exist")).toBeNull();
  });

  it("returns null for a path-traversal slug instead of querying it", async () => {
    const { getPostBySlug } = await import("./blog");
    expect(await getPostBySlug("../../../../etc/passwd")).toBeNull();
  });

  it("returns null for an empty slug", async () => {
    const { getPostBySlug } = await import("./blog");
    expect(await getPostBySlug("")).toBeNull();
  });
});

describe("savePost", () => {
  it("writes a post that getPostBySlug can then read back", async () => {
    const { savePost, getPostBySlug } = await import("./blog");
    await savePost(
      makePost({
        slug: "brand-new-post",
        title: "Brand New Post",
        category: "Company News",
        tags: ["announcement"],
        bodyMarkdown: "This is the body.",
      })
    );

    const post = await getPostBySlug("brand-new-post");
    expect(post?.title).toBe("Brand New Post");
    expect(post?.bodyMarkdown).toBe("This is the body.");
    expect(post?.category).toBe("Company News");
    expect(post?.tags).toEqual(["announcement"]);
  });

  it("rejects a path-traversal slug instead of saving it", async () => {
    const { savePost, getAllPosts } = await import("./blog");
    await expect(savePost(makePost({ slug: "../../../../tmp/pwned-blog-test" }))).rejects.toThrow(
      /Invalid post slug/
    );
    expect(await getAllPosts()).toEqual([]);
  });

  it("rejects an empty slug", async () => {
    const { savePost } = await import("./blog");
    await expect(savePost(makePost({ slug: "" }))).rejects.toThrow(/Invalid post slug/);
  });

  it("upserts in place when saving the same slug twice, rather than duplicating it", async () => {
    const { savePost, getAllPosts } = await import("./blog");
    await savePost(makePost({ slug: "same-slug", title: "First Version" }));
    await savePost(makePost({ slug: "same-slug", title: "Second Version" }));

    const posts = await getAllPosts();
    expect(posts).toHaveLength(1);
    expect(posts[0].title).toBe("Second Version");
  });
});

describe("getPublishedPosts / getPublishedPostBySlug", () => {
  it("getPublishedPosts excludes drafts", async () => {
    const { savePost, getPublishedPosts } = await import("./blog");
    await savePost(makePost({ slug: "live-post", status: "published" }));
    await savePost(makePost({ slug: "draft-post", status: "draft" }));

    const posts = await getPublishedPosts();
    expect(posts.map((p) => p.slug)).toEqual(["live-post"]);
  });

  it("getPublishedPostBySlug returns null for a draft, even though it exists", async () => {
    const { savePost, getPublishedPostBySlug } = await import("./blog");
    await savePost(makePost({ slug: "draft-post", status: "draft" }));

    expect(await getPublishedPostBySlug("draft-post")).toBeNull();
  });

  it("getPublishedPostBySlug returns the post when it is published", async () => {
    const { savePost, getPublishedPostBySlug } = await import("./blog");
    await savePost(makePost({ slug: "live-post", status: "published", title: "Live Post" }));

    expect((await getPublishedPostBySlug("live-post"))?.title).toBe("Live Post");
  });
});

describe("publishPost", () => {
  it("flips a draft to published without changing anything else", async () => {
    const { savePost, publishPost, getPostBySlug, getPublishedPostBySlug } = await import("./blog");
    await savePost(makePost({ slug: "pending-post", status: "draft", title: "Pending Post" }));

    expect(await getPublishedPostBySlug("pending-post")).toBeNull();

    await publishPost("pending-post");

    const post = await getPostBySlug("pending-post");
    expect(post?.status).toBe("published");
    expect(post?.title).toBe("Pending Post");
    expect((await getPublishedPostBySlug("pending-post"))?.title).toBe("Pending Post");
  });
});

describe("uniqueSlug / create-mode collision handling", () => {
  it("returns the desired slug unchanged when there is no collision", async () => {
    const { uniqueSlug } = await import("./blog");
    expect(await uniqueSlug("no-collision-slug")).toBe("no-collision-slug");
  });

  it("appends a numeric suffix when the desired slug already exists", async () => {
    const { savePost, getPostBySlug, uniqueSlug } = await import("./blog");
    await savePost(makePost({ slug: "duplicate-title", title: "Duplicate Title" }));

    const deduped = await uniqueSlug("duplicate-title");
    expect(deduped).toBe("duplicate-title-2");

    await savePost(makePost({ slug: deduped, title: "Duplicate Title (second)" }));

    expect((await getPostBySlug("duplicate-title"))?.title).toBe("Duplicate Title");
    expect((await getPostBySlug("duplicate-title-2"))?.title).toBe("Duplicate Title (second)");
  });
});
