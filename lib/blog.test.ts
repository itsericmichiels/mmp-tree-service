import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { getAllPosts, getPostBySlug, savePost } from "./blog";

const fixturesDir = path.join(os.tmpdir(), "mmp-blog-test-fixtures");

beforeAll(() => {
  fs.mkdirSync(fixturesDir, { recursive: true });
  fs.writeFileSync(
    path.join(fixturesDir, "older-post.md"),
    `---
title: "Older Post"
date: "2026-01-01"
excerpt: "An older post."
coverImage: "https://example.com/a.jpg"
seoTitle: "Older Post SEO"
seoDescription: "SEO desc"
---

Body of the older post.
`
  );
  fs.writeFileSync(
    path.join(fixturesDir, "newer-post.md"),
    `---
title: "Newer Post"
date: "2026-06-01"
excerpt: "A newer post."
coverImage: "https://example.com/b.jpg"
seoTitle: "Newer Post SEO"
seoDescription: "SEO desc"
---

Body of the newer post.
`
  );
});

afterAll(() => {
  fs.rmSync(fixturesDir, { recursive: true, force: true });
});

describe("getAllPosts", () => {
  it("returns all posts sorted newest first", () => {
    const posts = getAllPosts(fixturesDir);
    expect(posts.map((p) => p.slug)).toEqual(["newer-post", "older-post"]);
  });

  it("returns an empty array when the posts directory doesn't exist", () => {
    expect(getAllPosts(path.join(fixturesDir, "does-not-exist"))).toEqual([]);
  });
});

describe("getPostBySlug", () => {
  it("returns the matching post with parsed frontmatter and body", () => {
    const post = getPostBySlug("older-post", fixturesDir);
    expect(post?.title).toBe("Older Post");
    expect(post?.date).toBe("2026-01-01");
    expect(post?.bodyMarkdown).toBe("Body of the older post.");
  });

  it("returns null for a missing slug", () => {
    expect(getPostBySlug("does-not-exist", fixturesDir)).toBeNull();
  });
});

describe("savePost", () => {
  it("writes a post file that getPostBySlug can then read back", () => {
    savePost(
      {
        slug: "brand-new-post",
        title: "Brand New Post",
        date: "2026-08-24",
        excerpt: "Just written.",
        coverImage: "https://example.com/c.jpg",
        seoTitle: "Brand New SEO",
        seoDescription: "SEO desc",
        bodyMarkdown: "This is the body.",
      },
      fixturesDir
    );
    const post = getPostBySlug("brand-new-post", fixturesDir);
    expect(post?.title).toBe("Brand New Post");
    expect(post?.bodyMarkdown).toBe("This is the body.");
  });

  it("creates the posts directory if it doesn't exist yet", () => {
    const freshDir = path.join(fixturesDir, "fresh-subdir");
    savePost(
      {
        slug: "first-post",
        title: "First Post",
        date: "2026-08-24",
        excerpt: "The very first one.",
        coverImage: "https://example.com/d.jpg",
        seoTitle: "First Post SEO",
        seoDescription: "SEO desc",
        bodyMarkdown: "Hello world.",
      },
      freshDir
    );
    expect(getPostBySlug("first-post", freshDir)?.title).toBe("First Post");
  });
});
