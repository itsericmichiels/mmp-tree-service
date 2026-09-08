import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const savePost = vi.fn();
const getPostBySlug = vi.fn();
const uniqueSlug = vi.fn();
const addCategory = vi.fn();

vi.mock("@/lib/blog", () => ({ savePost, getPostBySlug, uniqueSlug }));
vi.mock("@/lib/blog-categories", () => ({ addCategory }));

const SECRET = "test-ingest-secret";

function makeRequest(body: unknown, headers: Record<string, string> = { "x-ingest-secret": SECRET }) {
  return new NextRequest("http://localhost/api/blog-drafts", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

const validPayload = {
  title: "Tree Removal Cost Guide",
  excerpt: "What it actually costs.",
  coverImage: "https://example.com/photo.jpg",
  coverImageAlt: "A crew removing a tree",
  category: "Tree Care Tips",
  seoTitle: "Tree Removal Cost Guide",
  seoDescription: "See what tree removal costs across North Georgia and what drives the price.",
  bodyMarkdown: "Body content.",
  focusKeyword: "tree removal cost",
};

describe("POST /api/blog-drafts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BLOG_INGEST_SECRET = SECRET;
    getPostBySlug.mockResolvedValue(null);
  });

  it("rejects a request with no secret header", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest(validPayload, {}));
    expect(res.status).toBe(401);
    expect(savePost).not.toHaveBeenCalled();
  });

  it("rejects a request with the wrong secret", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest(validPayload, { "x-ingest-secret": "wrong" }));
    expect(res.status).toBe(401);
    expect(savePost).not.toHaveBeenCalled();
  });

  it("rejects an invalid payload with 400 and does not save anything", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest({ title: "Only a title" }));
    expect(res.status).toBe(400);
    expect(savePost).not.toHaveBeenCalled();
  });

  it("saves a valid payload as a draft and returns 201", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest(validPayload));

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.status).toBe("draft");
    expect(savePost).toHaveBeenCalledWith(expect.objectContaining({ status: "draft" }));
    expect(addCategory).toHaveBeenCalledWith("Tree Care Tips");
  });

  it("de-duplicates the slug when it already exists", async () => {
    getPostBySlug.mockResolvedValue({ slug: "tree-removal-cost-guide" });
    uniqueSlug.mockResolvedValue("tree-removal-cost-guide-2");

    const { POST } = await import("./route");
    const res = await POST(makeRequest(validPayload));

    expect(res.status).toBe(201);
    expect(savePost).toHaveBeenCalledWith(expect.objectContaining({ slug: "tree-removal-cost-guide-2" }));
  });
});
