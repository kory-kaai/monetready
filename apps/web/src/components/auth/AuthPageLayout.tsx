import type { ReactNode } from "react";

interface AuthPageLayoutProps {
  children: ReactNode;
}

export function AuthPageLayout({ children }: AuthPageLayoutProps) {
  return (
    <div className="auth-page">
      <div className="auth-branding hide-mobile">
        <p className="auth-branding-kicker">Monetready</p>
        <h2>Forge products that are ready to earn.</h2>
        <p>
          Audit your GTM stack, automate revenue playbooks, and launch with pricing and legal pages from
          day one.
        </p>
        <ul className="auth-branding-list">
          <li>Monetready Score across 6 categories</li>
          <li>6 revenue automation playbooks</li>
          <li>Firebase + Stripe + SES integrations</li>
        </ul>
      </div>
      {children}
    </div>
  );
}
