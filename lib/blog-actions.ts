"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getPostBySlug, savePost, uniqueSlug, publishPost, unpublishPost } from "@/lib/blog";
import { buildPostFromFormData } from "@/lib/blogFormData";
import { addCategory } from "@/lib/blog-categories";

export async function savePostAction(formData: FormData): Promise<void> {
  const post = buildPostFromFormData(formData);
  const mode = formData.get("mode") === "edit" ? "edit" : "create";

  if (mode === "create" && (await getPostBySlug(post.slug))) {
    post.slug = await uniqueSlug(post.slug);
  }

  await addCategory(post.category);
  await savePost(post);

  if (post.status === "published") {
    redirect(`/blog/${post.slug}`);
  }
  redirect("/admin/blog");
}

export async function approvePostAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "");
  if (slug) {
    await publishPost(slug);
    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    revalidatePath("/sitemap.xml");
  }
  redirect("/admin/blog");
}

export async function unpublishPostAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "");
  if (slug) {
    await unpublishPost(slug);
    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    revalidatePath("/sitemap.xml");
  }
  redirect("/admin/blog");
}
