import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { getCategories } from "@/lib/blog-categories";
import { BlogPostCard } from "@/components/BlogPostCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blog | MMP Tree Service LLC",
  description: "Tree care tips for North Metro Atlanta homeowners.",
};

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const allPosts = await getAllPosts();
  const categories = await getCategories();
  const posts = category ? allPosts.filter((p) => p.category === category) : allPosts;

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Blog</span>
          <h1>Tree Care Tips for Atlanta Homeowners</h1>
          <p>
            Practical advice on tree removal, trimming, storm damage, and
            more from the MMP Tree Service crew.
          </p>
        </div>
        {categories.length > 0 && (
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <Link
              href="/blog"
              className="tag"
              style={{ fontWeight: category ? 400 : 700 }}
            >
              All
            </Link>{" "}
            {categories.map((c) => (
              <Link
                key={c}
                href={`/blog?category=${encodeURIComponent(c)}`}
                className="tag"
                style={{ fontWeight: category === c ? 700 : 400 }}
              >
                {c}
              </Link>
            ))}
          </div>
        )}
        {posts.length === 0 ? (
          <p>No posts yet — check back soon.</p>
        ) : (
          <div className="grid grid--3">
            {posts.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
