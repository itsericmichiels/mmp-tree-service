// lib/blogDraftIngest.ts
// Validates payloads submitted to /api/blog-drafts (used by the scheduled
// blog-writing agent). Every accepted post is forced to draft status —
// this endpoint can never publish directly.
import type { BlogPost } from "./blog";
import { slugify } from "./slugify";

const REQUIRED_STRING_FIELDS = [
  "title",
  "excerpt",
  "coverImage",
  "coverImageAlt",
  "category",
  "seoTitle",
  "seoDescription",
  "bodyMarkdown",
  "focusKeyword",
] as const;

export type ParseDraftResult = { ok: true; post: BlogPost } | { ok: false; error: string };

export function parseDraftPayload(input: unknown): ParseDraftResult {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return { ok: false, error: "Payload must be a JSON object" };
  }
  const body = input as Record<string, unknown>;

  for (const field of REQUIRED_STRING_FIELDS) {
    const value = body[field];
    if (typeof value !== "string" || value.trim().length === 0) {
      return { ok: false, error: `Missing or blank required field: ${field}` };
    }
  }

  let tags: string[] = [];
  if (body.tags !== undefined) {
    if (!Array.isArray(body.tags) || !body.tags.every((t) => typeof t === "string")) {
      return { ok: false, error: "tags must be an array of strings" };
    }
    tags = body.tags;
  }

  const title = body.title as string;
  const slug = typeof body.slug === "string" && body.slug.trim() ? body.slug.trim() : slugify(title);
  const date =
    typeof body.date === "string" && body.date.trim()
      ? body.date.trim()
      : new Date().toISOString().slice(0, 10);

  const post: BlogPost = {
    slug,
    title,
    date,
    excerpt: body.excerpt as string,
    coverImage: body.coverImage as string,
    coverImageAlt: body.coverImageAlt as string,
    category: body.category as string,
    tags,
    seoTitle: body.seoTitle as string,
    seoDescription: body.seoDescription as string,
    bodyMarkdown: body.bodyMarkdown as string,
    focusKeyword: body.focusKeyword as string,
    status: "draft",
  };

  return { ok: true, post };
}
