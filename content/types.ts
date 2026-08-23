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
  hub: { intro: string; whyUs: string[] };
  services: Record<string, ServicePageContent>;
};
