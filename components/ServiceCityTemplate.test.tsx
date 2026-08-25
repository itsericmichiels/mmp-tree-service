// components/ServiceCityTemplate.test.tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ServiceCityTemplate } from "./ServiceCityTemplate";
import type { City } from "@/lib/cities";
import type { Service } from "@/lib/services";

const canton: City = { slug: "canton", name: "Canton, GA", isBuilt: true };
const treeRemoval: Service = {
  slug: "tree-removal",
  name: "Tree Removal",
  shortDescription: "x",
  icon: "tree-removal",
};
const content = {
  intro: "Intro text.",
  howItWorks: { title: "How It Works", body: "Body." },
  cost: { title: "Cost", body: "Body." },
  localConsiderations: { title: "Local", body: "Body." },
  faqs: [{ question: "Q?", answer: "A." }],
};

describe("ServiceCityTemplate hero image", () => {
  it("uses the stock fallback photo when heroImageUrl is not provided", () => {
    const { container } = render(
      <ServiceCityTemplate city={canton} service={treeRemoval} content={content} />
    );
    const hero = container.querySelector(".hero") as HTMLElement;
    expect(hero.style.backgroundImage).toContain("images.unsplash.com");
  });

  it("uses the provided heroImageUrl when set", () => {
    const { container } = render(
      <ServiceCityTemplate
        city={canton}
        service={treeRemoval}
        content={content}
        heroImageUrl="/uploads/canton-removal-abc123.jpg"
      />
    );
    const hero = container.querySelector(".hero") as HTMLElement;
    expect(hero.style.backgroundImage).toContain("/uploads/canton-removal-abc123.jpg");
  });
});
