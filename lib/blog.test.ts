import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { getAllPosts, getPostBySlug, savePost, uniqueSlug } from "./blog";
import type { BlogPost } from "./blog";

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

  it("rejects a path-traversal slug instead of writing outside the posts directory", () => {
    const maliciousPost: BlogPost = {
      slug: "../../../../tmp/pwned-blog-test",
      title: "Malicious",
      date: "2026-08-24",
      excerpt: "x",
      coverImage: "x",
      seoTitle: "x",
      seoDescription: "x",
      bodyMarkdown: "x",
    };
    expect(() => savePost(maliciousPost, fixturesDir)).toThrow(/Invalid post slug/);
    expect(fs.existsSync("/tmp/pwned-blog-test.md")).toBe(false);
  });

  it("rejects an empty slug", () => {
    const emptySlugPost: BlogPost = {
      slug: "",
      title: "Empty Slug",
      date: "2026-08-24",
      excerpt: "x",
      coverImage: "x",
      seoTitle: "x",
      seoDescription: "x",
      bodyMarkdown: "x",
    };
    expect(() => savePost(emptySlugPost, fixturesDir)).toThrow(/Invalid post slug/);
  });
});

describe("getPostBySlug slug validation", () => {
  it("returns null for a path-traversal slug instead of reading outside the posts directory", () => {
    expect(getPostBySlug("../../../../etc/passwd", fixturesDir)).toBeNull();
  });

  it("returns null for an empty slug", () => {
    expect(getPostBySlug("", fixturesDir)).toBeNull();
  });
});

describe("uniqueSlug / create-mode collision handling", () => {
  it("returns the desired slug unchanged when there is no collision", () => {
    expect(uniqueSlug("no-collision-slug", fixturesDir)).toBe("no-collision-slug");
  });

  it("appends a numeric suffix when the desired slug already exists", () => {
    savePost(
      {
        slug: "duplicate-title",
        title: "Duplicate Title",
        date: "2026-08-24",
        excerpt: "Original.",
        coverImage: "https://example.com/e.jpg",
        seoTitle: "Duplicate SEO",
        seoDescription: "SEO desc",
        bodyMarkdown: "Original body.",
      },
      fixturesDir
    );

    const deduped = uniqueSlug("duplicate-title", fixturesDir);
    expect(deduped).toBe("duplicate-title-2");

    // Simulate what savePostAction does on a create-mode collision: save
    // under the de-duplicated slug rather than overwriting the original.
    savePost(
      {
        slug: deduped,
        title: "Duplicate Title (second)",
        date: "2026-08-24",
        excerpt: "Second.",
        coverImage: "https://example.com/f.jpg",
        seoTitle: "Duplicate SEO 2",
        seoDescription: "SEO desc",
        bodyMarkdown: "Second body.",
      },
      fixturesDir
    );

    // The original post must be untouched, and the new one lives at a
    // distinct slug rather than silently overwriting it.
    expect(getPostBySlug("duplicate-title", fixturesDir)?.title).toBe("Duplicate Title");
    expect(getPostBySlug("duplicate-title-2", fixturesDir)?.title).toBe(
      "Duplicate Title (second)"
    );
  });
});

describe("frontmatter validation at the fs boundary", () => {
  it("coerces a Date-typed date field to a string instead of throwing", () => {
    fs.writeFileSync(
      path.join(fixturesDir, "unquoted-date-post.md"),
      `---
title: Unquoted Date Post
date: 2026-08-24
excerpt: An excerpt.
coverImage: https://example.com/g.jpg
seoTitle: Unquoted Date SEO
seoDescription: SEO desc
---

Body of the post.
`
    );

    const post = getPostBySlug("unquoted-date-post", fixturesDir);
    expect(post).not.toBeNull();
    expect(typeof post?.date).toBe("string");
  });

  it("getAllPosts skips a malformed post file and still returns the valid ones", () => {
    const malformedDir = path.join(fixturesDir, "malformed-fixtures");
    fs.mkdirSync(malformedDir, { recursive: true });
    fs.writeFileSync(
      path.join(malformedDir, "valid-post.md"),
      `---
title: "Valid Post"
date: "2026-08-24"
excerpt: "Valid."
coverImage: "https://example.com/h.jpg"
seoTitle: "Valid SEO"
seoDescription: "SEO desc"
---

Valid body.
`
    );
    // Unterminated/invalid YAML frontmatter delimiter causes gray-matter to
    // throw when parsing this file.
    fs.writeFileSync(
      path.join(malformedDir, "broken-post.md"),
      `---
title: "Broken Post
date: "2026-08-24"
---

Broken body.
`
    );

    const posts = getAllPosts(malformedDir);
    expect(posts.map((p) => p.slug)).toEqual(["valid-post"]);
  });
});
