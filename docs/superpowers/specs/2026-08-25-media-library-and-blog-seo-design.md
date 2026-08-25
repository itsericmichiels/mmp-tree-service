# Media Library & Blog SEO Design

**Sub-project 3** of the MMP Tree Service rebuild (per the original approved
build order: foundation → blog → image admin → remaining cities →
multi-client template).

## Goal

Give the non-technical business owner a way to upload and manage photos
without touching code, and close the blog system's SEO gaps (categories,
tags, Open Graph/Twitter meta tags, structured data, real image alt text).

## Current state (verified by reading the code)

- Every city hub and service page hero uses the **same hardcoded stock
  Unsplash photo** (`components/CityHubTemplate.tsx`,
  `components/ServiceCityTemplate.tsx`) — across all 162 built pages.
- `/our-work` (`app/our-work/page.tsx`) is a static "Coming Soon" placeholder.
- The blog (`lib/blog.ts`, `components/admin/BlogPostForm.tsx`) has
  `seoTitle`/`seoDescription` only. No categories, no tags, no Open Graph or
  Twitter Card meta tags, no JSON-LD structured data. The cover image's
  `alt` attribute is hardcoded to the post title, not a real alt field.
- The blog's cover image is a plain "Cover Image URL" text input — no
  upload capability exists anywhere on the site.

## Architecture

Follows the blog system's established pattern: file-based storage under
`content/`, unauthenticated admin routes under `/admin/*` (same tradeoff
already accepted for `/admin/blog`), Server Actions (`"use server"`) for
mutations, `SLUG_PATTERN`-style validation at every filesystem write to
prevent path traversal (mirroring `lib/blog.ts`'s `assertValidSlug`).

### 1. Media library

- `lib/media.ts` — metadata store at `content/media/media.json` (array of
  `{ id, filename, url, alt, tags: string[], uploadedAt }`). Uploaded files
  themselves live under `public/uploads/`.
- Filename safety: generated server-side as
  `${slugify(originalNameWithoutExt)}-${shortId}.${ext}` — never the raw
  client-supplied filename — with an extension allowlist (`.jpg`, `.jpeg`,
  `.png`, `.webp`) and a size cap (10MB). Reject anything else.
- `/admin/media` page: upload form (file input + required alt text field +
  optional tags), a gallery grid of all uploaded media (thumbnail, alt
  text, tags, copyable `/uploads/...` URL, delete button).
- Deleting a media item removes both the file and its metadata entry.

### 2. Hero image assignment (city/service pages)

- `content/media/hero-assignments.json` — a flat map of page slug (e.g.
  `tree-service-canton-ga`, `tree-removal-canton-ga`) → media id.
- `lib/hero-images.ts` — `getHeroImageUrl(slug: string): string`, returns
  the assigned media's URL if present, else the current stock-photo
  fallback (kept as a named constant, not removed — it's the default for
  the ~150+ pages that won't get a custom photo on day one).
- `CityHubTemplate`/`ServiceCityTemplate` call `getHeroImageUrl` instead of
  hardcoding the Unsplash URL.
- Assignment UI lives on `/admin/media`: each gallery item gets a "Use as
  hero for…" control — a searchable select of all built page slugs (hub +
  service pages), backed by `builtSlugs()` from `lib/slugs.ts` (already
  exists). Choosing a slug writes/overwrites that slug's entry in
  `hero-assignments.json`.
- This keeps hero images out of the curated `content/<city>.ts` SEO copy
  files entirely — they stay code, hero assignments stay swappable data.

### 3. Our Work gallery

- Reuses media's `tags` field: an item tagged `"our-work"` appears on the
  public `/our-work` page.
- `/admin/media` gallery items get a simple toggle: "Show on Our Work
  page" (adds/removes the `"our-work"` tag).
- `app/our-work/page.tsx` replaces the "Coming Soon" copy with a responsive
  grid of every media item tagged `"our-work"` (image + alt text), falling
  back to today's placeholder copy only if the tag list is empty.

### 4. Blog SEO enhancements

**Data model** (`lib/blog.ts`'s `BlogPost` type gains):
- `category: string` (one of the managed category list, see below)
- `tags: string[]` (free-form, comma-separated in the admin form, stored
  as a YAML array in frontmatter)
- `coverImageAlt: string` (replaces the post-title fallback)

**Categories** — extensible, not a hardcoded enum:
- `content/blog/categories.json` — seeded with `["Tree Care Tips", "Local
  Guides", "Storm Safety", "Company News"]`.
- `lib/blog-categories.ts` — `getCategories()`, `addCategory(name)` (trims,
  rejects empty/duplicate names case-insensitively).
- `BlogPostForm` gets a category `<select>` populated from
  `getCategories()`, plus an "+ Add new category" option that reveals a
  text input and calls a new `addCategoryAction` Server Action before
  re-rendering the select with the new option chosen.

**Tags**: free-form comma-separated text input on `BlogPostForm`, split/
trimmed/filtered-empty on save.

**Meta tags** (`app/blog/[slug]/page.tsx`'s `generateMetadata`): add
`openGraph: { title, description, images: [coverImage], type: "article",
publishedTime: date }` and `twitter: { card: "summary_large_image", title,
description, images: [coverImage] }` alongside the existing
`title`/`description`.

**Structured data**: render a `<script type="application/ld+json">` block
on the blog post page with `@type: "BlogPosting"` — `headline`, `image`,
`datePublished`, `author` (Organization: MMP Tree Service LLC),
`publisher`, `mainEntityOfPage`.

**Cover image alt**: `app/blog/[slug]/page.tsx` and `BlogPostCard.tsx` use
`post.coverImageAlt` instead of `post.title`.

**Blog index browsing**: `/blog` page gains category filter chips (reads
`getCategories()`, links to `/blog?category=<name>`, filters
`getAllPosts()` client- or server-side by exact category match). Tags are
stored and rendered on each post but do not need their own filter UI in
this pass — YAGNI; can be added later if the owner asks for it.

## Testing

Unit tests for `lib/media.ts` (filename safety, extension/size rejection,
CRUD), `lib/hero-images.ts` (fallback vs. assigned), `lib/blog-categories.ts`
(add/dedupe/validation), and the extended `BlogPost` type's
frontmatter round-trip. Component tests for the new form fields. One e2e
test: upload an image via `/admin/media`, tag it for Our Work, confirm it
renders on `/our-work`; one e2e test for assigning a hero image and seeing
it reflected on a live city page; one e2e test for creating a post with a
category/tags and seeing the category filter work on `/blog`.

## Out of scope (explicitly deferred)

- Authentication on any `/admin/*` route (matches the existing accepted
  blog-admin tradeoff — revisit only if the owner asks).
- Image resizing/optimization pipeline beyond what `next/image` or plain
  `<img>` already gives us — no thumbnail generation service.
- A dedicated tag filter/browse UI on the blog index (tags are stored and
  displayed, not filterable, in this pass).
- Cloud storage — local filesystem only, per the owner's explicit choice;
  revisit at the hosting-decision sub-project if the final host is
  serverless.
