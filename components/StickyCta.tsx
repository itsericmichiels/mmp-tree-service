// components/StickyCta.tsx
import Link from "next/link";

export function StickyCta() {
  return (
    <div className="sticky-cta">
      <a href="tel:4704030215" className="sticky-cta__call">
        📞 Call (470) 403-0215
      </a>
      <Link href="/contact" className="sticky-cta__estimate">
        Get a Free Estimate
      </Link>
    </div>
  );
}
