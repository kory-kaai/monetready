import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { getSiteSpec } from "@/lib/spec";

export const metadata: Metadata = {
  title: "Dashboard — Monetready",
  robots: { index: false },
};

export default async function DashboardPage() {
  const spec = await getSiteSpec();

  return (
    <Suspense fallback={<p className="dashboard-status">Loading dashboard…</p>}>
      <DashboardClient productName={spec.product.name} />
    </Suspense>
  );
}
