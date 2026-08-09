import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { getSiteSpec, productEmail } from "@/lib/spec";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Terms of Service — Monetready", robots: { index: false } };
}

export default async function TermsPage() {
  const spec = await getSiteSpec();
  const email = productEmail(spec, "legal");

  return (
    <PageShell spec={spec}>
      <LegalLayout title="Terms of Service" eyebrow="Legal" currentPath="/terms">
        <section className="legal-section">
          <h2>Agreement</h2>
          <p>
            By using {spec.product.name}, you agree to these terms. If you do not agree, do not use
            the service.
          </p>
        </section>
        <section className="legal-section" id="acceptable-use">
          <h2>Acceptable use</h2>
          <p>
            You may not use the service for illegal activity, spam, or to harm other users. We may
            suspend accounts that violate these terms.
          </p>
        </section>
        <section className="legal-section">
          <h2>Refunds</h2>
          <p>
            Paid plans are billed in advance. Refunds are handled case-by-case within 14 days.
            Contact <a href={`mailto:${email}`}>{email}</a>.
          </p>
        </section>
      </LegalLayout>
    </PageShell>
  );
}
