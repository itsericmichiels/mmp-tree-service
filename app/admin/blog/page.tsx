import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { approvePostAction } from "@/lib/blog-actions";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminBlogListPage() {
  const posts = await getAllPosts();
  const pending = posts.filter((p) => p.status === "draft");
  const published = posts.filter((p) => p.status === "published");

  return (
    <section className="section">
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1>Blog Admin</h1>
          <Link href="/admin/blog/new" className="btn btn-orange">
            New Post
          </Link>
        </div>

        <h2>Pending Approval {pending.length > 0 ? `(${pending.length})` : ""}</h2>
        {pending.length === 0 ? (
          <p className="form-note" style={{ textAlign: "left" }}>
            Nothing waiting on approval right now.
          </p>
        ) : (
          <ul style={{ marginBottom: 32 }}>
            {pending.map((post) => (
              <li key={post.slug} style={{ marginBottom: 12 }}>
                <strong>{post.title}</strong> — {post.date} —{" "}
                <Link href={`/admin/blog/${post.slug}/edit`}>Edit</Link>{" "}
                <form action={approvePostAction} style={{ display: "inline" }}>
                  <input type="hidden" name="slug" value={post.slug} />
                  <button type="submit" className="btn btn-green btn-sm">
                    Approve &amp; Publish
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <h2>Published</h2>
        {published.length === 0 ? (
          <p>No posts published yet.</p>
        ) : (
          <ul>
            {published.map((post) => (
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
