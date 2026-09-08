// app/api/blog-drafts/route.ts
// Narrow-purpose endpoint for the scheduled blog-writing agent: accepts a
// new post and saves it as a draft. Can never publish directly — every
// post goes through /admin/blog's Approve & Publish action.
import { NextResponse, type NextRequest } from "next/server";
import { parseDraftPayload } from "@/lib/blogDraftIngest";
import { getPostBySlug, savePost, uniqueSlug } from "@/lib/blog";
import { addCategory } from "@/lib/blog-categories";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const secret = request.headers.get("x-ingest-secret");
  const expected = process.env.BLOG_INGEST_SECRET;
  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseDraftPayload(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const post = parsed.post;
  if (await getPostBySlug(post.slug)) {
    post.slug = await uniqueSlug(post.slug);
  }

  await addCategory(post.category);
  await savePost(post);

  return NextResponse.json({ ok: true, slug: post.slug, status: "draft" }, { status: 201 });
}
