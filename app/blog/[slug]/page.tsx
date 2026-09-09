import { notFound } from "next/navigation";
import { getPublishedPostBySlug } from "@/lib/blog";
import { renderMarkdownToHtml } from "@/lib/markdown";
import { formatDisplayDate } from "@/lib/formatDate";
import { SITE_URL, absoluteUrl } from "@/lib/site";
import { EstimateMapSection } from "@/components/EstimateMapSection";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.seoTitle,
    description: post.seoDescription,
    alternates: { canonical: `/blog/${post.slug}` },
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
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const html = renderMarkdownToHtml(post.bodyMarkdown);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    image: [absoluteUrl(post.coverImage)],
    datePublished: post.date,
    author: { "@type": "Organization", name: "MMP Tree Service LLC" },
    publisher: { "@type": "Organization", name: "MMP Tree Service LLC" },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
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
          <p style={{ color: "var(--ink-soft)", fontSize: ".85rem" }}>{formatDisplayDate(post.date)}</p>
          <h1>{post.title}</h1>
          <img
            src={post.coverImage}
            alt={post.coverImageAlt}
            style={{
              width: "100%",
              aspectRatio: "16 / 9",
              objectFit: "cover",
              borderRadius: "var(--radius)",
              margin: "20px 0",
            }}
          />
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </section>
      <EstimateMapSection />
    </>
  );
}
