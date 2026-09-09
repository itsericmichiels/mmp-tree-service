// components/GeneralServiceTemplate.tsx
import Link from "next/link";
import type { Service } from "@/lib/services";
import { CITIES } from "@/lib/cities";
import { serviceCitySlug } from "@/lib/slugs";
import type { GeneralServicePageContent } from "@/content/types";
import { GOOGLE_REVIEWS_URL, type GoogleReviewsData } from "@/lib/googleReviews";
import { MapEmbed } from "./MapEmbed";
import { EstimateForm } from "./EstimateForm";
import { MarkdownBlock } from "./MarkdownBlock";

const HERO_URL =
  "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1800&q=80";

function CtaBand({ title, service }: { title: string; service: Service }) {
  return (
    <section className="section section--green">
      <div className="container" style={{ textAlign: "center" }}>
        <h2>{title}</h2>
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
  );
}

export function GeneralServiceTemplate({
  service,
  content,
  reviews,
}: {
  service: Service;
  content: GeneralServicePageContent;
  reviews: GoogleReviewsData;
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
          <p className="lead">{content.heroTagline}</p>
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

      <section className="section section--tight">
        <div className="container" style={{ maxWidth: 860, margin: "0 auto" }}>
          <MarkdownBlock markdown={content.intro} />
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div>
            <h2>{content.costFactors.title}</h2>
            <p>{content.costFactors.intro}</p>
            <ul className="check-list">
              {content.costFactors.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h2 style={{ marginTop: 40 }}>{content.whyNeeded.title}</h2>
            {content.whyNeeded.reasons.map((reason, i) => (
              <div key={reason.title} style={{ marginBottom: 20 }}>
                <h3>
                  {i + 1}. {reason.title}
                </h3>
                <MarkdownBlock markdown={reason.body} />
              </div>
            ))}

            <h2 style={{ marginTop: 40 }}>{content.whyChooseUs.title}</h2>
            {content.whyChooseUs.reasons.map((reason, i) => (
              <div key={reason.title} style={{ marginBottom: 20 }}>
                <h3>
                  {i + 1}. {reason.title}
                </h3>
                <MarkdownBlock markdown={reason.body} />
              </div>
            ))}
          </div>

          <div className="sticky-sidebar">
            <EstimateForm />
            <div className="estimate-panel" style={{ marginTop: 24 }}>
              <ul className="check-list">
                <li>Licensed &amp; Insured</li>
                <li>ISA Certified Arborists</li>
                <li>Family-Owned, Not a Franchise</li>
                <li>24/7 Emergency Response</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <CtaBand title={content.cta.title} service={service} />

      <section className="section section--cream" id="service-areas">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Where We Work</span>
            <h2>{service.name} Across North Metro Atlanta</h2>
            <p>
              We cover {builtCities.length} cities across North Georgia. Pick your city below for
              local details, or see the <Link href="/service-areas">full service area list</Link>.
            </p>
          </div>
          <p className="area-list">
            {builtCities.map((city, i) => (
              <span key={city.slug}>
                <Link href={`/${serviceCitySlug(service, city)}`}>{city.name}</Link>
                {i < builtCities.length - 1 ? " · " : ""}
              </span>
            ))}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">FAQs</span>
            <h2>{service.name}: Common Questions</h2>
          </div>
          {content.faqs.map((faq) => (
            <div className="faq-item" key={faq.question}>
              <h3>{faq.question}</h3>
              <MarkdownBlock markdown={faq.answer} />
            </div>
          ))}
        </div>
      </section>

      <CtaBand title="Ready to Book a Service?" service={service} />

      <section className="section section--cream">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Reviews</span>
            <h2>What Our Clients Say</h2>
            <p>{reviews.rating} out of 5 — {reviews.reviewCount} Google Reviews</p>
          </div>
          <div className="grid grid--3">
            {reviews.reviews.map((review) => (
              <div className="testi-card" key={review.who}>
                <span className="stars">{"★".repeat(review.rating)}</span>
                <p>&quot;{review.text}&quot;</p>
                <div className="who">{review.who}</div>
                <a
                  className="testi-card__link"
                  href={review.googleMapsUri ?? GOOGLE_REVIEWS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read full review on Google →
                </a>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", marginTop: 24 }}>
            <Link href="/testimonials">Read more reviews →</Link>
          </p>
        </div>
      </section>

      <section className="section" id="estimate">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Get Started</span>
            <h2>Request Your Free {service.name} Estimate</h2>
            <p>
              Scroll up to the form on this page, or{" "}
              <a href="tel:4704030215">call (470) 403-0215</a> — we'll walk your property and give
              you a firm number before any cutting starts.
            </p>
          </div>
          <MapEmbed />
        </div>
      </section>
    </>
  );
}
