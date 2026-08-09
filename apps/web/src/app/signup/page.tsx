import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { PageShell } from "@/components/layout/PageShell";
import { getSiteSpec } from "@/lib/spec";

export const metadata: Metadata = {
  title: "Sign up — Monetready",
  robots: { index: false },
};

export default async function SignupPage() {
  const spec = await getSiteSpec();

  return (
    <PageShell spec={spec}>
      <AuthPageLayout>
        <AuthForm mode="signup" />
      </AuthPageLayout>
    </PageShell>
  );
}
