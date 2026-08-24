# Blog System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a file-based blog (plain Markdown posts, no database) with public listing/post pages and an unauthenticated admin UI for writing and editing posts, including a live internal/external link-count helper.

**Architecture:** Posts are `.md` files with YAML frontmatter under `content/blog/posts/`, read via a small `lib/blog.ts` data layer (mirrors the existing `lib/cities.ts` pattern). Public routes (`/blog`, `/blog/[slug]`) and admin routes (`/admin/blog`, `/admin/blog/new`, `/admin/blog/[slug]/edit`) all read/write that same directory directly — no database, no build step required for a new post to go live.

**Tech Stack:** Next.js App Router (existing project), `gray-matter` (frontmatter parsing), `marked` (Markdown → HTML), `sanitize-html` (defense-in-depth against the admin route being unauthenticated).

**Spec:** `docs/superpowers/specs/2026-08-24-blog-system-design.md`

## Global Constraints

- Posts are plain Markdown (`.md`), not MDX. (Spec §Content storage)
- Frontmatter fields, exact names: `title`, `date`, `excerpt`, `coverImage`, `seoTitle`, `seoDescription`. No tags, categories, or author field. (Spec §Content storage)
- No draft/published flag — saving publishes immediately. (Spec §Content storage)
- `/admin/blog*` routes have no authentication — this is a deliberate, spec-approved decision for this phase, not an oversight. (Spec §Admin)
- A post's slug is fixed once created; the edit form's slug field is read-only (still submits its value — HTML `readonly` inputs post normally, unlike `disabled`). (Spec §Admin)
- Link-count helper: parses `[text](url)` in the body textarea, classifies a URL as internal if it starts with `/` or contains `mmptreeservice.com`, otherwise external. Shows live "X/5" counts for each, turning green at ≥5. This is guidance only — never blocks saving. (Spec §Admin)
- `/blog/[slug]` pages get a "Get a Free Estimate" CTA band at the end; they do NOT include `<MapEmbed>` (unlike the Canton pages). (Spec §Public routes)
- Every blog-related page (`/blog`, `/blog/[slug]`, `/admin/blog`, `/admin/blog/new`, `/admin/blog/[slug]/edit`) must export `export const dynamic = "force-dynamic";`. Reason: posts are written to disk at runtime by the admin form while the server is already running (`next start`); without forcing dynamic rendering, Next.js would statically cache these pages at build time and neither a brand-new post nor an edit to an existing post would appear without a full rebuild — directly breaking the "publishes immediately" requirement.
- This project's installed Next.js version has been flagged (`AGENTS.md`) as having API/convention differences from typical training-data knowledge. Before writing Task 6, this plan's author already checked `node_modules/next/dist/docs/01-app/02-guides/forms.md` for this exact version and confirmed the `<form action={serverActionFn}>` + top-level `"use server"` pattern used in Task 6 is correct and current — no further verification needed there. If any *other* task in this plan runs into a Next.js API that doesn't behave as written (an import path, a config option, a routing convention), check `node_modules/next/dist/docs/` for that specific API before assuming the plan is wrong, and note what you found in your report.
- A file with a top-level `"use server"` directive may only export `async` functions — this is why the plan splits FormData-parsing (pure, sync, testable) from the actual server action (thin, async, wraps the pure function) into two separate files.

---

## File Structure

