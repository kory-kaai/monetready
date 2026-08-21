import Link from "next/link";
import type { ReactNode } from "react";

interface AuthPageLayoutProps {
  children: ReactNode;
}

export function AuthPageLayout({ children }: AuthPageLayoutProps) {
  return (
    <div className="auth-page">
      <div className="auth-branding hide-mobile">
        <h2>Forge products that are ready to earn.</h2>
        <p>
          Audit your GTM stack, automate revenue playbooks, and launch with pricing and legal pages from day one —
          hosted on monetready.com or self-hosted with the open-source CLI.
        </p>
        <ul className="auth-branding-list">
          <li>Monetready Score across 6 categories</li>
          <li>6 revenue automation playbooks</li>
          <li>Hosted: Firebase + Stripe + SES · CLI: PostHog + Resend</li>
        </ul>
        <p className="auth-branding-alt">
          Prefer local control? <Link href="/cli">Use the self-hosted CLI</Link> instead.
        </p>
      </div>
      {children}
    </div>
  );
}
