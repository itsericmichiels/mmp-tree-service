// components/GeneralServiceTemplate.tsx
import Link from "next/link";
import type { Service } from "@/lib/services";
import { CITIES } from "@/lib/cities";
import { serviceCitySlug } from "@/lib/slugs";
import type { GeneralServicePageContent } from "@/content/types";
import { REVIEWS } from "@/lib/testimonials";
import { MapEmbed } from "./MapEmbed";
import { EstimateForm } from "./EstimateForm";
import { MarkdownBlock } from "./MarkdownBlock";

const HERO_URL =
  "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1800&q=80";

export function GeneralServiceTemplate({
  service,
  content,
}: {
  service: Service;
  content: GeneralServicePageContent;
}) {
  const builtCities = CITIES.filter((c) => c.isBuilt);

  return (
    <>
      <section
        className="hero"
        style={{ backgroundImage: `url('${HERO_URL}')` }}
      >
        <div className="container hero__content">
          <p className="hero__breadcrumb">
            <Link href="/">Home</Link> / {service.name}
          </p>
          <h1>{service.name} in North Georgia</h1>
          <MarkdownBlock className="lead" markdown={content.intro} />
          <div className="hero__actions">
            <Link href="/contact" className="btn btn-orange">
              Get a Free Estimate
            </Link>
            <a href="tel:4704030215" className="btn btn-outline-light">
              📞 Call (470) 403-0215
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 860, margin: "0 auto" }}>
          <h2>{content.costFactors.title}</h2>
          <p>{content.costFactors.intro}</p>
          <ul className="check-list">
            {content.costFactors.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--cream">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Why It Matters</span>
            <h2>{content.whyNeeded.title}</h2>
          </div>
          <div className="grid grid--2">
            {content.whyNeeded.reasons.map((reason) => (
              <div className="card" key={reason.title}>
                <div className="card__body">
                  <h3>{reason.title}</h3>
                  <MarkdownBlock markdown={reason.body} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Why MMP</span>
            <h2>{content.whyChooseUs.title}</h2>
          </div>
          <div className="grid grid--3">
            {content.whyChooseUs.reasons.map((reason) => (
              <div className="card" key={reason.title}>
                <div className="card__body">
                  <h3>{reason.title}</h3>
                  <MarkdownBlock markdown={reason.body} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--green">
        <div className="container" style={{ textAlign: "center", maxWidth: 720, margin: "0 auto" }}>
          <h2>{content.cta.title}</h2>
          <p>{content.cta.body}</p>
          <div className="hero__actions" style={{ justifyContent: "center" }}>
            <Link href="/contact" className="btn btn-orange">
              Get a Free Estimate
            </Link>
            <a href="tel:4704030215" className="btn btn-outline-light">
              📞 Call (470) 403-0215
            </a>
          </div>
        </div>
      </section>

      <section className="section" id="service-areas">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Where We Work</span>
            <h2>{service.name} Across North Metro Atlanta</h2>
            <p>
              We cover {builtCities.length} cities across North Georgia. Pick your city below for
              local details, or see the <Link href="/service-areas">full service area list</Link>.
            </p>
          </div>
          <div className="grid grid--4">
            {builtCities.map((city) => (
              <Link
                key={city.slug}
                href={`/${serviceCitySlug(service, city)}`}
                className="area-chip"
              >
                {city.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--cream">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">FAQs</span>
            <h2>{service.name}: Common Questions</h2>
          </div>
          {content.faqs.map((faq) => (
            <div className="faq-item" key={faq.question}>
              <h4>{faq.question}</h4>
              <MarkdownBlock markdown={faq.answer} />
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Reviews</span>
            <h2>What Our Clients Say</h2>
            <p>4.8 out of 5 — 34 Google Reviews</p>
          </div>
          <div className="grid grid--3">
            {REVIEWS.map((review) => (
              <div className="testi-card" key={review.who}>
                <span className="stars">★★★★★</span>
                <p>&quot;{review.text}&quot;</p>
                <div className="who">{review.who}</div>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", marginTop: 24 }}>
            <Link href="/testimonials">Read more reviews →</Link>
          </p>
        </div>
      </section>

      <section className="section section--green" id="estimate">
        <div className="container split">
          <div>
            <span className="eyebrow">Get Started</span>
            <h2>Request Your Free {service.name} Estimate</h2>
            <MapEmbed />
          </div>
          <EstimateForm />
        </div>
      </section>
    </>
  );
}