```
site/
  lib/
    slugify.ts              # pure title -> URL slug (client-safe: no node:fs)
    slugify.test.ts
    markdown.ts              # renderMarkdownToHtml(markdown) -> sanitized HTML
    markdown.test.ts
    linkCount.ts              # countLinks(markdown) -> {internal, external} (client-safe)
    linkCount.test.ts
    blog.ts                    # BlogPost type + getAllPosts/getPostBySlug/savePost (server-only: uses node:fs)
    blog.test.ts
    blogFormData.ts             # buildPostFromFormData(FormData) -> BlogPost (pure, testable)
    blogFormData.test.ts
    blog-actions.ts               # "use server" — savePostAction(FormData)
  components/
    BlogPostCard.tsx          # public card, used on /blog
    admin/
      BlogPostForm.tsx         # "use client" — shared create/edit form + link-count UI
  app/
    blog/
      page.tsx                 # MODIFY: replace placeholder with real card-grid index
      [slug]/
        page.tsx                 # CREATE: full post page
    admin/
      blog/
        page.tsx                 # CREATE: list of posts + "New Post" link
        new/
          page.tsx                 # CREATE: new-post form
        [slug]/
          edit/
            page.tsx                 # CREATE: edit-post form
    sitemap.ts                  # MODIFY: include blog post URLs
  content/
    blog/
      posts/                     # created at runtime by savePost(); starts empty
  e2e/
    blog-admin.spec.ts          # CREATE: create-a-post-and-see-it-live flow
```

---

### Task 1: Dependencies and Markdown rendering

**Files:**
- Modify: `package.json` (add dependencies)
- Create: `lib/markdown.ts`
- Test: `lib/markdown.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `renderMarkdownToHtml(markdown: string): string` — consumed by Task 8 (`/blog/[slug]/page.tsx`)

- [ ] **Step 1: Install dependencies**

```bash
npm install marked sanitize-html
npm install -D @types/sanitize-html
```

- [ ] **Step 2: Write the failing tests**

```ts
// lib/markdown.test.ts
import { describe, it, expect } from "vitest";
import { renderMarkdownToHtml } from "./markdown";

