import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { getSiteSpec, productEmail } from "@/lib/spec";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Security — Monetready", robots: { index: false } };
}

export default async function SecurityPage() {
  const spec = await getSiteSpec();
  const email = productEmail(spec, "security");

  return (
    <PageShell spec={spec}>
      <LegalLayout title="Security" eyebrow="Trust" currentPath="/security">
        <section className="legal-section">
          <h2>Our commitment</h2>
          <p>
            We protect your data with encryption in transit, Firebase App Check, and least-privilege
            access to production systems.
          </p>
        </section>
        <section className="legal-section">
          <h2>Report a vulnerability</h2>
          <p>
            Found a security issue? Please report it responsibly to{" "}
            <a href={`mailto:${email}`}>{email}</a>. We aim to respond within 48 hours.
          </p>
        </section>
      </LegalLayout>
    </PageShell>
  );
}
