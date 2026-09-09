// content/types.ts
// Shared content shape for a single service+city page. Not coupled to any
// specific city's data file — city content modules (e.g. content/canton.ts)
// import this type instead of each other.
export type ServicePageContent = {
  intro: string;
  howItWorks: { title: string; body: string };
  cost: { title: string; body: string };
  localConsiderations: { title: string; body: string };
  faqs: { question: string; answer: string }[];
};

export type CityContent = {
  hub: { intro: string; overview: string; whyUs: string[] };
  services: Record<string, ServicePageContent>;
};

// Content for a general, non-city-specific service page (e.g. /tree-removal)
// covering North Georgia broadly rather than one city.
export type GeneralServicePageContent = {
  // Short, one-sentence line shown directly on the hero photo. Keep this
  // brief — the full intro (below) renders as regular body text right
  // after the hero, not overlaid on the image.
  heroTagline: string;
  intro: string;
  // <meta name="description">, 120-155 chars. Written for the search
  // snippet specifically (service + area + trust signal + phone) — not a
  // truncation of `intro`, which runs far longer than a snippet allows.
  metaDescription: string;
  costFactors: {
    title: string;
    intro: string;
    items: string[];
  };
  whyNeeded: {
    title: string;
    reasons: { title: string; body: string }[];
  };
  whyChooseUs: {
    title: string;
    reasons: { title: string; body: string }[];
  };
  cta: { title: string; body: string };
  faqs: { question: string; answer: string }[];
};
