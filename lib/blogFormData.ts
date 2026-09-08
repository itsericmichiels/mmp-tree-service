import type { BlogPost, BlogPostStatus } from "./blog";

function parseStatus(value: FormDataEntryValue | null): BlogPostStatus {
  return value === "draft" ? "draft" : "published";
}

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
    focusKeyword: String(formData.get("focusKeyword") ?? ""),
    status: parseStatus(formData.get("status")),
  };
}
