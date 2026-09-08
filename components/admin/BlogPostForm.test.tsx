// components/admin/BlogPostForm.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BlogPostForm } from "./BlogPostForm";

describe("BlogPostForm auto-slug behavior", () => {
  it("auto-fills the URL Slug field from the Title field when slugEditable and untouched", () => {
    render(<BlogPostForm action={() => {}} slugEditable={true} categories={[]} />);

    const title = screen.getByLabelText("Title", { exact: true });
    const slug = screen.getByLabelText("URL Slug") as HTMLInputElement;

    fireEvent.change(title, { target: { value: "My Great Post" } });

    expect(slug.value).toBe("my-great-post");
  });

  it("stops auto-filling the slug once the user manually edits it, even as the title keeps changing", () => {
    render(<BlogPostForm action={() => {}} slugEditable={true} categories={[]} />);

    const title = screen.getByLabelText("Title", { exact: true });
    const slug = screen.getByLabelText("URL Slug") as HTMLInputElement;

    fireEvent.change(title, { target: { value: "My Great Post" } });
    expect(slug.value).toBe("my-great-post");

    fireEvent.change(slug, { target: { value: "custom-slug" } });
    expect(slug.value).toBe("custom-slug");

    fireEvent.change(title, { target: { value: "My Great Post Extended" } });
    expect(slug.value).toBe("custom-slug");
  });

  it("never changes the slug field from the Title field when slugEditable is false, touched or not", () => {
    const initialPost = {
      slug: "existing-post",
      title: "Existing Post",
      date: "2026-08-24",
      excerpt: "An excerpt.",
      coverImage: "https://example.com/x.jpg",
      coverImageAlt: "Existing alt text",
      category: "Tree Care Tips",
      tags: ["oak"],
      seoTitle: "Existing Post SEO",
      seoDescription: "SEO description.",
      bodyMarkdown: "Body.",
      focusKeyword: "",
    };

    render(
      <BlogPostForm
        action={() => {}}
        slugEditable={false}
        initialPost={initialPost}
        categories={["Tree Care Tips"]}
      />
    );

    const title = screen.getByLabelText("Title", { exact: true });
    const slug = screen.getByLabelText("URL Slug") as HTMLInputElement;

    expect(slug.value).toBe("existing-post");
    expect(slug).toHaveAttribute("readonly");

    fireEvent.change(title, { target: { value: "Completely Different Title" } });

    expect(slug.value).toBe("existing-post");
  });
});

describe("BlogPostForm category/tags/alt fields", () => {
  it("lists the provided categories as datalist options and pre-fills tags/alt from initialPost", () => {
    const initialPost = {
      slug: "existing-post",
      title: "Existing Post",
      date: "2026-08-24",
      excerpt: "An excerpt.",
      coverImage: "https://example.com/x.jpg",
      coverImageAlt: "Existing alt text",
      category: "Storm Safety",
      tags: ["oak", "storm"],
      seoTitle: "Existing Post SEO",
      seoDescription: "SEO description.",
      bodyMarkdown: "Body.",
      focusKeyword: "",
    };

    render(
      <BlogPostForm
        action={() => {}}
        slugEditable={false}
        initialPost={initialPost}
        categories={["Tree Care Tips", "Storm Safety"]}
      />
    );

    expect((screen.getByLabelText("Category") as HTMLInputElement).value).toBe("Storm Safety");
    expect((screen.getByLabelText("Tags") as HTMLInputElement).value).toBe("oak, storm");
    expect((screen.getByLabelText("Cover Image Alt Text") as HTMLInputElement).value).toBe(
      "Existing alt text"
    );
    expect(screen.getByText("Tree Care Tips")).toBeInTheDocument();
  });
});

describe("BlogPostForm SEO checklist", () => {
  it("updates live as the focus keyword and title are edited", () => {
    render(<BlogPostForm action={() => {}} slugEditable={true} categories={[]} />);

    expect(screen.getByText(/Focus keyword appears in the title/)).toHaveClass(
      "seo-checklist__fail"
    );

    fireEvent.change(screen.getByLabelText("Focus Keyword"), {
      target: { value: "tree removal" },
    });
    fireEvent.change(screen.getByLabelText("Title", { exact: true }), {
      target: { value: "Tree Removal Cost Guide" },
    });

    expect(screen.getByText(/Focus keyword appears in the title/)).toHaveClass(
      "seo-checklist__pass"
    );
  });

  it("submits the focus keyword as a form field", () => {
    render(<BlogPostForm action={() => {}} slugEditable={true} categories={[]} />);
    const input = screen.getByLabelText("Focus Keyword") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "stump grinding" } });
    expect(input.name).toBe("focusKeyword");
    expect(input.value).toBe("stump grinding");
  });
});
