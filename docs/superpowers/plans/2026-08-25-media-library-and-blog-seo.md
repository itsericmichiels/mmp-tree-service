# Media Library & Blog SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the site owner an unauthenticated `/admin/media` page to upload and manage photos (assigning them as page heroes or an "Our Work" gallery), and close the blog system's SEO gaps (categories, tags, Open Graph/Twitter tags, structured data, real image alt text).

**Architecture:** File-based storage under `content/media/` (JSON metadata) and `public/uploads/` (image files), mirroring the existing blog system's pattern in `lib/blog.ts`. Unauthenticated Server Actions (`"use server"`) for all mutations, with the same filename/path-traversal safety discipline as `lib/blog.ts`'s `assertValidSlug`.

**Tech Stack:** Next.js 16 App Router, TypeScript, `node:fs`/`node:crypto` (no new npm dependencies), Vitest + React Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-08-25-media-library-and-blog-seo-design.md`

## Global Constraints

- No new npm dependencies — use `node:fs`, `node:path`, `node:crypto` (built into Node) for everything.
- Every filesystem write path must be validated so a malicious/garbage input cannot write outside its intended directory (same discipline as `lib/blog.ts`'s `SLUG_PATTERN`/`assertValidSlug`).
- Image uploads: allowed extensions are `jpg`, `jpeg`, `png`, `webp` only; max size 10MB.
- `/admin/*` routes stay unauthenticated, matching the already-accepted `/admin/blog` tradeoff. Do not add auth.
- All new admin/data-mutation code follows the existing pattern: plain file-based storage, Server Actions, `export const dynamic = "force-dynamic"` on admin pages, `metadata = { robots: { index: false, follow: false } }` on admin pages.
- CTA copy must always say "Get a Free Estimate" and use the `btn-orange` class, per the site's standing brand rule (not touched by this plan, but do not regress it).
- Reuse existing CSS classes (`.card`, `.card__img`, `.card__body`, `.grid`, `.grid--3`, `.form-field`, `.form-row`, `.form-note`, `.tag`, `.btn`, `.btn-orange`, `.btn-green`, `.btn-outline-light`, `.btn-sm`, `.estimate-panel`) — do not invent new top-level classes unless a step below says to.

---

### Task 1: `lib/media.ts` — media metadata store + file upload

**Files:**
- Create: `lib/media.ts`
- Create: `lib/media.test.ts`
- Modify: `next.config.ts` (raise the Server Actions body size limit so image uploads aren't rejected by the framework before reaching this module)

**Interfaces:**
- Produces: `MediaItem` type `{ id: string; filename: string; url: string; alt: string; tags: string[]; uploadedAt: string }`; `MEDIA_METADATA_PATH: string`; `UPLOADS_DIR: string`; `getAllMedia(metadataPath?: string): MediaItem[]`; `getMediaById(id: string, metadataPath?: string): MediaItem | null`; `isAllowedImage(originalFilename: string, sizeBytes: number): boolean`; `saveMediaFile(originalFilename: string, buffer: Buffer, alt: string, tags?: string[], metadataPath?: string, uploadsDir?: string): MediaItem`; `deleteMedia(id: string, metadataPath?: string, uploadsDir?: string): boolean`; `setMediaTags(id: string, tags: string[], metadataPath?: string): MediaItem | null`; `toggleMediaTag(id: string, tag: string, metadataPath?: string): MediaItem | null`.

- [ ] **Step 1: Write the failing tests**

Create `lib/media.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  getAllMedia,
  getMediaById,
  isAllowedImage,
  saveMediaFile,
  deleteMedia,
  setMediaTags,
  toggleMediaTag,
} from "./media";

const fixturesRoot = path.join(os.tmpdir(), "mmp-media-test-fixtures");
const metadataPath = path.join(fixturesRoot, "media.json");
const uploadsDir = path.join(fixturesRoot, "uploads");

beforeEach(() => {
  fs.rmSync(fixturesRoot, { recursive: true, force: true });
  fs.mkdirSync(fixturesRoot, { recursive: true });
});

afterAll(() => {
  fs.rmSync(fixturesRoot, { recursive: true, force: true });
});

describe("isAllowedImage", () => {
  it("accepts jpg/jpeg/png/webp under the size cap", () => {
    expect(isAllowedImage("photo.jpg", 1024)).toBe(true);
    expect(isAllowedImage("photo.JPEG", 1024)).toBe(true);
    expect(isAllowedImage("photo.png", 1024)).toBe(true);
    expect(isAllowedImage("photo.webp", 1024)).toBe(true);
  });

  it("rejects disallowed extensions", () => {
    expect(isAllowedImage("script.svg", 1024)).toBe(false);
    expect(isAllowedImage("payload.exe", 1024)).toBe(false);
    expect(isAllowedImage("no-extension", 1024)).toBe(false);
  });

  it("rejects files over 10MB and zero-byte files", () => {
    expect(isAllowedImage("photo.jpg", 10 * 1024 * 1024 + 1)).toBe(false);
    expect(isAllowedImage("photo.jpg", 0)).toBe(false);
  });
});

describe("saveMediaFile", () => {
  it("writes the file to uploadsDir and records metadata", () => {
    const item = saveMediaFile(
      "Front Yard Oak.jpg",
      Buffer.from("fake-image-bytes"),
      "A large oak in a Canton front yard",
      ["canton"],
      metadataPath,
      uploadsDir
    );

    expect(item.alt).toBe("A large oak in a Canton front yard");
    expect(item.tags).toEqual(["canton"]);
    expect(item.filename).toMatch(/^front-yard-oak-[a-f0-9]{8}\.jpg$/);
    expect(item.url).toBe(`/uploads/${item.filename}`);
    expect(fs.existsSync(path.join(uploadsDir, item.filename))).toBe(true);
    expect(getMediaById(item.id, metadataPath)).toEqual(item);
  });

  it("strips path-traversal characters from the original filename instead of writing outside uploadsDir", () => {
    const item = saveMediaFile(
      "../../../../etc/evil.png",
      Buffer.from("x"),
      "alt text",
      [],
      metadataPath,
      uploadsDir
    );

    expect(item.filename).not.toContain("..");
    expect(item.filename).not.toContain("/");
    expect(fs.existsSync(path.join(uploadsDir, item.filename))).toBe(true);
    expect(fs.existsSync("/etc/evil.png")).toBe(false);
  });

  it("throws and writes nothing for a disallowed file type", () => {
    expect(() =>
      saveMediaFile("payload.exe", Buffer.from("x"), "alt", [], metadataPath, uploadsDir)
    ).toThrow(/Rejected upload/);
    expect(getAllMedia(metadataPath)).toEqual([]);
  });

  it("throws when alt text is blank", () => {
    expect(() =>
      saveMediaFile("photo.jpg", Buffer.from("x"), "   ", [], metadataPath, uploadsDir)
    ).toThrow(/Alt text is required/);
  });

  it("creates uploadsDir and the metadata directory if they don't exist yet", () => {
    const freshMetadata = path.join(fixturesRoot, "fresh", "media.json");
    const freshUploads = path.join(fixturesRoot, "fresh-uploads");
    const item = saveMediaFile(
      "photo.png",
      Buffer.from("x"),
      "alt",
      [],
      freshMetadata,
      freshUploads
    );
    expect(fs.existsSync(path.join(freshUploads, item.filename))).toBe(true);
    expect(getAllMedia(freshMetadata)).toHaveLength(1);
  });
});

describe("getAllMedia", () => {
  it("returns an empty array when the metadata file doesn't exist", () => {
    expect(getAllMedia(metadataPath)).toEqual([]);
  });

  it("returns items newest-uploaded first", () => {
    const first = saveMediaFile("a.jpg", Buffer.from("a"), "alt a", [], metadataPath, uploadsDir);
    const second = saveMediaFile("b.jpg", Buffer.from("b"), "alt b", [], metadataPath, uploadsDir);
    const all = getAllMedia(metadataPath);
    expect(all[0].id).toBe(second.id);
    expect(all[1].id).toBe(first.id);
  });
});

describe("deleteMedia", () => {
  it("removes both the file and the metadata entry, returning true", () => {
    const item = saveMediaFile("a.jpg", Buffer.from("a"), "alt", [], metadataPath, uploadsDir);
    const filePath = path.join(uploadsDir, item.filename);
    expect(fs.existsSync(filePath)).toBe(true);

    const result = deleteMedia(item.id, metadataPath, uploadsDir);

    expect(result).toBe(true);
    expect(fs.existsSync(filePath)).toBe(false);
    expect(getMediaById(item.id, metadataPath)).toBeNull();
  });

  it("returns false for an id that doesn't exist", () => {
    expect(deleteMedia("not-a-real-id", metadataPath, uploadsDir)).toBe(false);
  });
});

describe("setMediaTags / toggleMediaTag", () => {
  it("setMediaTags replaces the tag list", () => {
    const item = saveMediaFile("a.jpg", Buffer.from("a"), "alt", ["x"], metadataPath, uploadsDir);
    const updated = setMediaTags(item.id, ["our-work", "canton"], metadataPath);
    expect(updated?.tags).toEqual(["our-work", "canton"]);
  });

  it("toggleMediaTag adds the tag when absent and removes it when present", () => {
    const item = saveMediaFile("a.jpg", Buffer.from("a"), "alt", [], metadataPath, uploadsDir);
    const withTag = toggleMediaTag(item.id, "our-work", metadataPath);
    expect(withTag?.tags).toEqual(["our-work"]);
    const withoutTag = toggleMediaTag(item.id, "our-work", metadataPath);
    expect(withoutTag?.tags).toEqual([]);
  });

  it("returns null for an id that doesn't exist", () => {
    expect(setMediaTags("nope", ["x"], metadataPath)).toBeNull();
    expect(toggleMediaTag("nope", "x", metadataPath)).toBeNull();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run lib/media.test.ts`
Expected: FAIL with "Cannot find module './media'" (the file doesn't exist yet).

- [ ] **Step 3: Implement `lib/media.ts`**

```ts
// lib/media.ts
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export type MediaItem = {
  id: string;
  filename: string;
  url: string;
  alt: string;
  tags: string[];
  uploadedAt: string;
};

export const MEDIA_METADATA_PATH = path.join(process.cwd(), "content/media/media.json");
export const UPLOADS_DIR = path.join(process.cwd(), "public/uploads");

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

function readMetadata(metadataPath: string): MediaItem[] {
  if (!fs.existsSync(metadataPath)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeMetadata(metadataPath: string, items: MediaItem[]): void {
  const dir = path.dirname(metadataPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(metadataPath, JSON.stringify(items, null, 2), "utf-8");
}

function extensionFor(originalFilename: string): string {
  const match = /\.([a-zA-Z0-9]+)$/.exec(originalFilename);
  return match ? match[1].toLowerCase() : "";
}

function slugifyBase(originalFilename: string): string {
  const withoutExt = originalFilename.replace(/\.[^.]+$/, "");
  const slug = withoutExt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "image";
}

export function isAllowedImage(originalFilename: string, sizeBytes: number): boolean {
  const ext = extensionFor(originalFilename);
  return ALLOWED_EXTENSIONS.has(ext) && sizeBytes > 0 && sizeBytes <= MAX_FILE_SIZE_BYTES;
}

export function getAllMedia(metadataPath: string = MEDIA_METADATA_PATH): MediaItem[] {
  return readMetadata(metadataPath).sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
}

export function getMediaById(
  id: string,
  metadataPath: string = MEDIA_METADATA_PATH
): MediaItem | null {
  return readMetadata(metadataPath).find((item) => item.id === id) ?? null;
}

export function saveMediaFile(
  originalFilename: string,
  buffer: Buffer,
  alt: string,
  tags: string[] = [],
  metadataPath: string = MEDIA_METADATA_PATH,
  uploadsDir: string = UPLOADS_DIR
): MediaItem {
  if (!isAllowedImage(originalFilename, buffer.byteLength)) {
    throw new Error(
      `Rejected upload "${originalFilename}": must be jpg/jpeg/png/webp and 10MB or smaller`
    );
  }
  if (!alt.trim()) {
    throw new Error("Alt text is required");
  }

  const ext = extensionFor(originalFilename);
  const base = slugifyBase(originalFilename);
  const id = crypto.randomUUID();
  const filename = `${base}-${id.slice(0, 8)}.${ext}`;

  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  fs.writeFileSync(path.join(uploadsDir, filename), buffer);

  const item: MediaItem = {
    id,
    filename,
    url: `/uploads/${filename}`,
    alt: alt.trim(),
    tags: tags.map((t) => t.trim()).filter(Boolean),
    uploadedAt: new Date().toISOString(),
  };

  const items = readMetadata(metadataPath);
  items.push(item);
  writeMetadata(metadataPath, items);

  return item;
}

export function deleteMedia(
  id: string,
  metadataPath: string = MEDIA_METADATA_PATH,
  uploadsDir: string = UPLOADS_DIR
): boolean {
  const items = readMetadata(metadataPath);
  const item = items.find((i) => i.id === id);
  if (!item) return false;

  const filePath = path.join(uploadsDir, item.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  writeMetadata(metadataPath, items.filter((i) => i.id !== id));
  return true;
}

export function setMediaTags(
  id: string,
  tags: string[],
  metadataPath: string = MEDIA_METADATA_PATH
): MediaItem | null {
  const items = readMetadata(metadataPath);
  const item = items.find((i) => i.id === id);
  if (!item) return null;
  item.tags = tags.map((t) => t.trim()).filter(Boolean);
  writeMetadata(metadataPath, items);
  return item;
}

export function toggleMediaTag(
  id: string,
  tag: string,
  metadataPath: string = MEDIA_METADATA_PATH
): MediaItem | null {
  const items = readMetadata(metadataPath);
  const item = items.find((i) => i.id === id);
  if (!item) return null;
  item.tags = item.tags.includes(tag)
    ? item.tags.filter((t) => t !== tag)
    : [...item.tags, tag];
  writeMetadata(metadataPath, items);
  return item;
}
```

- [ ] **Step 4: Raise the Server Actions body size limit**

Next.js caps Server Action request bodies at 1MB by default, which would reject any real photo upload before it reaches `saveMediaFile`. Update `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run lib/media.test.ts`
Expected: PASS (all cases above green).

- [ ] **Step 6: Commit**

```bash
git add lib/media.ts lib/media.test.ts next.config.ts
git commit -m "Add file-based media library store with upload validation"
```

---

### Task 2: `lib/hero-images.ts` — per-page hero image assignment

**Files:**
- Create: `lib/hero-images.ts`
- Create: `lib/hero-images.test.ts`

**Interfaces:**
- Consumes: `MEDIA_METADATA_PATH`, `getMediaById` from `./media` (Task 1).
- Produces: `getHeroImageUrl(slug: string, assignmentsPath?: string, metadataPath?: string): string | null`; `assignHero(slug: string, mediaId: string, assignmentsPath?: string): void`; `clearHero(slug: string, assignmentsPath?: string): void`; `getAllHeroAssignments(assignmentsPath?: string): Record<string, string>`.

- [ ] **Step 1: Write the failing tests**

Create `lib/hero-images.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { saveMediaFile } from "./media";
import {
  getHeroImageUrl,
  assignHero,
  clearHero,
  getAllHeroAssignments,
} from "./hero-images";

const fixturesRoot = path.join(os.tmpdir(), "mmp-hero-images-test-fixtures");
const assignmentsPath = path.join(fixturesRoot, "hero-assignments.json");
const metadataPath = path.join(fixturesRoot, "media.json");
const uploadsDir = path.join(fixturesRoot, "uploads");

beforeEach(() => {
  fs.rmSync(fixturesRoot, { recursive: true, force: true });
  fs.mkdirSync(fixturesRoot, { recursive: true });
});

afterAll(() => {
  fs.rmSync(fixturesRoot, { recursive: true, force: true });
});

describe("getHeroImageUrl", () => {
  it("returns null when the slug has no assignment file yet", () => {
    expect(getHeroImageUrl("tree-service-canton-ga", assignmentsPath, metadataPath)).toBeNull();
  });

  it("returns null when the slug has no assignment", () => {
    assignHero("tree-service-marietta-ga", "some-id", assignmentsPath);
    expect(getHeroImageUrl("tree-service-canton-ga", assignmentsPath, metadataPath)).toBeNull();
  });

  it("returns the assigned media's URL", () => {
    const item = saveMediaFile(
      "canton-oak.jpg",
      Buffer.from("x"),
      "A big oak in Canton",
      [],
      metadataPath,
      uploadsDir
    );
    assignHero("tree-service-canton-ga", item.id, assignmentsPath);

    expect(getHeroImageUrl("tree-service-canton-ga", assignmentsPath, metadataPath)).toBe(
      item.url
    );
  });

  it("returns null if the assigned media id no longer exists", () => {
    assignHero("tree-service-canton-ga", "deleted-media-id", assignmentsPath);
    expect(getHeroImageUrl("tree-service-canton-ga", assignmentsPath, metadataPath)).toBeNull();
  });
});

describe("assignHero / clearHero", () => {
  it("assignHero overwrites a previous assignment for the same slug", () => {
    const first = saveMediaFile("a.jpg", Buffer.from("a"), "alt a", [], metadataPath, uploadsDir);
    const second = saveMediaFile("b.jpg", Buffer.from("b"), "alt b", [], metadataPath, uploadsDir);

    assignHero("tree-service-canton-ga", first.id, assignmentsPath);
    assignHero("tree-service-canton-ga", second.id, assignmentsPath);

    expect(getHeroImageUrl("tree-service-canton-ga", assignmentsPath, metadataPath)).toBe(
      second.url
    );
  });

  it("clearHero removes the assignment", () => {
    const item = saveMediaFile("a.jpg", Buffer.from("a"), "alt", [], metadataPath, uploadsDir);
    assignHero("tree-service-canton-ga", item.id, assignmentsPath);
    clearHero("tree-service-canton-ga", assignmentsPath);
    expect(getHeroImageUrl("tree-service-canton-ga", assignmentsPath, metadataPath)).toBeNull();
  });

  it("clearHero on a slug with no assignment is a no-op, not an error", () => {
    expect(() => clearHero("never-assigned-slug", assignmentsPath)).not.toThrow();
  });
});

describe("getAllHeroAssignments", () => {
  it("returns an empty object when no file exists yet", () => {
    expect(getAllHeroAssignments(assignmentsPath)).toEqual({});
  });

  it("returns every slug->mediaId assignment", () => {
    assignHero("tree-service-canton-ga", "id-1", assignmentsPath);
    assignHero("tree-removal-marietta-ga", "id-2", assignmentsPath);
    expect(getAllHeroAssignments(assignmentsPath)).toEqual({
      "tree-service-canton-ga": "id-1",
      "tree-removal-marietta-ga": "id-2",
    });
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run lib/hero-images.test.ts`
Expected: FAIL with "Cannot find module './hero-images'".

- [ ] **Step 3: Implement `lib/hero-images.ts`**

```ts
// lib/hero-images.ts
import fs from "node:fs";
import path from "node:path";
import { MEDIA_METADATA_PATH, getMediaById } from "./media";

export const HERO_ASSIGNMENTS_PATH = path.join(
  process.cwd(),
  "content/media/hero-assignments.json"
);

type HeroAssignments = Record<string, string>;

function readAssignments(assignmentsPath: string): HeroAssignments {
  if (!fs.existsSync(assignmentsPath)) return {};
  try {
    const parsed = JSON.parse(fs.readFileSync(assignmentsPath, "utf-8"));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function writeAssignments(assignmentsPath: string, assignments: HeroAssignments): void {
  const dir = path.dirname(assignmentsPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(assignmentsPath, JSON.stringify(assignments, null, 2), "utf-8");
}

export function getHeroImageUrl(
  slug: string,
  assignmentsPath: string = HERO_ASSIGNMENTS_PATH,
  metadataPath: string = MEDIA_METADATA_PATH
): string | null {
  const mediaId = readAssignments(assignmentsPath)[slug];
  if (!mediaId) return null;
  const media = getMediaById(mediaId, metadataPath);
  return media ? media.url : null;
}

export function assignHero(
  slug: string,
  mediaId: string,
  assignmentsPath: string = HERO_ASSIGNMENTS_PATH
): void {
  const assignments = readAssignments(assignmentsPath);
  assignments[slug] = mediaId;
  writeAssignments(assignmentsPath, assignments);
}

export function clearHero(slug: string, assignmentsPath: string = HERO_ASSIGNMENTS_PATH): void {
  const assignments = readAssignments(assignmentsPath);
  delete assignments[slug];
  writeAssignments(assignmentsPath, assignments);
}

export function getAllHeroAssignments(
  assignmentsPath: string = HERO_ASSIGNMENTS_PATH
): HeroAssignments {
  return readAssignments(assignmentsPath);
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run lib/hero-images.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/hero-images.ts lib/hero-images.test.ts
git commit -m "Add per-page hero image assignment store"
```

---

### Task 3: `lib/media-actions.ts` — Server Actions

**Files:**
- Create: `lib/media-actions.ts`

**Interfaces:**
- Consumes: `saveMediaFile`, `deleteMedia`, `toggleMediaTag` from `./media` (Task 1); `assignHero`, `clearHero` from `./hero-images` (Task 2).
- Produces: `uploadMediaAction(formData: FormData): Promise<void>`; `deleteMediaAction(formData: FormData): Promise<void>`; `toggleOurWorkAction(formData: FormData): Promise<void>`; `assignHeroAction(formData: FormData): Promise<void>`; `clearHeroAction(formData: FormData): Promise<void>`.

No unit test for this file — like the existing `lib/blog-actions.ts`, it's a thin Server Action wrapper that calls `redirect()` (which Next.js implements by throwing), so it's covered by the e2e tests in Task 7 instead, matching the established precedent for `lib/blog-actions.ts`.

- [ ] **Step 1: Implement `lib/media-actions.ts`**

```ts
// lib/media-actions.ts
"use server";

import { redirect } from "next/navigation";
import { saveMediaFile, deleteMedia, toggleMediaTag } from "@/lib/media";
import { assignHero, clearHero } from "@/lib/hero-images";

export async function uploadMediaAction(formData: FormData): Promise<void> {
  const file = formData.get("file");
  const alt = String(formData.get("alt") ?? "");
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("No file uploaded");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  saveMediaFile(file.name, buffer, alt, tags);
  redirect("/admin/media");
}

export async function deleteMediaAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (id) deleteMedia(id);
  redirect("/admin/media");
}

export async function toggleOurWorkAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (id) toggleMediaTag(id, "our-work");
  redirect("/admin/media");
}

export async function assignHeroAction(formData: FormData): Promise<void> {
  const mediaId = String(formData.get("mediaId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  if (slug && mediaId) assignHero(slug, mediaId);
  redirect("/admin/media");
}

export async function clearHeroAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "");
  if (slug) clearHero(slug);
  redirect("/admin/media");
}
```

- [ ] **Step 2: Verify it type-checks**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/media-actions.ts
git commit -m "Add media library Server Actions"
```

---

### Task 4: Admin media UI

**Files:**
- Create: `components/admin/MediaUploadForm.tsx`
- Create: `components/admin/MediaGalleryItem.tsx`
- Create: `components/admin/MediaGalleryItem.test.tsx`
- Create: `app/admin/media/page.tsx`

**Interfaces:**
- Consumes: `MediaItem` type from `lib/media.ts` (Task 1); `getAllMedia` from `lib/media.ts`; `getAllHeroAssignments` from `lib/hero-images.ts` (Task 2); `builtSlugs` from `lib/slugs.ts` (existing); `uploadMediaAction`, `deleteMediaAction`, `toggleOurWorkAction`, `assignHeroAction`, `clearHeroAction` from `lib/media-actions.ts` (Task 3).
- Produces: `MediaUploadForm({ action })` component; `MediaGalleryItem({ item, pageSlugs, assignedSlug, deleteAction, toggleOurWorkAction, assignHeroAction, clearHeroAction })` component.

- [ ] **Step 1: Write the failing component test**

Create `components/admin/MediaGalleryItem.test.tsx`:

```tsx
// components/admin/MediaGalleryItem.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MediaGalleryItem } from "./MediaGalleryItem";
import type { MediaItem } from "@/lib/media";

const baseItem: MediaItem = {
  id: "abc123",
  filename: "canton-oak-abc123.jpg",
  url: "/uploads/canton-oak-abc123.jpg",
  alt: "A large oak in a Canton front yard",
  tags: [],
  uploadedAt: "2026-08-25T00:00:00.000Z",
};

describe("MediaGalleryItem", () => {
  it("renders the image with its alt text and no tags", () => {
    render(
      <MediaGalleryItem
        item={baseItem}
        pageSlugs={["tree-service-canton-ga"]}
        assignedSlug=""
        deleteAction={vi.fn()}
        toggleOurWorkAction={vi.fn()}
        assignHeroAction={vi.fn()}
        clearHeroAction={vi.fn()}
      />
    );

    const img = screen.getByRole("img", { name: /large oak in a canton front yard/i });
    expect(img).toHaveAttribute("src", baseItem.url);
    expect(screen.getByRole("button", { name: /show on our work/i })).toBeInTheDocument();
  });

  it("shows 'Remove from Our Work' when the item already has the our-work tag", () => {
    render(
      <MediaGalleryItem
        item={{ ...baseItem, tags: ["our-work"] }}
        pageSlugs={[]}
        assignedSlug=""
        deleteAction={vi.fn()}
        toggleOurWorkAction={vi.fn()}
        assignHeroAction={vi.fn()}
        clearHeroAction={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: /remove from our work/i })).toBeInTheDocument();
    expect(screen.getByText("our-work")).toBeInTheDocument();
  });

  it("shows the current hero assignment and a clear control when assignedSlug is set", () => {
    render(
      <MediaGalleryItem
        item={baseItem}
        pageSlugs={["tree-service-canton-ga"]}
        assignedSlug="tree-service-canton-ga"
        deleteAction={vi.fn()}
        toggleOurWorkAction={vi.fn()}
        assignHeroAction={vi.fn()}
        clearHeroAction={vi.fn()}
      />
    );

    // A longer, more specific match than the bare slug: the <select>'s own
    // <option value="tree-service-canton-ga"> also renders that exact slug
    // text, so a bare-slug regex matches twice and getByText throws. The
    // "Currently hero for:" prefix only appears in the assignment note.
    expect(screen.getByText(/currently hero for: tree-service-canton-ga/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /clear hero/i })).toBeInTheDocument();
  });

  it("does not show a clear-hero control when there is no current assignment", () => {
    render(
      <MediaGalleryItem
        item={baseItem}
        pageSlugs={["tree-service-canton-ga"]}
        assignedSlug=""
        deleteAction={vi.fn()}
        toggleOurWorkAction={vi.fn()}
        assignHeroAction={vi.fn()}
        clearHeroAction={vi.fn()}
      />
    );

    expect(screen.queryByRole("button", { name: /clear hero/i })).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run components/admin/MediaGalleryItem.test.tsx`
Expected: FAIL with "Cannot find module './MediaGalleryItem'".

- [ ] **Step 3: Implement `components/admin/MediaUploadForm.tsx`**

```tsx
// components/admin/MediaUploadForm.tsx
export function MediaUploadForm({
  action,
}: {
  action: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <form action={action} className="estimate-panel" style={{ marginBottom: 32 }}>
      <div className="form-field">
        <label htmlFor="file">Image File</label>
        <input id="file" name="file" type="file" accept=".jpg,.jpeg,.png,.webp" required />
      </div>
      <div className="form-field">
        <label htmlFor="alt">Alt Text</label>
        <input id="alt" name="alt" type="text" required />
        <p className="form-note">
          Describe what's in the photo — used for accessibility and image SEO.
        </p>
      </div>
      <div className="form-field">
        <label htmlFor="tags">Tags (comma-separated, optional)</label>
        <input id="tags" name="tags" type="text" placeholder="canton, storm-damage" />
      </div>
      <button type="submit" className="btn btn-orange">
        Upload Image
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Implement `components/admin/MediaGalleryItem.tsx`**

```tsx
// components/admin/MediaGalleryItem.tsx
import type { MediaItem } from "@/lib/media";

export function MediaGalleryItem({
  item,
  pageSlugs,
  assignedSlug,
  deleteAction,
  toggleOurWorkAction,
  assignHeroAction,
  clearHeroAction,
}: {
  item: MediaItem;
  pageSlugs: string[];
  assignedSlug: string;
  deleteAction: (formData: FormData) => void | Promise<void>;
  toggleOurWorkAction: (formData: FormData) => void | Promise<void>;
  assignHeroAction: (formData: FormData) => void | Promise<void>;
  clearHeroAction: (formData: FormData) => void | Promise<void>;
}) {
  const isOurWork = item.tags.includes("our-work");

  return (
    <div className="card">
      <img className="card__img" src={item.url} alt={item.alt} />
      <div className="card__body">
        <p>{item.alt}</p>
        <div>
          {item.tags.map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>

        <form action={toggleOurWorkAction}>
          <input type="hidden" name="id" value={item.id} />
          <button type="submit" className="btn btn-outline-light btn-sm">
            {isOurWork ? "Remove from Our Work" : "Show on Our Work"}
          </button>
        </form>

        <div className="form-field">
          <label htmlFor={`hero-${item.id}`}>Use as hero for</label>
          <form action={assignHeroAction}>
            <select id={`hero-${item.id}`} name="slug" defaultValue={assignedSlug}>
              <option value="">— choose a page —</option>
              {pageSlugs.map((slug) => (
                <option key={slug} value={slug}>
                  {slug}
                </option>
              ))}
            </select>
            <input type="hidden" name="mediaId" value={item.id} />
            <button type="submit" className="btn btn-green btn-sm">
              Assign Hero
            </button>
          </form>
        </div>

        {assignedSlug && (
          <div className="form-note">
            Currently hero for: {assignedSlug}
            <form action={clearHeroAction} style={{ display: "inline" }}>
              <input type="hidden" name="slug" value={assignedSlug} />
              <button type="submit" className="btn btn-sm btn-outline-light">
                Clear Hero
              </button>
            </form>
          </div>
        )}

        <form action={deleteAction}>
          <input type="hidden" name="id" value={item.id} />
          <button
            type="submit"
            className="btn btn-sm"
            style={{ background: "#c0392b", color: "#fff" }}
          >
            Delete
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Implement `app/admin/media/page.tsx`**

```tsx
// app/admin/media/page.tsx
import { getAllMedia } from "@/lib/media";
import { getAllHeroAssignments } from "@/lib/hero-images";
import { builtSlugs } from "@/lib/slugs";
import { MediaUploadForm } from "@/components/admin/MediaUploadForm";
import { MediaGalleryItem } from "@/components/admin/MediaGalleryItem";
import {
  uploadMediaAction,
  deleteMediaAction,
  toggleOurWorkAction,
  assignHeroAction,
  clearHeroAction,
} from "@/lib/media-actions";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default function AdminMediaPage() {
  const media = getAllMedia();
  const assignments = getAllHeroAssignments();
  const pageSlugs = builtSlugs();

  return (
    <section className="section">
      <div className="container">
        <h1>Media Library</h1>
        <MediaUploadForm action={uploadMediaAction} />
        {media.length === 0 ? (
          <p>No images uploaded yet.</p>
        ) : (
          <div className="grid grid--3">
            {media.map((item) => {
              const assignedSlug =
                Object.entries(assignments).find(([, mediaId]) => mediaId === item.id)?.[0] ?? "";
              return (
                <MediaGalleryItem
                  key={item.id}
                  item={item}
                  pageSlugs={pageSlugs}
                  assignedSlug={assignedSlug}
                  deleteAction={deleteMediaAction}
                  toggleOurWorkAction={toggleOurWorkAction}
                  assignHeroAction={assignHeroAction}
                  clearHeroAction={clearHeroAction}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npx vitest run components/admin/MediaGalleryItem.test.tsx`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add components/admin/MediaUploadForm.tsx components/admin/MediaGalleryItem.tsx components/admin/MediaGalleryItem.test.tsx app/admin/media/page.tsx
git commit -m "Add /admin/media page: upload, tag, hero-assign, delete"
```

---

### Task 5: Wire hero image overrides into city/service pages

**Files:**
- Modify: `components/CityHubTemplate.tsx`
- Modify: `components/ServiceCityTemplate.tsx`
- Modify: `app/[slug]/page.tsx`
- Modify: `components/CityHubTemplate.test.tsx` if it exists, else create it
- Modify: `components/ServiceCityTemplate.test.tsx` if it exists, else create it

**Interfaces:**
- Consumes: `getHeroImageUrl` from `lib/hero-images.ts` (Task 2).
- Produces: `CityHubTemplate` and `ServiceCityTemplate` both accept an optional `heroImageUrl?: string` prop, falling back to their existing hardcoded stock photo when not provided.

- [ ] **Step 1: Check for existing template tests**

Run: `ls components/CityHubTemplate.test.tsx components/ServiceCityTemplate.test.tsx 2>&1`

If neither file exists (expected — the foundation build did not add them), proceed to Step 2 to create both alongside the implementation change, testing the specific new behavior only (not a full re-test of the whole template, which is already covered by the e2e suite).

- [ ] **Step 2: Write the failing tests**

Create `components/CityHubTemplate.test.tsx`:

```tsx
// components/CityHubTemplate.test.tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { CityHubTemplate } from "./CityHubTemplate";
import type { City } from "@/lib/cities";

const canton: City = { slug: "canton", name: "Canton, GA", isBuilt: true };
const content = { intro: "Intro text.", overview: "Overview text.", whyUs: ["Reason one"] };

describe("CityHubTemplate hero image", () => {
  it("uses the stock fallback photo when heroImageUrl is not provided", () => {
    const { container } = render(<CityHubTemplate city={canton} content={content} />);
    const hero = container.querySelector(".hero") as HTMLElement;
    expect(hero.style.backgroundImage).toContain("images.unsplash.com");
  });

  it("uses the provided heroImageUrl when set", () => {
    const { container } = render(
      <CityHubTemplate
        city={canton}
        content={content}
        heroImageUrl="/uploads/canton-oak-abc123.jpg"
      />
    );
    const hero = container.querySelector(".hero") as HTMLElement;
    expect(hero.style.backgroundImage).toContain("/uploads/canton-oak-abc123.jpg");
  });
});
```

Create `components/ServiceCityTemplate.test.tsx`:

```tsx
// components/ServiceCityTemplate.test.tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ServiceCityTemplate } from "./ServiceCityTemplate";
import type { City } from "@/lib/cities";
import type { Service } from "@/lib/services";

const canton: City = { slug: "canton", name: "Canton, GA", isBuilt: true };
const treeRemoval: Service = {
  slug: "tree-removal",
  name: "Tree Removal",
  shortDescription: "x",
  icon: "tree-removal",
};
const content = {
  intro: "Intro text.",
  howItWorks: { title: "How It Works", body: "Body." },
  cost: { title: "Cost", body: "Body." },
  localConsiderations: { title: "Local", body: "Body." },
  faqs: [{ question: "Q?", answer: "A." }],
};

describe("ServiceCityTemplate hero image", () => {
  it("uses the stock fallback photo when heroImageUrl is not provided", () => {
    const { container } = render(
      <ServiceCityTemplate city={canton} service={treeRemoval} content={content} />
    );
    const hero = container.querySelector(".hero") as HTMLElement;
    expect(hero.style.backgroundImage).toContain("images.unsplash.com");
  });

  it("uses the provided heroImageUrl when set", () => {
    const { container } = render(
      <ServiceCityTemplate
        city={canton}
        service={treeRemoval}
        content={content}
        heroImageUrl="/uploads/canton-removal-abc123.jpg"
      />
    );
    const hero = container.querySelector(".hero") as HTMLElement;
    expect(hero.style.backgroundImage).toContain("/uploads/canton-removal-abc123.jpg");
  });
});
```

Check `lib/services.ts`'s exact `Service` type shape before running this — if its fields differ from `{ slug, name, shortDescription }`, adjust the fixture to match the real type (`cat lib/services.ts` first).

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npx vitest run components/CityHubTemplate.test.tsx components/ServiceCityTemplate.test.tsx`
Expected: FAIL (`heroImageUrl` prop not yet accepted; TypeScript error or the fallback-only image showing in both cases).

- [ ] **Step 4: Update `components/CityHubTemplate.tsx`**

Change the function signature and hero `<section>`:

```tsx
const DEFAULT_HUB_HERO_URL =
  "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1800&q=80";

export function CityHubTemplate({
  city,
  content,
  heroImageUrl,
}: {
  city: City;
  content: { intro: string; overview: string; whyUs: string[] };
  heroImageUrl?: string;
}) {
  return (
    <>
      <section
        className="hero"
        style={{
          backgroundImage: `url('${heroImageUrl || DEFAULT_HUB_HERO_URL}')`,
        }}
      >
```

Leave the rest of the file unchanged.

- [ ] **Step 5: Update `components/ServiceCityTemplate.tsx`**

Same pattern, using the service template's existing stock photo:

```tsx
const DEFAULT_SERVICE_HERO_URL =
  "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1800&q=80";

export function ServiceCityTemplate({
  city,
  service,
  content,
  heroImageUrl,
}: {
  city: City;
  service: Service;
  content: ServicePageContent;
  heroImageUrl?: string;
}) {
  return (
    <>
      <section
        className="hero"
        style={{
          backgroundImage: `url('${heroImageUrl || DEFAULT_SERVICE_HERO_URL}')`,
        }}
      >
```

Leave the rest of the file unchanged.

- [ ] **Step 6: Wire `getHeroImageUrl` into `app/[slug]/page.tsx`**

In the default export, after `const { slug } = await params;` and after resolving `resolved`/`content` (do not move this above the existing `notFound()` guards), add:

```tsx
import { getHeroImageUrl } from "@/lib/hero-images";
```

to the imports at the top, and in `CityOrServicePage`, right before the `if (resolved.type === "hub")` branch, add:

```tsx
  const heroImageUrl = getHeroImageUrl(slug) ?? undefined;
```

then pass it through:

```tsx
  if (resolved.type === "hub") {
    return (
      <CityHubTemplate city={resolved.city} content={content.hub} heroImageUrl={heroImageUrl} />
    );
  }

  return (
    <ServiceCityTemplate
      city={resolved.city}
      service={resolved.service}
      content={content.services[resolved.service.slug]}
      heroImageUrl={heroImageUrl}
    />
  );
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npx vitest run components/CityHubTemplate.test.tsx components/ServiceCityTemplate.test.tsx`
Expected: PASS.

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add components/CityHubTemplate.tsx components/ServiceCityTemplate.tsx components/CityHubTemplate.test.tsx components/ServiceCityTemplate.test.tsx "app/[slug]/page.tsx"
git commit -m "Wire assigned hero images into city and service page templates"
```

---

### Task 6: Our Work gallery page

**Files:**
- Modify: `app/our-work/page.tsx`
- Create: `app/our-work/page.test.tsx`

**Interfaces:**
- Consumes: `getAllMedia` from `lib/media.ts` (Task 1).

- [ ] **Step 1: Write the failing test**

Create `app/our-work/page.test.tsx`:

```tsx
// app/our-work/page.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import OurWorkPage from "./page";
import type { MediaItem } from "@/lib/media";

vi.mock("@/lib/media", () => ({
  getAllMedia: vi.fn(),
}));

import { getAllMedia } from "@/lib/media";

const mockedGetAllMedia = vi.mocked(getAllMedia);

describe("OurWorkPage", () => {
  it("shows the placeholder copy when no media is tagged our-work", () => {
    mockedGetAllMedia.mockReturnValue([]);
    render(<OurWorkPage />);
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
  });

  it("renders a grid of media tagged our-work, excluding untagged media", () => {
    const tagged: MediaItem = {
      id: "1",
      filename: "job-1.jpg",
      url: "/uploads/job-1.jpg",
      alt: "A finished tree removal in Canton",
      tags: ["our-work"],
      uploadedAt: "2026-08-25T00:00:00.000Z",
    };
    const untagged: MediaItem = {
      id: "2",
      filename: "job-2.jpg",
      url: "/uploads/job-2.jpg",
      alt: "An unrelated photo",
      tags: [],
      uploadedAt: "2026-08-25T00:00:00.000Z",
    };
    mockedGetAllMedia.mockReturnValue([tagged, untagged]);

    render(<OurWorkPage />);

    expect(screen.getByAltText("A finished tree removal in Canton")).toBeInTheDocument();
    expect(screen.queryByAltText("An unrelated photo")).not.toBeInTheDocument();
    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run app/our-work/page.test.tsx`
Expected: FAIL (the current placeholder page ignores media entirely, so the second test's assertions fail).

- [ ] **Step 3: Implement the updated `app/our-work/page.tsx`**

```tsx
// app/our-work/page.tsx
import { getAllMedia } from "@/lib/media";

export const dynamic = "force-dynamic";

export const metadata = { title: "Our Work | MMP Tree Service LLC" };

export default function OurWorkPage() {
  const gallery = getAllMedia().filter((item) => item.tags.includes("our-work"));

  return (
    <section className="section">
      <div className="container section-head">
        <span className="eyebrow">Our Work</span>
        <h1>{gallery.length === 0 ? "Coming Soon" : "Recent Jobs Around North Metro Atlanta"}</h1>
      </div>
      <div className="container">
        {gallery.length === 0 ? (
          <p>
            We&apos;re building out a full gallery of recent MMP Tree Service
            jobs. In the meantime, call{" "}
            <a href="tel:4704030215">(470) 403-0215</a> to see examples near
            you.
          </p>
        ) : (
          <div className="grid grid--3">
            {gallery.map((item) => (
              <div className="card" key={item.id}>
                <img className="card__img" src={item.url} alt={item.alt} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run app/our-work/page.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/our-work/page.tsx app/our-work/page.test.tsx
git commit -m "Render live Our Work gallery from media tagged our-work"
```

---

### Addendum (found during Task 7): hero assignment needs on-demand revalidation

**Discovered by:** Task 7's e2e work, which runs against a real production build (`npm run build && npm run start`, per `playwright.config.ts`'s `webServer.command`) — not `next dev`.

**The gap:** `app/[slug]/page.tsx` uses `generateStaticParams()` with no `dynamic` export, so all 162 city/service pages are fully static (SSG) — rendered once at build time. `assignHero`/`clearHero` (Task 2) write `content/media/hero-assignments.json` at runtime, but nothing tells Next.js to regenerate the affected static page afterward, so an assigned hero image would never appear in production without a full rebuild — defeating the entire point of a self-service admin control.

**Ruling:** Do not make the route `force-dynamic` — that would turn all 162 statically-generated pages dynamic just to fix one admin action, sacrificing the static-generation performance/SEO benefit this whole city-build-out project was built for. Instead, use Next.js's on-demand revalidation (`revalidatePath`) so only the one specific page whose hero just changed gets regenerated, while the other 161+ pages stay untouched and fully static.

**Files:**
- Modify: `lib/media-actions.ts` (retroactively amends Task 3's file)

Add the import and two calls:

```ts
// lib/media-actions.ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { saveMediaFile, deleteMedia, toggleMediaTag } from "@/lib/media";
import { assignHero, clearHero } from "@/lib/hero-images";
```

```ts
export async function assignHeroAction(formData: FormData): Promise<void> {
  const mediaId = String(formData.get("mediaId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  if (slug && mediaId) {
    assignHero(slug, mediaId);
    revalidatePath(`/${slug}`);
  }
  redirect("/admin/media");
}

export async function clearHeroAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "");
  if (slug) {
    clearHero(slug);
    revalidatePath(`/${slug}`);
  }
  redirect("/admin/media");
}
```

`uploadMediaAction`, `deleteMediaAction`, and `toggleOurWorkAction` do not need `revalidatePath` — they only affect `/admin/media` and `/our-work`, both of which already declare `export const dynamic = "force-dynamic"` and re-read the filesystem on every request.

This fix is applied and verified as part of Task 7 (below), since Task 7's e2e test is what depends on it actually working in production.

---

### Task 7: e2e coverage for the media library

**Files:**
- Create: `e2e/media-admin.spec.ts`
- Modify: `.gitignore` (nothing to add here — uploaded files under `public/uploads/` and `content/media/*.json` are real site content and stay tracked, matching `content/blog/posts/`'s precedent; this step is a no-op check, not an edit)

**Interfaces:**
- Consumes: the running app's `/admin/media`, `/our-work`, and `/tree-service-canton-ga` routes.

- [ ] **Step 1: Write the e2e test**

Create `e2e/media-admin.spec.ts`:

```ts
// e2e/media-admin.spec.ts
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const TEST_JPG_BASE64 =
  "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAj/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";

test.describe("media library admin", () => {
  let uploadedFilePath: string | null = null;

  test.afterEach(() => {
    // Best-effort cleanup: the uploaded file's on-disk name isn't known
    // ahead of time (it's generated server-side), so this only guards the
    // one fixture path we explicitly create below for the upload input.
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      fs.unlinkSync(uploadedFilePath);
    }
  });

  test("upload an image, tag it for Our Work, and see it live", async ({ page }) => {
    const fixturePath = path.join(process.cwd(), "e2e-fixture-upload.jpg");
    fs.writeFileSync(fixturePath, Buffer.from(TEST_JPG_BASE64, "base64"));
    uploadedFilePath = fixturePath;

    await page.goto("/admin/media");
    await page.setInputFiles("#file", fixturePath);
    await page.getByLabel("Alt Text").fill("E2E test job photo");
    await page.getByRole("button", { name: "Upload Image" }).click();

    await expect(page).toHaveURL(/\/admin\/media$/);
    await expect(page.getByText("E2E test job photo")).toBeVisible();

    await page
      .locator(".card", { hasText: "E2E test job photo" })
      .getByRole("button", { name: "Show on Our Work" })
      .click();

    await expect(page).toHaveURL(/\/admin\/media$/);

    await page.goto("/our-work");
    await expect(page.getByAltText("E2E test job photo")).toBeVisible();

    // Clean up via the admin UI itself so the metadata file and uploaded
    // file both stay in sync (a raw fs.unlink would leave a stale
    // media.json entry pointing at a deleted file).
    await page.goto("/admin/media");
    await page
      .locator(".card", { hasText: "E2E test job photo" })
      .getByRole("button", { name: "Delete" })
      .click();
    await expect(page).toHaveURL(/\/admin\/media$/);
    await expect(page.getByText("E2E test job photo")).not.toBeVisible();
  });

  test("assign an uploaded image as a city page's hero", async ({ page }) => {
    const fixturePath = path.join(process.cwd(), "e2e-fixture-hero.jpg");
    fs.writeFileSync(fixturePath, Buffer.from(TEST_JPG_BASE64, "base64"));
    uploadedFilePath = fixturePath;

    await page.goto("/admin/media");
    await page.setInputFiles("#file", fixturePath);
    await page.getByLabel("Alt Text").fill("E2E hero test photo");
    await page.getByRole("button", { name: "Upload Image" }).click();

    const card = page.locator(".card", { hasText: "E2E hero test photo" });
    await card.locator("select").selectOption("tree-service-canton-ga");
    await card.getByRole("button", { name: "Assign Hero" }).click();

    await expect(page).toHaveURL(/\/admin\/media$/);
    await expect(page.getByText("Currently hero for: tree-service-canton-ga")).toBeVisible();

    await page.goto("/tree-service-canton-ga");
    const heroBackgroundImage = await page
      .locator(".hero")
      .evaluate((el) => getComputedStyle(el).backgroundImage);
    // The generated filename is derived from the uploaded file's original
    // name ("e2e-fixture-hero.jpg"), not from the alt text entered above —
    // saveMediaFile() in lib/media.ts slugifies the original filename and
    // appends an 8-char id, e.g. "e2e-fixture-hero-a1b2c3d4.jpg".
    expect(heroBackgroundImage).toContain("e2e-fixture-hero");

    // Clear the assignment and delete the media so the fixture doesn't
    // leak into later test runs against the same dev server.
    await page.goto("/admin/media");
    await page
      .locator(".card", { hasText: "E2E hero test photo" })
      .getByRole("button", { name: "Clear Hero" })
      .click();
    await page
      .locator(".card", { hasText: "E2E hero test photo" })
      .getByRole("button", { name: "Delete" })
      .click();
  });
});
```

- [ ] **Step 2: Run the e2e suite**

Run: `PORT=4180 npm run e2e -- e2e/media-admin.spec.ts`
Expected: PASS.

- [ ] **Step 3: Run the full e2e suite to check for regressions**

Run: `PORT=4180 npm run e2e`
Expected: all tests, including the pre-existing ones, still PASS.

- [ ] **Step 4: Commit**

```bash
git add e2e/media-admin.spec.ts
git commit -m "Add e2e coverage for media upload, Our Work tagging, and hero assignment"
```

---

### Task 8: `lib/blog-categories.ts` — extensible category list

**Files:**
- Create: `lib/blog-categories.ts`
- Create: `lib/blog-categories.test.ts`
- Create: `content/blog/categories.json`

**Interfaces:**
- Produces: `getCategories(categoriesPath?: string): string[]`; `addCategory(name: string, categoriesPath?: string): string[]`.

- [ ] **Step 1: Write the failing tests**

Create `lib/blog-categories.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { getCategories, addCategory } from "./blog-categories";

const fixturesRoot = path.join(os.tmpdir(), "mmp-blog-categories-test-fixtures");
const categoriesPath = path.join(fixturesRoot, "categories.json");

beforeEach(() => {
  fs.rmSync(fixturesRoot, { recursive: true, force: true });
  fs.mkdirSync(fixturesRoot, { recursive: true });
});

afterAll(() => {
  fs.rmSync(fixturesRoot, { recursive: true, force: true });
});

describe("getCategories", () => {
  it("returns an empty array when the file doesn't exist yet", () => {
    expect(getCategories(categoriesPath)).toEqual([]);
  });

  it("returns the categories from the file", () => {
    fs.writeFileSync(categoriesPath, JSON.stringify(["Tree Care Tips", "Local Guides"]));
    expect(getCategories(categoriesPath)).toEqual(["Tree Care Tips", "Local Guides"]);
  });
});

describe("addCategory", () => {
  it("appends a new category and persists it", () => {
    const updated = addCategory("Storm Safety", categoriesPath);
    expect(updated).toEqual(["Storm Safety"]);
    expect(getCategories(categoriesPath)).toEqual(["Storm Safety"]);
  });

  it("does not add a case-insensitive duplicate", () => {
    addCategory("Storm Safety", categoriesPath);
    const updated = addCategory("storm safety", categoriesPath);
    expect(updated).toEqual(["Storm Safety"]);
  });

  it("ignores a blank or whitespace-only name", () => {
    expect(addCategory("   ", categoriesPath)).toEqual([]);
    expect(getCategories(categoriesPath)).toEqual([]);
  });

  it("trims whitespace before comparing and storing", () => {
    const updated = addCategory("  Company News  ", categoriesPath);
    expect(updated).toEqual(["Company News"]);
  });

  it("creates the containing directory if it doesn't exist yet", () => {
    const freshPath = path.join(fixturesRoot, "fresh", "categories.json");
    addCategory("Tree Care Tips", freshPath);
    expect(getCategories(freshPath)).toEqual(["Tree Care Tips"]);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run lib/blog-categories.test.ts`
Expected: FAIL with "Cannot find module './blog-categories'".

- [ ] **Step 3: Implement `lib/blog-categories.ts`**

```ts
// lib/blog-categories.ts
import fs from "node:fs";
import path from "node:path";

export const CATEGORIES_PATH = path.join(process.cwd(), "content/blog/categories.json");

function readCategories(categoriesPath: string): string[] {
  if (!fs.existsSync(categoriesPath)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(categoriesPath, "utf-8"));
    return Array.isArray(parsed) ? parsed.filter((c): c is string => typeof c === "string") : [];
  } catch {
    return [];
  }
}

function writeCategories(categoriesPath: string, categories: string[]): void {
  const dir = path.dirname(categoriesPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(categoriesPath, JSON.stringify(categories, null, 2), "utf-8");
}

export function getCategories(categoriesPath: string = CATEGORIES_PATH): string[] {
  return readCategories(categoriesPath);
}

export function addCategory(name: string, categoriesPath: string = CATEGORIES_PATH): string[] {
  const trimmed = name.trim();
  const categories = readCategories(categoriesPath);
  if (!trimmed) return categories;

  const exists = categories.some((c) => c.toLowerCase() === trimmed.toLowerCase());
  if (exists) return categories;

  const updated = [...categories, trimmed];
  writeCategories(categoriesPath, updated);
  return updated;
}
```

- [ ] **Step 4: Seed `content/blog/categories.json`**

```json
[
  "Tree Care Tips",
  "Local Guides",
  "Storm Safety",
  "Company News"
]
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run lib/blog-categories.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/blog-categories.ts lib/blog-categories.test.ts content/blog/categories.json
git commit -m "Add extensible blog category list (seeded with 4 defaults)"
```

---

### Task 9: Extend `BlogPost` with category, tags, and cover image alt text

**Files:**
- Modify: `lib/blog.ts`
- Modify: `lib/blog.test.ts`
- Modify: `lib/blogFormData.ts`
- Modify: `lib/blog-actions.ts`
- Modify: `components/admin/BlogPostForm.test.tsx` (minimal patch only — see Step 6a; the full rewrite of this file, including its new test cases, is Task 10's job)

**Interfaces:**
- Consumes: `addCategory` from `lib/blog-categories.ts` (Task 8).
- Produces: `BlogPost` type gains `coverImageAlt: string`, `category: string`, `tags: string[]`.

**Preflight note:** adding these fields as required makes every existing `BlogPost`-typed object literal in the codebase fail `tsc --noEmit` until it's updated. `lib/blog.test.ts`'s literals are updated in Step 1 below. There is exactly one other such literal outside this task's own files: `components/admin/BlogPostForm.test.tsx`'s `initialPost` object (around line 35), which is assigned to `BlogPostForm`'s `initialPost?: BlogPost` prop. Step 6a patches only that literal's fields — it does not touch anything else in that file (new test cases and the `categories` prop wiring are Task 10's job) — so that this task's own `tsc --noEmit` check is actually true when you run it, rather than passing only once Task 10 also lands.

- [ ] **Step 1: Update the failing/changed tests**

Replace the full contents of `lib/blog.test.ts` with:

```ts
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
coverImageAlt: "Alt for older post"
category: "Tree Care Tips"
tags: ["oak", "pruning"]
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
coverImageAlt: "Alt for newer post"
category: "Storm Safety"
tags: ["storm"]
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
  it("returns the matching post with parsed frontmatter and body, including category and tags", () => {
    const post = getPostBySlug("older-post", fixturesDir);
    expect(post?.title).toBe("Older Post");
    expect(post?.date).toBe("2026-01-01");
    expect(post?.bodyMarkdown).toBe("Body of the older post.");
    expect(post?.category).toBe("Tree Care Tips");
    expect(post?.tags).toEqual(["oak", "pruning"]);
    expect(post?.coverImageAlt).toBe("Alt for older post");
  });

  it("returns null for a missing slug", () => {
    expect(getPostBySlug("does-not-exist", fixturesDir)).toBeNull();
  });

  it("defaults category to an empty string and tags to an empty array when frontmatter omits them", () => {
    fs.writeFileSync(
      path.join(fixturesDir, "no-category-post.md"),
      `---
title: "No Category Post"
date: "2026-07-01"
excerpt: "No category set."
coverImage: "https://example.com/z.jpg"
seoTitle: "SEO"
seoDescription: "SEO desc"
---

Body.
`
    );
    const post = getPostBySlug("no-category-post", fixturesDir);
    expect(post?.category).toBe("");
    expect(post?.tags).toEqual([]);
    expect(post?.coverImageAlt).toBe("");
  });
});

describe("savePost", () => {
  it("writes a post file that getPostBySlug can then read back, including category and tags", () => {
    savePost(
      {
        slug: "brand-new-post",
        title: "Brand New Post",
        date: "2026-08-24",
        excerpt: "Just written.",
        coverImage: "https://example.com/c.jpg",
        coverImageAlt: "A brand new photo",
        category: "Company News",
        tags: ["announcement"],
        seoTitle: "Brand New SEO",
        seoDescription: "SEO desc",
        bodyMarkdown: "This is the body.",
      },
      fixturesDir
    );
    const post = getPostBySlug("brand-new-post", fixturesDir);
    expect(post?.title).toBe("Brand New Post");
    expect(post?.bodyMarkdown).toBe("This is the body.");
    expect(post?.category).toBe("Company News");
    expect(post?.tags).toEqual(["announcement"]);
    expect(post?.coverImageAlt).toBe("A brand new photo");
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
        coverImageAlt: "Alt",
        category: "Local Guides",
        tags: [],
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
      coverImageAlt: "x",
      category: "x",
      tags: [],
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
      coverImageAlt: "x",
      category: "x",
      tags: [],
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
        coverImageAlt: "Alt",
        category: "Tree Care Tips",
        tags: [],
        seoTitle: "Duplicate SEO",
        seoDescription: "SEO desc",
        bodyMarkdown: "Original body.",
      },
      fixturesDir
    );

    const deduped = uniqueSlug("duplicate-title", fixturesDir);
    expect(deduped).toBe("duplicate-title-2");

    savePost(
      {
        slug: deduped,
        title: "Duplicate Title (second)",
        date: "2026-08-24",
        excerpt: "Second.",
        coverImage: "https://example.com/f.jpg",
        coverImageAlt: "Alt 2",
        category: "Tree Care Tips",
        tags: [],
        seoTitle: "Duplicate SEO 2",
        seoDescription: "SEO desc",
        bodyMarkdown: "Second body.",
      },
      fixturesDir
    );

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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run lib/blog.test.ts`
Expected: FAIL — TypeScript errors on the `BlogPost` literals missing `coverImageAlt`/`category`/`tags`, and assertions on `post?.category`/`post?.tags`/`post?.coverImageAlt` failing since `lib/blog.ts` doesn't read them yet.

- [ ] **Step 3: Update `lib/blog.ts`**

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
  coverImageAlt: string;
  category: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  bodyMarkdown: string;
};

const DEFAULT_POSTS_DIR = path.join(process.cwd(), "content/blog/posts");

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function assertValidSlug(slug: string): void {
  if (!SLUG_PATTERN.test(slug)) {
    throw new Error(`Invalid post slug: ${slug}`);
  }
}

function readPostFile(filePath: string, slug: string): BlogPost {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return {
    slug,
    title: String(data.title ?? ""),
    date: String(data.date ?? ""),
    excerpt: String(data.excerpt ?? ""),
    coverImage: String(data.coverImage ?? ""),
    coverImageAlt: String(data.coverImageAlt ?? ""),
    category: String(data.category ?? ""),
    tags: Array.isArray(data.tags) ? data.tags.map((t: unknown) => String(t)) : [],
    seoTitle: String(data.seoTitle ?? ""),
    seoDescription: String(data.seoDescription ?? ""),
    bodyMarkdown: content.trim(),
  };
}

export function getAllPosts(postsDir: string = DEFAULT_POSTS_DIR): BlogPost[] {
  if (!fs.existsSync(postsDir)) return [];
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));
  const posts: BlogPost[] = [];
  for (const file of files) {
    try {
      posts.push(readPostFile(path.join(postsDir, file), file.replace(/\.md$/, "")));
    } catch (error) {
      console.error(`Skipping unreadable blog post file "${file}":`, error);
    }
  }
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(
  slug: string,
  postsDir: string = DEFAULT_POSTS_DIR
): BlogPost | null {
  if (!SLUG_PATTERN.test(slug)) return null;
  const filePath = path.join(postsDir, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  return readPostFile(filePath, slug);
}

export function uniqueSlug(desiredSlug: string, postsDir: string = DEFAULT_POSTS_DIR): string {
  if (!getPostBySlug(desiredSlug, postsDir)) return desiredSlug;
  let suffix = 2;
  let candidate = `${desiredSlug}-${suffix}`;
  while (getPostBySlug(candidate, postsDir)) {
    suffix += 1;
    candidate = `${desiredSlug}-${suffix}`;
  }
  return candidate;
}

export function savePost(post: BlogPost, postsDir: string = DEFAULT_POSTS_DIR): void {
  assertValidSlug(post.slug);
  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }
  const fileContents = matter.stringify(post.bodyMarkdown, {
    title: post.title,
    date: post.date,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    coverImageAlt: post.coverImageAlt,
    category: post.category,
    tags: post.tags,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
  });
  fs.writeFileSync(path.join(postsDir, `${post.slug}.md`), fileContents, "utf-8");
}
```

- [ ] **Step 4: Update `lib/blogFormData.ts`**

```ts
import type { BlogPost } from "./blog";

export function buildPostFromFormData(formData: FormData): BlogPost {
  return {
    slug: String(formData.get("slug") ?? ""),
    title: String(formData.get("title") ?? ""),
    date: String(formData.get("date") ?? ""),
    excerpt: String(formData.get("excerpt") ?? ""),
    coverImage: String(formData.get("coverImage") ?? ""),
    coverImageAlt: String(formData.get("coverImageAlt") ?? ""),
    category: String(formData.get("category") ?? ""),
    tags: String(formData.get("tags") ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    seoTitle: String(formData.get("seoTitle") ?? ""),
    seoDescription: String(formData.get("seoDescription") ?? ""),
    bodyMarkdown: String(formData.get("bodyMarkdown") ?? ""),
  };
}
```

- [ ] **Step 5: Update `lib/blog-actions.ts` to auto-register new categories**

```ts
"use server";

import { redirect } from "next/navigation";
import { getPostBySlug, savePost, uniqueSlug } from "@/lib/blog";
import { buildPostFromFormData } from "@/lib/blogFormData";
import { addCategory } from "@/lib/blog-categories";

export async function savePostAction(formData: FormData): Promise<void> {
  const post = buildPostFromFormData(formData);
  const mode = formData.get("mode") === "edit" ? "edit" : "create";

  if (mode === "create" && getPostBySlug(post.slug)) {
    post.slug = uniqueSlug(post.slug);
  }

  addCategory(post.category);
  savePost(post);
  redirect(`/blog/${post.slug}`);
}
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npx vitest run lib/blog.test.ts`
Expected: PASS.

- [ ] **Step 6a: Patch the one other `BlogPost`-typed literal so `tsc --noEmit` is clean**

In `components/admin/BlogPostForm.test.tsx`, find the `initialPost` object literal (in the third test, "never changes the slug field..."):

```ts
    const initialPost = {
      slug: "existing-post",
      title: "Existing Post",
      date: "2026-08-24",
      excerpt: "An excerpt.",
      coverImage: "https://example.com/x.jpg",
      seoTitle: "Existing Post SEO",
      seoDescription: "SEO description.",
      bodyMarkdown: "Body.",
    };
```

Add the three new fields (don't change anything else in the file — no new test cases, no `categories` prop on the `<BlogPostForm>` render calls below it; that's Task 10's job and doing it here would just get overwritten):

```ts
    const initialPost = {
      slug: "existing-post",
      title: "Existing Post",
      date: "2026-08-24",
      excerpt: "An excerpt.",
      coverImage: "https://example.com/x.jpg",
      coverImageAlt: "Existing alt text",
      category: "Tree Care Tips",
      tags: ["oak"],
      seoTitle: "Existing Post SEO",
      seoDescription: "SEO description.",
      bodyMarkdown: "Body.",
    };
```

- [ ] **Step 7: Run `tsc` to verify the whole project compiles**

Run: `npx tsc --noEmit`
Expected: no errors. If any other file besides `lib/blog.test.ts` and `components/admin/BlogPostForm.test.tsx` fails because it constructs a `BlogPost` literal, that's a real gap this plan's preflight scan didn't catch — add the three fields to that literal too, using the same values pattern as above, before moving on.

- [ ] **Step 8: Commit**

```bash
git add lib/blog.ts lib/blog.test.ts lib/blogFormData.ts lib/blog-actions.ts components/admin/BlogPostForm.test.tsx
git commit -m "Add category, tags, and cover image alt text to the BlogPost data model"
```

---

### Task 10: Blog admin form — category, tags, and cover image alt fields

**Files:**
- Modify: `components/admin/BlogPostForm.tsx`
- Modify: `components/admin/BlogPostForm.test.tsx`
- Modify: `app/admin/blog/new/page.tsx`
- Modify: `app/admin/blog/[slug]/edit/page.tsx`
- Modify: `e2e/blog-admin.spec.ts`

**Interfaces:**
- Consumes: `getCategories` from `lib/blog-categories.ts` (Task 8); the extended `BlogPost` type from Task 9.
- Produces: `BlogPostForm` accepts a new required `categories: string[]` prop.

- [ ] **Step 1: Update the failing test**

Replace the full contents of `components/admin/BlogPostForm.test.tsx`:

```tsx
// components/admin/BlogPostForm.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BlogPostForm } from "./BlogPostForm";

describe("BlogPostForm auto-slug behavior", () => {
  it("auto-fills the URL Slug field from the Title field when slugEditable and untouched", () => {
    render(<BlogPostForm action={() => {}} slugEditable={true} categories={[]} />);

    const title = screen.getByLabelText("Title", { exact: true });
    const slug = screen.getByLabelText("URL Slug") as HTMLInputElement;

    fireEvent.change(title, { target: { value: "My Great Post" } });

    expect(slug.value).toBe("my-great-post");
  });

  it("stops auto-filling the slug once the user manually edits it, even as the title keeps changing", () => {
    render(<BlogPostForm action={() => {}} slugEditable={true} categories={[]} />);

    const title = screen.getByLabelText("Title", { exact: true });
    const slug = screen.getByLabelText("URL Slug") as HTMLInputElement;

    fireEvent.change(title, { target: { value: "My Great Post" } });
    expect(slug.value).toBe("my-great-post");

    fireEvent.change(slug, { target: { value: "custom-slug" } });
    expect(slug.value).toBe("custom-slug");

    fireEvent.change(title, { target: { value: "My Great Post Extended" } });
    expect(slug.value).toBe("custom-slug");
  });

  it("never changes the slug field from the Title field when slugEditable is false, touched or not", () => {
    const initialPost = {
      slug: "existing-post",
      title: "Existing Post",
      date: "2026-08-24",
      excerpt: "An excerpt.",
      coverImage: "https://example.com/x.jpg",
      coverImageAlt: "Existing alt text",
      category: "Tree Care Tips",
      tags: ["oak"],
      seoTitle: "Existing Post SEO",
      seoDescription: "SEO description.",
      bodyMarkdown: "Body.",
    };

    render(
      <BlogPostForm
        action={() => {}}
        slugEditable={false}
        initialPost={initialPost}
        categories={["Tree Care Tips"]}
      />
    );

    const title = screen.getByLabelText("Title", { exact: true });
    const slug = screen.getByLabelText("URL Slug") as HTMLInputElement;

    expect(slug.value).toBe("existing-post");
    expect(slug).toHaveAttribute("readonly");

    fireEvent.change(title, { target: { value: "Completely Different Title" } });

    expect(slug.value).toBe("existing-post");
  });
});

describe("BlogPostForm category/tags/alt fields", () => {
  it("lists the provided categories as datalist options and pre-fills tags/alt from initialPost", () => {
    const initialPost = {
      slug: "existing-post",
      title: "Existing Post",
      date: "2026-08-24",
      excerpt: "An excerpt.",
      coverImage: "https://example.com/x.jpg",
      coverImageAlt: "Existing alt text",
      category: "Storm Safety",
      tags: ["oak", "storm"],
      seoTitle: "Existing Post SEO",
      seoDescription: "SEO description.",
      bodyMarkdown: "Body.",
    };

    render(
      <BlogPostForm
        action={() => {}}
        slugEditable={false}
        initialPost={initialPost}
        categories={["Tree Care Tips", "Storm Safety"]}
      />
    );

    expect((screen.getByLabelText("Category") as HTMLInputElement).value).toBe("Storm Safety");
    expect((screen.getByLabelText("Tags") as HTMLInputElement).value).toBe("oak, storm");
    expect((screen.getByLabelText("Cover Image Alt Text") as HTMLInputElement).value).toBe(
      "Existing alt text"
    );
    expect(screen.getByText("Tree Care Tips")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run components/admin/BlogPostForm.test.tsx`
Expected: FAIL (TypeScript error: `categories` prop doesn't exist yet; `Category`/`Tags`/`Cover Image Alt Text` labels don't exist).

- [ ] **Step 3: Update `components/admin/BlogPostForm.tsx`**

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
  categories,
}: {
  action: (formData: FormData) => void | Promise<void>;
  initialPost?: BlogPost;
  slugEditable: boolean;
  categories: string[];
}) {
  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [slug, setSlug] = useState(initialPost?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [body, setBody] = useState(initialPost?.bodyMarkdown ?? "");

  const linkCounts = countLinks(body);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (slugEditable && !slugTouched) {
      setSlug(slugify(value));
    }
  }

  return (
    <form action={action} className="estimate-panel">
      <input type="hidden" name="mode" value={initialPost ? "edit" : "create"} />
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
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="coverImageAlt">Cover Image Alt Text</label>
          <input
            id="coverImageAlt"
            name="coverImageAlt"
            type="text"
            defaultValue={initialPost?.coverImageAlt ?? ""}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="category">Category</label>
          <input
            id="category"
            name="category"
            type="text"
            list="category-options"
            defaultValue={initialPost?.category ?? ""}
            required
          />
          <datalist id="category-options">
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </datalist>
          <p className="form-note">
            Pick an existing category or type a new one — it'll be added to the list.
          </p>
        </div>
      </div>
      <div className="form-field">
        <label htmlFor="tags">Tags</label>
        <input
          id="tags"
          name="tags"
          type="text"
          defaultValue={initialPost?.tags.join(", ") ?? ""}
          placeholder="oak, pruning, canton"
        />
        <p className="form-note">Comma-separated, optional.</p>
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

- [ ] **Step 4: Update `app/admin/blog/new/page.tsx`**

```tsx
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { savePostAction } from "@/lib/blog-actions";
import { getCategories } from "@/lib/blog-categories";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default function NewBlogPostPage() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 760 }}>
        <h1>New Blog Post</h1>
        <BlogPostForm action={savePostAction} slugEditable={true} categories={getCategories()} />
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Update `app/admin/blog/[slug]/edit/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/blog";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { savePostAction } from "@/lib/blog-actions";
import { getCategories } from "@/lib/blog-categories";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

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
        <BlogPostForm
          action={savePostAction}
          initialPost={post}
          slugEditable={false}
          categories={getCategories()}
        />
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npx vitest run components/admin/BlogPostForm.test.tsx`
Expected: PASS.

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Update `e2e/blog-admin.spec.ts` for the new required fields**

Replace the full contents of `e2e/blog-admin.spec.ts`:

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

    await page.getByLabel("Title", { exact: true }).fill("E2E Test Post");
    await page.getByLabel("URL Slug").fill(uniqueSlug);
    await page
      .getByLabel("Cover Image URL")
      .fill("https://images.unsplash.com/photo-1441974231531-c6227db76b6e");
    await page.getByLabel("Cover Image Alt Text").fill("An e2e test cover photo");
    await page.getByLabel("Category").fill("Tree Care Tips");
    await page.getByLabel("Tags").fill("oak, pruning");
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
    await page.getByLabel("Title", { exact: true }).fill("Original Title");
    await page.getByLabel("URL Slug").fill(uniqueSlug);
    await page.getByLabel("Cover Image URL").fill("https://example.com/x.jpg");
    await page.getByLabel("Cover Image Alt Text").fill("Original alt text");
    await page.getByLabel("Category").fill("Company News");
    await page.getByLabel("Excerpt").fill("Original excerpt.");
    await page.getByLabel("SEO Title").fill("Original SEO Title");
    await page.getByLabel("SEO Description").fill("Original SEO description.");
    await page.getByLabel("Body (Markdown)").fill("Original body.");
    await page.getByRole("button", { name: "Publish Post" }).click();
    await expect(page).toHaveURL(new RegExp(`/blog/${uniqueSlug}`));

    await page.goto(`/admin/blog/${uniqueSlug}/edit`);
    await expect(page.getByLabel("URL Slug")).toHaveAttribute("readonly", "");
    await page.getByLabel("Title", { exact: true }).fill("Updated Title");
    await page.getByLabel("Body (Markdown)").fill("Updated body.");
    await page.getByRole("button", { name: "Save Changes" }).click();

    await expect(page).toHaveURL(new RegExp(`/blog/${uniqueSlug}$`));
    await expect(page.getByRole("heading", { name: "Updated Title" })).toBeVisible();
    await expect(page.getByText("Updated body.")).toBeVisible();
  } finally {
    if (fs.existsSync(postFilePath)) {
      fs.unlinkSync(postFilePath);
    }
  }
});
```

- [ ] **Step 8: Run the full e2e suite**

Run: `PORT=4181 npm run e2e`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add components/admin/BlogPostForm.tsx components/admin/BlogPostForm.test.tsx app/admin/blog/new/page.tsx "app/admin/blog/[slug]/edit/page.tsx" e2e/blog-admin.spec.ts
git commit -m "Add category, tags, and cover image alt fields to the blog admin form"
```

---

### Task 11: Open Graph, Twitter Card, and JSON-LD structured data on blog posts

**Files:**
- Modify: `app/blog/[slug]/page.tsx`
- Modify: `components/BlogPostCard.tsx`

**Interfaces:**
- Consumes: the extended `BlogPost` type from Task 9.

- [ ] **Step 1: Update `app/blog/[slug]/page.tsx`**

```tsx
import Link from "next/link";
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
    openGraph: {
      title: post.seoTitle,
      description: post.seoDescription,
      images: [post.coverImage],
      type: "article",
      publishedTime: post.date,
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoTitle,
      description: post.seoDescription,
      images: [post.coverImage],
    },
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    image: [post.coverImage],
    datePublished: post.date,
    author: { "@type": "Organization", name: "MMP Tree Service LLC" },
    publisher: { "@type": "Organization", name: "MMP Tree Service LLC" },
    mainEntityOfPage: `https://mmptreeservice.com/blog/${post.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        // JSON.stringify does not escape "<", so a post title/field
        // containing a literal "</script>" would otherwise close this tag
        // early and let anything after it run as a new, real <script> — the
        // blog admin is unauthenticated by design, so this field is
        // attacker-reachable. Escaping "<" to its unicode escape defeats
        // the HTML-parser-level breakout while staying valid, parseable
        // JSON for search engines' structured-data readers.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <section className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          <p style={{ color: "var(--ink-soft)", fontSize: ".85rem" }}>{post.date}</p>
          <h1>{post.title}</h1>
          <img
            src={post.coverImage}
            alt={post.coverImageAlt}
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
        <Link href="/contact" className="btn btn-orange">
          Get a Free Estimate
        </Link>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Update `components/BlogPostCard.tsx`**

```tsx
import Link from "next/link";
import type { BlogPost } from "@/lib/blog";

export function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <div className="card">
      <img className="card__img" src={post.coverImage} alt={post.coverImageAlt} />
      <div className="card__body">
        {post.category && <span className="tag">{post.category}</span>}
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

- [ ] **Step 3: Verify existing tests and types still pass**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm test -- --run`
Expected: all existing tests still PASS (this task doesn't add new unit tests — it's markup/metadata only, already exercised by the e2e suite's blog tests updated in Task 10).

- [ ] **Step 4: Commit**

```bash
git add "app/blog/[slug]/page.tsx" components/BlogPostCard.tsx
git commit -m "Add Open Graph, Twitter Card, and JSON-LD structured data to blog posts"
```

---

### Task 12: Blog index category filter

**Files:**
- Modify: `app/blog/page.tsx`
- Create: `e2e/blog-category-filter.spec.ts`

**Interfaces:**
- Consumes: `getCategories` from `lib/blog-categories.ts` (Task 8); `getAllPosts` from `lib/blog.ts`.

- [ ] **Step 1: Implement the updated `app/blog/page.tsx`**

```tsx
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { getCategories } from "@/lib/blog-categories";
import { BlogPostCard } from "@/components/BlogPostCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blog | MMP Tree Service LLC",
  description: "Tree care tips for North Metro Atlanta homeowners.",
};

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const allPosts = getAllPosts();
  const categories = getCategories();
  const posts = category ? allPosts.filter((p) => p.category === category) : allPosts;

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
        {categories.length > 0 && (
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <Link
              href="/blog"
              className="tag"
              style={{ fontWeight: category ? 400 : 700 }}
            >
              All
            </Link>{" "}
            {categories.map((c) => (
              <Link
                key={c}
                href={`/blog?category=${encodeURIComponent(c)}`}
                className="tag"
                style={{ fontWeight: category === c ? 700 : 400 }}
              >
                {c}
              </Link>
            ))}
          </div>
        )}
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

- [ ] **Step 2: Write the e2e test**

Create `e2e/blog-category-filter.spec.ts`:

```ts
// e2e/blog-category-filter.spec.ts
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

test("filtering the blog index by category shows only matching posts", async ({ page }) => {
  const slugA = `e2e-category-a-${Date.now()}`;
  const slugB = `e2e-category-b-${Date.now()}`;
  const pathA = path.join(process.cwd(), "content/blog/posts", `${slugA}.md`);
  const pathB = path.join(process.cwd(), "content/blog/posts", `${slugB}.md`);

  try {
    await page.goto("/admin/blog/new");
    await page.getByLabel("Title", { exact: true }).fill("Storm Post For Filter Test");
    await page.getByLabel("URL Slug").fill(slugA);
    await page.getByLabel("Cover Image URL").fill("https://example.com/a.jpg");
    await page.getByLabel("Cover Image Alt Text").fill("Alt A");
    await page.getByLabel("Category").fill("Storm Safety");
    await page.getByLabel("Excerpt").fill("Excerpt A.");
    await page.getByLabel("SEO Title").fill("SEO A");
    await page.getByLabel("SEO Description").fill("Desc A.");
    await page.getByLabel("Body (Markdown)").fill("Body A.");
    await page.getByRole("button", { name: "Publish Post" }).click();
    await expect(page).toHaveURL(new RegExp(`/blog/${slugA}`));

    await page.goto("/admin/blog/new");
    await page.getByLabel("Title", { exact: true }).fill("Company Post For Filter Test");
    await page.getByLabel("URL Slug").fill(slugB);
    await page.getByLabel("Cover Image URL").fill("https://example.com/b.jpg");
    await page.getByLabel("Cover Image Alt Text").fill("Alt B");
    await page.getByLabel("Category").fill("Company News");
    await page.getByLabel("Excerpt").fill("Excerpt B.");
    await page.getByLabel("SEO Title").fill("SEO B");
    await page.getByLabel("SEO Description").fill("Desc B.");
    await page.getByLabel("Body (Markdown)").fill("Body B.");
    await page.getByRole("button", { name: "Publish Post" }).click();
    await expect(page).toHaveURL(new RegExp(`/blog/${slugB}`));

    await page.goto("/blog?category=Storm%20Safety");
    await expect(page.getByRole("heading", { name: "Storm Post For Filter Test" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Company Post For Filter Test" })
    ).not.toBeVisible();

    await page.getByRole("link", { name: "All", exact: true }).click();
    await expect(page).toHaveURL("/blog");
    await expect(page.getByRole("heading", { name: "Storm Post For Filter Test" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Company Post For Filter Test" })
    ).toBeVisible();
  } finally {
    if (fs.existsSync(pathA)) fs.unlinkSync(pathA);
    if (fs.existsSync(pathB)) fs.unlinkSync(pathB);
  }
});
```

- [ ] **Step 3: Run the full test suite**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm test -- --run`
Expected: all tests PASS.

Run: `npm run build`
Expected: builds successfully.

Run: `PORT=4182 npm run e2e`
Expected: all e2e tests, including the new `blog-category-filter.spec.ts` and `media-admin.spec.ts`, PASS.

- [ ] **Step 4: Commit**

```bash
git add app/blog/page.tsx e2e/blog-category-filter.spec.ts
git commit -m "Add category filter chips to the blog index"
```
