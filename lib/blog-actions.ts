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
