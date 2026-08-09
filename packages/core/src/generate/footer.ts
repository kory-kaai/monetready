import type { MonetreadySpec } from "../schema/monetready-spec.js";
import { escapeHtml, slugify } from "./html.js";

export function fireIconSvg(size = 18): string {
  return `<svg class="logo-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 22C16.4183 22 20 18.4183 20 14C20 9.5 17 5 17 5C17 5 15.5 9.5 14 11.5C14 11.5 14.5 8 12 5.5C9.5 8 10 11.5 10 11.5C8.5 9.5 7 5 7 5C7 5 4 9.5 4 14C4 18.4183 7.58172 22 12 22Z" fill="#ffffff"/>
    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.5 13.5 8 12 6C10.5 8 9 10.5 9 12C9 13.6569 10.3431 15 12 15Z" fill="#ffffff" fill-opacity="0.9"/>
  </svg>`;
}

export function renderLogoMark(): string {
  return `<span class="logo-mark">${fireIconSvg()}</span>`;
}

export function renderFooter(spec: MonetreadySpec): string {
  const name = escapeHtml(spec.product.name);
  const tagline = escapeHtml(spec.product.tagline ?? spec.product.problem);
  const year = new Date().getFullYear();
  const email = `hello@${slugify(spec.product.name)}.com`;
  const githubLink = spec.integrations.github
    ? `<a href="https://github.com/${escapeHtml(spec.integrations.github)}" class="footer-social-link" target="_blank" rel="noopener" aria-label="GitHub">GitHub</a>`
    : "";
  const hasTwitter = spec.gtm.channels.includes("twitter");
  const twitterLink = hasTwitter
    ? `<a href="https://twitter.com/${slugify(spec.product.name)}" class="footer-social-link" target="_blank" rel="noopener" aria-label="Twitter">Twitter</a>`
    : "";

  return `
    <footer class="site-footer">
      <div class="footer-inner">
        <div class="footer-grid">
          <div class="footer-brand">
            <a href="index.html" class="logo footer-logo">
              ${renderLogoMark()}
              <span>${name}</span>
            </a>
            <p class="footer-tagline">${tagline}</p>
            <div class="footer-brand-actions">
              <a href="pricing.html" class="btn btn-primary btn-sm nav-cta">Get started free</a>
              <a href="mailto:${email}" class="btn btn-secondary btn-sm">Contact us</a>
            </div>
            ${githubLink || twitterLink ? `<div class="footer-social">${githubLink}${twitterLink}</div>` : ""}
          </div>
          <div class="footer-col">
            <h4>Product</h4>
            <ul>
              <li><a href="index.html">Home</a></li>
              <li><a href="pricing.html">Pricing</a></li>
              <li><a href="index.html#how-it-works">How it works</a></li>
              <li><a href="about.html">About</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Legal</h4>
            <ul>
              <li><a href="privacy.html">Privacy Policy</a></li>
              <li><a href="terms.html">Terms of Service</a></li>
              <li><a href="cookies.html">Cookie Policy</a></li>
              <li><a href="security.html">Security</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Support</h4>
            <ul>
              <li><a href="mailto:${email}">Contact</a></li>
              <li><a href="privacy.html#your-rights">Your rights</a></li>
              <li><a href="terms.html#acceptable-use">Acceptable use</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <div class="footer-bottom-left">
            <p class="footer-copy">&copy; ${year} ${name}. All rights reserved.</p>
            <span class="footer-status"><span class="footer-status-dot"></span> All systems operational</span>
          </div>
          <p class="footer-meta">Forged with <a href="https://github.com/kory-kaai/monetready" target="_blank" rel="noopener">Monetready</a></p>
        </div>
      </div>
    </footer>`;
}
