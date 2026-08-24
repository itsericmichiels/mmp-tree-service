import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { savePostAction } from "@/lib/blog-actions";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default function NewBlogPostPage() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 760 }}>
        <h1>New Blog Post</h1>
        <BlogPostForm action={savePostAction} slugEditable={true} />
      </div>
    </section>
  );
}
