import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

export const dynamic = "force-dynamic";

export default function AdminBlogListPage() {
  const posts = getAllPosts();

  return (
    <section className="section">
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1>Blog Admin</h1>
          <Link href="/admin/blog/new" className="btn btn-orange">
            New Post
          </Link>
        </div>
        {posts.length === 0 ? (
          <p>No posts yet.</p>
        ) : (
          <ul>
            {posts.map((post) => (
              <li key={post.slug} style={{ marginBottom: 12 }}>
                <strong>{post.title}</strong> — {post.date} —{" "}
                <Link href={`/admin/blog/${post.slug}/edit`}>Edit</Link> —{" "}
                <Link href={`/blog/${post.slug}`}>View</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
