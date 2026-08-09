import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { getSiteSpec } from "@/lib/spec";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "About — Monetready", robots: { index: false } };
}

export default async function AboutPage() {
  const spec = await getSiteSpec();

  return (
    <PageShell spec={spec}>
      <LegalLayout title="About Monetready" eyebrow="Company" currentPath="/about">
        <section className="legal-section">
          <h2>Our mission</h2>
          <p>{spec.product.solution}</p>
        </section>
        <section className="legal-section">
          <h2>Who we serve</h2>
          <p>{spec.gtm.target_audience}</p>
        </section>
        <section className="legal-section">
          <h2>Why we built this</h2>
          <p>{spec.gtm.unfair_advantage}</p>
        </section>
      </LegalLayout>
    </PageShell>
  );
}
