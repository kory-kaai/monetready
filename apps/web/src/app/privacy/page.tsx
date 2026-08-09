import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { getSiteSpec, productEmail } from "@/lib/spec";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Privacy Policy — Monetready", robots: { index: false } };
}

export default async function PrivacyPage() {
  const spec = await getSiteSpec();
  const email = productEmail(spec, "privacy");

  return (
    <PageShell spec={spec}>
      <LegalLayout title="Privacy Policy" eyebrow="Legal" currentPath="/privacy">
        <section className="legal-section">
          <h2>What we collect</h2>
          <p>
            We collect account information (name, email), usage analytics to improve the product,
            and billing details when you subscribe to a paid plan.
          </p>
        </section>
        <section className="legal-section">
          <h2>How we use data</h2>
          <ul>
            <li>Provide and improve {spec.product.name}</li>
            <li>Process payments and send transactional emails</li>
            <li>Run revenue playbooks you configure</li>
          </ul>
        </section>
        <section className="legal-section" id="your-rights">
          <h2>Your rights</h2>
          <p>
            Depending on your location, you may request access, correction, deletion, or export of
            your data. Contact us at <a href={`mailto:${email}`}>{email}</a>.
          </p>
        </section>
      </LegalLayout>
    </PageShell>
  );
}
