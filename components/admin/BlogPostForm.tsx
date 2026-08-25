// components/admin/BlogPostForm.tsx
"use client";

import { useState } from "react";
import { slugify } from "@/lib/slugify";
import { countLinks } from "@/lib/linkCount";
import type { BlogPost } from "@/lib/blog";

export function BlogPostForm({
  action,
  initialPost,
  slugEditable,
  categories,
}: {
  action: (formData: FormData) => void | Promise<void>;
  initialPost?: BlogPost;
  slugEditable: boolean;
  categories: string[];
}) {
  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [slug, setSlug] = useState(initialPost?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [body, setBody] = useState(initialPost?.bodyMarkdown ?? "");

  const linkCounts = countLinks(body);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (slugEditable && !slugTouched) {
      setSlug(slugify(value));
    }
  }

  return (
    <form action={action} className="estimate-panel">
      <input type="hidden" name="mode" value={initialPost ? "edit" : "create"} />
      <div className="form-field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="slug">URL Slug</label>
        <input
          id="slug"
          name="slug"
          type="text"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          readOnly={!slugEditable}
          required
        />
      </div>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="date">Date</label>
          <input
            id="date"
            name="date"
            type="date"
            defaultValue={initialPost?.date ?? new Date().toISOString().slice(0, 10)}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="coverImage">Cover Image URL</label>
          <input
            id="coverImage"
            name="coverImage"
            type="text"
            defaultValue={initialPost?.coverImage ?? ""}
            required
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="coverImageAlt">Cover Image Alt Text</label>
          <input
            id="coverImageAlt"
            name="coverImageAlt"
            type="text"
            defaultValue={initialPost?.coverImageAlt ?? ""}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="category">Category</label>
          <input
            id="category"
            name="category"
            type="text"
            list="category-options"
            defaultValue={initialPost?.category ?? ""}
            required
          />
          <datalist id="category-options">
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </datalist>
          <p className="form-note">
            Pick an existing category or type a new one — it&apos;ll be added to the list.
          </p>
        </div>
      </div>
      <div className="form-field">
        <label htmlFor="tags">Tags</label>
        <input
          id="tags"
          name="tags"
          type="text"
          defaultValue={initialPost?.tags.join(", ") ?? ""}
          placeholder="oak, pruning, canton"
        />
        <p className="form-note">Comma-separated, optional.</p>
      </div>
      <div className="form-field">
        <label htmlFor="excerpt">Excerpt</label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={2}
          defaultValue={initialPost?.excerpt ?? ""}
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="seoTitle">SEO Title</label>
        <input
          id="seoTitle"
          name="seoTitle"
          type="text"
          defaultValue={initialPost?.seoTitle ?? ""}
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="seoDescription">SEO Description</label>
        <textarea
          id="seoDescription"
          name="seoDescription"
          rows={2}
          defaultValue={initialPost?.seoDescription ?? ""}
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="bodyMarkdown">Body (Markdown)</label>
        <textarea
          id="bodyMarkdown"
          name="bodyMarkdown"
          rows={16}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
        <p
          className="form-note"
          style={{ color: linkCounts.internal >= 5 ? "var(--green)" : "var(--ink-soft)" }}
        >
          Internal links: {linkCounts.internal}/5 {linkCounts.internal >= 5 ? "✓" : ""}
        </p>
        <p
          className="form-note"
          style={{ color: linkCounts.external >= 5 ? "var(--green)" : "var(--ink-soft)" }}
        >
          External links: {linkCounts.external}/5 {linkCounts.external >= 5 ? "✓" : ""}
        </p>
      </div>
      <button type="submit" className="btn btn-orange btn-block">
        {initialPost ? "Save Changes" : "Publish Post"}
      </button>
    </form>
  );
}
