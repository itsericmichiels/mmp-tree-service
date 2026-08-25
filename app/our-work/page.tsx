import { getAllMedia } from "@/lib/media";

export const dynamic = "force-dynamic";

export const metadata = { title: "Our Work | MMP Tree Service LLC" };

export default function OurWorkPage() {
  const gallery = getAllMedia().filter((item) => item.tags.includes("our-work"));

  return (
    <section className="section">
      <div className="container section-head">
        <span className="eyebrow">Our Work</span>
        <h1>{gallery.length === 0 ? "Coming Soon" : "Recent Jobs Around North Metro Atlanta"}</h1>
      </div>
      <div className="container">
        {gallery.length === 0 ? (
          <p>
            We&apos;re building out a full gallery of recent MMP Tree Service
            jobs. In the meantime, call{" "}
            <a href="tel:4704030215">(470) 403-0215</a> to see examples near
            you.
          </p>
        ) : (
          <div className="grid grid--3">
            {gallery.map((item) => (
              <div className="card" key={item.id}>
                <img className="card__img" src={item.url} alt={item.alt} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
