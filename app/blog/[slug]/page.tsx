import Link from "next/link";
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
    openGraph: {
      title: post.seoTitle,
      description: post.seoDescription,
      images: [post.coverImage],
      type: "article",
      publishedTime: post.date,
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoTitle,
      description: post.seoDescription,
      images: [post.coverImage],
    },
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    image: [post.coverImage],
    datePublished: post.date,
    author: { "@type": "Organization", name: "MMP Tree Service LLC" },
    publisher: { "@type": "Organization", name: "MMP Tree Service LLC" },
    mainEntityOfPage: `https://mmptreeservice.com/blog/${post.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Escape `<` to prevent HTML-parser-level script tag breakout.
        // JSON.stringify does not escape `<`, so titles with `</script>` would
        // close the script tag prematurely at the HTML parser level, allowing
        // script injection. Unicode escape `<` is valid JSON and safely parsed
        // by search engines' structured-data readers.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <section className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          <p style={{ color: "var(--ink-soft)", fontSize: ".85rem" }}>{post.date}</p>
          <h1>{post.title}</h1>
          <img
            src={post.coverImage}
            alt={post.coverImageAlt}
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
        <Link href="/contact" className="btn btn-orange">
          Get a Free Estimate
        </Link>
      </section>
    </>
  );
}
