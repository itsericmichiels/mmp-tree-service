// components/admin/MediaGalleryItem.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MediaGalleryItem } from "./MediaGalleryItem";
import type { MediaItem } from "@/lib/media";

const baseItem: MediaItem = {
  id: "abc123",
  filename: "canton-oak-abc123.jpg",
  url: "/uploads/canton-oak-abc123.jpg",
  alt: "A large oak in a Canton front yard",
  tags: [],
  uploadedAt: "2026-08-25T00:00:00.000Z",
};

describe("MediaGalleryItem", () => {
  it("renders the image with its alt text and no tags", () => {
    render(
      <MediaGalleryItem
        item={baseItem}
        pageSlugs={["tree-service-canton-ga"]}
        assignedSlug=""
        deleteAction={vi.fn()}
        toggleOurWorkAction={vi.fn()}
        assignHeroAction={vi.fn()}
        clearHeroAction={vi.fn()}
      />
    );

    const img = screen.getByRole("img", { name: /large oak in a canton front yard/i });
    expect(img).toHaveAttribute("src", baseItem.url);
    expect(screen.getByRole("button", { name: /show on our work/i })).toBeInTheDocument();
  });

  it("shows 'Remove from Our Work' when the item already has the our-work tag", () => {
    render(
      <MediaGalleryItem
        item={{ ...baseItem, tags: ["our-work"] }}
        pageSlugs={[]}
        assignedSlug=""
        deleteAction={vi.fn()}
        toggleOurWorkAction={vi.fn()}
        assignHeroAction={vi.fn()}
        clearHeroAction={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: /remove from our work/i })).toBeInTheDocument();
    expect(screen.getByText("our-work")).toBeInTheDocument();
  });

  it("shows the current hero assignment and a clear control when assignedSlug is set", () => {
    render(
      <MediaGalleryItem
        item={baseItem}
        pageSlugs={["tree-service-canton-ga"]}
        assignedSlug="tree-service-canton-ga"
        deleteAction={vi.fn()}
        toggleOurWorkAction={vi.fn()}
        assignHeroAction={vi.fn()}
        clearHeroAction={vi.fn()}
      />
    );

    // A longer, more specific match than the bare slug: the <select>'s own
    // <option value="tree-service-canton-ga"> also renders that exact slug
    // text, so a bare-slug regex matches twice and getByText throws. The
    // "Currently hero for:" prefix only appears in the assignment note.
    expect(screen.getByText(/currently hero for: tree-service-canton-ga/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /clear hero/i })).toBeInTheDocument();
  });

  it("does not show a clear-hero control when there is no current assignment", () => {
    render(
      <MediaGalleryItem
        item={baseItem}
        pageSlugs={["tree-service-canton-ga"]}
        assignedSlug=""
        deleteAction={vi.fn()}
        toggleOurWorkAction={vi.fn()}
        assignHeroAction={vi.fn()}
        clearHeroAction={vi.fn()}
      />
    );

    expect(screen.queryByRole("button", { name: /clear hero/i })).not.toBeInTheDocument();
  });
});
