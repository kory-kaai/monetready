import Link from "next/link";
import type { MonetreadySpec } from "@monetready/core";
import { BrandLogo } from "@/components/brand/BrandLogo";
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
            <Link href="/" className="logo footer-logo">
              <BrandLogo size={80} />
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
