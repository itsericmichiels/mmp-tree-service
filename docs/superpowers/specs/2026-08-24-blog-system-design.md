# MMP Tree Service — Blog System Design

Status: Approved for implementation planning
Date: 2026-08-24
Sub-project: 2 of 5 (blog) — see the foundation spec's "Deferred" section for the rest

## Context

The foundation spec (`2026-08-15-mmp-site-foundation-design.md`) shipped `/blog`
as a "coming soon" placeholder and explicitly deferred the real blog system
to a later sub-project. This spec designs that sub-project: a lightweight,
file-based blog with an unauthenticated admin form for writing posts,
matching the "format for posting blog posts" the user asked for — borrowing
the *idea* of structured content pages with SEO fields from the Fusades
project (a full database-backed CMS), at a much lighter weight appropriate
for a small-business marketing site.

Blog posts also carry the same SEO link-density discipline already
established for the city/service pages in the existing WordPress content
pipeline (`content-pipeline/SKILL.md`): at least 5 internal links and 5
external links per post.

## Decisions

### Content storage: plain Markdown, not MDX
Posts are `.md` files, not `.mdx`. MDX allows embedding live React
components inside post body text; nothing about this blog needs that
(headings, links, images, lists cover every real use case), and skipping
MDX avoids adding MDX's build-time compilation tooling for no benefit.
Plain Markdown parses with a small, dependency-light library and is
simpler on both the write path (the admin form saves raw text) and the
read path (parse-to-HTML at render time).

Each post is one file: `content/blog/posts/<slug>.md`, with YAML
frontmatter:

```yaml
---
title: "Storm Damage Tree Removal in Acworth & Sandy Springs, GA"
date: "2026-08-24"
excerpt: "One or two sentences summarizing the post, shown on the blog index card."
coverImage: "https://images.unsplash.com/photo-..."
seoTitle: "Storm Damage Tree Removal | MMP Tree Service"
seoDescription: "..."
---

Markdown body starts here.
```

No tags, categories, or author byline field — YAGNI for a single-author
blog with no filtering need yet. No draft/published flag — saving a post
publishes it immediately, matching how a small business actually writes
(no editorial review step).

### Data access layer
`lib/blog.ts`, mirroring the existing `lib/cities.ts`/`content/index.ts`
pattern already in the codebase:

```ts
type BlogPost = {
  slug: string;
  title: string;
  date: string;       // ISO yyyy-mm-dd
  excerpt: string;
  coverImage: string;
  seoTitle: string;
  seoDescription: string;
  bodyMarkdown: string; // raw markdown, rendered to HTML at display time
};

function getAllPosts(): BlogPost[];       // sorted newest-first
function getPostBySlug(slug: string): BlogPost | null;
function savePost(post: BlogPost): void;  // writes/overwrites the .md file
```

Reads happen via Node's `fs` at request time inside Server Components —
no database, no build step required for new posts to appear (a post
written through the admin form is live on next request).

### Public routes
- `/blog` — replaces the current placeholder. Card grid (cover image,
  title, excerpt, date), newest first, same visual language as existing
  service/testimonial cards (`.card`, `.grid--3` classes already in
  `globals.css`).
- `/blog/[slug]` — full post. Cover image, title, date, rendered markdown
  body, ending in a "Get a Free Estimate" CTA band (reusing the existing
  `.estimate-cta-band`/`btn-orange` pattern). No `<MapEmbed>` on post
  pages — the map is tied to location/service intent, which blog content
  isn't. Per-page `generateMetadata` from `seoTitle`/`seoDescription`,
  matching the pattern already established in `app/[slug]/page.tsx` for
  Canton pages. Added to `app/sitemap.ts`.

### Admin
`/admin/blog` — unprotected, per the approved decision that real auth is
part of the later hosting/migration sub-project, not built (and likely
rebuilt) twice.
- List view: every existing post (title, date, an Edit link) from
  `getAllPosts()`.
- New/Edit form: title, an auto-generated slug (editable at creation
  time only — once a post exists, its slug is fixed and the field is
  read-only on the edit form, so editing never orphans the old file or
  breaks a link someone already shared), date (defaults to today),
  excerpt, cover image URL, SEO title, SEO description, and a markdown
  body textarea.
- Saving calls a Next.js Server Action that writes/overwrites the `.md`
  file via `savePost()` and redirects to the published post. No delete
  action (not requested; add later if needed).
- **Link-count helper:** as the body textarea changes, client-side JS
  parses `[text](url)` links and classifies each as internal (URL starts
  with `/`, or contains `mmptreeservice.com`) or external (anything
  else), showing live counts like "3/5 internal · 6/5 external", turning
  each count green at ≥5. This is guidance, not a hard gate — the form
  still saves below threshold, since it's a best-practice nudge, not a
  data-integrity rule.

### Testing
- `lib/blog.test.ts` — unit tests for `getAllPosts`/`getPostBySlug`
  (correct parsing, newest-first sort, null on missing slug) against
  fixture `.md` files.
- An e2e test that creates a post through `/admin/blog`, confirms it
  appears on `/blog`, and that `/blog/<new-slug>` renders with the CTA
  band present.

## Deferred (unchanged from the foundation spec, still later sub-projects)
1. Image-management admin page
2. The remaining 26 cities
3. Generalizing into a reusable multi-client template
4. WordPress migration / hosting / domain cutover
5. Real authentication for any admin route (blog admin included) — added
   once hosting is decided, not before
