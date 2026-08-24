import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/blog";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { savePostAction } from "@/lib/blog-actions";

export const dynamic = "force-dynamic";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 760 }}>
        <h1>Edit Blog Post</h1>
        <BlogPostForm action={savePostAction} initialPost={post} slugEditable={false} />
      </div>
    </section>
  );
}