describe("renderMarkdownToHtml", () => {
  it("converts basic markdown to HTML", () => {
    const html = renderMarkdownToHtml("# Hello\n\nThis is **bold** text.");
    expect(html).toContain("<h1>Hello</h1>");
    expect(html).toContain("<strong>bold</strong>");
  });

  it("converts markdown links to anchor tags", () => {
    const html = renderMarkdownToHtml("[Tree Removal](/tree-removal-canton-ga)");
    expect(html).toContain('href="/tree-removal-canton-ga"');
  });

  it("strips a raw script tag (sanitization)", () => {
    const html = renderMarkdownToHtml("Hello <script>alert('xss')</script> world");
    expect(html).not.toContain("<script>");
  });

  it("preserves an img tag with src and alt", () => {
    const html = renderMarkdownToHtml("![A tree](https://example.com/tree.jpg)");
    expect(html).toContain('src="https://example.com/tree.jpg"');
    expect(html).toContain('alt="A tree"');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
npx vitest run lib/markdown.test.ts
```
Expected: FAIL — `lib/markdown.ts` does not exist.

- [ ] **Step 4: Write the implementation**

```ts
// lib/markdown.ts
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

export function renderMarkdownToHtml(markdown: string): string {
  const rawHtml = marked.parse(markdown, { async: false }) as string;
  return sanitizeHtml(rawHtml, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "title"],
      a: ["href", "name", "target", "rel"],
    },
  });
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npx vitest run lib/markdown.test.ts
```
Expected: PASS (4 tests)

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json lib/markdown.ts lib/markdown.test.ts
git commit -m "Add Markdown rendering with sanitization"
```

---

### Task 2: Slug helper and blog data layer

**Files:**
- Create: `lib/slugify.ts`
- Test: `lib/slugify.test.ts`
- Create: `lib/blog.ts`
- Test: `lib/blog.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `slugify(title: string): string` — consumed by Task 7 (`BlogPostForm`)
  - `type BlogPost = { slug, title, date, excerpt, coverImage, seoTitle, seoDescription, bodyMarkdown }` — consumed by Tasks 4, 5, 6, 7, 8
  - `getAllPosts(postsDir?: string): BlogPost[]` (newest-first) — consumed by Task 4 (`/blog`), Task 5 (`sitemap.ts`), Task 8 (`/admin/blog`)
  - `getPostBySlug(slug: string, postsDir?: string): BlogPost | null` — consumed by Task 5 (`/blog/[slug]`), Task 8 (`/admin/blog/[slug]/edit`)
  - `savePost(post: BlogPost, postsDir?: string): void` — consumed by Task 6 (`blog-actions.ts`)

- [ ] **Step 1: Write the failing test for `slugify`**

```ts
// lib/slugify.test.ts
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run lib/slugify.test.ts
```
Expected: FAIL — `lib/slugify.ts` does not exist.

- [ ] **Step 3: Write the `slugify` implementation**

```ts
// lib/slugify.ts
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run lib/slugify.test.ts
```
Expected: PASS (2 tests)

- [ ] **Step 5: Install gray-matter**

```bash
npm install gray-matter
```

- [ ] **Step 6: Write the failing tests for the blog data layer**

```ts
// lib/blog.test.ts
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
```

- [ ] **Step 7: Run test to verify it fails**

```bash
npx vitest run lib/blog.test.ts
```
Expected: FAIL — `lib/blog.ts` does not exist.

- [ ] **Step 8: Write the blog data layer implementation**

```ts
// lib/blog.ts
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  coverImage: string;
  seoTitle: string;
  seoDescription: string;
  bodyMarkdown: string;
};

const DEFAULT_POSTS_DIR = path.join(process.cwd(), "content/blog/posts");

function readPostFile(filePath: string, slug: string): BlogPost {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return {
    slug,
    title: data.title,
    date: data.date,
    excerpt: data.excerpt,
    coverImage: data.coverImage,
    seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
    bodyMarkdown: content.trim(),
  };
}

export function getAllPosts(postsDir: string = DEFAULT_POSTS_DIR): BlogPost[] {
  if (!fs.existsSync(postsDir)) return [];
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));
  const posts = files.map((file) =>
    readPostFile(path.join(postsDir, file), file.replace(/\.md$/, ""))
  );
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(
  slug: string,
  postsDir: string = DEFAULT_POSTS_DIR
): BlogPost | null {
  const filePath = path.join(postsDir, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  return readPostFile(filePath, slug);
}

export function savePost(post: BlogPost, postsDir: string = DEFAULT_POSTS_DIR): void {
  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }
  const fileContents = matter.stringify(post.bodyMarkdown, {
    title: post.title,
    date: post.date,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
  });
  fs.writeFileSync(path.join(postsDir, `${post.slug}.md`), fileContents, "utf-8");
}
```

- [ ] **Step 9: Run test to verify it passes**

```bash
npx vitest run lib/blog.test.ts
```
Expected: PASS (6 tests)

- [ ] **Step 10: Commit**

```bash
git add package.json package-lock.json lib/slugify.ts lib/slugify.test.ts lib/blog.ts lib/blog.test.ts
git commit -m "Add slugify helper and file-based blog data layer"
```

---

### Task 3: Link-count helper

**Files:**
- Create: `lib/linkCount.ts`
- Test: `lib/linkCount.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `type LinkCounts = { internal: number; external: number }`, `countLinks(markdown: string, siteDomain?: string): LinkCounts` — consumed by Task 7 (`BlogPostForm`)

- [ ] **Step 1: Write the failing test**

```ts
// lib/linkCount.test.ts
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run lib/linkCount.test.ts
```
Expected: FAIL — `lib/linkCount.ts` does not exist.

- [ ] **Step 3: Write the implementation**

