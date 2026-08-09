"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { MonetreadySpec } from "@monetready/core";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { IconClose, IconMenu } from "@/components/ui/Icons";

interface SiteNavProps {
  spec: MonetreadySpec;
}

export function SiteNav({ spec }: SiteNavProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const github = spec.integrations.github;

  const navLinks = (
    <>
      <Link href="/" className={pathname === "/" ? "active" : ""}>
        Home
      </Link>
      <Link href="/pricing" className={pathname === "/pricing" ? "active" : ""}>
        Pricing
      </Link>
      {github ? (
        <a href={`https://github.com/${github}`} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
      ) : null}
      <Link href="/login">Log in</Link>
      <Link href="/signup" className="btn btn-primary btn-sm nav-cta">
        Get started
      </Link>
    </>
  );

  return (
    <>
      <nav className={`site-nav${scrolled ? " scrolled" : ""}`} aria-label="Main">
        <div className="container site-nav-inner">
          <Link href="/" className="logo">
            <BrandLogo size={68} priority />
            {spec.product.name}
          </Link>

          <div className="nav-links hide-mobile">{navLinks}</div>

          <button
            type="button"
            className="nav-menu-btn show-mobile"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </nav>

      {menuOpen ? (
        <div className="mobile-nav-overlay show-mobile" onClick={() => setMenuOpen(false)} aria-hidden />
      ) : null}

      <div
        id="mobile-nav"
        className={`mobile-nav show-mobile${menuOpen ? " open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <div className="mobile-nav-links">{navLinks}</div>
      </div>
    </>
  );
}
