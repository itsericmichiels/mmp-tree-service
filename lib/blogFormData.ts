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
