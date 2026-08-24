import { getAllPosts } from "@/lib/blog";
import { BlogPostCard } from "@/components/BlogPostCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blog | MMP Tree Service LLC",
  description: "Tree care tips for North Metro Atlanta homeowners.",
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

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
