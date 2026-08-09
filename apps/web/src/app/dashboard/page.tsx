import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { getSiteSpec } from "@/lib/spec";

export const metadata: Metadata = {
  title: "Dashboard — Monetready",
  robots: { index: false },
};

export default async function DashboardPage() {
  const spec = await getSiteSpec();

  return (
    <PageShell spec={spec}>
      <DashboardClient />
    </PageShell>
  );
}
