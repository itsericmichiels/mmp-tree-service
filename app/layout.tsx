// app/layout.tsx
import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import Script from "next/script";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StickyCta } from "@/components/StickyCta";
import { SITE_URL } from "@/lib/site";
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "MMP Tree Service LLC | North Metro Atlanta Tree Care",
  description:
    "Licensed & insured tree removal, trimming, stump grinding, and 24/7 emergency tree service across North Metro Atlanta.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
        <StickyCta />
        <Script
          src="https://link.contentcreatormachine.com/js/form_embed.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
