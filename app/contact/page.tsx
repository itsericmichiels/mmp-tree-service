import { MapEmbed } from "@/components/MapEmbed";
import { EstimateForm } from "@/components/EstimateForm";

import { socialTags } from "@/lib/seo";

const TITLE = "Contact MMP Tree Service LLC | Free Estimate";
const DESCRIPTION =
  "Call (470) 403-0215 or request a free estimate online — available 24/7 for emergencies.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/contact" },
  ...socialTags(TITLE, DESCRIPTION),
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
