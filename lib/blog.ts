// lib/blog.ts
import { supabase } from "./supabase";

export type BlogPostStatus = "draft" | "published";

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
  focusKeyword: string;
  status: BlogPostStatus;
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function assertValidSlug(slug: string): void {
  if (!SLUG_PATTERN.test(slug)) {
    throw new Error(`Invalid post slug: ${slug}`);
  }
}

type BlogPostRow = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  cover_image: string;
  cover_image_alt: string;
  category: string;
  tags: string[];
  seo_title: string;
  seo_description: string;
  body_markdown: string;
  focus_keyword: string;
  status: BlogPostStatus;
};

function fromRow(row: BlogPostRow): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    date: row.date,
    excerpt: row.excerpt,
    coverImage: row.cover_image,
    coverImageAlt: row.cover_image_alt,
    category: row.category,
    tags: row.tags ?? [],
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    bodyMarkdown: row.body_markdown,
    focusKeyword: row.focus_keyword ?? "",
    status: row.status ?? "published",
  };
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("date", { ascending: false });
  if (error || !data) return [];
  return data.map(fromRow);
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("date", { ascending: false });
  if (error || !data) return [];
  return data.map(fromRow);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!SLUG_PATTERN.test(slug)) return null;
  const { data, error } = await supabase.from("blog_posts").select("*").eq("slug", slug).maybeSingle();
  if (error || !data) return null;
  return fromRow(data);
}

export async function getPublishedPostBySlug(slug: string): Promise<BlogPost | null> {
  const post = await getPostBySlug(slug);
  return post && post.status === "published" ? post : null;
}

export async function uniqueSlug(desiredSlug: string): Promise<string> {
  if (!(await getPostBySlug(desiredSlug))) return desiredSlug;
  let suffix = 2;
  let candidate = `${desiredSlug}-${suffix}`;
  while (await getPostBySlug(candidate)) {
    suffix += 1;
    candidate = `${desiredSlug}-${suffix}`;
  }
  return candidate;
}

export async function savePost(post: BlogPost): Promise<void> {
  assertValidSlug(post.slug);
  const { error } = await supabase.from("blog_posts").upsert({
    slug: post.slug,
    title: post.title,
    date: post.date,
    excerpt: post.excerpt,
    cover_image: post.coverImage,
    cover_image_alt: post.coverImageAlt,
    category: post.category,
    tags: post.tags,
    seo_title: post.seoTitle,
    seo_description: post.seoDescription,
    body_markdown: post.bodyMarkdown,
    focus_keyword: post.focusKeyword,
    status: post.status,
  });
  if (error) throw new Error(`Failed to save post: ${error.message}`);
}

export async function publishPost(slug: string): Promise<void> {
  const { error } = await supabase.from("blog_posts").update({ status: "published" }).eq("slug", slug);
  if (error) throw new Error(`Failed to publish post: ${error.message}`);
}
