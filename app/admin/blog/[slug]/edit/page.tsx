import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/blog";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { savePostAction } from "@/lib/blog-actions";
import { getCategories } from "@/lib/blog-categories";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const categories = await getCategories();

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 760 }}>
        <h1>Edit Blog Post</h1>
        <BlogPostForm
          action={savePostAction}
          initialPost={post}
          slugEditable={false}
          categories={categories}
        />
      </div>
    </section>
  );
}
