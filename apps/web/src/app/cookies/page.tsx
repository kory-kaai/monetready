import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { getSiteSpec } from "@/lib/spec";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Cookie Policy — Monetready", robots: { index: false } };
}

export default async function CookiesPage() {
  const spec = await getSiteSpec();

  return (
    <PageShell spec={spec}>
      <LegalLayout title="Cookie Policy" eyebrow="Legal" currentPath="/cookies">
        <section className="legal-section">
          <h2>What are cookies</h2>
          <p>
            Cookies are small files stored on your device. We use essential cookies for
            authentication and analytics cookies to understand product usage.
          </p>
        </section>
        <section className="legal-section">
          <h2>Analytics</h2>
          <p>
            We use {spec.integrations.analytics !== "none" ? spec.integrations.analytics : "analytics providers"} to
            help improve the product when enabled in your project.
          </p>
        </section>
      </LegalLayout>
    </PageShell>
  );
}
