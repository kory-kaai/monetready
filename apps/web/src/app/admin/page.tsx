import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminClient } from "@/components/admin/AdminClient";
import { getSiteSpec } from "@/lib/spec";

export const metadata: Metadata = {
  title: "Admin — Monetready",
  robots: { index: false },
};

export default async function AdminPage() {
  const spec = await getSiteSpec();

  return (
    <Suspense fallback={<p className="dashboard-status">Loading admin panel…</p>}>
      <AdminClient productName={spec.product.name} />
    </Suspense>
  );
}
