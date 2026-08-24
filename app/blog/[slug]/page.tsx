import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/blog";
import { renderMarkdownToHtml } from "@/lib/markdown";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.seoTitle,
    description: post.seoDescription,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const html = renderMarkdownToHtml(post.bodyMarkdown);

  return (
    <>
      <section className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          <p style={{ color: "var(--ink-soft)", fontSize: ".85rem" }}>{post.date}</p>
          <h1>{post.title}</h1>
          <img
            src={post.coverImage}
            alt={post.title}
            style={{ width: "100%", borderRadius: "var(--radius)", margin: "20px 0" }}
          />
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </section>
      <section className="estimate-cta-band" style={{ margin: "0 24px 60px" }}>
        <div>
          <h3>Need Tree Service in North Metro Atlanta?</h3>
          <p>Get a free, no-obligation estimate from MMP Tree Service.</p>
        </div>
        <a href="/contact" className="btn btn-orange">
          Get a Free Estimate
        </a>
      </section>
    </>
  );
}
