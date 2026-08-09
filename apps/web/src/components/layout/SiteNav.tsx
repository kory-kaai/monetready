"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { MonetreadySpec } from "@monetready/core";

function LogoMark() {
  return (
    <span className="logo-mark" aria-hidden>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2C8.5 8 4 10 4 14a8 8 0 0 0 16 0c0-4-4.5-6-8-12Z"
          fill="white"
          opacity="0.95"
        />
      </svg>
    </span>
  );
}

interface SiteNavProps {
  spec: MonetreadySpec;
}

export function SiteNav({ spec }: SiteNavProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const github = spec.integrations.github;

  return (
    <nav className={`site-nav${scrolled ? " scrolled" : ""}`}>
      <Link href="/" className="logo">
        <LogoMark />
        {spec.product.name}
      </Link>
      <div className="nav-links">
        <Link href="/" className={pathname === "/" ? "active hide-mobile" : "hide-mobile"}>
          Home
        </Link>
        <Link href="/pricing" className={pathname === "/pricing" ? "active" : ""}>
          Pricing
        </Link>
        {github ? (
          <a
            href={`https://github.com/${github}`}
            className="hide-mobile"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        ) : null}
        <Link href="/login" className="hide-mobile">
          Log in
        </Link>
        <Link href="/signup" className="btn btn-primary btn-sm nav-cta">
          Get started
        </Link>
      </div>
    </nav>
  );
}
