"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const CONSENT_KEY = "mmp-cookie-consent";
const GA_MEASUREMENT_ID = "G-7VZNE9K9DY";

type Consent = "accepted" | "declined";

export function CookieConsent() {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [checkedStorage, setCheckedStorage] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored === "accepted" || stored === "declined") setConsent(stored);
    setCheckedStorage(true);
  }, []);

  function choose(value: Consent) {
    localStorage.setItem(CONSENT_KEY, value);
    setConsent(value);
  }

  return (
    <>
      {consent === "accepted" && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
            `}
          </Script>
        </>
      )}

      {checkedStorage && consent === null && (
        <div className="cookie-consent" role="dialog" aria-label="Cookie consent">
          <p className="cookie-consent__text">
            We use cookies to analyze site traffic and improve your experience. See our{" "}
            <a href="/terms#privacy-policy">Privacy Policy</a>.
          </p>
          <div className="cookie-consent__actions">
            <button
              type="button"
              className="btn btn-outline-light btn-sm"
              onClick={() => choose("declined")}
            >
              Decline
            </button>
            <button
              type="button"
              className="btn btn-orange btn-sm"
              onClick={() => choose("accepted")}
            >
              Accept
            </button>
          </div>
        </div>
      )}
    </>
  );
}
