export const metadata = {
  title: "About MMP Tree Service LLC | North Metro Atlanta",
  description:
    "Family-owned, ISA-certified, licensed and insured — MMP Tree Service has served North Metro Atlanta for over a decade.",
};

export default function AboutPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">About Us</span>
          <h1>12+ Years of Careful, Local Tree Care</h1>
          <p>
            As a local, family-owned company, we take pride in personalized
            service and long-lasting relationships with our clients — not a
            national call-center franchise. Every job is priced fairly,
            explained clearly, and cleaned up completely before we leave.
          </p>
        </div>
        <ul className="check-list">
          <li>ISA Certified Arborists on every crew</li>
          <li>Licensed, insured, and BBB A+ accredited</li>
          <li>State-of-the-art equipment for jobs of any size</li>
          <li>24/7 emergency response, insurance-claim support</li>
          <li>Full clean-up — we leave your property better than we found it</li>
        </ul>
      </div>
    </section>
  );
}
