import Link from "next/link";
import type { MonetreadySpec } from "@monetready/core";
import { productEmail } from "@/lib/spec";

interface SiteFooterProps {
  spec: MonetreadySpec;
}

export function SiteFooter({ spec }: SiteFooterProps) {
  const hello = productEmail(spec, "hello");

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link href="/" className="logo" style={{ marginBottom: "1rem" }}>
              <span className="logo-mark" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2C8.5 8 4 10 4 14a8 8 0 0 0 16 0c0-4-4.5-6-8-12Z"
                    fill="white"
                  />
                </svg>
              </span>
              {spec.product.name}
            </Link>
            <p style={{ color: "var(--muted)", maxWidth: 280, fontSize: "0.95rem" }}>
              {spec.product.tagline}
            </p>
          </div>
          <div>
            <h4>Product</h4>
            <Link href="/pricing">Pricing</Link>
            <Link href="/signup">Get started</Link>
            {spec.integrations.github ? (
              <a
                href={`https://github.com/${spec.integrations.github}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            ) : null}
          </div>
          <div>
            <h4>Legal</h4>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/cookies">Cookies</Link>
            <Link href="/security">Security</Link>
          </div>
          <div>
            <h4>Support</h4>
            <a href={`mailto:${hello}`}>Contact</a>
            <Link href="/about">About</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {spec.product.name}</span>
          <span>All systems operational</span>
        </div>
      </div>
    </footer>
  );
}
