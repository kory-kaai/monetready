import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { HomePageContent } from "@/components/marketing/HomePageContent";
import { PricingSection } from "@/components/marketing/PricingSection";
import { getSiteSpec } from "@/lib/spec";

export async function generateMetadata(): Promise<Metadata> {
  const spec = await getSiteSpec();
  return {
    title: `${spec.product.name} — ${spec.product.tagline}`,
    description: spec.product.solution,
  };
}

export default async function HomePage() {
  const spec = await getSiteSpec();

  return (
    <PageShell spec={spec}>
      <HomePageContent spec={spec} />
      <PricingSection spec={spec} />
    </PageShell>
  );
}