```ts
// lib/linkCount.ts
export type LinkCounts = { internal: number; external: number };

export function countLinks(
  markdown: string,
  siteDomain: string = "mmptreeservice.com"
): LinkCounts {
  const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g;
  let internal = 0;
  let external = 0;
  let match: RegExpExecArray | null;
  while ((match = linkPattern.exec(markdown)) !== null) {
    const url = match[1];
    if (url.startsWith("/") || url.includes(siteDomain)) {
      internal++;
    } else {
      external++;
    }
  }
  return { internal, external };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run lib/linkCount.test.ts
```
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/linkCount.ts lib/linkCount.test.ts
git commit -m "Add link-count helper for internal/external SEO link tracking"
```

---

### Task 4: Blog index page

**Files:**
- Create: `components/BlogPostCard.tsx`
- Modify: `app/blog/page.tsx` (replace the "coming soon" placeholder entirely)

**Interfaces:**
- Consumes: `BlogPost` type and `getAllPosts` from `lib/blog.ts` (Task 2)
- Produces: `<BlogPostCard post={BlogPost} />` (reusable, no other consumer in this plan) — the `/blog` route

- [ ] **Step 1: Write `BlogPostCard`**

```tsx
// components/BlogPostCard.tsx
import Link from "next/link";
import type { BlogPost } from "@/lib/blog";

export function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <div className="card">
      <img className="card__img" src={post.coverImage} alt={post.title} />
      <div className="card__body">
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
        <p style={{ fontSize: ".8rem", color: "var(--ink-soft)" }}>{post.date}</p>
        <Link className="card__link" href={`/blog/${post.slug}`}>
          Read more →
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace the blog index page**

