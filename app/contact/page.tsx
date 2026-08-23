import { MapEmbed } from "@/components/MapEmbed";
import { EstimateForm } from "@/components/EstimateForm";

export const metadata = {
  title: "Contact MMP Tree Service LLC | Free Estimate",
  description: "Call (470) 403-0215 or request a free estimate online — available 24/7 for emergencies.",
};

export default function ContactPage() {
  return (
    <section className="section section--green" id="estimate">
      <div className="container split">
        <div>
          <span className="eyebrow">Get In Touch</span>
          <h1>Request Your Free Estimate</h1>
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
