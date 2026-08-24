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
