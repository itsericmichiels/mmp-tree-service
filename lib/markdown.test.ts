import { describe, it, expect } from "vitest";
import { renderMarkdownToHtml } from "./markdown";

describe("renderMarkdownToHtml", () => {
  it("converts basic markdown to HTML", () => {
    const html = renderMarkdownToHtml("# Hello\n\nThis is **bold** text.");
    expect(html).toContain("<h1>Hello</h1>");
    expect(html).toContain("<strong>bold</strong>");
  });

  it("converts markdown links to anchor tags", () => {
    const html = renderMarkdownToHtml("[Tree Removal](/tree-removal-canton-ga)");
    expect(html).toContain('href="/tree-removal-canton-ga"');
  });

  it("strips a raw script tag (sanitization)", () => {
    const html = renderMarkdownToHtml("Hello <script>alert('xss')</script> world");
    expect(html).not.toContain("<script>");
  });

  it("preserves an img tag with src and alt", () => {
    const html = renderMarkdownToHtml("![A tree](https://example.com/tree.jpg)");
    expect(html).toContain('src="https://example.com/tree.jpg"');
    expect(html).toContain('alt="A tree"');
  });
});
