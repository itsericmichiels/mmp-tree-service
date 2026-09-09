// components/EstimateMapSection.tsx
// The green "call or fill out the form" band paired with the location map,
// same visual pattern as the /contact page's hero. Used at the bottom of
// pages (like blog posts) that already have their own <h1>, so this heading
// is an <h2>.
import { MapEmbed } from "@/components/MapEmbed";
import { EstimateForm } from "@/components/EstimateForm";

export function EstimateMapSection() {
  return (
    <section className="section section--green" id="estimate">
      <div className="container split">
        <div>
          <span className="eyebrow">Get In Touch</span>
          <h2>Request Your Free Estimate</h2>
          <p>
            Call <a href="tel:4704030215">(470) 403-0215</a> or fill out the
            form — we&apos;re available 24/7 for emergencies.
          </p>
          <MapEmbed />
        </div>
        <EstimateForm />
      </div>
    </section>
  );
}
