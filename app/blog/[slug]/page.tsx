import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getPostBySlug, type BlogPost } from "@/lib/blog";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/adminAuth";
import { renderMarkdownToHtml } from "@/lib/markdown";
import { formatDisplayDate } from "@/lib/formatDate";
import { SITE_URL, absoluteUrl } from "@/lib/site";
import { EstimateMapSection } from "@/components/EstimateMapSection";

export const dynamic = "force-dynamic";

// A draft is only ever shown to whoever is logged into /admin — this is how
// the business owner previews a post before hitting Approve & Publish. It
// stays a normal 404 for everyone else, same as a slug that doesn't exist.
async function getViewablePost(slug: string): Promise<BlogPost | null> {
  const post = await getPostBySlug(slug);
  if (!post) return null;
  if (post.status === "published") return post;

  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  return (await verifySessionToken(token)) ? post : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getViewablePost(slug);
  if (!post) return {};
  return {
    title: post.seoTitle,
    description: post.seoDescription,
    alternates: { canonical: `/blog/${post.slug}` },
    robots: post.status === "draft" ? { index: false, follow: false } : undefined,
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
  const post = await getViewablePost(slug);

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
          {post.status === "draft" && (
            <p
              style={{
                background: "#fff3cd",
                color: "#664d03",
                padding: "10px 16px",
                borderRadius: "var(--radius-sm)",
                fontWeight: 600,
                marginBottom: 20,
              }}
            >
              Draft preview — only visible to you while logged into /admin. Not live on the public
              site yet.
            </p>
          )}
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
