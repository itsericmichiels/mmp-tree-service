"use server";

import { redirect } from "next/navigation";
import { savePost } from "@/lib/blog";
import { buildPostFromFormData } from "@/lib/blogFormData";

export async function savePostAction(formData: FormData): Promise<void> {
  const post = buildPostFromFormData(formData);
  savePost(post);
  redirect(`/blog/${post.slug}`);
}
