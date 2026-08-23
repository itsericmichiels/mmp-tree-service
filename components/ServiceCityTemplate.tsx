// components/ServiceCityTemplate.tsx
import Link from "next/link";
import type { City } from "@/lib/cities";
import type { Service } from "@/lib/services";
import { citySlug } from "@/lib/slugs";
import type { ServicePageContent } from "@/content/types";
import { MapEmbed } from "./MapEmbed";
import { EstimateForm } from "./EstimateForm";

export function ServiceCityTemplate({
  city,
  service,
  content,
}: {
  city: City;
  service: Service;
  content: ServicePageContent;
}) {
  return (
    <>
      <section
        className="hero"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1800&q=80')",
        }}
      >
        <div className="container hero__content">
          <p className="hero__breadcrumb">
            <Link href="/">Home</Link> /{" "}
            <Link href={`/${citySlug(city)}`}>{city.name}</Link> / {service.name}
          </p>
          <h1>{service.name} in {city.name}</h1>
          <p className="lead">{content.intro}</p>
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
        <div className="container split">
          <div>
            <h2>{content.howItWorks.title}</h2>
            <p>{content.howItWorks.body}</p>
            <h2>{content.cost.title}</h2>
            <p>{content.cost.body}</p>
            <h2>{content.localConsiderations.title}</h2>
            <p>{content.localConsiderations.body}</p>
          </div>
          <MapEmbed />
        </div>
      </section>

      <section className="section section--cream">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">FAQs</span>
            <h2>{service.name} in {city.name}: Common Questions</h2>
          </div>
          {content.faqs.map((faq) => (
            <div className="faq-item" key={faq.question}>
              <h4>{faq.question}</h4>
              <p>{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section section--green" id="estimate">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Get Started</span>
            <h2>Request Your Free Estimate</h2>
          </div>
          <EstimateForm />
        </div>
      </section>
    </>
  );
}
