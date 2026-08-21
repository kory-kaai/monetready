import Link from "next/link";
import type { MonetreadySpec } from "@monetready/core";
import { Reveal } from "@/components/ui/Reveal";
import { CliCommandsBlock } from "@/components/marketing/CliCommandsBlock";
import { GITHUB_URL, README_QUICK_START_URL } from "@/lib/oss";

interface SelfHostedSectionProps {
  spec: MonetreadySpec;
}

export function SelfHostedSection({ spec }: SelfHostedSectionProps) {
  const github = spec.integrations.github;

  return (
    <section className="section" id="self-hosted">
      <div className="section-header">
        <Reveal>
          <h2>Prefer self-hosted?</h2>
          <p>
            Same Monetready Score, playbooks, and <code>monetready.yaml</code> spec — powered by{" "}
            <code>@monetready/core</code>. Run everything on your machine with the open-source CLI.
          </p>
        </Reveal>
      </div>
      <Reveal delay={0.08}>
        <div className="container">
          <CliCommandsBlock />
          <p className="cli-footnote">
            Local dashboard runs at <code>http://127.0.0.1:3721</code> — separate from the hosted dashboard
            at <Link href="/dashboard">monetready.com/dashboard</Link>. CLI playbooks support PostHog and
            Resend; this site uses Firebase and Amazon SES.
          </p>
          <div className="hero-actions" style={{ marginTop: "1.5rem", marginBottom: 0 }}>
            {github ? (
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                Open source on GitHub
              </a>
            ) : null}
            <a href={README_QUICK_START_URL} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              CLI quick start in README
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
