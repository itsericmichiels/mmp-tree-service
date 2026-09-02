// app/our-work/page.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import OurWorkPage from "./page";
import type { MediaItem } from "@/lib/media";

vi.mock("@/lib/media", () => ({
  getAllMedia: vi.fn(),
}));

import { getAllMedia } from "@/lib/media";

const mockedGetAllMedia = vi.mocked(getAllMedia);

describe("OurWorkPage", () => {
  it("shows the placeholder copy when no media is tagged our-work", async () => {
    mockedGetAllMedia.mockResolvedValue([]);
    render(await OurWorkPage());
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
  });

  it("renders a grid of media tagged our-work, excluding untagged media", async () => {
    const tagged: MediaItem = {
      id: "1",
      filename: "job-1.jpg",
      url: "/uploads/job-1.jpg",
      alt: "A finished tree removal in Canton",
      tags: ["our-work"],
      uploadedAt: "2026-08-25T00:00:00.000Z",
    };
    const untagged: MediaItem = {
      id: "2",
      filename: "job-2.jpg",
      url: "/uploads/job-2.jpg",
      alt: "An unrelated photo",
      tags: [],
      uploadedAt: "2026-08-25T00:00:00.000Z",
    };
    mockedGetAllMedia.mockResolvedValue([tagged, untagged]);

    render(await OurWorkPage());

    expect(screen.getByAltText("A finished tree removal in Canton")).toBeInTheDocument();
    expect(screen.queryByAltText("An unrelated photo")).not.toBeInTheDocument();
    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument();
  });
});
