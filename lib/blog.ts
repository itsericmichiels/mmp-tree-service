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
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
  });
  fs.writeFileSync(path.join(postsDir, `${post.slug}.md`), fileContents, "utf-8");
}
