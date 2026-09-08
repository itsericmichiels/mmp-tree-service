import { SITE_URL } from "@/lib/site";
import { socialTags } from "@/lib/seo";

const TITLE = "Terms & Privacy Policy | MMP Tree Service LLC";
const DESCRIPTION = "Terms and conditions and privacy policy for MMP Tree Service LLC.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/terms" },
  ...socialTags(TITLE, DESCRIPTION),
};

export default function TermsPage() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 800, margin: "0 auto" }}>
        <div className="section-head">
          <span className="eyebrow">Legal</span>
          <h1>Terms &amp; Privacy Policy</h1>
        </div>

        <h2>Terms and Conditions</h2>
        <p>
          These Terms govern your access to and use of all content, products, and services
          available at {SITE_URL} (the &quot;Service&quot;) operated by MMP Tree Service LLC
          (&quot;MMP Tree Service&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
        </p>
        <p>
          Your access to our Service is conditioned on your acceptance, without modification, of
          all terms and conditions contained herein and all other operating rules and policies
          published or that may be published from time to time by us on the Site (collectively,
          the &quot;Agreement&quot;).
        </p>
        <p>
          Please read this Agreement carefully before accessing or using our Service. By
          accessing or using any part of the Service, you agree to be bound by these Terms. If
          you do not agree to any part of the Agreement, you may not access or use our Service.
        </p>

        <h3>Intellectual Property</h3>
        <p>
          The Agreement does not transfer from MMP Tree Service LLC to you any of our or any
          third party&apos;s intellectual property. All right, title, and interest in and to the
          Service, including but not limited to text, graphics, logos, images, and other
          materials, will remain (as between the parties) solely with MMP Tree Service LLC and
          its licensors.
        </p>
        <p>
          Our business names, logos, domain names, and other branding elements are trademarks or
          registered trademarks of MMP Tree Service LLC. Your use of the Service does not grant
          you any right or license to reproduce or otherwise use any MMP Tree Service LLC or
          third-party trademarks.
        </p>

        <h3>Third-Party Services</h3>
        <p>
          In using the Service, you may access or use third-party services, products, software,
          embeds, or applications developed or provided by third parties (&quot;Third-Party
          Services&quot;), including Google Analytics, Google Reviews, and our online estimate
          request form.
        </p>
        <p>
          Any use of Third-Party Services is at your own risk, and we are not responsible or
          liable for third-party websites or services, their content, privacy policies, or
          practices. You are encouraged to review the terms and privacy policies of any
          Third-Party Services you use.
        </p>

        <h3>Accounts</h3>
        <p>
          At present, typical use of our Site does not require creating a user account. If any
          part of the Service in the future requires registration, you agree to provide accurate
          information and are responsible for maintaining the confidentiality of your
          credentials.
        </p>

        <h3>Links to Other Websites</h3>
        <p>
          Our Service may contain links to third-party websites or services that are not owned
          or controlled by MMP Tree Service LLC. We have no control over, and assume no
          responsibility for, the content, privacy policies, or practices of any third-party
          websites or services.
        </p>

        <h3>Termination</h3>
        <p>
          We may terminate or suspend your access to all or any part of our Service at any time,
          with or without cause, with or without notice, effective immediately.
        </p>

        <h3>Disclaimer</h3>
        <p>
          Our Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. MMP
          Tree Service LLC disclaims all warranties of any kind, express or implied, including
          warranties of merchantability, fitness for a particular purpose, and non-infringement.
        </p>

        <h3>Limitation of Liability</h3>
        <p>
          To the maximum extent permitted by applicable law, MMP Tree Service LLC shall not be
          liable for any indirect, incidental, special, consequential, or punitive damages
          arising out of your access to or use of the Service. Our aggregate liability for any
          claim relating to the Service is limited to the amount you paid (if any) for using the
          Service during the six months immediately preceding the claim, or $100, whichever is
          greater.
        </p>

        <h3>Jurisdiction and Applicable Law</h3>
        <p>
          This Agreement is governed by the laws of the State of Georgia. The proper venue for
          any disputes arising out of the Agreement will be the state and federal courts located
          in Cobb County, Georgia.
        </p>

        <h3>Changes</h3>
        <p>
          MMP Tree Service LLC reserves the right to modify or replace these Terms at any time.
          Your continued use of the Service after any changes take effect constitutes acceptance
          of those revised Terms.
        </p>

        <h2 id="privacy-policy" style={{ marginTop: 48 }}>
          Privacy Policy
        </h2>
        <p>
          This Privacy Policy explains how MMP Tree Service LLC collects, uses, and protects
          information when you visit {SITE_URL} or use our Service.
        </p>

        <h3>Information We Collect</h3>
        <p>
          <strong>Information you provide:</strong> when you submit our estimate request or
          contact form, we collect the information you enter — such as your name, phone number,
          email address, property address, and details about the job.
        </p>
        <p>
          <strong>Information collected automatically:</strong> like most websites, we
          automatically collect certain information about your visit through cookies and similar
          technologies, including your IP address, browser type, device type, pages viewed, and
          how you arrived at our Site.
        </p>

        <h3>Cookies and Analytics</h3>
        <p>
          We use Google Analytics to understand how visitors use our Site so we can improve it.
          Google Analytics uses cookies to collect this information. You can choose whether to
          allow these cookies using the cookie banner shown when you first visit our Site — if
          you decline, Google Analytics will not load on your device.
        </p>

        <h3>How We Use Your Information</h3>
        <ul>
          <li>To respond to your estimate requests and inquiries</li>
          <li>To schedule and provide tree service work you request</li>
          <li>To improve our Site and understand how it is used</li>
          <li>To comply with legal obligations</li>
        </ul>

        <h3>Third-Party Services We Use</h3>
        <p>
          We share information with the following categories of third-party services strictly to
          operate our Site and business:
        </p>
        <ul>
          <li>
            <strong>Google Analytics</strong> — website traffic analytics (only after cookie
            consent)
          </li>
          <li>
            <strong>Google Places API</strong> — to display our genuine Google reviews on this
            Site
          </li>
          <li>
            <strong>Our estimate request form provider</strong> — to receive and route the
            estimate requests you submit to our team
          </li>
        </ul>
        <p>We do not sell your personal information to third parties.</p>

        <h3>Data Security</h3>
        <p>
          We take reasonable measures to protect the information you provide from loss, misuse,
          and unauthorized access. However, no method of transmission over the internet is
          completely secure.
        </p>

        <h3>Your Rights and Choices</h3>
        <p>
          You may decline non-essential cookies at any time using our cookie banner. To request
          that we delete information you have submitted to us, contact us using the details
          below.
        </p>

        <h3>Children&apos;s Privacy</h3>
        <p>
          Our Service is not directed to children under 13, and we do not knowingly collect
          personal information from children.
        </p>

        <h3>Changes to This Policy</h3>
        <p>
          We may update this Privacy Policy from time to time. Continued use of our Service after
          changes take effect constitutes acceptance of the revised policy.
        </p>

        <h3>Contact Us</h3>
        <p>
          MMP Tree Service LLC
          <br />
          3330 Cobb Pkwy NW, Ste 324
          <br />
          Acworth, GA 30101
          <br />
          Phone: <a href="tel:4704030215">(470) 403-0215</a>
          <br />
          Email: <a href="mailto:mmptreeservicellc@gmail.com">mmptreeservicellc@gmail.com</a>
        </p>
      </div>
    </section>
  );
}
