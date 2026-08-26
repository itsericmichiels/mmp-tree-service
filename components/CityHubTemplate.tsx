// components/CityHubTemplate.tsx
import Link from "next/link";
import type { City } from "@/lib/cities";
import { SERVICES } from "@/lib/services";
import { serviceCitySlug } from "@/lib/slugs";
import { MapEmbed } from "./MapEmbed";
import { EstimateForm } from "./EstimateForm";
import { MarkdownBlock } from "./MarkdownBlock";

const DEFAULT_HUB_HERO_URL =
  "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1800&q=80";

export function CityHubTemplate({
  city,
  content,
  heroImageUrl,
}: {
  city: City;
  content: { intro: string; overview: string; whyUs: string[] };
  heroImageUrl?: string;
}) {
  return (
    <>
      <section
        className="hero hero--plain"
        style={{
          backgroundImage: `url('${heroImageUrl || DEFAULT_HUB_HERO_URL}')`,
        }}
      />

      <section className="section section--tight">
        <div className="container" style={{ maxWidth: 860, margin: "0 auto" }}>
          <p className="breadcrumb">
            <Link href="/">Home</Link> / Tree Service in {city.name}
          </p>
          <h1>Tree Service in {city.name}</h1>
          <MarkdownBlock markdown={content.intro} />
          <div className="hero__actions">
            <Link href="/contact" className="btn btn-orange">
              Get a Free Estimate
            </Link>
            <a href="tel:4704030215" className="btn btn-green">
              📞 Call (470) 403-0215
            </a>
          </div>
        </div>
      </section>

      <section className="section section--cream">
        <div className="container split">
          <div>
            <MarkdownBlock markdown={content.overview} />
          </div>
          <div className="sticky-sidebar">
            <EstimateForm />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Our Services in {city.name}</span>
            <h2>Every Service, One Trusted Crew</h2>
          </div>
          <div className="grid grid--3">
            {SERVICES.map((service) => (
              <div className="card" key={service.slug}>
                <div className="card__body">
                  <h3>{service.name}</h3>
                  <p>{service.shortDescription}</p>
                  <Link
                    className="card__link"
                    href={`/${serviceCitySlug(service, city)}`}
                  >
                    {service.name} in {city.name} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--cream">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Why {city.name} Chooses MMP</span>
            <h2>Local Crews Who Know {city.name}</h2>
          </div>
          <ul className="check-list">
            {content.whyUs.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" id="estimate">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Get Started</span>
            <h2>Request Your Free Estimate in {city.name}</h2>
          </div>
          <MapEmbed />
        </div>
      </section>
    </>
  );
}
