import Link from "next/link";
import type { ReactNode } from "react";

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/cookies", label: "Cookie Policy" },
  { href: "/security", label: "Security" },
  { href: "/about", label: "About" },
];

interface LegalLayoutProps {
  title: string;
  eyebrow: string;
  currentPath: string;
  children: ReactNode;
}

export function LegalLayout({ title, eyebrow, currentPath, children }: LegalLayoutProps) {
  return (
    <div className="container legal-layout">
      <aside className="legal-sidebar">
        <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginBottom: "1rem" }}>{eyebrow}</p>
        <nav>
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={currentPath === link.href ? "active" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <article className="legal-content">
        <h1>{title}</h1>
        <p className="meta">Last updated: March 2026</p>
        {children}
      </article>
    </div>
  );
}
