import Link from "next/link";
import type { BlogPost } from "@/lib/blog";

export function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <div className="card">
      <img className="card__img" src={post.coverImage} alt={post.title} />
      <div className="card__body">
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
        <p style={{ fontSize: ".8rem", color: "var(--ink-soft)" }}>{post.date}</p>
        <Link className="card__link" href={`/blog/${post.slug}`}>
          Read more →
        </Link>
      </div>
    </div>
  );
}
