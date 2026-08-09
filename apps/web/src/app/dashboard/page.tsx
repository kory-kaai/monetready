import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { PageLoader } from "@/components/ui/PageLoader";
import { getSiteSpec } from "@/lib/spec";

export const metadata: Metadata = {
  title: "Dashboard — Monetready",
  robots: { index: false },
};

export default async function DashboardPage() {
  const spec = await getSiteSpec();

  return (
    <Suspense
      fallback={
        <PageLoader message="Forging your dashboard" submessage="Setting up your workspace" />
      }
    >
      <DashboardClient productName={spec.product.name} />
    </Suspense>
  );
}
