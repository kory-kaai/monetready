import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { CliCommandsBlock } from "@/components/marketing/CliCommandsBlock";
import { Reveal } from "@/components/ui/Reveal";
import { getSiteSpec } from "@/lib/spec";
import { GITHUB_URL, README_QUICK_START_URL } from "@/lib/oss";

export async function generateMetadata(): Promise<Metadata> {
  const spec = await getSiteSpec();
  return {
    title: `CLI — ${spec.product.name}`,
    description: "Self-hosted Monetready CLI commands — same spec, score, and playbooks as monetready.com.",
  };
}

export default async function CliPage() {
  const spec = await getSiteSpec();

  return (
    <PageShell spec={spec}>
      <section className="hero" style={{ paddingBottom: "2rem" }}>
        <Reveal>
          <h1>Self-hosted CLI</h1>
          <p className="lead">
            Monetready is one product with two fronts. Use the open-source CLI when you want local control —
            same <code>monetready.yaml</code>, Monetready Score, and six playbooks as the hosted app.
          </p>
        </Reveal>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <Reveal>
            <h2 style={{ marginBottom: "1rem" }}>Quick commands</h2>
            <CliCommandsBlock />
          </Reveal>

          <Reveal delay={0.08}>
            <div className="legal-section" style={{ marginTop: "2.5rem" }}>
              <h2>Hosted vs self-hosted</h2>
              <ul>
                <li>
                  <strong>Hosted</strong> (<Link href="/signup">sign up</Link>,{" "}
                  <Link href="/dashboard">dashboard</Link>, Stripe billing, GitHub YAML sync) — Firebase Auth
                  + Amazon SES.
                </li>
                <li>
                  <strong>Self-hosted</strong> (this CLI) — local files,{" "}
                  <code>monetready dashboard</code> on <code>127.0.0.1:3721</code>, optional PostHog +
                  Resend adapters for live playbooks.
                </li>
              </ul>
              <p>
                Full docs live in the{" "}
                <a href={README_QUICK_START_URL} target="_blank" rel="noopener noreferrer">
                  GitHub README
                </a>
                . Prefer the hosted path?{" "}
                <Link href="/signup">Create a free account</Link>.
              </p>
              <div className="hero-actions" style={{ marginTop: "1.5rem", marginBottom: 0 }}>
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                  View on GitHub
                </a>
                <Link href="/signup" className="btn btn-primary">
                  Use hosted instead
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
}
