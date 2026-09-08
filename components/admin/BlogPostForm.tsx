// components/admin/BlogPostForm.tsx
"use client";

import { useState } from "react";
import { slugify } from "@/lib/slugify";
import { analyzeSeo } from "@/lib/seoChecklist";
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
  const [coverImageAlt, setCoverImageAlt] = useState(initialPost?.coverImageAlt ?? "");
  const [seoDescription, setSeoDescription] = useState(initialPost?.seoDescription ?? "");
  const [body, setBody] = useState(initialPost?.bodyMarkdown ?? "");
  const [focusKeyword, setFocusKeyword] = useState(initialPost?.focusKeyword ?? "");

  const checks = analyzeSeo({
    title,
    slug,
    seoDescription,
    bodyMarkdown: body,
    focusKeyword,
    coverImageAlt,
  });
  const passedCount = checks.filter((c) => c.passed).length;

  function handleTitleChange(value: string) {
    setTitle(value);
    if (slugEditable && !slugTouched) {
      setSlug(slugify(value));
    }
  }

  return (
    <form action={action} className="estimate-panel">
      <input type="hidden" name="mode" value={initialPost ? "edit" : "create"} />
      <input type="hidden" name="status" value={initialPost?.status ?? "published"} />
      <div className="form-field">
        <label htmlFor="focusKeyword">Focus Keyword</label>
        <input
          id="focusKeyword"
          name="focusKeyword"
          type="text"
          value={focusKeyword}
          onChange={(e) => setFocusKeyword(e.target.value)}
          placeholder="tree removal cost"
        />
        <p className="form-note">
          The main phrase this post targets — checked against the fields below, same as Rank
          Math / Yoast.
        </p>
      </div>
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
            value={coverImageAlt}
            onChange={(e) => setCoverImageAlt(e.target.value)}
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
          value={seoDescription}
          onChange={(e) => setSeoDescription(e.target.value)}
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
      </div>

      <div className="seo-checklist">
        <h4>
          SEO Checklist{" "}
          <span className="form-note" style={{ display: "inline" }}>
            ({passedCount}/{checks.length})
          </span>
        </h4>
        <ul>
          {checks.map((check) => (
            <li key={check.id} className={check.passed ? "seo-checklist__pass" : "seo-checklist__fail"}>
              {check.passed ? "✓" : "○"} {check.label}
            </li>
          ))}
        </ul>
      </div>

      <button type="submit" className="btn btn-orange btn-block">
        {initialPost ? "Save Changes" : "Publish Post"}
      </button>
    </form>
  );
}