```tsx
// app/blog/page.tsx
import { getAllPosts } from "@/lib/blog";
import { BlogPostCard } from "@/components/BlogPostCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blog | MMP Tree Service LLC",
  description: "Tree care tips for North Metro Atlanta homeowners.",
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Blog</span>
          <h1>Tree Care Tips for Atlanta Homeowners</h1>
          <p>
            Practical advice on tree removal, trimming, storm damage, and
            more from the MMP Tree Service crew.
          </p>
        </div>
        {posts.length === 0 ? (
          <p>No posts yet — check back soon.</p>
        ) : (
          <div className="grid grid--3">
            {posts.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify the app builds**

```bash
npm run build
```
Expected: build succeeds; `/blog` still listed as a route (now dynamic, marked `ƒ` instead of `○` in the route output — that's expected given `force-dynamic`).

- [ ] **Step 4: Commit**

```bash
git add components/BlogPostCard.tsx app/blog/page.tsx
git commit -m "Replace blog placeholder with a real, data-driven index page"
```

---

### Task 5: Blog post page and sitemap

**Files:**
- Create: `app/blog/[slug]/page.tsx`
- Modify: `app/sitemap.ts`

**Interfaces:**
- Consumes: `getPostBySlug`/`getAllPosts` from `lib/blog.ts` (Task 2), `renderMarkdownToHtml` from `lib/markdown.ts` (Task 1), `builtSlugs` from `lib/slugs.ts` (existing)
- Produces: the `/blog/[slug]` route

- [ ] **Step 1: Write the post page**

```tsx
// app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/blog";
import { renderMarkdownToHtml } from "@/lib/markdown";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.seoTitle,
    description: post.seoDescription,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const html = renderMarkdownToHtml(post.bodyMarkdown);

  return (
    <>
      <section className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          <p style={{ color: "var(--ink-soft)", fontSize: ".85rem" }}>{post.date}</p>
          <h1>{post.title}</h1>
          <img
            src={post.coverImage}
            alt={post.title}
            style={{ width: "100%", borderRadius: "var(--radius)", margin: "20px 0" }}
          />
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </section>
      <section className="estimate-cta-band" style={{ margin: "0 24px 60px" }}>
        <div>
          <h3>Need Tree Service in North Metro Atlanta?</h3>
          <p>Get a free, no-obligation estimate from MMP Tree Service.</p>
        </div>
        <a href="/contact" className="btn btn-orange">
          Get a Free Estimate
        </a>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Update the sitemap to include blog posts**

Read the current `app/sitemap.ts` first — it already exists (added in the foundation project) and lists static pages plus `builtSlugs()`. Add blog post URLs to it:

```ts
// app/sitemap.ts
import type { MetadataRoute } from "next";
import { builtSlugs } from "@/lib/slugs";
import { getAllPosts } from "@/lib/blog";

export const dynamic = "force-dynamic";

// Placeholder base URL — update once the site has a real production
// domain (this project is intended to eventually replace mmptreeservice.com).
const BASE_URL = "https://mmptreeservice.com";

const STATIC_PATHS = [
  "/",
  "/service-areas",
  "/about",
  "/testimonials",
  "/contact",
  "/our-work",
  "/blog",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const blogPaths = getAllPosts().map((post) => `/blog/${post.slug}`);
  const paths = [...STATIC_PATHS, ...builtSlugs().map((slug) => `/${slug}`), ...blogPaths];

  return paths.map((path) => ({
    url: `${BASE_URL}${path === "/" ? "" : path}`,
  }));
}
```

- [ ] **Step 3: Verify the app builds**

```bash
npm run build
```
Expected: build succeeds.

- [ ] **Step 4: Manually verify a 404 for a missing post**

```bash
npm run start -- -p 3411 &
sleep 2
curl -s -o /dev/null -w "%{http_code}" http://localhost:3411/blog/does-not-exist
kill %1
```
Expected: prints `404`.

- [ ] **Step 5: Commit**

```bash
git add app/blog/[slug]/page.tsx app/sitemap.ts
git commit -m "Add blog post page and include posts in the sitemap"
```

---

### Task 6: Post form-data parsing and server action

**Files:**
- Create: `lib/blogFormData.ts`
- Test: `lib/blogFormData.test.ts`
- Create: `lib/blog-actions.ts`

**Interfaces:**
- Consumes: `BlogPost` type and `savePost` from `lib/blog.ts` (Task 2)
- Produces: `buildPostFromFormData(formData: FormData): BlogPost`, `savePostAction(formData: FormData): Promise<void>` — consumed by Task 8 (admin pages)

**Note:** the `<form action={...}>` + `"use server"` pattern below was already verified against this project's installed Next.js docs when this plan was written (see Global Constraints) — write it as given.

- [ ] **Step 1: Write the failing test for the pure parsing function**

```ts
// lib/blogFormData.test.ts
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
      seoTitle: "Test Post SEO",
      seoDescription: "SEO description.",
      bodyMarkdown: "Body text here.",
    });
  });

  it("defaults missing fields to empty strings", () => {
    const formData = new FormData();
    formData.set("slug", "minimal-post");
    const post = buildPostFromFormData(formData);
    expect(post.title).toBe("");
    expect(post.bodyMarkdown).toBe("");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run lib/blogFormData.test.ts
```
Expected: FAIL — `lib/blogFormData.ts` does not exist.

- [ ] **Step 3: Write the implementation**

```ts
// lib/blogFormData.ts
import type { BlogPost } from "./blog";

export function buildPostFromFormData(formData: FormData): BlogPost {
  return {
    slug: String(formData.get("slug") ?? ""),
    title: String(formData.get("title") ?? ""),
    date: String(formData.get("date") ?? ""),
    excerpt: String(formData.get("excerpt") ?? ""),
    coverImage: String(formData.get("coverImage") ?? ""),
    seoTitle: String(formData.get("seoTitle") ?? ""),
    seoDescription: String(formData.get("seoDescription") ?? ""),
    bodyMarkdown: String(formData.get("bodyMarkdown") ?? ""),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run lib/blogFormData.test.ts
```
Expected: PASS (2 tests)

- [ ] **Step 5: Write the server action**

This file's exports must all be `async` functions (a `"use server"` file constraint) — that's why the FormData-parsing logic lives in the separate, plain `blogFormData.ts` module instead of here.

```ts
// lib/blog-actions.ts
"use server";

import { redirect } from "next/navigation";
import { savePost } from "@/lib/blog";
import { buildPostFromFormData } from "@/lib/blogFormData";

export async function savePostAction(formData: FormData): Promise<void> {
  const post = buildPostFromFormData(formData);
  savePost(post);
  redirect(`/blog/${post.slug}`);
}
```

- [ ] **Step 6: Verify the app builds**

```bash
npm run build
```
Expected: build succeeds (nothing imports `blog-actions.ts` yet — that's Task 8 — so this only checks the file compiles standalone under the `"use server"` convention).

- [ ] **Step 7: Commit**

```bash
git add lib/blogFormData.ts lib/blogFormData.test.ts lib/blog-actions.ts
git commit -m "Add post form-data parsing and the savePostAction server action"
```

---

### Task 7: `BlogPostForm` component

**Files:**
- Create: `components/admin/BlogPostForm.tsx`

**Interfaces:**
- Consumes: `slugify` from `lib/slugify.ts` (Task 2), `countLinks` from `lib/linkCount.ts` (Task 3), `BlogPost` type from `lib/blog.ts` (Task 2)
- Produces: `<BlogPostForm action={(formData: FormData) => void | Promise<void>} initialPost?={BlogPost} slugEditable={boolean} />` — consumed by Task 8

- [ ] **Step 1: Write the component**

```tsx
// components/admin/BlogPostForm.tsx
"use client";

import { useState } from "react";
import { slugify } from "@/lib/slugify";
import { countLinks } from "@/lib/linkCount";
import type { BlogPost } from "@/lib/blog";

export function BlogPostForm({
  action,
  initialPost,
  slugEditable,
}: {
  action: (formData: FormData) => void | Promise<void>;
  initialPost?: BlogPost;
  slugEditable: boolean;
}) {
  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [slug, setSlug] = useState(initialPost?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [body, setBody] = useState(initialPost?.bodyMarkdown ?? "");

  const linkCounts = countLinks(body);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  return (
    <form action={action} className="estimate-panel">
      <div className="form-field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="slug">URL Slug</label>
        <input
          id="slug"
          name="slug"
          type="text"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          readOnly={!slugEditable}
          required
        />
      </div>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="date">Date</label>
          <input
            id="date"
            name="date"
            type="date"
            defaultValue={initialPost?.date ?? new Date().toISOString().slice(0, 10)}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="coverImage">Cover Image URL</label>
          <input
            id="coverImage"
            name="coverImage"
            type="text"
            defaultValue={initialPost?.coverImage ?? ""}
            required
          />
        </div>
      </div>
      <div className="form-field">
        <label htmlFor="excerpt">Excerpt</label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={2}
          defaultValue={initialPost?.excerpt ?? ""}
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="seoTitle">SEO Title</label>
        <input
          id="seoTitle"
          name="seoTitle"
          type="text"
          defaultValue={initialPost?.seoTitle ?? ""}
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="seoDescription">SEO Description</label>
        <textarea
          id="seoDescription"
          name="seoDescription"
          rows={2}
          defaultValue={initialPost?.seoDescription ?? ""}
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="bodyMarkdown">Body (Markdown)</label>
        <textarea
          id="bodyMarkdown"
          name="bodyMarkdown"
          rows={16}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
        <p
          className="form-note"
          style={{ color: linkCounts.internal >= 5 ? "var(--green)" : "var(--ink-soft)" }}
        >
          Internal links: {linkCounts.internal}/5 {linkCounts.internal >= 5 ? "✓" : ""}
        </p>
        <p
          className="form-note"
          style={{ color: linkCounts.external >= 5 ? "var(--green)" : "var(--ink-soft)" }}
        >
          External links: {linkCounts.external}/5 {linkCounts.external >= 5 ? "✓" : ""}
        </p>
      </div>
      <button type="submit" className="btn btn-orange btn-block">
        {initialPost ? "Save Changes" : "Publish Post"}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Verify the app builds**

```bash
npm run build
```
Expected: build succeeds (not imported by any page yet — that's Task 8).

- [ ] **Step 3: Commit**

```bash
git add components/admin/BlogPostForm.tsx
git commit -m "Add shared create/edit BlogPostForm with live link-count helper"
```

---

### Task 8: Admin pages

**Files:**
- Create: `app/admin/blog/page.tsx`
- Create: `app/admin/blog/new/page.tsx`
- Create: `app/admin/blog/[slug]/edit/page.tsx`

**Interfaces:**
- Consumes: `getAllPosts`/`getPostBySlug` from `lib/blog.ts` (Task 2), `savePostAction` from `lib/blog-actions.ts` (Task 6), `<BlogPostForm>` from `components/admin/BlogPostForm.tsx` (Task 7)
- Produces: the `/admin/blog`, `/admin/blog/new`, `/admin/blog/[slug]/edit` routes

- [ ] **Step 1: Write the list page**

```tsx
// app/admin/blog/page.tsx
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

export const dynamic = "force-dynamic";

export default function AdminBlogListPage() {
  const posts = getAllPosts();

  return (
    <section className="section">
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1>Blog Admin</h1>
          <Link href="/admin/blog/new" className="btn btn-orange">
            New Post
          </Link>
        </div>
        {posts.length === 0 ? (
          <p>No posts yet.</p>
        ) : (
          <ul>
            {posts.map((post) => (
              <li key={post.slug} style={{ marginBottom: 12 }}>
                <strong>{post.title}</strong> — {post.date} —{" "}
                <Link href={`/admin/blog/${post.slug}/edit`}>Edit</Link> —{" "}
                <Link href={`/blog/${post.slug}`}>View</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Write the new-post page**

```tsx
// app/admin/blog/new/page.tsx
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { savePostAction } from "@/lib/blog-actions";

export const dynamic = "force-dynamic";

export default function NewBlogPostPage() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 760 }}>
        <h1>New Blog Post</h1>
        <BlogPostForm action={savePostAction} slugEditable={true} />
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Write the edit page**

```tsx
// app/admin/blog/[slug]/edit/page.tsx
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/blog";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { savePostAction } from "@/lib/blog-actions";

export const dynamic = "force-dynamic";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 760 }}>
        <h1>Edit Blog Post</h1>
        <BlogPostForm action={savePostAction} initialPost={post} slugEditable={false} />
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Verify the app builds**

```bash
npm run build
```
Expected: build succeeds; `/admin/blog`, `/admin/blog/new` listed as routes (the `[slug]/edit` dynamic route won't print a static example since no posts exist yet, but it should not error).

- [ ] **Step 5: Manual smoke test**

```bash
npm run start -- -p 3411 &
sleep 2
curl -s http://localhost:3411/admin/blog | grep -o "Blog Admin"
curl -s http://localhost:3411/admin/blog/new | grep -o "New Blog Post"
kill %1
```
Expected: both greps print a match.

- [ ] **Step 6: Commit**

```bash
git add app/admin/blog/page.tsx app/admin/blog/new/page.tsx "app/admin/blog/[slug]/edit/page.tsx"
git commit -m "Add admin pages for listing, creating, and editing blog posts"
```

---

### Task 9: End-to-end verification

**Files:**
- Create: `e2e/blog-admin.spec.ts`

**Interfaces:**
- Consumes: the running built app (all previous tasks)
- Produces: proof the full create → publish → view flow works together

- [ ] **Step 1: Write the e2e spec**

```ts
// e2e/blog-admin.spec.ts
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

test("creating a post via admin makes it live on the blog", async ({ page }) => {
  const uniqueSlug = `e2e-test-post-${Date.now()}`;
  const postFilePath = path.join(process.cwd(), "content/blog/posts", `${uniqueSlug}.md`);

  try {
    await page.goto("/admin/blog/new");

    await page.getByLabel("Title").fill("E2E Test Post");
    await page.getByLabel("URL Slug").fill(uniqueSlug);
    await page
      .getByLabel("Cover Image URL")
      .fill("https://images.unsplash.com/photo-1441974231531-c6227db76b6e");
    await page.getByLabel("Excerpt").fill("An excerpt written by the e2e test.");
    await page.getByLabel("SEO Title").fill("E2E Test Post SEO Title");
    await page.getByLabel("SEO Description").fill("E2E test post SEO description.");
    await page.getByLabel("Body (Markdown)").fill(
      "This is the body.\n\n" +
        "[Tree Removal](/tree-removal-canton-ga) [Tree Trimming](/tree-trimming-canton-ga) " +
        "[Stump Grinding](/stump-grinding-canton-ga) [Lot Clearing](/lot-clearing-canton-ga) " +
        "[Emergency Service](/emergency-tree-service-canton-ga)\n\n" +
        "[ISA](https://www.isa-arbor.com/) [BBB](https://www.bbb.org/) " +
        "[Georgia Forestry](https://gatrees.org/) [Cherokee County](https://www.cherokeega.com/) " +
        "[NOAA](https://www.weather.gov/)"
    );

    await expect(page.getByText("Internal links: 5/5 ✓")).toBeVisible();
    await expect(page.getByText("External links: 5/5 ✓")).toBeVisible();

    await page.getByRole("button", { name: "Publish Post" }).click();

    await expect(page).toHaveURL(new RegExp(`/blog/${uniqueSlug}`));
    await expect(page.getByRole("heading", { name: "E2E Test Post" })).toBeVisible();

    await page.goto("/blog");
    await expect(page.getByRole("heading", { name: "E2E Test Post" })).toBeVisible();
  } finally {
    if (fs.existsSync(postFilePath)) {
      fs.unlinkSync(postFilePath);
    }
  }
});

test("editing a post keeps its slug and updates its content", async ({ page }) => {
  const uniqueSlug = `e2e-edit-post-${Date.now()}`;
  const postFilePath = path.join(process.cwd(), "content/blog/posts", `${uniqueSlug}.md`);

  try {
    await page.goto("/admin/blog/new");
    await page.getByLabel("Title").fill("Original Title");
    await page.getByLabel("URL Slug").fill(uniqueSlug);
    await page.getByLabel("Cover Image URL").fill("https://example.com/x.jpg");
    await page.getByLabel("Excerpt").fill("Original excerpt.");
    await page.getByLabel("SEO Title").fill("Original SEO Title");
    await page.getByLabel("SEO Description").fill("Original SEO description.");
    await page.getByLabel("Body (Markdown)").fill("Original body.");
    await page.getByRole("button", { name: "Publish Post" }).click();
    await expect(page).toHaveURL(new RegExp(`/blog/${uniqueSlug}`));

    await page.goto(`/admin/blog/${uniqueSlug}/edit`);
    await expect(page.getByLabel("URL Slug")).toHaveAttribute("readonly", "");
    await page.getByLabel("Title").fill("Updated Title");
    await page.getByLabel("Body (Markdown)").fill("Updated body.");
    await page.getByRole("button", { name: "Save Changes" }).click();

    await expect(page).toHaveURL(new RegExp(`/blog/${uniqueSlug}`));
    await expect(page.getByRole("heading", { name: "Updated Title" })).toBeVisible();
    await expect(page.getByText("Updated body.")).toBeVisible();
  } finally {
    if (fs.existsSync(postFilePath)) {
      fs.unlinkSync(postFilePath);
    }
  }
});
```

- [ ] **Step 2: Run the full e2e suite**

```bash
PORT=3412 npm run e2e
```
Expected: all tests PASS, including the 2 new ones and every pre-existing test from the foundation project.

- [ ] **Step 3: Run the unit suite one more time to confirm nothing regressed**

```bash
npm test
```
Expected: all unit tests (foundation project's + this plan's new ones) PASS.

- [ ] **Step 4: Commit**

```bash
git add e2e/blog-admin.spec.ts
git commit -m "Add end-to-end tests for the blog create and edit flows"
```

---

## Post-plan note

`content/blog/posts/` starts empty and is created on first save — no seed/sample post is part of this plan (the spec doesn't call for one, and inventing sample blog copy is a content-authoring task, not a coding one). The user can write their first real post through `/admin/blog/new` once this plan ships.
