import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { PricingSection } from "@/components/marketing/PricingSection";
import { Reveal } from "@/components/ui/Reveal";
import { getSiteSpec } from "@/lib/spec";

export async function generateMetadata(): Promise<Metadata> {
  const spec = await getSiteSpec();
  return {
    title: `Pricing — ${spec.product.name}`,
    description: `Plans and pricing for ${spec.product.name}`,
  };
}

export default async function PricingPage() {
  const spec = await getSiteSpec();

  return (
    <PageShell spec={spec}>
      <section className="hero" style={{ paddingBottom: "2rem" }}>
        <Reveal>
          <span className="hero-eyebrow">Pricing</span>
          <h1>Pick your forge</h1>
          <p className="lead">Start free. Scale when your product earns.</p>
        </Reveal>
      </section>
      <PricingSection spec={spec} />
    </PageShell>
  );
}
