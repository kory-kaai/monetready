import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { AuthForm } from "@/components/auth/AuthForm";
import { getSiteSpec } from "@/lib/spec";

export const metadata: Metadata = {
  title: "Sign up — Monetready",
  robots: { index: false },
};

export default async function SignupPage() {
  const spec = await getSiteSpec();

  return (
    <PageShell spec={spec}>
      <div className="auth-page">
        <AuthForm mode="signup" />
      </div>
    </PageShell>
  );
}
