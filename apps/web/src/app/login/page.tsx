import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { AuthForm } from "@/components/auth/AuthForm";
import { getSiteSpec } from "@/lib/spec";

export const metadata: Metadata = {
  title: "Log in — Monetready",
  robots: { index: false },
};

export default async function LoginPage() {
  const spec = await getSiteSpec();

  return (
    <PageShell spec={spec}>
      <div className="auth-page">
        <AuthForm mode="login" />
      </div>
    </PageShell>
  );
}
