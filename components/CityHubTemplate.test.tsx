// components/CityHubTemplate.test.tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { CityHubTemplate } from "./CityHubTemplate";
import type { City } from "@/lib/cities";

const canton: City = { slug: "canton", name: "Canton, GA", isBuilt: true };
const content = { intro: "Intro text.", overview: "Overview text.", whyUs: ["Reason one"] };

describe("CityHubTemplate hero image", () => {
  it("uses the stock fallback photo when heroImageUrl is not provided", () => {
    const { container } = render(<CityHubTemplate city={canton} content={content} />);
    const hero = container.querySelector(".hero") as HTMLElement;
    expect(hero.style.backgroundImage).toContain("images.unsplash.com");
  });

  it("uses the provided heroImageUrl when set", () => {
    const { container } = render(
      <CityHubTemplate
        city={canton}
        content={content}
        heroImageUrl="/uploads/canton-oak-abc123.jpg"
      />
    );
    const hero = container.querySelector(".hero") as HTMLElement;
    expect(hero.style.backgroundImage).toContain("/uploads/canton-oak-abc123.jpg");
  });
});
