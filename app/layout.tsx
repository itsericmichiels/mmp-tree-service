// app/layout.tsx
import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import Script from "next/script";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StickyCta } from "@/components/StickyCta";
import { CookieConsent } from "@/components/CookieConsent";
import { SITE_URL } from "@/lib/site";
import { socialTags } from "@/lib/seo";
import { buildLocalBusinessSchema } from "@/lib/localBusinessSchema";
import { getGoogleReviews } from "@/lib/googleReviews";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const DEFAULT_TITLE = "MMP Tree Service LLC | North Metro Atlanta Tree Care";
const DEFAULT_DESCRIPTION =
  "Licensed & insured tree removal, trimming, stump grinding, and 24/7 emergency tree service across North Metro Atlanta.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  alternates: { canonical: "/" },
  ...socialTags(DEFAULT_TITLE, DEFAULT_DESCRIPTION),
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { rating, reviewCount } = await getGoogleReviews();
  const localBusinessSchema = buildLocalBusinessSchema(rating, reviewCount);

  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body>
        <script
          type="application/ld+json"
          // Escape `<` to prevent HTML-parser-level script tag breakout —
          // see the identical note in app/blog/[slug]/page.tsx.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema).replace(/</g, "\\u003c"),
          }}
        />
        <SiteHeader />
        {children}
        <SiteFooter />
        <StickyCta />
        <CookieConsent />
        <Script
          src="https://link.contentcreatormachine.com/js/form_embed.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
