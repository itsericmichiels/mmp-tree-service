// app/layout.tsx
import type { Metadata } from "next";
import Script from "next/script";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StickyCta } from "@/components/StickyCta";
import "./globals.css";

export const metadata: Metadata = {
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
    <html lang="en">
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
